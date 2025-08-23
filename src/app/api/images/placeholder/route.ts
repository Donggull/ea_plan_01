import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const model = searchParams.get('model') || 'flux-schnell'
    const prompt = searchParams.get('prompt') || 'generated image'
    const index = searchParams.get('index') || '0'

    // 모델별 색상 설정
    const modelColors = {
      'flux-schnell': '#3B82F6', // 파란색
      imagen3: '#10B981', // 초록색
      'flux-context': '#8B5CF6', // 보라색
    }

    const color = modelColors[model as keyof typeof modelColors] || '#6B7280'

    // SVG 플레이스홀더 이미지 생성
    const svg = `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.4" />
          </linearGradient>
        </defs>
        
        <!-- 배경 -->
        <rect width="512" height="512" fill="url(#gradient)"/>
        
        <!-- 격자 패턴 -->
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="${color}" stroke-width="1" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="512" height="512" fill="url(#grid)"/>
        
        <!-- 중앙 아이콘 -->
        <g transform="translate(256,200)">
          <rect x="-60" y="-30" width="120" height="80" rx="8" fill="white" opacity="0.9"/>
          <rect x="-50" y="-20" width="100" height="60" rx="4" fill="${color}" opacity="0.8"/>
          <circle cx="-25" cy="-5" r="8" fill="white" opacity="0.9"/>
          <polygon points="-10,10 10,10 0,-10" fill="white" opacity="0.9"/>
        </g>
        
        <!-- 모델 이름 -->
        <text x="256" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">
          ${model.toUpperCase()}
        </text>
        
        <!-- 인덱스 표시 -->
        <text x="256" y="345" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white" opacity="0.8">
          Image #${parseInt(index) + 1}
        </text>
        
        <!-- 프롬프트 미리보기 (짧게) -->
        <text x="256" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white" opacity="0.6">
          ${prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}
        </text>
        
        <!-- 생성 시간 -->
        <text x="256" y="390" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="white" opacity="0.5">
          Generated: ${new Date().toLocaleTimeString()}
        </text>
        
        <!-- 워터마크 -->
        <text x="20" y="490" font-family="Arial, sans-serif" font-size="10" fill="white" opacity="0.3">
          AI Generated • Planning Platform
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Placeholder image API error:', error)

    // 에러 발생 시 기본 SVG 반환
    const errorSvg = `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#EF4444"/>
        <text x="256" y="256" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">
          이미지 생성 중...
        </text>
      </svg>
    `

    return new NextResponse(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    })
  }
}
