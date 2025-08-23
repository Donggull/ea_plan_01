import { NextRequest, NextResponse } from 'next/server'
import { ImageService } from '@/lib/services/imageService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')
    const format = searchParams.get('format') || 'original'

    if (!imageId) {
      return NextResponse.json(
        {
          error: 'Image ID is required',
          success: false,
        },
        { status: 400 }
      )
    }

    // 이미지 정보 조회
    const imageResult = await ImageService.getImageById(imageId)
    if (!imageResult.success || !imageResult.data) {
      return NextResponse.json(
        {
          error: 'Image not found',
          success: false,
        },
        { status: 404 }
      )
    }

    const imageData = imageResult.data

    // 다운로드 서비스 호출
    const downloadResult = await ImageService.downloadImage(imageId)
    if (!downloadResult.success || !downloadResult.data) {
      return NextResponse.json(
        {
          error: 'Failed to download image',
          success: false,
        },
        { status: 500 }
      )
    }

    // 파일명 생성
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `generated-image-${imageData.model_used}-${timestamp}.${getFileExtension(format)}`

    // 응답 헤더 설정
    const headers = new Headers()
    headers.set('Content-Type', getContentType(format))
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    headers.set('Cache-Control', 'public, max-age=31536000') // 1년 캐시

    return new NextResponse(downloadResult.data, { headers })
  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageIds, format = 'webp', zipDownload = false } = body

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        {
          error: 'Image IDs array is required',
          success: false,
        },
        { status: 400 }
      )
    }

    if (imageIds.length > 50) {
      return NextResponse.json(
        {
          error: 'Maximum 50 images can be downloaded at once',
          success: false,
        },
        { status: 400 }
      )
    }

    // 단일 이미지 다운로드
    if (imageIds.length === 1 && !zipDownload) {
      const downloadResult = await ImageService.downloadImage(imageIds[0])
      if (!downloadResult.success || !downloadResult.data) {
        return NextResponse.json(
          {
            error: 'Failed to download image',
            success: false,
          },
          { status: 500 }
        )
      }

      const headers = new Headers()
      headers.set('Content-Type', getContentType(format))
      headers.set(
        'Content-Disposition',
        `attachment; filename="generated-image.${getFileExtension(format)}"`
      )

      return new NextResponse(downloadResult.data, { headers })
    }

    // 다중 이미지 ZIP 다운로드 (실제 구현 필요)
    return NextResponse.json({
      success: true,
      message: 'Batch download initiated',
      data: {
        download_id: `batch_${Date.now()}`,
        status: 'preparing',
        total_images: imageIds.length,
      },
    })
  } catch (error) {
    console.error('Batch download API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    )
  }
}

// 유틸리티 함수들
function getContentType(format: string): string {
  const contentTypes: Record<string, string> = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    original: 'image/webp', // 기본값
  }

  return contentTypes[format.toLowerCase()] || 'image/webp'
}

function getFileExtension(format: string): string {
  const extensions: Record<string, string> = {
    webp: 'webp',
    jpeg: 'jpg',
    jpg: 'jpg',
    png: 'png',
    gif: 'gif',
    original: 'webp', // 기본값
  }

  return extensions[format.toLowerCase()] || 'webp'
}
