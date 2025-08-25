import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { textContent, fileName, projectId } = await request.json()

    if (!textContent || !fileName) {
      return NextResponse.json(
        { error: 'Text content and file name are required' },
        { status: 400 }
      )
    }

    // Simulate AI analysis with a realistic delay
    await new Promise(resolve => setTimeout(resolve, 3000))

    // For demo purposes, generate a mock analysis based on keywords
    const analysis = {
      projectTitle: extractProjectTitle(textContent, fileName),
      client: extractClient(textContent),
      deadline: extractDeadline(textContent),
      budget: extractBudget(textContent),
      requirements: {
        functional: extractFunctionalRequirements(textContent),
        technical: extractTechnicalRequirements(textContent),
        design: extractDesignRequirements(textContent),
      },
      scope: extractScope(textContent),
      deliverables: extractDeliverables(textContent),
      riskFactors: extractRiskFactors(textContent),
      keyPoints: extractKeyPoints(textContent),
    }

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('RFP analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze RFP' },
      { status: 500 }
    )
  }
}

function extractProjectTitle(content: string, fileName: string): string {
  // Look for project title patterns
  const titlePatterns = [
    /프로젝트\s*명?\s*[:：]\s*(.+)/i,
    /사업\s*명?\s*[:：]\s*(.+)/i,
    /과제\s*명?\s*[:：]\s*(.+)/i,
  ]

  for (const pattern of titlePatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1].trim().split(/[\n\r]/, 1)[0]
    }
  }

  // If no title found, use filename
  return fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
}

function extractClient(content: string): string {
  const clientPatterns = [
    /발주\s*기관?\s*[:：]\s*(.+)/i,
    /클라이언트\s*[:：]\s*(.+)/i,
    /의뢰\s*기관?\s*[:：]\s*(.+)/i,
    /고객사\s*[:：]\s*(.+)/i,
  ]

  for (const pattern of clientPatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1].trim().split(/[\n\r]/, 1)[0]
    }
  }

  return '클라이언트 정보를 찾을 수 없음'
}

function extractDeadline(content: string): string {
  const deadlinePatterns = [
    /마감\s*일?\s*[:：]\s*(.+)/i,
    /완료\s*일?\s*[:：]\s*(.+)/i,
    /납기\s*일?\s*[:：]\s*(.+)/i,
    /\d{4}[-년.]\s?\d{1,2}[-월.]\s?\d{1,2}일?/g,
  ]

  for (const pattern of deadlinePatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1] ? match[1].trim().split(/[\n\r]/, 1)[0] : match[0]
    }
  }

  return '마감일 정보를 찾을 수 없음'
}

function extractBudget(content: string) {
  const budgetPatterns = [
    /예산\s*[:：]\s*([0-9,]+)\s*~\s*([0-9,]+)\s*(만원|원)/i,
    /예산\s*[:：]\s*([0-9,]+)\s*(만원|원)/i,
    /([0-9,]+)\s*만원/g,
  ]

  for (const pattern of budgetPatterns) {
    const match = content.match(pattern)
    if (match) {
      if (match[2] && match[3]) {
        // Range found
        const min = parseInt(match[1].replace(/,/g, ''))
        const max = parseInt(match[2].replace(/,/g, ''))
        const currency = match[3] === '만원' ? 'KRW' : 'KRW'
        return {
          min: match[3] === '만원' ? min * 10000 : min,
          max: match[3] === '만원' ? max * 10000 : max,
          currency,
        }
      } else if (match[1]) {
        // Single value
        const amount = parseInt(match[1].replace(/,/g, ''))
        const currency = 'KRW'
        return {
          min: match[2] === '만원' ? amount * 10000 : amount,
          currency,
        }
      }
    }
  }

  return {
    currency: 'KRW',
  }
}

