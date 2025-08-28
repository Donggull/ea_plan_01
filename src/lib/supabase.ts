import { createClient } from '@supabase/supabase-js'

// 환경 변수 유효성 검사 및 기본값 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 빌드 시점에 환경 변수 검증 스킵 (Vercel 빌드를 위해)
const isBuilding =
  process.env.NODE_ENV === 'production' && !supabaseUrl && !supabaseAnonKey

if (!isBuilding && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    'Supabase environment variables are not set. Some features may not work.'
  )
}

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
          user_role?: 'user' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          user_role?: 'user' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          avatar_url?: string
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          user_role?: 'user' | 'admin' | 'super_admin'
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          owner_id: string
          name: string
          description?: string
          category: 'proposal' | 'development' | 'operation'
          status: 'active' | 'completed' | 'archived' | 'paused'
          tags: string[]
          metadata: Record<string, unknown>
          is_public: boolean
          visibility_level: 'private' | 'shared' | 'public'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          owner_id?: string
          name: string
          description?: string
          category: 'proposal' | 'development' | 'operation'
          status?: 'active' | 'completed' | 'archived' | 'paused'
          tags?: string[]
          metadata?: Record<string, unknown>
          is_public?: boolean
          visibility_level?: 'private' | 'shared' | 'public'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          category?: 'proposal' | 'development' | 'operation'
          status?: 'active' | 'completed' | 'archived' | 'paused'
          tags?: string[]
          metadata?: Record<string, unknown>
          is_public?: boolean
          visibility_level?: 'private' | 'shared' | 'public'
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          invited_by?: string
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          invited_by?: string
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: 'owner' | 'admin' | 'member' | 'viewer'
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
          style: string
          size: string
          is_favorite: boolean
          tags: string[]
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
          style?: string
          size?: string
          is_favorite?: boolean
          tags?: string[]
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          prompt?: string
          style?: string
          size?: string
          is_favorite?: boolean
          tags?: string[]
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

// Mock Supabase client for build time
const mockSupabaseClient = {
  from: () => ({
    select: () => Promise.resolve({ data: null, error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    eq: () => ({
      single: () => Promise.resolve({ data: null, error: null }),
      select: () => Promise.resolve({ data: null, error: null }),
    }),
  }),
  auth: {
    signInWithPassword: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
}

// Supabase 클라이언트 생성 (조건부)
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false,  // 브라우저 종료시 세션 자동 삭제
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,  // sessionStorage 사용으로 브라우저 종료시 자동 삭제
        },
      })
    : (mockSupabaseClient as ReturnType<typeof createClient>)

// 클라이언트 사이드 전용 Supabase 클라이언트
export const createClientComponentClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase client cannot be created without environment variables'
    )
    return mockSupabaseClient as ReturnType<typeof createClient<Database>>
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,  // 브라우저 종료시 세션 자동 삭제
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,  // sessionStorage 사용으로 브라우저 종료시 자동 삭제
    },
  })
}

// 서버 사이드 전용 Supabase 클라이언트 (서비스 키 사용)
export const createServerComponentClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      'Supabase server client cannot be created without environment variables'
    )
    return mockSupabaseClient as ReturnType<typeof createClient<Database>>
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
