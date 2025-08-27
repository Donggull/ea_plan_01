import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { category, keywords } = await request.json()

    if (!category || !keywords) {
      return NextResponse.json(
        { error: 'Category and keywords are required' },
        { status: 400 }
      )
    }

    // Simulate market research with realistic delay
    await new Promise(resolve => setTimeout(resolve, 4000))

    const research = generateMarketResearch(category, keywords)

    return NextResponse.json(research)
  } catch (error) {
    console.error('Market research error:', error)
    return NextResponse.json(
      { error: 'Failed to conduct market research' },
      { status: 500 }
    )
  }
}

function generateMarketResearch(category: string, keywords: string[]) {
  const competitors = generateCompetitors(category)
  const marketTrends = generateMarketTrends(category)
  const technologyStack = generateTechnologyStack(category)
  const pricing = generatePricingAnalysis(category)
  const timeline = generateTimeline(category)
  const recommendations = generateRecommendations(category, keywords)
  const sources = [
    'Statista - Web Development Market Report 2024',
    'Stack Overflow Developer Survey 2024',
    'GitHub State of the Octoverse 2024',
    'Google Web Development Trends',
    'NPM Package Usage Statistics',
  ]

  return {
    competitors,
    marketTrends,
    technologyStack,
    pricing,
    timeline,
    recommendations,
    sources,
  }
}

function generateCompetitors(category: string) {
  const competitorSets = {
    proposal: [
      {
        name: '제안서 작성 전문 업체 A',
        website: 'https://example-proposal-a.com',
        strengths: ['풍부한 경험', '높은 수주율', '빠른 턴어라운드'],
        weaknesses: ['높은 비용', '제한적인 기술 스택', '커스터마이징 어려움'],
        pricingModel: '프로젝트당 300-800만원',
      },
      {
        name: '디지털 에이전시 B',
        website: 'https://example-agency-b.com',
        strengths: ['종합적 서비스', '크리에이티브 강점', '대기업 경험'],
        weaknesses: ['높은 가격대', '중소규모 프로젝트 관심 저조'],
        pricingModel: '월 100-500만원 (유지보수 별도)',
      },
    ],
    development: [
      {
        name: '웹개발 전문업체 C',
        website: 'https://example-dev-c.com',
        strengths: ['최신 기술 스택', '빠른 개발 속도', '합리적 가격'],
        weaknesses: ['디자인 역량 부족', '대규모 프로젝트 경험 부족'],
        pricingModel: '개발자당 일 50-80만원',
      },
      {
        name: '풀스택 개발팀 D',
        website: 'https://example-fullstack-d.com',
        strengths: ['종합적 기술력', '유연한 대응', 'DevOps 전문성'],
        weaknesses: ['높은 인건비', '프로젝트 일정 지연 가능성'],
        pricingModel: '시간당 8-15만원',
      },
    ],
    operation: [
      {
        name: '운영 관리 전문사 E',
        website: 'https://example-ops-e.com',
        strengths: ['24/7 모니터링', '신속한 장애 대응', '운영 자동화'],
        weaknesses: ['초기 구축 비용 높음', '특정 기술 스택 제한'],
        pricingModel: '월 50-200만원 (규모별)',
      },
      {
        name: '클라우드 서비스 F',
        website: 'https://example-cloud-f.com',
        strengths: ['확장성', '비용 효율성', '보안 강화'],
        weaknesses: ['기술 의존성', '커스터마이징 제약'],
        pricingModel: '사용량 기반 과금',
      },
    ],
  }

  return (
    competitorSets[category as keyof typeof competitorSets] ||
    competitorSets.development
  )
}

