import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const {
      sectionType,
      sectionTitle,
      projectTitle,
      rfpAnalysis,
      marketResearch,
    } = await request.json()

    if (!sectionType || !sectionTitle) {
      return NextResponse.json(
        { error: 'Section type and title are required' },
        { status: 400 }
      )
    }

    // Simulate AI content generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const content = generateSectionContent(
      sectionType,
      sectionTitle,
      projectTitle,
      rfpAnalysis,
      marketResearch
    )

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

function generateSectionContent(
  sectionType: string,
  sectionTitle: string,
  projectTitle: string,
  rfpAnalysis?: Record<string, unknown>,
  marketResearch?: Record<string, unknown>
): string {
  const templates = {
    '프로젝트 개요': () =>
      `
${projectTitle}는 ${rfpAnalysis?.client || '고객사'}의 디지털 혁신을 지원하기 위한 종합적인 웹 솔루션입니다.

본 프로젝트의 핵심 목표는 다음과 같습니다:

• 사용자 중심의 직관적인 인터페이스 구현
• 확장 가능하고 안정적인 시스템 아키텍처 구축  
• 최신 웹 기술을 활용한 성능 최적화
• 보안 및 접근성 기준 준수

${rfpAnalysis?.scope || '프로젝트 범위'}를 통해 고객의 비즈니스 목표 달성을 지원하겠습니다.
    `.trim(),

    '요구사항 분석': () => {
      let content = `${projectTitle} 프로젝트의 요구사항을 다음과 같이 분석하였습니다.\n\n`

      if (rfpAnalysis?.requirements) {
        content += `## 기능적 요구사항\n`
        rfpAnalysis.requirements.functional?.forEach(
          (req: string, index: number) => {
            content += `${index + 1}. ${req}\n`
          }
        )

        content += `\n## 기술적 요구사항\n`
        rfpAnalysis.requirements.technical?.forEach(
          (req: string, index: number) => {
            content += `${index + 1}. ${req}\n`
          }
        )

        content += `\n## 디자인 요구사항\n`
        rfpAnalysis.requirements.design?.forEach(
          (req: string, index: number) => {
            content += `${index + 1}. ${req}\n`
          }
        )
      } else {
        content += `
1. 사용자 인증 및 권한 관리 시스템
2. 반응형 웹 디자인 구현
3. 데이터 관리 및 CRUD 기능
4. 검색 및 필터링 시스템
5. 관리자 대시보드 구축
        `.trim()
      }

      return content
    },

    '제안 솔루션': () =>
      `
${projectTitle}에 대한 저희의 솔루션 제안은 다음과 같습니다.

## 핵심 솔루션 아키텍처

**프론트엔드**
- React 18 + Next.js 14를 활용한 모던 웹 애플리케이션
- TypeScript로 타입 안전성 확보
- Tailwind CSS를 통한 일관성 있는 디자인 시스템

**백엔드**
- Node.js + Express 기반 RESTful API
- PostgreSQL 데이터베이스 (확장성 및 안정성)
- JWT 기반 인증 시스템

**인프라 및 배포**
- AWS/Vercel을 활용한 클라우드 배포
- CI/CD 파이프라인 구축
- 모니터링 및 로깅 시스템

이 솔루션을 통해 ${rfpAnalysis?.client || '고객사'}의 요구사항을 효과적으로 충족할 수 있습니다.
    `.trim(),

    '기술 스택': () => {
      let content = `${projectTitle} 개발에 사용할 기술 스택입니다.\n\n`

      if (marketResearch?.technologyStack) {
        ;(
          marketResearch.technologyStack as Array<{
            category: string
            technologies: string[]
          }>
        ).forEach(stack => {
          content += `**${stack.category}**\n`
          stack.technologies.forEach((tech: string) => {
            content += `• ${tech}\n`
          })
          content += `\n`
        })
      } else {
        content += `
**프론트엔드**
• React 18
• Next.js 14
• TypeScript
• Tailwind CSS

**백엔드**
• Node.js
• Express.js
• Prisma ORM
• PostgreSQL

**DevOps**
• Docker
• GitHub Actions
• Vercel/AWS
        `.trim()
      }

      return content
    },

    '프로젝트 일정': () => {
      let content = `${projectTitle}의 세부 일정계획입니다.\n\n`

      if (marketResearch?.timeline) {
        content += `단계|기간|주요 활동|산출물\n`
        content += `----|----|----|----\n`(
          marketResearch.timeline as Array<{
            phase: string
            duration: string
            description: string
          }>
        ).forEach(phase => {
          content += `${phase.phase}|${phase.duration}|${phase.description}|관련 문서 및 결과물\n`
        })
      } else {
        content += `
단계|기간|주요 활동|산출물
----|----|----|----
기획/분석|2-4주|요구사항 분석, 시스템 설계|요구사항 명세서, 시스템 설계서
개발|8-16주|프론트엔드/백엔드 개발|소스코드, API 문서
테스팅|2-4주|단위/통합/사용자 테스트|테스트 결과서, 버그 리포트
배포|1-2주|프로덕션 배포, 모니터링|운영 가이드, 배포 문서
        `.trim()
      }

      return content
    },

    '예산 및 비용': () => {
      let content = `${projectTitle}의 예산 산정 내역입니다.\n\n`

      if (marketResearch?.pricing) {
        content += `구분|금액|비고\n`
        content += `----|----|----\n`
        content += `개발비|${marketResearch.pricing.averageRange.min}-${marketResearch.pricing.averageRange.max} ${marketResearch.pricing.averageRange.currency}|기본 개발 비용\n`
        content += `디자인|개발비의 15-20%|UI/UX 디자인 비용\n`
        content += `테스팅|개발비의 10-15%|품질보증 비용\n`
        content += `프로젝트 관리|개발비의 5-10%|일정 관리 및 커뮤니케이션\n`
        content += `예비비|전체의 10%|리스크 대응 비용\n`
      } else {
        content += `
구분|금액|비고
----|----|----
개발비|5,000-12,000만원|프로젝트 규모에 따라 조정
디자인|1,000-2,000만원|UI/UX 디자인 비용  
테스팅|500-1,500만원|품질보증 비용
프로젝트 관리|500-1,000만원|일정 관리 및 커뮤니케이션
예비비|700-1,650만원|리스크 대응 비용
**총 예상 비용**|**7,700-18,150만원**|**VAT 별도**
        `.trim()
      }

      return content
    },

    '팀 구성': () =>
      `
${projectTitle} 수행을 위한 전담팀 구성안입니다.

**프로젝트 매니저 (1명)**
- 전체 프로젝트 계획 및 일정 관리
- 고객 커뮤니케이션 및 이슈 해결
- 품질 관리 및 리스크 대응

**시니어 풀스택 개발자 (1명)**
- 시스템 아키텍처 설계
- 핵심 모듈 개발 및 코드 리뷰
- 기술적 의사결정 및 멘토링

**프론트엔드 개발자 (1-2명)**
- React/Next.js 기반 사용자 인터페이스 개발
- 반응형 웹 디자인 구현
- 사용자 경험 최적화

**백엔드 개발자 (1명)**
- API 서버 개발 및 데이터베이스 설계
- 보안 및 성능 최적화
- 외부 시스템 연동

**QA 엔지니어 (1명)**  
- 테스트 계획 수립 및 실행
- 품질 검증 및 버그 관리
- 사용자 테스트 지원
    `.trim(),

    '위험 관리': () => {
      let content = `${projectTitle} 진행 시 예상되는 위험요소와 대응방안입니다.\n\n`

      if (rfpAnalysis?.riskFactors) {
        rfpAnalysis.riskFactors.forEach((risk: string, index: number) => {
          content += `**위험요소 ${index + 1}: ${risk}**\n`
          content += `대응방안: 정기적인 리뷰를 통한 조기 발견 및 대응\n\n`
        })
      } else {
        content += `
**기술적 위험**
- 새로운 기술 스택 도입으로 인한 학습 비용
- 외부 API 의존성으로 인한 장애 가능성
- 대응방안: 사전 PoC 진행, 대안 기술 준비

**일정 위험**
- 요구사항 변경으로 인한 일정 지연
- 외부 의존성으로 인한 블로킹 이슈
- 대응방안: 애자일 방법론 적용, 주간 스프린트 회의

**품질 위험**
- 테스트 커버리지 부족으로 인한 버그
- 성능 이슈 발견 지연
- 대응방안: 자동화 테스트 구축, 지속적 모니터링
        `.trim()
      }

      return content
    },

    결론: () =>
      `
${projectTitle}는 ${rfpAnalysis?.client || '고객사'}의 디지털 혁신을 실현하는 핵심 프로젝트입니다.

## 프로젝트 성공 요인

**경험과 전문성**
저희 팀은 유사한 프로젝트 경험을 바탕으로 검증된 방법론과 최신 기술을 활용합니다.

**품질과 신뢰성**  
체계적인 개발 프로세스와 철저한 테스팅을 통해 안정적인 시스템을 구축합니다.

**효율적인 커뮤니케이션**
정기적인 진행 보고와 투명한 소통을 통해 고객의 요구사항을 정확히 반영합니다.

**지속적인 지원**
프로젝트 완료 후에도 안정적인 운영을 위한 지속적인 기술 지원을 제공합니다.

${rfpAnalysis?.keyPoints?.join(', ') || '사용자 중심 설계, 확장 가능한 아키텍처, 보안 강화'}를 통해 
고객의 비즈니스 목표 달성에 기여하겠습니다.
    `.trim(),
  }

  // Get template function or return default content
  const templateFn =
    templates[sectionTitle as keyof typeof templates] ||
    (() =>
      `${sectionTitle}에 대한 상세 내용을 여기에 작성하세요.\n\n이 섹션은 ${projectTitle} 프로젝트의 중요한 부분입니다.`)

  return templateFn()
}
