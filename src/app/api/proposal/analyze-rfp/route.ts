import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/services/aiService'
import type { ChatMessage } from '@/lib/services/aiService'

interface AnalysisMetrics {
  complexity: 'low' | 'medium' | 'high' | 'very_high'
  estimatedEffort: {
    hours: number
    uncertainty: number // 0-100%
  }
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  technologyStack: {
    category: string
    technologies: string[]
    confidence: number
  }[]
  domainIdentification: {
    primary: string
    secondary: string[]
    confidence: number
  }
  keywordAnalysis: {
    functional: { keyword: string; frequency: number; importance: number }[]
    technical: { keyword: string; frequency: number; importance: number }[]
    business: { keyword: string; frequency: number; importance: number }[]
  }
  timeEstimation: {
    phases: {
      name: string
      duration: number // Changed to number for weeks
      description: string // Added description
    }[]
    totalWeeks: number // Changed from totalEstimate
    confidenceLevel: number // Changed from criticalPath
  }
  domainClassification: {
    // Changed from domainIdentification
    category: string
    confidence: number
    indicators: string[]
  }
  requirementCategories: {
    functional: number
    technical: number
    business: number
    design: number
    security: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      textContent,
      fileName,
      projectId,
      aiModel = 'gemini',
      customPrompt,
      guidelines,
      analysisInstructions,
      mcpSettings,
    } = await request.json()

    if (!textContent || !fileName) {
      return NextResponse.json(
        { error: 'Text content and file name are required' },
        { status: 400 }
      )
    }

    console.log(
      `Starting enhanced RFP analysis with ${aiModel} model for file: ${fileName}`
    )

    // Create AI analysis prompt
    let systemPrompt = `당신은 RFP(Request for Proposal) 문서를 분석하는 전문가입니다. 
다음 RFP 문서를 종합적으로 분석하여 구조화된 정보를 추출하고 분석 결과를 제공해주세요.

분석할 항목:
1. 프로젝트 기본 정보 (제목, 클라이언트, 마감일, 예산)
2. 요구사항 분류 (기능적, 기술적, 디자인)
3. 프로젝트 범위 및 목표
4. 주요 산출물
5. 위험 요소
6. 핵심 포인트
7. 복잡도 및 공수 추정

결과는 JSON 형태로 구조화하여 제공해주세요.`

    // Add guidelines if provided
    if (guidelines && guidelines.length > 0) {
      const guidelinesText = guidelines.map((g, i) => 
        `${i + 1}. ${g.type === 'file' ? `파일 ${g.fileName}: ` : ''}${g.content}`
      ).join('\n')
      systemPrompt += `\n\n참고 지침:\n${guidelinesText}`
    }

    // Add custom analysis instructions
    if (analysisInstructions) {
      systemPrompt += `\n\n추가 분석 지시사항:\n${analysisInstructions}`
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `다음 RFP 문서를 분석해주세요:\n\n${textContent}${customPrompt ? `\n\n추가 요구사항:\n${customPrompt}` : ''}`
      }
    ]

    try {
      // Use AI service for real analysis
      const aiResponse = await aiService.chat({
        messages,
        model: aiModel as any,
        projectId,
        workflowType: 'proposal',
        workflowStage: 'rfp-analysis',
        enableMCP: mcpSettings?.enabled,
        selectedMCPTools: mcpSettings?.selectedTools,
      })

      console.log(`AI analysis completed with ${aiModel} model`)

      // Try to parse AI response as JSON, fallback to structured extraction
      let aiAnalysis: any = {}
      try {
        aiAnalysis = JSON.parse(aiResponse.content)
      } catch {
        // If AI response is not JSON, create structured analysis from text
        console.log('AI response is not JSON, using fallback extraction')
        aiAnalysis = {
          analysis: aiResponse.content,
          extractedInfo: 'AI 응답이 JSON 형식이 아니므로 기본 추출 방식을 사용했습니다.'
        }
      }

      // Enhanced analysis with metrics (combine AI analysis with traditional extraction)
      const metrics = performAdvancedAnalysis(textContent, aiModel)

      const analysis = {
        // AI-generated content (primary)
        aiAnalysis: aiAnalysis,
        aiResponse: aiResponse.content,
        
        // Traditional extraction (backup)
        projectTitle: extractProjectTitle(textContent, fileName, aiModel),
        client: extractClient(textContent),
        deadline: extractDeadline(textContent),
        budget: extractBudget(textContent),
        requirements: {
          functional: extractFunctionalRequirements(textContent, aiModel),
          technical: extractTechnicalRequirements(textContent, aiModel),
          design: extractDesignRequirements(textContent, aiModel),
        },
        scope: extractScope(textContent),
        deliverables: extractDeliverables(textContent),
        riskFactors: extractRiskFactors(textContent, aiModel),
        keyPoints: extractKeyPoints(textContent, aiModel),
        
        // Enhanced analysis results
        metrics,
        analysisMetadata: {
          aiModel,
          analysisDate: new Date().toISOString(),
          contentLength: textContent.length,
          fileName,
          projectId,
          customPromptUsed: !!customPrompt,
          guidelinesCount: guidelines?.length || 0,
          hasAnalysisInstructions: !!analysisInstructions,
          mcpEnabled: mcpSettings?.enabled || false,
          mcpToolsUsed: mcpSettings?.selectedTools || [],
          aiUsage: aiResponse.usage,
        },
      }

      return NextResponse.json(analysis)
    } catch (aiError) {
      console.error('AI service error, falling back to traditional analysis:', aiError)
      
      // Fallback to traditional analysis if AI fails
      const metrics = performAdvancedAnalysis(textContent, aiModel)

      const analysis = {
        projectTitle: extractProjectTitle(textContent, fileName, aiModel),
        client: extractClient(textContent),
        deadline: extractDeadline(textContent),
        budget: extractBudget(textContent),
        requirements: {
          functional: extractFunctionalRequirements(textContent, aiModel),
          technical: extractTechnicalRequirements(textContent, aiModel),
          design: extractDesignRequirements(textContent, aiModel),
        },
        scope: extractScope(textContent),
        deliverables: extractDeliverables(textContent),
        riskFactors: extractRiskFactors(textContent, aiModel),
        keyPoints: extractKeyPoints(textContent, aiModel),
        // Enhanced analysis results
        metrics,
        analysisMetadata: {
          aiModel,
          analysisDate: new Date().toISOString(),
          contentLength: textContent.length,
          fileName,
          projectId,
          customPromptUsed: !!customPrompt,
          guidelinesCount: guidelines?.length || 0,
          hasAnalysisInstructions: !!analysisInstructions,
          mcpEnabled: mcpSettings?.enabled || false,
          mcpToolsUsed: mcpSettings?.selectedTools || [],
          fallbackUsed: true,
          aiError: aiError instanceof Error ? aiError.message : 'Unknown AI error',
        },
      }

      return NextResponse.json(analysis)
    }
  } catch (error) {
    console.error('RFP analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze RFP' },
      { status: 500 }
    )
  }
}

