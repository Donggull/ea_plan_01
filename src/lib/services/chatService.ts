import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Conversation = Database['public']['Tables']['conversations']['Row']
type ConversationInsert =
  Database['public']['Tables']['conversations']['Insert']
type ConversationUpdate =
  Database['public']['Tables']['conversations']['Update']

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

export interface CreateConversationData {
  project_id?: string
  title: string
  model_used: string
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface CreateMessageData {
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, unknown>
}

export interface UpdateConversationData {
  title?: string
  model_used?: string
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface ConversationListFilters {
  project_id?: string
  model_used?: string
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
}

export interface ChatServiceResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
}

export interface ConversationWithMessages extends Conversation {
  messages?: Message[]
  messageCount?: number
  lastMessage?: Message
}

export interface ConversationSummary {
  id: string
  title: string
  project_id: string | null
  messageCount: number
  lastMessageAt: string
  model_used: string
  tags: string[]
}

export class ChatService {
  static async createConversation(
    conversationData: CreateConversationData
  ): Promise<ChatServiceResponse<Conversation>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to create conversation',
          success: false,
        }
      }

      const insertData: ConversationInsert = {
        user_id: user.id,
        project_id: conversationData.project_id || null,
        title: conversationData.title,
        model_used: conversationData.model_used,
        tags: conversationData.tags || [],
        metadata: conversationData.metadata || {},
      }

      const { data: newConversation, error: insertError } = await supabase
        .from('conversations')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        return {
          data: null,
          error: `Failed to create conversation: ${insertError.message}`,
          success: false,
        }
      }

      // Log the activity
      await this.logChatActivity(
        newConversation.id,
        user.id,
        'conversation_created',
        {
          title: conversationData.title,
          model_used: conversationData.model_used,
          project_id: conversationData.project_id,
        }
      )

      return {
        data: newConversation,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async getConversationById(
    conversationId: string,
    includeMessages: boolean = false
  ): Promise<ChatServiceResponse<ConversationWithMessages>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (conversationError || !conversation) {
        return {
          data: null,
          error: `Failed to fetch conversation: ${conversationError?.message || 'Conversation not found'}`,
          success: false,
        }
      }

      let conversationWithMessages: ConversationWithMessages = conversation

      if (includeMessages) {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (messagesError) {
          return {
            data: null,
            error: `Failed to fetch messages: ${messagesError.message}`,
            success: false,
          }
        }

        conversationWithMessages = {
          ...conversation,
          messages: messages || [],
          messageCount: messages?.length || 0,
          lastMessage: messages?.[messages.length - 1],
        }
      } else {
        // Get message count and last message
        const [messageCountRes, lastMessageRes] = await Promise.all([
          supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', conversationId),
          supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
        ])

        conversationWithMessages = {
          ...conversation,
          messageCount: messageCountRes.count || 0,
          lastMessage: lastMessageRes.data || undefined,
        }
      }

      return {
        data: conversationWithMessages,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async addMessage(
    messageData: CreateMessageData
  ): Promise<ChatServiceResponse<Message>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to add message',
          success: false,
        }
      }

      // Verify conversation belongs to user
      const { error: conversationError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', messageData.conversation_id)
        .eq('user_id', user.id)
        .single()

      if (conversationError) {
        return {
          data: null,
          error: 'Conversation not found or access denied',
          success: false,
        }
      }

      const insertData: MessageInsert = {
        conversation_id: messageData.conversation_id,
        role: messageData.role,
        content: messageData.content,
        metadata: messageData.metadata || {},
      }

      const { data: newMessage, error: insertError } = await supabase
        .from('messages')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        return {
          data: null,
          error: `Failed to add message: ${insertError.message}`,
          success: false,
        }
      }

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', messageData.conversation_id)

      // Log the activity
      await this.logChatActivity(
        messageData.conversation_id,
        user.id,
        'message_added',
        {
          role: messageData.role,
          content_length: messageData.content.length,
        }
      )

      return {
        data: newMessage,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async updateConversation(
    conversationId: string,
    updates: UpdateConversationData
  ): Promise<ChatServiceResponse<Conversation>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to update conversation',
          success: false,
        }
      }

      const updateData: ConversationUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      const { data: updatedConversation, error: updateError } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        return {
          data: null,
          error: `Failed to update conversation: ${updateError.message}`,
          success: false,
        }
      }

      // Log the activity
      await this.logChatActivity(
        conversationId,
        user.id,
        'conversation_updated',
        { updates }
      )

      return {
        data: updatedConversation,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async deleteConversation(
    conversationId: string
  ): Promise<ChatServiceResponse<boolean>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to delete conversation',
          success: false,
        }
      }

      // Get conversation details for logging before deletion
      const { data: conversation } = await supabase
        .from('conversations')
        .select('title, model_used')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      // Log the deletion before actually deleting
      if (conversation) {
        await this.logChatActivity(
          conversationId,
          user.id,
          'conversation_deleted',
          {
            title: conversation.title,
            model_used: conversation.model_used,
          }
        )
      }

      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id)

      if (deleteError) {
        return {
          data: null,
          error: `Failed to delete conversation: ${deleteError.message}`,
          success: false,
        }
      }

      return {
        data: true,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async listConversations(
    filters: ConversationListFilters = {}
  ): Promise<ChatServiceResponse<ConversationSummary[]>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      let query = supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)

      // Apply filters
      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id)
      }

      if (filters.model_used) {
        query = query.eq('model_used', filters.model_used)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        )
      }

      // Order by updated_at descending
      query = query.order('updated_at', { ascending: false })

      const { data: conversations, error: conversationsError } = await query

      if (conversationsError) {
        return {
          data: null,
          error: `Failed to fetch conversations: ${conversationsError.message}`,
          success: false,
        }
      }

      // Enhance conversations with message counts and last message
      const conversationSummaries: ConversationSummary[] = await Promise.all(
        (conversations || []).map(async conversation => {
          const [messageCountRes, lastMessageRes] = await Promise.all([
            supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('conversation_id', conversation.id),
            supabase
              .from('messages')
              .select('created_at')
              .eq('conversation_id', conversation.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single(),
          ])

          return {
            id: conversation.id,
            title: conversation.title,
            project_id: conversation.project_id,
            messageCount: messageCountRes.count || 0,
            lastMessageAt:
              lastMessageRes.data?.created_at || conversation.created_at,
            model_used: conversation.model_used,
            tags: conversation.tags || [],
          }
        })
      )

      return {
        data: conversationSummaries,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async getMessages(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<ChatServiceResponse<Message[]>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      // Verify conversation belongs to user
      const { error: conversationError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (conversationError) {
        return {
          data: null,
          error: 'Conversation not found or access denied',
          success: false,
        }
      }

      let query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (limit) {
        query = query.limit(limit)
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1)
      }

      const { data: messages, error: messagesError } = await query

      if (messagesError) {
        return {
          data: null,
          error: `Failed to fetch messages: ${messagesError.message}`,
          success: false,
        }
      }

      return {
        data: messages || [],
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async addConversationTag(
    conversationId: string,
    tag: string
  ): Promise<ChatServiceResponse<Conversation>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      // Get current conversation
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('tags')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: `Failed to fetch conversation: ${fetchError.message}`,
          success: false,
        }
      }

      const currentTags = conversation.tags || []
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag]
        return this.updateConversation(conversationId, { tags: updatedTags })
      }

      // Tag already exists, return current conversation
      const currentConversationResult =
        await this.getConversationById(conversationId)
      return currentConversationResult
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async removeConversationTag(
    conversationId: string,
    tag: string
  ): Promise<ChatServiceResponse<Conversation>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      // Get current conversation
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('tags')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: `Failed to fetch conversation: ${fetchError.message}`,
          success: false,
        }
      }

      const currentTags = conversation.tags || []
      const updatedTags = currentTags.filter(t => t !== tag)

      return this.updateConversation(conversationId, { tags: updatedTags })
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async searchConversations(
    searchTerm: string
  ): Promise<ChatServiceResponse<ConversationSummary[]>> {
    return this.listConversations({ search: searchTerm })
  }

  static async getConversationsByProject(
    projectId: string
  ): Promise<ChatServiceResponse<ConversationSummary[]>> {
    return this.listConversations({ project_id: projectId })
  }

  static async getRecentConversations(
    limit: number = 10
  ): Promise<ChatServiceResponse<ConversationSummary[]>> {
    return this.listConversations({ limit })
  }

  private static async logChatActivity(
    conversationId: string,
    userId: string,
    action: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        conversation_id: conversationId,
        action,
        metadata,
        ip_address: 'unknown', // Could be passed from client or detected server-side
        user_agent: 'unknown', // Could be passed from client
      })
    } catch (error) {
      console.error('Failed to log chat activity:', error)
      // Don't throw error as this is not critical functionality
    }
  }
}

export default ChatService
