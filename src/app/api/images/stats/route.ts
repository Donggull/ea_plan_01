import { NextRequest, NextResponse } from 'next/server'
import { ImageService } from '@/lib/services/imageService'

// 사용량 및 비용 통계 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') || 'month') as
      | 'day'
      | 'week'
      | 'month'
    const statsType = searchParams.get('type') || 'all' // 'cost', 'usage', 'queue', 'all'

    const response: Record<string, unknown> = {
      success: true,
      data: {},
    }

    // 비용 통계
    if (statsType === 'cost' || statsType === 'all') {
      const costStats = await ImageService.getCostStatistics(period)
      if (costStats.success) {
        response.data.cost_statistics = costStats.data
      }
    }

    // 사용량 제한 정보
    if (statsType === 'usage' || statsType === 'all') {
      const usageLimits = await ImageService.getUsageLimits()
      if (usageLimits.success) {
        response.data.usage_limits = usageLimits.data
      }
    }

    // 대기열 상태
    if (statsType === 'queue' || statsType === 'all') {
      const queueStatus = ImageService.getQueueStatus()
      response.data.queue_status = queueStatus
    }

    // 생성 히스토리 (최근 10개)
    if (statsType === 'history' || statsType === 'all') {
      const history = await ImageService.getUserGenerationHistory('current', 10)
      if (history.success) {
        response.data.recent_generations = history.data
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch statistics',
        success: false,
      },
      { status: 500 }
    )
  }
}

// 대기열 관리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action

    const result: Record<string, unknown> = { success: true }

    switch (action) {
      case 'clear_completed':
        const hours = body.hours || 1
        ImageService.clearCompletedGenerations(hours)
        result.message = `Cleared completed generations older than ${hours} hours`
        break

      case 'get_queue_status':
        result.data = ImageService.getQueueStatus()
        break

      case 'cancel_generation':
        // 실제 구현에서는 생성 취소 로직 구현
        const generationId = body.generation_id
        if (!generationId) {
          return NextResponse.json(
            { error: 'Generation ID is required', success: false },
            { status: 400 }
          )
        }
        result.message = `Generation ${generationId} cancelled (mock)`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action', success: false },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Queue management API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to manage queue',
        success: false,
      },
      { status: 500 }
    )
  }
}