// Enhanced analysis function
function performAdvancedAnalysis(
  textContent: string,
  aiModel: string
): AnalysisMetrics {
  const contentLower = textContent.toLowerCase()

  // Keyword analysis
  const functionalKeywords = [
    { keyword: '로그인', importance: 8 },
    { keyword: '회원가입', importance: 7 },
    { keyword: '결제', importance: 9 },
    { keyword: '주문', importance: 8 },
    { keyword: '검색', importance: 6 },
    { keyword: '관리자', importance: 7 },
    { keyword: '게시판', importance: 5 },
    { keyword: '댓글', importance: 4 },
    { keyword: '리뷰', importance: 5 },
    { keyword: '알림', importance: 6 },
  ]

  const technicalKeywords = [
    { keyword: 'api', importance: 8 },
    { keyword: 'database', importance: 9 },
    { keyword: '데이터베이스', importance: 9 },
    { keyword: 'react', importance: 7 },
    { keyword: 'node.js', importance: 7 },
    { keyword: '클라우드', importance: 8 },
    { keyword: '보안', importance: 9 },
    { keyword: '성능', importance: 7 },
    { keyword: '모바일', importance: 8 },
    { keyword: '반응형', importance: 6 },
  ]

  const businessKeywords = [
    { keyword: '매출', importance: 8 },
    { keyword: '고객', importance: 7 },
    { keyword: '브랜드', importance: 6 },
    { keyword: '마케팅', importance: 7 },
    { keyword: '분석', importance: 8 },
    { keyword: '리포트', importance: 6 },
    { keyword: 'kpi', importance: 7 },
    { keyword: 'roi', importance: 8 },
  ]

  // Calculate keyword frequencies and importance
  const analyzeKeywords = (keywords: typeof functionalKeywords) => {
    return keywords
      .map(({ keyword, importance }) => {
        const regex = new RegExp(keyword, 'gi')
        const matches = textContent.match(regex) || []
        return {
          keyword,
          frequency: matches.length,
          importance: matches.length > 0 ? importance : 0,
        }
      })
      .filter(k => k.frequency > 0)
  }

  const keywordAnalysis = {
    functional: analyzeKeywords(functionalKeywords),
    technical: analyzeKeywords(technicalKeywords),
    business: analyzeKeywords(businessKeywords),
  }

  // Calculate complexity based on keyword analysis
  const totalImportance =
    keywordAnalysis.functional.reduce((sum, k) => sum + k.importance, 0) +
    keywordAnalysis.technical.reduce((sum, k) => sum + k.importance, 0) +
    keywordAnalysis.business.reduce((sum, k) => sum + k.importance, 0)

  let complexity: AnalysisMetrics['complexity']
  if (totalImportance < 30) complexity = 'low'
  else if (totalImportance < 60) complexity = 'medium'
  else if (totalImportance < 100) complexity = 'high'
  else complexity = 'very_high'

  // Technology stack identification
  const technologyStack: AnalysisMetrics['technologyStack'] = []

  if (contentLower.includes('react') || contentLower.includes('프론트엔드')) {
    technologyStack.push({
      category: 'Frontend',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      confidence: 0.8,
    })
  }

  if (
    contentLower.includes('node.js') ||
    contentLower.includes('백엔드') ||
    contentLower.includes('api')
  ) {
    technologyStack.push({
      category: 'Backend',
      technologies: ['Node.js', 'Express', 'PostgreSQL'],
      confidence: 0.7,
    })
  }

  if (
    contentLower.includes('데이터베이스') ||
    contentLower.includes('database') ||
    contentLower.includes('mysql') ||
    contentLower.includes('postgresql')
  ) {
    technologyStack.push({
      category: 'Database',
      technologies: ['PostgreSQL', 'Redis'],
      confidence: 0.9,
    })
  }

  // Domain identification
  let primaryDomain = 'General Web Application'
  const secondaryDomains: string[] = []

  if (
    contentLower.includes('쇼핑') ||
    contentLower.includes('결제') ||
    contentLower.includes('ecommerce')
  ) {
    primaryDomain = 'E-Commerce'
    secondaryDomains.push('Payment System', 'Inventory Management')
  } else if (contentLower.includes('관리') || contentLower.includes('admin')) {
    primaryDomain = 'Management System'
    secondaryDomains.push('User Management', 'Dashboard')
  } else if (
    contentLower.includes('콘텐츠') ||
    contentLower.includes('블로그')
  ) {
    primaryDomain = 'Content Management'
    secondaryDomains.push('Publishing', 'Media Management')
  }

  // Time estimation
  const baseHours = Math.max(40, totalImportance * 10)
  const estimatedEffort = {
    hours: baseHours,
    uncertainty:
      complexity === 'low'
        ? 20
        : complexity === 'medium'
          ? 35
          : complexity === 'high'
            ? 50
            : 70,
  }

  // Risk level calculation
  let riskLevel: AnalysisMetrics['riskLevel'] = 'low'
  if (contentLower.includes('결제') || contentLower.includes('보안'))
    riskLevel = 'high'
  else if (contentLower.includes('실시간') || contentLower.includes('대용량'))
    riskLevel = 'medium'
  else if (complexity === 'very_high') riskLevel = 'critical'

  // Time estimation phases
  const phases = [
    {
      name: '기획 및 설계',
      duration: 3,
      description: '요구사항 분석, 시스템 설계, UI/UX 디자인',
    },
    {
      name: '개발',
      duration: Math.ceil(baseHours / 40),
      description: '핵심 기능 개발, API 구현, 프론트엔드 개발',
    },
    {
      name: '테스트',
      duration: 2,
      description: '단위 테스트, 통합 테스트, 사용자 테스트',
    },
    {
      name: '배포 및 운영준비',
      duration: 1,
      description: '서버 배포, 모니터링 설정, 문서화',
    },
  ]

  const totalWeeks = phases.reduce((sum, phase) => sum + phase.duration, 0)

  // Calculate requirement categories
  const requirementCategories = {
    functional: keywordAnalysis.functional.length,
    technical: keywordAnalysis.technical.length,
    business: keywordAnalysis.business.length,
    design:
      contentLower.includes('디자인') || contentLower.includes('ui') ? 3 : 1,
    security:
      contentLower.includes('보안') || contentLower.includes('인증') ? 4 : 1,
  }

  return {
    complexity,
    confidence: 0.8,
    estimatedEffort,
    riskLevel,
    technologyStack,
    domainClassification: {
      category: primaryDomain,
      confidence: 70,
      indicators: secondaryDomains,
    },
    keywordAnalysis,
    timeEstimation: {
      phases,
      totalWeeks,
      confidenceLevel: 75,
    },
    requirementCategories,
  }
}

