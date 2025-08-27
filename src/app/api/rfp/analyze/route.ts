import { NextRequest, NextResponse } from 'next/server'

interface RFPAnalysisRequest {
  projectId: string
  content: string
  analysisType: 'manual' | 'document'
  documentId?: string
}

interface RequirementExtraction {
  id: string
  title: string
  description: string
  requirement_type:
    | 'functional'
    | 'non_functional'
    | 'business'
    | 'technical'
    | 'constraint'
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  acceptance_criteria: string[]
  business_value: number
  estimated_effort: number
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  status: 'identified'
}

// AI 분석을 시뮬레이션하는 함수
function simulateAIAnalysis(content: string): RequirementExtraction[] {
  // 실제 구현에서는 Claude, GPT, 또는 Gemini API를 사용
  const mockRequirements: RequirementExtraction[] = []

  // 키워드 기반으로 요구사항 추출 시뮬레이션
  const keywords = {
    functional: [
      '로그인',
      '회원가입',
      '결제',
      '주문',
      '상품',
      '장바구니',
      '검색',
      '게시판',
      '댓글',
      '리뷰',
    ],
    non_functional: [
      '성능',
      '보안',
      '확장성',
      '접근성',
      '반응형',
      '호환성',
      '가용성',
      '유지보수',
    ],
    business: [
      '매출',
      '고객',
      '브랜드',
      '마케팅',
      '분석',
      '리포트',
      '대시보드',
      'KPI',
    ],
    technical: [
      'API',
      '데이터베이스',
      '클라우드',
      '배포',
      '모니터링',
      '로그',
      'SSL',
      '백업',
    ],
    constraint: ['예산', '일정', '리소스', '제약', '한계', '규정', '법적'],
  }

  let id = 1

  // 각 카테고리별로 키워드 매칭하여 요구사항 생성
  Object.entries(keywords).forEach(([type, keywordList]) => {
    keywordList.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        const requirement: RequirementExtraction = {
          id: (id++).toString(),
          title: generateRequirementTitle(keyword, type as string),
          description: generateRequirementDescription(keyword, type as string),
          requirement_type: type as string,
          priority: generatePriority(keyword),
          category: generateCategory(keyword),
          acceptance_criteria: generateAcceptanceCriteria(keyword),
          business_value: Math.floor(Math.random() * 5) + 5,
          estimated_effort: Math.floor(Math.random() * 20) + 5,
          risk_level: generateRiskLevel(keyword),
          status: 'identified',
        }
        mockRequirements.push(requirement)
      }
    })
  })

  return mockRequirements.slice(0, 10) // 최대 10개로 제한
}

function generateRequirementTitle(keyword: string, type: string): string {
  const templates = {
    functional: {
      로그인: '사용자 로그인 시스템',
      회원가입: '회원 등록 및 인증',
      결제: '온라인 결제 처리',
      주문: '주문 관리 시스템',
      상품: '상품 카탈로그 관리',
      장바구니: '쇼핑카트 기능',
      검색: '통합 검색 시스템',
      게시판: '커뮤니티 게시판',
      댓글: '댓글 및 답글 시스템',
      리뷰: '상품 리뷰 시스템',
    },
    non_functional: {
      성능: '시스템 성능 최적화',
      보안: '보안 강화 방안',
      확장성: '확장 가능한 아키텍처',
      접근성: '웹 접근성 준수',
      반응형: '반응형 웹 디자인',
      호환성: '크로스 브라우저 호환',
      가용성: '고가용성 시스템',
      유지보수: '유지보수성 향상',
    },
    business: {
      매출: '매출 분석 대시보드',
      고객: '고객 관리 시스템',
      브랜드: '브랜드 아이덴티티 구현',
      마케팅: '마케팅 자동화',
      분석: '데이터 분석 플랫폼',
      리포트: '리포팅 시스템',
      대시보드: '경영진 대시보드',
      KPI: 'KPI 모니터링',
    },
    technical: {
      API: 'RESTful API 설계',
      데이터베이스: '데이터베이스 최적화',
      클라우드: '클라우드 인프라 구축',
      배포: 'CI/CD 파이프라인',
      모니터링: '시스템 모니터링',
      로그: '로그 관리 시스템',
      SSL: 'SSL 인증서 적용',
      백업: '데이터 백업 시스템',
    },
    constraint: {
      예산: '예산 제약 사항',
      일정: '일정 제약 조건',
      리소스: '리소스 할당 제한',
      제약: '기술적 제약 사항',
      한계: '시스템 한계점',
      규정: '규정 준수 요구사항',
      법적: '법적 요구사항',
    },
  }

  return (
    templates[type as keyof typeof templates][keyword] ||
    `${keyword} 관련 요구사항`
  )
}

