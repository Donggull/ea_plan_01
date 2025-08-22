// Auth types
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  created_at: string
}

// Project types
export interface Project {
  id: string
  user_id: string
  name: string
  description: string
  category: 'proposal' | 'development' | 'operation'
  status: 'active' | 'completed' | 'archived'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Chat types
export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Conversation {
  id: string
  project_id: string
  title: string
  model_used: string
  created_at: string
  messages?: Message[]
}

// AI types
export type AIModel = 'gemini' | 'chatgpt' | 'claude'

export interface ChatRequest {
  message: string
  context?: string
  model?: AIModel
  features?: string[]
}

export interface ChatResponse {
  message: string
  model: AIModel
  usage: {
    tokens: number
    cost: number
  }
}

// Canvas types
export interface CodeBlock {
  id: string
  language: string
  code: string
  created_at: string
}

// Image types
export interface GeneratedImage {
  id: string
  user_id: string
  prompt: string
  model_used: string
  image_url: string
  metadata: Record<string, unknown>
  created_at: string
}
