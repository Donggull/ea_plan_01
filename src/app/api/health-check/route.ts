import { NextRequest, NextResponse } from 'next/server'
import { env, validateEnv } from '@/lib/utils/env'

export async function GET(_request: NextRequest) {
  try {
    const validation = validateEnv()

    // 환경 변수 상태 확인
    const status = {
      configured: false,
      message: '',
      environment: env.NODE_ENV || 'unknown',
      database: {
        supabase:
          !!env.NEXT_PUBLIC_SUPABASE_URL && !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!env.SUPABASE_SERVICE_ROLE_KEY,
      },
      aiModels: validation.availableAIModels,
      timestamp: new Date().toISOString(),
    }

    // 필수 환경 변수 확인
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      status.message =
        'Supabase 연결 정보가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.'
      return NextResponse.json(status, { status: 200 })
    }

    // URL 형식 기본 검증
    if (
      !env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co') &&
      !env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost')
    ) {
      status.message = 'Supabase URL 형식이 올바르지 않습니다.'
      return NextResponse.json(status, { status: 200 })
    }

    // AI 모델 최소 하나 확인
    const hasAnyAI = Object.values(validation.availableAIModels).some(Boolean)
    if (!hasAnyAI) {
      status.message =
        'AI API 키가 하나도 설정되지 않았습니다. 최소 하나 이상의 AI API 키를 설정하세요.'
      return NextResponse.json(status, { status: 200 })
    }

    // 모든 검사 통과 (실제 연결 테스트 제외)
    status.configured = true
    status.message =
      '환경 설정이 정상적으로 완료되었습니다. 실제 Supabase 연결은 첫 사용 시 확인됩니다.'

    return NextResponse.json(status)
  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json(
      {
        configured: false,
        message: '환경 설정 확인 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function HEAD(_request: NextRequest) {
  // 간단한 상태 확인 (body 없음)
  const validation = validateEnv()
  const isHealthy =
    validation.isValid &&
    !!env.NEXT_PUBLIC_SUPABASE_URL &&
    !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return new Response(null, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