function extractProjectTitle(
  content: string,
  fileName: string,
  aiModel?: string
): string {
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

function extractFunctionalRequirements(
  content: string,
  aiModel?: string
): string[] {
  const requirements = []

  // Look for common functional requirement keywords
  const keywords = [
    '사용자 관리',
    '로그인',
    '회원가입',
    '게시판',
    '검색',
    '결제',
    '주문',
    '관리자',
    '대시보드',
    '리포트',
    '알림',
  ]

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

function extractTechnicalRequirements(
  content: string,
  aiModel?: string
): string[] {
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

function extractDesignRequirements(
  content: string,
  aiModel?: string
): string[] {
  const requirements = []

  // Look for design keywords
  const designKeywords = [
    '디자인',
    '브랜드',
    '로고',
    'UI',
    'UX',
    '사용성',
    '접근성',
  ]

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

function extractRiskFactors(content: string, aiModel?: string): string[] {
  return [
    '요구사항 변경에 따른 일정 지연 가능성',
    '외부 API 연동 시 기술적 제약사항',
    '브라우저 호환성 이슈',
    '데이터 마이그레이션 복잡성',
    '성능 최적화 요구사항',
  ]
}

function extractKeyPoints(content: string, aiModel?: string): string[] {
  return [
    '사용자 경험(UX) 최적화에 중점',
    '확장 가능한 아키텍처 설계',
    '보안 및 개인정보 보호 강화',
    '유지보수 용이성 고려',
    '프로젝트 일정 및 품질 관리',
  ]
}