function generateMarketTrends(category: string) {
  const trendSets = {
    proposal: [
      {
        trend: 'AI 기반 제안서 자동 생성',
        impact: 'high' as const,
        description:
          'ChatGPT, Claude 등 AI 도구를 활용한 제안서 작성이 급속히 증가하고 있음',
      },
      {
        trend: '협업 도구 통합',
        impact: 'medium' as const,
        description: 'Slack, Notion 등과 연계한 실시간 협업 기능 수요 증가',
      },
    ],
    development: [
      {
        trend: 'Full-Stack JavaScript 개발',
        impact: 'high' as const,
        description:
          'Next.js, Nuxt.js 등 메타프레임워크 사용률이 70% 이상 증가',
      },
      {
        trend: 'AI 코드 생성 도구 활용',
        impact: 'high' as const,
        description: 'GitHub Copilot, Cursor 등으로 개발 생산성 30-50% 향상',
      },
      {
        trend: '서버리스 아키텍처',
        impact: 'medium' as const,
        description: 'Vercel, Netlify 등 JAMstack 기반 개발 방식 확산',
      },
    ],
    operation: [
      {
        trend: 'DevOps 자동화',
        impact: 'high' as const,
        description:
          'CI/CD 파이프라인 구축이 필수가 되어 운영 효율성 크게 향상',
      },
      {
        trend: '모니터링 및 옵저빌리티',
        impact: 'medium' as const,
        description:
          'Prometheus, Grafana 등을 활용한 실시간 모니터링 중요성 증대',
      },
    ],
  }

  return trendSets[category as keyof typeof trendSets] || trendSets.development
}

function generateTechnologyStack(category: string) {
  const techStacks = {
    proposal: [
      {
        category: 'Frontend',
        technologies: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
        popularity: 85,
        adoptionRate: '85% (2024년 기준)',
      },
      {
        category: 'Backend',
        technologies: ['Node.js', 'Express', 'Prisma', 'PostgreSQL'],
        popularity: 78,
        adoptionRate: '78% (기업용 프로젝트 기준)',
      },
      {
        category: 'AI/ML',
        technologies: ['OpenAI API', 'Langchain', 'Vector DB'],
        popularity: 65,
        adoptionRate: '65% (신규 프로젝트 기준)',
      },
    ],
    development: [
      {
        category: 'Frontend',
        technologies: ['React', 'Vue.js', 'Angular', 'Next.js'],
        popularity: 92,
        adoptionRate: '92% (상업용 프로젝트 기준)',
      },
      {
        category: 'Backend',
        technologies: ['Node.js', 'Python', 'Java', 'Go'],
        popularity: 88,
        adoptionRate: '88% (엔터프라이즈 기준)',
      },
      {
        category: 'Database',
        technologies: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
        popularity: 81,
        adoptionRate: '81% (프로덕션 환경 기준)',
      },
    ],
    operation: [
      {
        category: 'Container',
        technologies: ['Docker', 'Kubernetes', 'Helm'],
        popularity: 89,
        adoptionRate: '89% (클라우드 네이티브 기준)',
      },
      {
        category: 'CI/CD',
        technologies: ['GitHub Actions', 'Jenkins', 'GitLab CI'],
        popularity: 86,
        adoptionRate: '86% (자동화 도입 기업 기준)',
      },
      {
        category: 'Monitoring',
        technologies: ['Prometheus', 'Grafana', 'ELK Stack'],
        popularity: 74,
        adoptionRate: '74% (모니터링 도구 사용 기업 기준)',
      },
    ],
  }

  return (
    techStacks[category as keyof typeof techStacks] || techStacks.development
  )
}

function generatePricingAnalysis(category: string) {
  const pricingData = {
    proposal: {
      averageRange: { min: 300, max: 1500, currency: 'KRW (만원)' },
      factorsAffectingPrice: [
        '프로젝트 규모 및 복잡도',
        '제안서 페이지 수',
        '디자인 및 인포그래픽 포함 여부',
        '시장 조사 깊이',
        '긴급성 (Rush Job 여부)',
      ],
      recommendedPricing: {
        strategy: '가치 기반 가격책정',
        justification:
          '경쟁사 대비 15-20% 할인된 가격으로 시장 진입 후, 품질 입증을 통해 점진적 인상',
      },
    },
    development: {
      averageRange: { min: 3000, max: 15000, currency: 'KRW (만원)' },
      factorsAffectingPrice: [
        '기능 복잡도 및 개발 범위',
        '사용자 수 및 트래픽 규모',
        '기술 스택 및 아키텍처',
        '디자인 요구사항',
        '일정 및 리소스',
      ],
      recommendedPricing: {
        strategy: '단계별 가격책정',
        justification:
          'MVP 단계는 경쟁력 있는 가격, 고도화 단계에서는 프리미엄 가격 적용',
      },
    },
    operation: {
      averageRange: { min: 100, max: 800, currency: 'KRW (만원/월)' },
      factorsAffectingPrice: [
        '서버 인프라 규모',
        '모니터링 및 알림 수준',
        'SLA 요구사항',
        '백업 및 복구 정책',
        '보안 요구사항',
      ],
      recommendedPricing: {
        strategy: '구독 기반 티어링',
        justification:
          '기본/표준/프리미엄 3단계 구성으로 고객 선택권 제공 및 업셀링 기회 창출',
      },
    },
  }

  return (
    pricingData[category as keyof typeof pricingData] || pricingData.development
  )
}