function extractFunctionalRequirements(content: string): string[] {
  const requirements = []
  
  // Look for common functional requirement keywords
  const keywords = ['사용자 관리', '로그인', '회원가입', '게시판', '검색', '결제', '주문', '관리자', '대시보드', '리포트', '알림']
  
  for (const keyword of keywords) {
    if (content.includes(keyword)) {
      requirements.push(`${keyword} 기능 구현`)
    }
  }

  // Add some default requirements if none found
  if (requirements.length === 0) {
    requirements.push(
      '사용자 인증 및 권한 관리',
      '데이터 CRUD 기능',
      '검색 및 필터링',
      '반응형 웹 디자인'
    )
  }

  return requirements
}

function extractTechnicalRequirements(content: string): string[] {
  const requirements = []
  
  // Look for technical keywords
  const techKeywords = [
    { keyword: 'React', requirement: 'React 프레임워크 사용' },
    { keyword: 'Vue', requirement: 'Vue.js 프레임워크 사용' },
    { keyword: 'Node', requirement: 'Node.js 백엔드 구현' },
    { keyword: 'MySQL', requirement: 'MySQL 데이터베이스 사용' },
    { keyword: 'PostgreSQL', requirement: 'PostgreSQL 데이터베이스 사용' },
    { keyword: 'API', requirement: 'RESTful API 구현' },
    { keyword: 'AWS', requirement: 'AWS 클라우드 인프라' },
  ]

  for (const { keyword, requirement } of techKeywords) {
    if (content.includes(keyword)) {
      requirements.push(requirement)
    }
  }

  // Add default technical requirements
  if (requirements.length === 0) {
    requirements.push(
      '웹 표준 및 크로스브라우징 지원',
      '보안 강화 (HTTPS, 데이터 암호화)',
      '성능 최적화',
      '모바일 반응형 지원'
    )
  }

  return requirements
}

function extractDesignRequirements(content: string): string[] {
  const requirements = []
  
  // Look for design keywords
  const designKeywords = ['디자인', '브랜드', '로고', 'UI', 'UX', '사용성', '접근성']
  
  for (const keyword of designKeywords) {
    if (content.includes(keyword)) {
      requirements.push(`${keyword} 가이드라인 준수`)
    }
  }

  // Add default design requirements
  if (requirements.length === 0) {
    requirements.push(
      '직관적인 사용자 인터페이스',
      '일관된 디자인 시스템',
      '모바일 우선 반응형 디자인',
      '웹 접근성(WCAG) 준수'
    )
  }

  return requirements
}

function extractScope(content: string): string {
  // Look for scope-related sections
  const scopePatterns = [
    /범위\s*[:：](.*?)(?=\n\n|\n[가-힣]|\n\d|$)/is,
    /사업\s*내용\s*[:：](.*?)(?=\n\n|\n[가-힣]|\n\d|$)/is,
  ]

  for (const pattern of scopePatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return '웹 애플리케이션 설계, 개발, 테스팅, 배포 및 운영 지원을 포함한 전체 생명주기 관리'
}

function extractDeliverables(content: string): string[] {
  const deliverables = []
  
  // Look for deliverable keywords
  const keywords = ['소스코드', '문서', '매뉴얼', '설계서', '테스트', '교육']
  
  for (const keyword of keywords) {
    if (content.includes(keyword)) {
      deliverables.push(`${keyword} 제공`)
    }
  }

  // Add default deliverables
  if (deliverables.length === 0) {
    deliverables.push(
      '완성된 웹 애플리케이션',
      '소스코드 및 기술문서',
      '사용자 매뉴얼',
      '운영 가이드',
      '테스트 결과서'
    )
  }

  return deliverables
}

function extractRiskFactors(content: string): string[] {
  return [
    '요구사항 변경에 따른 일정 지연 가능성',
    '외부 API 연동 시 기술적 제약사항',
    '브라우저 호환성 이슈',
    '데이터 마이그레이션 복잡성',
    '성능 최적화 요구사항'
  ]
}

function extractKeyPoints(content: string): string[] {
  return [
    '사용자 경험(UX) 최적화에 중점',
    '확장 가능한 아키텍처 설계',
    '보안 및 개인정보 보호 강화',
    '유지보수 용이성 고려',
    '프로젝트 일정 및 품질 관리'
  ]
}