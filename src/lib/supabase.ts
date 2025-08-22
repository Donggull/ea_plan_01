import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url?: string
          subscription_tier: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          avatar_url?: string
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description?: string
          category: 'proposal' | 'development' | 'operation'
          status: 'active' | 'completed' | 'archived' | 'paused'
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          category: 'proposal' | 'development' | 'operation'
          status?: 'active' | 'completed' | 'archived' | 'paused'
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          category?: 'proposal' | 'development' | 'operation'
          status?: 'active' | 'completed' | 'archived' | 'paused'
          metadata?: Record<string, unknown>
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          model_used: string
          tags: string[]
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title: string
          model_used: string
          tags?: string[]
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          model_used?: string
          tags?: string[]
          metadata?: Record<string, unknown>
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          content?: string
          metadata?: Record<string, unknown>
        }
      }
      custom_bots: {
        Row: {
          id: string
          user_id: string
          name: string
          description?: string
          system_prompt?: string
          knowledge_base: string[]
          is_public: boolean
          is_active: boolean
          tags: string[]
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          system_prompt?: string
          knowledge_base: string[]
          is_public?: boolean
          is_active?: boolean
          tags?: string[]
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          system_prompt?: string
          knowledge_base?: string[]
          is_public?: boolean
          is_active?: boolean
          tags?: string[]
          metadata?: Record<string, unknown>
          updated_at?: string
        }
      }
      generated_images: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          prompt: string
          model_used: string
          image_url: string
          is_favorite: boolean
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          prompt: string
          model_used: string
          image_url: string
          is_favorite?: boolean
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          prompt?: string
          is_favorite?: boolean
          metadata?: Record<string, unknown>
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          file_url?: string
          extracted_content?: string
          analysis_result?: Record<string, unknown>
          notes?: string
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          file_url?: string
          extracted_content?: string
          analysis_result?: Record<string, unknown>
          notes?: string
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          project_id?: string | null
          file_name?: string
          file_path?: string
          file_url?: string
          extracted_content?: string
          analysis_result?: Record<string, unknown>
          notes?: string
          metadata?: Record<string, unknown>
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'pro' | 'enterprise'
      project_category: 'proposal' | 'development' | 'operation'
      project_status: 'active' | 'completed' | 'archived'
      message_role: 'user' | 'assistant' | 'system'
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// 클라이언트 사이드 전용 Supabase 클라이언트
export const createClientComponentClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

// 서버 사이드 전용 Supabase 클라이언트 (서비스 키 사용)
export const createServerComponentClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