function generateTimeline(category: string) {
  const timelines = {
    proposal: [
      {
        phase: '요구사항 분석',
        duration: '1-2주',
        description: 'RFP 분석 및 고객 니즈 파악',
      },
      {
        phase: '시장 조사',
        duration: '1주',
        description: '경쟁사 분석 및 기술 트렌드 조사',
      },
      {
        phase: '제안서 작성',
        duration: '2-3주',
        description: '초안 작성, 검토, 수정 과정',
      },
      {
        phase: '최종 검토',
        duration: '3-5일',
        description: '품질 확인 및 최종 수정',
      },
    ],
    development: [
      {
        phase: '기획 및 설계',
        duration: '2-4주',
        description: '요구사항 정의, 시스템 아키텍처 설계',
      },
      {
        phase: '개발',
        duration: '8-16주',
        description: '프론트엔드 및 백엔드 개발, API 구현',
      },
      {
        phase: '테스팅',
        duration: '2-4주',
        description: '단위/통합/사용자 테스트',
      },
      {
        phase: '배포 및 운영',
        duration: '1-2주',
        description: '프로덕션 배포 및 모니터링 설정',
      },
    ],
    operation: [
      {
        phase: '인프라 구축',
        duration: '1-2주',
        description: '서버 환경 구성 및 모니터링 설정',
      },
      {
        phase: '서비스 이관',
        duration: '1주',
        description: '기존 서비스에서 새 환경으로 이관',
      },
      {
        phase: '안정화',
        duration: '2-4주',
        description: '성능 튜닝 및 안정성 확보',
      },
      {
        phase: '지속적 운영',
        duration: '지속적',
        description: '24/7 모니터링 및 유지보수',
      },
    ],
  }

  return timelines[category as keyof typeof timelines] || timelines.development
}

function generateRecommendations(category: string, keywords: string[]) {
  const baseRecommendations = {
    proposal: [
      'AI 도구를 활용한 효율적인 제안서 작성 프로세스 구축',
      '고객 맞춤형 템플릿 및 사례 데이터베이스 확충',
      '시각적 임팩트를 높이는 인포그래픽 및 차트 활용',
      '경쟁사 대비 차별화된 솔루션 제시 방안 모색',
    ],
    development: [
      '현재 시장에서 검증된 기술 스택 채택 권장',
      '확장성을 고려한 마이크로서비스 아키텍처 검토',
      '자동화된 테스팅 및 배포 파이프라인 구축',
      '보안 및 성능 최적화를 위한 코드 리뷰 프로세스 강화',
    ],
    operation: [
      '클라우드 네이티브 환경으로의 점진적 마이그레이션',
      'Infrastructure as Code(IaC) 도입을 통한 관리 효율화',
      '실시간 모니터링 및 알림 시스템 고도화',
      '재해 복구(DR) 및 백업 전략 수립',
    ],
  }

  const recommendations =
    baseRecommendations[category as keyof typeof baseRecommendations] ||
    baseRecommendations.development

  // Add keyword-specific recommendations
  keywords.forEach(keyword => {
    if (keyword.includes('AI') || keyword.includes('인공지능')) {
      recommendations.push('AI 기술 도입을 통한 경쟁력 강화 검토')
    }
    if (keyword.includes('모바일')) {
      recommendations.push('모바일 퍼스트 접근 방식 적용')
    }
    if (keyword.includes('보안')) {
      recommendations.push('강화된 보안 정책 및 컴플라이언스 준수')
    }
  })

  return recommendations
}