function generateRequirementDescription(keyword: string, type: string): string {
  const descriptions = {
    functional: {
      로그인:
        '사용자가 이메일/비밀번호 또는 소셜 계정을 통해 시스템에 로그인할 수 있는 기능',
      회원가입:
        '신규 사용자가 계정을 생성하고 이메일 인증을 통해 회원가입할 수 있는 기능',
      결제: '다양한 결제 수단(카드, 계좌이체, 간편결제)을 지원하는 안전한 결제 처리 시스템',
      주문: '고객이 주문하고 관리자가 주문을 처리할 수 있는 주문 관리 시스템',
    },
    non_functional: {
      성능: '페이지 로딩 시간 3초 이내, 동시 사용자 1000명 지원',
      보안: 'HTTPS, JWT 토큰 인증, SQL 인젝션 방지 등 보안 기능 구현',
      확장성: '트래픽 증가에 따른 수평적/수직적 확장 가능한 아키텍처 설계',
    },
  }

  return (
    descriptions[type as keyof typeof descriptions]?.[keyword] ||
    `${keyword}에 대한 상세한 요구사항을 정의하고 구현해야 합니다.`
  )
}

function generatePriority(
  keyword: string
): 'critical' | 'high' | 'medium' | 'low' {
  const criticalKeywords = ['결제', '보안', '로그인', '예산']
  const highKeywords = ['주문', '상품', '성능', '일정']

  if (criticalKeywords.includes(keyword)) return 'critical'
  if (highKeywords.includes(keyword)) return 'high'
  return Math.random() > 0.5 ? 'medium' : 'low'
}

function generateCategory(keyword: string): string {
  const categories = {
    로그인: '사용자 인증',
    회원가입: '사용자 관리',
    결제: '결제 시스템',
    주문: '주문 관리',
    상품: '상품 관리',
    장바구니: '쇼핑',
    검색: '검색 기능',
    게시판: '커뮤니티',
    성능: 'NFR',
    보안: '보안',
    API: '시스템 연동',
  }

  return categories[keyword as keyof typeof categories] || '기타'
}

function generateAcceptanceCriteria(keyword: string): string[] {
  const criteria = {
    로그인: [
      '이메일/비밀번호 검증',
      '로그인 실패 시 에러 메시지',
      '로그인 성공 시 토큰 발급',
    ],
    결제: ['PG사 연동', '결제 성공/실패 처리', '결제 내역 저장'],
    상품: ['상품 CRUD 기능', '이미지 업로드', '재고 관리'],
    성능: [
      '페이지 로딩 3초 이내',
      '동시 접속자 1000명 처리',
      '서버 응답시간 1초 이내',
    ],
  }

  return (
    criteria[keyword as keyof typeof criteria] || [
      `${keyword} 기능 동작`,
      `${keyword} 에러 처리`,
      `${keyword} 테스트 완료`,
    ]
  )
}

function generateRiskLevel(
  keyword: string
): 'critical' | 'high' | 'medium' | 'low' {
  const highRiskKeywords = ['결제', '보안', 'API', '데이터베이스']
  if (highRiskKeywords.includes(keyword)) return 'high'
  return Math.random() > 0.7 ? 'medium' : 'low'
}

export async function POST(request: NextRequest) {
  try {
    const body: RFPAnalysisRequest = await request.json()
    const { projectId, content, analysisType, documentId } = body

    if (!projectId || !content) {
      return NextResponse.json(
        { error: 'projectId와 content가 필요합니다.' },
        { status: 400 }
      )
    }

    // AI 분석 시뮬레이션 (실제로는 3-5초 소요)
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 요구사항 추출
    const requirements = simulateAIAnalysis(content)

    // 분석 결과를 데이터베이스에 저장 (실제 구현에서는 Supabase 사용)
    const analysisResult = {
      analysis_id: `analysis_${Date.now()}`,
      project_id: projectId,
      document_id: documentId,
      analysis_type: 'requirement_extraction',
      ai_model: 'gpt-4',
      requirements,
      confidence_score: 0.85,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      requirements,
      summary: {
        total_requirements: requirements.length,
        by_type: {
          functional: requirements.filter(
            r => r.requirement_type === 'functional'
          ).length,
          non_functional: requirements.filter(
            r => r.requirement_type === 'non_functional'
          ).length,
          business: requirements.filter(r => r.requirement_type === 'business')
            .length,
          technical: requirements.filter(
            r => r.requirement_type === 'technical'
          ).length,
          constraint: requirements.filter(
            r => r.requirement_type === 'constraint'
          ).length,
        },
        by_priority: {
          critical: requirements.filter(r => r.priority === 'critical').length,
          high: requirements.filter(r => r.priority === 'high').length,
          medium: requirements.filter(r => r.priority === 'medium').length,
          low: requirements.filter(r => r.priority === 'low').length,
        },
        estimated_total_effort: requirements.reduce(
          (sum, r) => sum + r.estimated_effort,
          0
        ),
        average_business_value:
          Math.round(
            (requirements.reduce((sum, r) => sum + r.business_value, 0) /
              requirements.length) *
              10
          ) / 10,
      },
    })
  } catch (error) {
    console.error('RFP 분석 오류:', error)
    return NextResponse.json(
      { error: 'RFP 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
