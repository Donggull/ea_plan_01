import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/services/aiService'
import type { ChatRequest } from '@/lib/services/aiService'

// Vercel 환경 최적화
export const runtime = 'nodejs'
export const maxDuration = 60 // 60초 타임아웃

// POST /api/chat - 채팅 메시지 전송
export async function POST(request: NextRequest) {
  try {
    // 인증 확인 (간단한 헤더 기반 인증)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 요청 본문 파싱
    const body: ChatRequest = await request.json()

    // 요청 검증
    if (
      !body.messages ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0
    ) {
      return NextResponse.json(
        { error: 'Messages array is required and cannot be empty' },
        { status: 400 }
      )
    }

    // 각 메시지 검증
    for (const message of body.messages) {
      if (!message.content || typeof message.content !== 'string') {
        return NextResponse.json(
          { error: 'Each message must have a content field' },
          { status: 400 }
        )
      }

      if (!['user', 'assistant', 'system'].includes(message.role)) {
        return NextResponse.json(
          { error: 'Invalid message role' },
          { status: 400 }
        )
      }
    }

    // 로깅
    console.log(`[${new Date().toISOString()}] Chat request:`, {
      messageCount: body.messages.length,
      model: body.model,
      stream: body.stream,
      criteria: body.criteria,
    })

    // 스트리밍 응답 처리
    if (body.stream) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const encoder = new TextEncoder()

            for await (const chunk of aiService.streamChat(body)) {
              const data = JSON.stringify(chunk)
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))

              if (chunk.done) {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                break
              }
            }

            controller.close()
          } catch (error) {
            console.error('Streaming error:', error)
            const errorData = JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
              done: true,
            })
            controller.enqueue(
              new TextEncoder().encode(`data: ${errorData}\n\n`)
            )
            controller.close()
          }
        },
      })

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    // 일반 응답 처리
    const response = await aiService.chat(body)

    // 응답 로깅
    console.log(`[${new Date().toISOString()}] Chat response:`, {
      model: response.model,
      contentLength: response.content.length,
      usage: response.usage,
      finishReason: response.finishReason,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat API error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// GET /api/chat - 모델 정보 조회
export async function GET() {
  try {
    const models = aiService.getAvailableModels()

    return NextResponse.json({
      models,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Get models error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get models',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// OPTIONS - CORS 헤더
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
