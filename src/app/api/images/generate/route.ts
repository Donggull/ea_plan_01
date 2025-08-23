import { NextRequest, NextResponse } from 'next/server'
import {
  ImageService,
  type ImageGenerationRequest,
} from '@/lib/services/imageService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 요청 데이터 검증
    const validationResult = validateGenerationRequest(body)
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: validationResult.error,
          success: false,
        },
        { status: 400 }
      )
    }

    // 이미지 생성 요청 처리
    const generationRequest: ImageGenerationRequest = {
      prompt: body.prompt,
      model: body.model || 'flux-schnell',
      style: body.style,
      count: Math.min(body.count || 1, 4), // 최대 4개로 제한
      size: body.size || 'square',
      quality: body.quality || 'balanced',
      project_id: body.project_id,
      seed: body.seed,
      steps: body.steps,
      guidance: body.guidance,
    }

    // 참조 이미지 처리
    if (body.reference_image) {
      // 실제 구현에서는 base64 디코딩 또는 파일 업로드 처리
      // 임시로 참조 이미지가 있다고 가정
      generationRequest.model = 'flux-context'
    }

    // 대기열에 추가 방식 (비동기)
    if (body.async === true) {
      const queueResult =
        await ImageService.queueImageGeneration(generationRequest)

      if (!queueResult.success) {
        return NextResponse.json(
          {
            error: queueResult.error,
            success: false,
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          generation_id: queueResult.data?.generationId,
          estimated_time: queueResult.data?.estimatedTime,
          status: 'queued',
          message: '이미지 생성이 대기열에 추가되었습니다.',
        },
      })
    }

    // 직접 생성 방식 (동기)
    const result = await ImageService.generateImages(generationRequest)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          success: false,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        images: result.data?.images,
        total_cost: result.data?.total_cost,
        generation_time: result.data?.generation_time,
        model_used: result.data?.model_used,
      },
    })
  } catch (error) {
    console.error('Image generation API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    )
  }
}

// 생성 진행 상태 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const generationId = searchParams.get('id')

    if (!generationId) {
      return NextResponse.json(
        {
          error: 'Generation ID is required',
          success: false,
        },
        { status: 400 }
      )
    }

    const progress = ImageService.getGenerationProgress(generationId)

    if (!progress) {
      return NextResponse.json(
        {
          error: 'Generation not found',
          success: false,
        },
        { status: 404 }
      )
    }

    // 완료된 경우 결과 포함
    let result = null
    if (progress.status === 'completed') {
      // 실제 구현에서는 데이터베이스에서 결과 조회
      result = {
        message:
          'Generation completed - results would be fetched from database',
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...progress,
        result,
      },
    })
  } catch (error) {
    console.error('Generation status API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    )
  }
}

// 요청 데이터 검증 함수
function validateGenerationRequest(body: Record<string, unknown>): {
  valid: boolean
  error?: string
} {
  if (!body.prompt || typeof body.prompt !== 'string') {
    return { valid: false, error: 'Prompt is required and must be a string' }
  }

  if (body.prompt.length < 3) {
    return { valid: false, error: 'Prompt must be at least 3 characters long' }
  }

  if (body.prompt.length > 1000) {
    return { valid: false, error: 'Prompt must be less than 1000 characters' }
  }

  if (
    body.model &&
    !['flux-schnell', 'imagen3', 'flux-context'].includes(body.model)
  ) {
    return { valid: false, error: 'Invalid model specified' }
  }

  if (body.count && (body.count < 1 || body.count > 4)) {
    return { valid: false, error: 'Count must be between 1 and 4' }
  }

  if (body.size && !['square', 'portrait', 'landscape'].includes(body.size)) {
    return { valid: false, error: 'Invalid size specified' }
  }

  if (body.quality && !['fast', 'balanced', 'high'].includes(body.quality)) {
    return { valid: false, error: 'Invalid quality specified' }
  }

  if (body.steps && (body.steps < 1 || body.steps > 50)) {
    return { valid: false, error: 'Steps must be between 1 and 50' }
  }

  if (body.guidance && (body.guidance < 1 || body.guidance > 20)) {
    return { valid: false, error: 'Guidance must be between 1 and 20' }
  }

  return { valid: true }
}
