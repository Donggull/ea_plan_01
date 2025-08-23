import { NextResponse } from 'next/server'
import { aiService } from '@/lib/services/aiService'
import { AI_MODEL_CONFIGS } from '@/lib/config/aiConfig'

// Vercel 환경 최적화
export const runtime = 'nodejs'

// GET /api/models - 사용 가능한 AI 모델 목록 조회
export async function GET() {
  try {
    const models = aiService.getAvailableModels()

    return NextResponse.json({
      success: true,
      data: {
        models: models.map(({ model, config, available }) => ({
          id: model,
          name: config.displayName,
          provider: config.provider,
          description: config.description,
          available,
          supportsMCP: config.supportsMCP,
          costPerToken: config.costPerToken,
          maxTokens: config.maxTokens,
          features: {
            streaming: true,
            functionCalling: config.supportsMCP,
          },
        })),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Models API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get models',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// POST /api/models/test - 모델 연결 테스트
export async function POST(request: Request) {
  try {
    const { model } = await request.json()

    if (!model || !AI_MODEL_CONFIGS[model as keyof typeof AI_MODEL_CONFIGS]) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid model specified',
        },
        { status: 400 }
      )
    }

    // 간단한 테스트 메시지 전송
    const testMessages = [
      {
        role: 'user' as const,
        content:
          'Hello! Please respond with "Test successful" to confirm the connection.',
      },
    ]

    const response = await aiService.chat({
      messages: testMessages,
      model: model as keyof typeof AI_MODEL_CONFIGS,
      maxTokens: 50,
    })

    const isSuccessful = response.content
      .toLowerCase()
      .includes('test successful')

    return NextResponse.json({
      success: true,
      data: {
        model: response.model,
        connected: isSuccessful,
        response: response.content,
        usage: response.usage,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Model test error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Model test failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
