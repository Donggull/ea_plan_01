// 환경 변수 유틸리티 및 검증
export const env = {
  // AI API Keys (서버 사이드 전용)
  GOOGLE_AI_API_KEY:
    typeof window === 'undefined' ? process.env.GOOGLE_AI_API_KEY : undefined,
  OPENAI_API_KEY:
    typeof window === 'undefined' ? process.env.OPENAI_API_KEY : undefined,
  ANTHROPIC_API_KEY:
    typeof window === 'undefined' ? process.env.ANTHROPIC_API_KEY : undefined,

  // Database
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY:
    typeof window === 'undefined'
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : undefined,

  // Next.js
  NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
  VERCEL_URL:
    typeof window === 'undefined' ? process.env.VERCEL_URL : undefined,

  // Development
  NEXT_PUBLIC_API_TOKEN: process.env.NEXT_PUBLIC_API_TOKEN || 'demo-token',
}

// 필수 환경 변수 검증 함수
export function validateEnv() {
  const missingVars: string[] = []

  // AI API 키 중 최소 하나는 있어야 함
  const hasAnyAIKey =
    env.GOOGLE_AI_API_KEY || env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY
  if (!hasAnyAIKey) {
    missingVars.push(
      'At least one AI API key (GOOGLE_AI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY)'
    )
  }

  // Supabase 설정 (선택적)
  if (env.NEXT_PUBLIC_SUPABASE_URL && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingVars.push(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is required when SUPABASE_URL is set'
    )
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    availableAIModels: {
      gemini: !!env.GOOGLE_AI_API_KEY,
      chatgpt: !!env.OPENAI_API_KEY,
      claude: !!env.ANTHROPIC_API_KEY,
    },
  }
}

// 개발/프로덕션 환경 확인
export const isDev = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Vercel 환경 확인
export const isVercel = !!env.VERCEL_URL
