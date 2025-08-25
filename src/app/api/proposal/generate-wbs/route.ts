import { NextRequest, NextResponse } from 'next/server'

interface WorkItem {
  id: string
  category: string
  task: string
  hours: number
  hourlyRate: number
  complexity: 'low' | 'medium' | 'high'
  riskFactor: number
}

export async function POST(request: NextRequest) {
  try {
    const { projectType, scope } = await request.json()

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const workItems = generateWorkItems(projectType, scope)

    return NextResponse.json({ workItems })

  } catch (error) {
    console.error('WBS generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate WBS' },
      { status: 500 }
    )
  }
}

function generateWorkItems(projectType: string, scope: string): WorkItem[] {
  const baseWorkItems = [
    // 기획/분석 단계
    {
      category: '기획/분석',
      task: '요구사항 수집 및 분석',
      hours: 40,
      hourlyRate: 80000,
      complexity: 'medium' as const,
      riskFactor: 10
    },
    {
      category: '기획/분석',  
      task: '시스템 아키텍처 설계',
      hours: 32,
      hourlyRate: 80000,
      complexity: 'high' as const,
      riskFactor: 15
    },
    {
      category: '기획/분석',
      task: 'API 설계 및 명세서 작성',
      hours: 24,
      hourlyRate: 70000,
      complexity: 'medium' as const,
      riskFactor: 5
    },

    // 디자인 단계
    {
      category: '디자인',
      task: 'UI/UX 와이어프레임 설계',
      hours: 32,
      hourlyRate: 60000,
      complexity: 'medium' as const,
      riskFactor: 10
    },
    {
      category: '디자인',
      task: '프로토타입 제작',
      hours: 40,
      hourlyRate: 60000,
      complexity: 'medium' as const,
      riskFactor: 15
    },
    {
      category: '디자인',
      task: '디자인 시스템 구축',
      hours: 24,
      hourlyRate: 60000,
      complexity: 'low' as const,
      riskFactor: 5
    },

    // 프론트엔드 개발
    {
      category: '프론트엔드 개발',
      task: '프로젝트 초기 설정',
      hours: 16,
      hourlyRate: 70000,
      complexity: 'low' as const,
      riskFactor: 5
    },
    {
      category: '프론트엔드 개발',
      task: '공통 컴포넌트 개발',
      hours: 48,
      hourlyRate: 70000,
      complexity: 'medium' as const,
      riskFactor: 10
    },
    {
      category: '프론트엔드 개발',
      task: '메인 페이지 개발',
      hours: 40,
      hourlyRate: 70000,
      complexity: 'medium' as const,
      riskFactor: 10
    },
    {
      category: '프론트엔드 개발',
      task: '사용자 인증 시스템',
      hours: 32,
      hourlyRate: 70000,
      complexity: 'high' as const,
      riskFactor: 20
    },
    {
      category: '프론트엔드 개발',
      task: '대시보드 개발',
      hours: 56,
      hourlyRate: 70000,
      complexity: 'high' as const,
      riskFactor: 15
    },

    // 백엔드 개발
    {
      category: '백엔드 개발',
      task: '데이터베이스 스키마 설계',
      hours: 24,
      hourlyRate: 70000,
      complexity: 'medium' as const,
      riskFactor: 10
    },
    {
      category: '백엔드 개발',
      task: 'REST API 구현',
      hours: 64,
      hourlyRate: 70000,
      complexity: 'high' as const,
      riskFactor: 15
    },
    {
      category: '백엔드 개발',
      task: '인증/권한 시스템 구현',
      hours: 32,
      hourlyRate: 70000,
      complexity: 'high' as const,
      riskFactor: 20
    },
    {
      category: '백엔드 개발',
      task: '데이터 마이그레이션',
      hours: 16,
      hourlyRate: 70000,
      complexity: 'medium' as const,
      riskFactor: 25
    },

    // 데이터베이스
    {
      category: '데이터베이스',
      task: 'DB 환경 구축',
      hours: 16,
      hourlyRate: 75000,
      complexity: 'medium' as const,
      riskFactor: 10
    },
    {
      category: '데이터베이스',
      task: '인덱스 최적화',
      hours: 12,
      hourlyRate: 75000,
      complexity: 'high' as const,
      riskFactor: 15
    },
    {
      category: '데이터베이스',
      task: '백업 및 복구 시스템',
      hours: 16,
      hourlyRate: 75000,
      complexity: 'medium' as const,
      riskFactor: 20
    },

    // 테스팅
    {
      category: '테스팅',
      task: '테스트 계획 수립',
      hours: 16,
      hourlyRate: 55000,
      complexity: 'low' as const,
      riskFactor: 5
    },
    {
      category: '테스팅',
      task: '단위 테스트 작성',
      hours: 32,
      hourlyRate: 55000,
      complexity: 'medium' as const,
      riskFactor: 10
    },
    {
      category: '테스팅',
      task: '통합 테스트',
      hours: 24,
      hourlyRate: 55000,
      complexity: 'medium' as const,
      riskFactor: 15
    },
    {
      category: '테스팅',
      task: '사용자 테스트 및 피드백',
      hours: 16,
      hourlyRate: 55000,
      complexity: 'medium' as const,
      riskFactor: 20
    },

    // 배포/인프라
    {
      category: '배포/인프라',
      task: 'CI/CD 파이프라인 구축',
      hours: 24,
      hourlyRate: 75000,
      complexity: 'high' as const,
      riskFactor: 20
    },
    {
      category: '배포/인프라',
      task: '프로덕션 환경 구축',
      hours: 32,
      hourlyRate: 75000,
      complexity: 'high' as const,
      riskFactor: 25
    },
    {
      category: '배포/인프라',
      task: '모니터링 시스템 구축',
      hours: 16,
      hourlyRate: 75000,
      complexity: 'medium' as const,
      riskFactor: 15
    },

    // 문서화
    {
      category: '문서화',
      task: 'API 문서 작성',
      hours: 16,
      hourlyRate: 50000,
      complexity: 'low' as const,
      riskFactor: 5
    },
    {
      category: '문서화',
      task: '사용자 매뉴얼 작성',
      hours: 24,
      hourlyRate: 50000,
      complexity: 'low' as const,
      riskFactor: 5
    },
    {
      category: '문서화',
      task: '운영 가이드 작성',
      hours: 16,
      hourlyRate: 50000,
      complexity: 'low' as const,
      riskFactor: 10
    },

    // 프로젝트 관리
    {
      category: '프로젝트 관리',
      task: '프로젝트 킥오프 및 계획',
      hours: 8,
      hourlyRate: 80000,
      complexity: 'low' as const,
      riskFactor: 5
    },
    {
      category: '프로젝트 관리',
      task: '주간 진행 회의 및 보고',
      hours: 32,
      hourlyRate: 80000,
      complexity: 'low' as const,
      riskFactor: 5
    },
    {
      category: '프로젝트 관리',
      task: '이슈 관리 및 해결',
      hours: 24,
      hourlyRate: 80000,
      complexity: 'medium' as const,
      riskFactor: 15
    }
  ]

  // Add unique IDs
  const workItemsWithIds = baseWorkItems.map((item, index) => ({
    id: `item-${Date.now()}-${index}`,
    ...item
  }))

  // Adjust based on project scope
  if (scope === 'mvp') {
    // Reduce hours for MVP
    return workItemsWithIds.map(item => ({
      ...item,
      hours: Math.floor(item.hours * 0.7)
    }))
  } else if (scope === 'enterprise') {
    // Increase hours and complexity for enterprise
    return workItemsWithIds.map(item => ({
      ...item,
      hours: Math.floor(item.hours * 1.5),
      complexity: item.complexity === 'low' ? 'medium' : 
                  item.complexity === 'medium' ? 'high' : 'high',
      riskFactor: item.riskFactor + 5
    }))
  }

  return workItemsWithIds
}