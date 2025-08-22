import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type CustomBot = Database['public']['Tables']['custom_bots']['Row']
type CustomBotInsert = Database['public']['Tables']['custom_bots']['Insert']
type CustomBotUpdate = Database['public']['Tables']['custom_bots']['Update']

export interface CreateCustomBotData {
  name: string
  description: string
  system_prompt: string
  knowledge_base?: string[]
  is_public?: boolean
  is_active?: boolean
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface UpdateCustomBotData {
  name?: string
  description?: string
  system_prompt?: string
  knowledge_base?: string[]
  is_public?: boolean
  is_active?: boolean
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface CustomBotListFilters {
  is_public?: boolean
  is_active?: boolean
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
}

export interface CustomBotServiceResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
}

export interface CustomBotWithStats extends CustomBot {
  usage_count?: number
  rating?: number
  last_used?: string
  conversation_count?: number
}

export interface KnowledgeBaseDocument {
  id: string
  title: string
  content: string
  metadata?: Record<string, unknown>
}

export interface BotConversation {
  id: string
  bot_id: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string
  }>
  created_at: string
  updated_at: string
}

export class CustomBotService {
  static async createCustomBot(botData: CreateCustomBotData): Promise<CustomBotServiceResponse<CustomBot>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to create custom bot',
          success: false
        }
      }

      const insertData: CustomBotInsert = {
        user_id: user.id,
        name: botData.name,
        description: botData.description,
        system_prompt: botData.system_prompt,
        knowledge_base: botData.knowledge_base || [],
        is_public: botData.is_public || false,
        is_active: botData.is_active !== false, // default to true
        tags: botData.tags || [],
        metadata: botData.metadata || {}
      }

      const { data: newBot, error: insertError } = await supabase
        .from('custom_bots')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        return {
          data: null,
          error: `Failed to create custom bot: ${insertError.message}`,
          success: false
        }
      }

      // Log the activity
      await this.logBotActivity(newBot.id, user.id, 'bot_created', {
        bot_name: botData.name,
        is_public: botData.is_public
      })

      return {
        data: newBot,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async getCustomBotById(botId: string): Promise<CustomBotServiceResponse<CustomBotWithStats>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      // First try to get bot if user owns it or if it's public
      const { data: bot, error: botError } = await supabase
        .from('custom_bots')
        .select('*')
        .eq('id', botId)
        .or(`user_id.eq.${user.id},and(is_public.eq.true,is_active.eq.true)`)
        .single()

      if (botError) {
        return {
          data: null,
          error: `Failed to fetch custom bot: ${botError.message}`,
          success: false
        }
      }

      // Get usage stats
      const [conversationsRes, ratingsRes] = await Promise.all([
        supabase.from('conversations').select('id', { count: 'exact' }).eq('bot_id', botId),
        supabase.from('activity_logs')
          .select('created_at')
          .eq('custom_bot_id', botId)
          .eq('action', 'bot_used')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      ])

      const botWithStats: CustomBotWithStats = {
        ...bot,
        usage_count: bot.metadata?.usage_count || 0,
        rating: bot.metadata?.average_rating || 0,
        conversation_count: conversationsRes.count || 0,
        last_used: ratingsRes.data?.created_at
      }

      return {
        data: botWithStats,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async updateCustomBot(botId: string, updates: UpdateCustomBotData): Promise<CustomBotServiceResponse<CustomBot>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to update custom bot',
          success: false
        }
      }

      const updateData: CustomBotUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { data: updatedBot, error: updateError } = await supabase
        .from('custom_bots')
        .update(updateData)
        .eq('id', botId)
        .eq('user_id', user.id) // Only bot owner can update
        .select()
        .single()

      if (updateError) {
        return {
          data: null,
          error: `Failed to update custom bot: ${updateError.message}`,
          success: false
        }
      }

      // Log the activity
      await this.logBotActivity(botId, user.id, 'bot_updated', { updates })

      return {
        data: updatedBot,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async deleteCustomBot(botId: string): Promise<CustomBotServiceResponse<boolean>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to delete custom bot',
          success: false
        }
      }

      // Get bot details for logging before deletion
      const { data: bot } = await supabase
        .from('custom_bots')
        .select('name, is_public')
        .eq('id', botId)
        .eq('user_id', user.id)
        .single()

      // Log the deletion before actually deleting
      if (bot) {
        await this.logBotActivity(botId, user.id, 'bot_deleted', {
          bot_name: bot.name,
          was_public: bot.is_public
        })
      }

      const { error: deleteError } = await supabase
        .from('custom_bots')
        .delete()
        .eq('id', botId)
        .eq('user_id', user.id) // Only bot owner can delete

      if (deleteError) {
        return {
          data: null,
          error: `Failed to delete custom bot: ${deleteError.message}`,
          success: false
        }
      }

      return {
        data: true,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async listCustomBots(filters: CustomBotListFilters = {}): Promise<CustomBotServiceResponse<CustomBotWithStats[]>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      let query = supabase
        .from('custom_bots')
        .select('*')

      // If filtering for public bots, show public active bots from all users
      // If not specified or false, show only user's bots
      if (filters.is_public === true) {
        query = query.eq('is_public', true).eq('is_active', true)
      } else if (filters.is_public === false) {
        query = query.eq('user_id', user.id)
      } else {
        // Show user's bots + public bots
        query = query.or(`user_id.eq.${user.id},and(is_public.eq.true,is_active.eq.true)`)
      }

      // Apply other filters
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      // Order by updated_at descending
      query = query.order('updated_at', { ascending: false })

      const { data: bots, error: botsError } = await query

      if (botsError) {
        return {
          data: null,
          error: `Failed to fetch custom bots: ${botsError.message}`,
          success: false
        }
      }

      // Enhance bots with stats
      const botsWithStats: CustomBotWithStats[] = await Promise.all(
        (bots || []).map(async (bot) => {
          const [conversationsRes, lastUsedRes] = await Promise.all([
            supabase.from('conversations').select('id', { count: 'exact' }).eq('bot_id', bot.id),
            supabase.from('activity_logs')
              .select('created_at')
              .eq('custom_bot_id', bot.id)
              .eq('action', 'bot_used')
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
          ])

          return {
            ...bot,
            usage_count: bot.metadata?.usage_count || 0,
            rating: bot.metadata?.average_rating || 0,
            conversation_count: conversationsRes.count || 0,
            last_used: lastUsedRes.data?.created_at
          }
        })
      )

      return {
        data: botsWithStats,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async addKnowledgeBaseDocument(botId: string, document: KnowledgeBaseDocument): Promise<CustomBotServiceResponse<CustomBot>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      // Get current bot
      const { data: bot, error: fetchError } = await supabase
        .from('custom_bots')
        .select('knowledge_base')
        .eq('id', botId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: `Failed to fetch custom bot: ${fetchError.message}`,
          success: false
        }
      }

      const currentKnowledgeBase = bot.knowledge_base || []
      const updatedKnowledgeBase = [...currentKnowledgeBase, JSON.stringify(document)]

      return this.updateCustomBot(botId, { knowledge_base: updatedKnowledgeBase })
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async removeKnowledgeBaseDocument(botId: string, documentId: string): Promise<CustomBotServiceResponse<CustomBot>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      // Get current bot
      const { data: bot, error: fetchError } = await supabase
        .from('custom_bots')
        .select('knowledge_base')
        .eq('id', botId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: `Failed to fetch custom bot: ${fetchError.message}`,
          success: false
        }
      }

      const currentKnowledgeBase = bot.knowledge_base || []
      const updatedKnowledgeBase = currentKnowledgeBase.filter(doc => {
        try {
          const parsedDoc = JSON.parse(doc)
          return parsedDoc.id !== documentId
        } catch {
          return true // Keep malformed documents
        }
      })

      return this.updateCustomBot(botId, { knowledge_base: updatedKnowledgeBase })
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async toggleBotVisibility(botId: string): Promise<CustomBotServiceResponse<CustomBot>> {
    try {
      const botResult = await this.getCustomBotById(botId)
      
      if (!botResult.success || !botResult.data) {
        return {
          data: null,
          error: botResult.error || 'Bot not found',
          success: false
        }
      }

      return this.updateCustomBot(botId, {
        is_public: !botResult.data.is_public
      })
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async toggleBotStatus(botId: string): Promise<CustomBotServiceResponse<CustomBot>> {
    try {
      const botResult = await this.getCustomBotById(botId)
      
      if (!botResult.success || !botResult.data) {
        return {
          data: null,
          error: botResult.error || 'Bot not found',
          success: false
        }
      }

      return this.updateCustomBot(botId, {
        is_active: !botResult.data.is_active
      })
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async addBotTag(botId: string, tag: string): Promise<CustomBotServiceResponse<CustomBot>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      // Get current bot
      const { data: bot, error: fetchError } = await supabase
        .from('custom_bots')
        .select('tags')
        .eq('id', botId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: `Failed to fetch custom bot: ${fetchError.message}`,
          success: false
        }
      }

      const currentTags = bot.tags || []
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag]
        return this.updateCustomBot(botId, { tags: updatedTags })
      }

      // Tag already exists, return current bot
      const currentBotResult = await this.getCustomBotById(botId)
      return currentBotResult
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async removeBotTag(botId: string, tag: string): Promise<CustomBotServiceResponse<CustomBot>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      // Get current bot
      const { data: bot, error: fetchError } = await supabase
        .from('custom_bots')
        .select('tags')
        .eq('id', botId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: `Failed to fetch custom bot: ${fetchError.message}`,
          success: false
        }
      }

      const currentTags = bot.tags || []
      const updatedTags = currentTags.filter(t => t !== tag)
      
      return this.updateCustomBot(botId, { tags: updatedTags })
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async getMyCustomBots(): Promise<CustomBotServiceResponse<CustomBotWithStats[]>> {
    return this.listCustomBots({ is_public: false })
  }

  static async getPublicCustomBots(): Promise<CustomBotServiceResponse<CustomBotWithStats[]>> {
    return this.listCustomBots({ is_public: true })
  }

  static async searchCustomBots(searchTerm: string): Promise<CustomBotServiceResponse<CustomBotWithStats[]>> {
    return this.listCustomBots({ search: searchTerm })
  }

  static async cloneCustomBot(botId: string, newName?: string): Promise<CustomBotServiceResponse<CustomBot>> {
    try {
      const botResult = await this.getCustomBotById(botId)
      
      if (!botResult.success || !botResult.data) {
        return {
          data: null,
          error: botResult.error || 'Bot not found',
          success: false
        }
      }

      const originalBot = botResult.data
      
      const clonedBotData: CreateCustomBotData = {
        name: newName || `${originalBot.name} (Copy)`,
        description: originalBot.description,
        system_prompt: originalBot.system_prompt,
        knowledge_base: originalBot.knowledge_base,
        is_public: false, // Cloned bots are private by default
        is_active: true,
        tags: [...(originalBot.tags || []), 'cloned'],
        metadata: {
          ...originalBot.metadata,
          cloned_from: botId,
          cloned_at: new Date().toISOString()
        }
      }

      return this.createCustomBot(clonedBotData)
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async recordBotUsage(botId: string): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return
      }

      // Update usage count in metadata
      const { data: bot } = await supabase
        .from('custom_bots')
        .select('metadata')
        .eq('id', botId)
        .single()

      if (bot) {
        const currentMetadata = bot.metadata || {}
        const usageCount = (currentMetadata.usage_count || 0) + 1
        
        await supabase
          .from('custom_bots')
          .update({
            metadata: {
              ...currentMetadata,
              usage_count: usageCount,
              last_used: new Date().toISOString()
            }
          })
          .eq('id', botId)
      }

      // Log the usage
      await this.logBotActivity(botId, user.id, 'bot_used', {})
    } catch (error) {
      console.error('Failed to record bot usage:', error)
    }
  }

  private static async logBotActivity(
    botId: string,
    userId: string,
    action: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          custom_bot_id: botId,
          action,
          metadata,
          ip_address: 'unknown',
          user_agent: 'unknown'
        })
    } catch (error) {
      console.error('Failed to log bot activity:', error)
    }
  }
}

export default CustomBotService