import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export interface CreateUserProfileData {
  email: string
  name: string
  avatar_url?: string
  subscription_tier?: 'free' | 'pro' | 'enterprise'
}

export interface UpdateUserProfileData {
  name?: string
  avatar_url?: string
  subscription_tier?: 'free' | 'pro' | 'enterprise'
  bio?: string
  preferences?: Record<string, unknown>
}

export interface UserServiceResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
}

export class UserService {
  static async getCurrentUser(): Promise<UserServiceResponse<UserProfile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        return {
          data: null,
          error: `Authentication error: ${authError.message}`,
          success: false
        }
      }

      if (!user) {
        return {
          data: null,
          error: 'User not authenticated',
          success: false
        }
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return {
          data: null,
          error: `Failed to fetch user profile: ${profileError.message}`,
          success: false
        }
      }

      return {
        data: userProfile,
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

  static async createUserProfile(userData: CreateUserProfileData): Promise<UserServiceResponse<UserProfile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to create profile',
          success: false
        }
      }

      const insertData: UserInsert = {
        id: user.id,
        email: userData.email,
        name: userData.name,
        avatar_url: userData.avatar_url,
        subscription_tier: userData.subscription_tier || 'free'
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        return {
          data: null,
          error: `Failed to create user profile: ${insertError.message}`,
          success: false
        }
      }

      // Log the activity
      await this.logUserActivity(user.id, 'profile_created', { profile_data: userData })

      return {
        data: newUser,
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

  static async updateUserProfile(updates: UpdateUserProfileData): Promise<UserServiceResponse<UserProfile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to update profile',
          success: false
        }
      }

      const updateData: UserUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        return {
          data: null,
          error: `Failed to update user profile: ${updateError.message}`,
          success: false
        }
      }

      // Log the activity
      await this.logUserActivity(user.id, 'profile_updated', { updates })

      return {
        data: updatedUser,
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

  static async getUserById(userId: string): Promise<UserServiceResponse<UserProfile>> {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        return {
          data: null,
          error: `Failed to fetch user: ${error.message}`,
          success: false
        }
      }

      return {
        data: userProfile,
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

  static async updateSubscription(tier: 'free' | 'pro' | 'enterprise'): Promise<UserServiceResponse<UserProfile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to update subscription',
          success: false
        }
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          subscription_tier: tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        return {
          data: null,
          error: `Failed to update subscription: ${updateError.message}`,
          success: false
        }
      }

      // Log the subscription change
      await this.logUserActivity(user.id, 'subscription_updated', { 
        new_tier: tier,
        previous_tier: updatedUser.subscription_tier 
      })

      return {
        data: updatedUser,
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

  static async deleteUserProfile(): Promise<UserServiceResponse<boolean>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to delete profile',
          success: false
        }
      }

      // Log the deletion before actually deleting
      await this.logUserActivity(user.id, 'profile_deleted', {})

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (deleteError) {
        return {
          data: null,
          error: `Failed to delete user profile: ${deleteError.message}`,
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

  static async getUserStats(userId?: string): Promise<UserServiceResponse<{
    projectCount: number
    conversationCount: number
    documentCount: number
    imageCount: number
    botCount: number
  }>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      const targetUserId = userId || user.id

      // Get counts for various user resources
      const [projectsRes, conversationsRes, documentsRes, imagesRes, botsRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }).eq('user_id', targetUserId),
        supabase.from('conversations').select('id', { count: 'exact' }).eq('user_id', targetUserId),
        supabase.from('documents').select('id', { count: 'exact' }).eq('user_id', targetUserId),
        supabase.from('generated_images').select('id', { count: 'exact' }).eq('user_id', targetUserId),
        supabase.from('custom_bots').select('id', { count: 'exact' }).eq('user_id', targetUserId)
      ])

      return {
        data: {
          projectCount: projectsRes.count || 0,
          conversationCount: conversationsRes.count || 0,
          documentCount: documentsRes.count || 0,
          imageCount: imagesRes.count || 0,
          botCount: botsRes.count || 0
        },
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

  static async getRecentActivity(limit: number = 10): Promise<UserServiceResponse<any[]>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      const { data: activities, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return {
          data: null,
          error: `Failed to fetch recent activity: ${error.message}`,
          success: false
        }
      }

      return {
        data: activities || [],
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

  private static async logUserActivity(
    userId: string, 
    action: string, 
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action,
          metadata,
          ip_address: 'unknown', // Could be passed from client or detected server-side
          user_agent: 'unknown'  // Could be passed from client
        })
    } catch (error) {
      console.error('Failed to log user activity:', error)
      // Don't throw error as this is not critical functionality
    }
  }
}

export default UserService