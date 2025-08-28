import { supabase } from '@/lib/supabase/client'

export interface Question {
  id: string
  text: string
  type: 'text' | 'select' | 'multiselect' | 'boolean' | 'number' | 'date'
  required: boolean
  options?: string[]
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  context?: string
  dependsOn?: {
    questionId: string
    value: any
  }
}

export interface QuestionnaireResponse {
  questionId: string
  answer: any
  answeredBy: 'user' | 'ai'
  confidence?: number
}

export interface WorkflowStageQuestions {
  workflowType: 'proposal' | 'development' | 'operation'
  stage: string
  questions: Question[]
}

export class QuestionnaireService {
  private static instance: QuestionnaireService
  
  private constructor() {}
  
  public static getInstance(): QuestionnaireService {
    if (!QuestionnaireService.instance) {
      QuestionnaireService.instance = new QuestionnaireService()
    }
    return QuestionnaireService.instance
  }

  /**
   * 워크플로우 단계별 질문 생성
   */
  async generateQuestions(
    workflowType: 'proposal' | 'development' | 'operation',
    stage: string,
    rfpContext?: any
  ): Promise<Question[]> {
    const baseQuestions = this.getBaseQuestions(workflowType, stage)
    const contextualQuestions = await this.generateContextualQuestions(
      workflowType,
      stage,
      rfpContext
    )
    
    return [...baseQuestions, ...contextualQuestions]
  }

  /**
   * 기본 질문 템플릿 가져오기
   */
  private getBaseQuestions(
    workflowType: string,
    stage: string
  ): Question[] {
    const questionTemplates: Record<string, Record<string, Question[]>> = {
      proposal: {
        'rfp-analysis': [
          {
            id: 'proj-type',
            text: '프로젝트 유형을 선택해주세요',
            type: 'select',
            required: true,
            options: ['웹 애플리케이션', '모바일 앱', '웹사이트', 'ERP/CRM', '기타'],
            context: '프로젝트 유형에 따라 제안서 구조가 달라집니다'
          },
          {
            id: 'tech-stack-pref',
            text: '선호하는 기술 스택이 있나요?',
            type: 'multiselect',
            required: false,
            options: ['React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Python', 'Java', 'PHP'],
            context: '기술 스택 선정에 참고됩니다'
          },
          {
            id: 'team-size',
            text: '예상 투입 인원 규모는?',
            type: 'number',
            required: true,
            validation: { min: 1, max: 100 },
            placeholder: '예: 5'
          }
        ],
        'market-research': [
          {
            id: 'competitors',
            text: '주요 경쟁사나 벤치마킹 대상을 알려주세요',
            type: 'text',
            required: false,
            placeholder: '예: 네이버, 카카오, 쿠팡'
          },
          {
            id: 'target-market',
            text: '타겟 시장 규모는 어느 정도인가요?',
            type: 'select',
            required: true,
            options: ['스타트업', '중소기업', '대기업', '공공기관', '글로벌'],
            context: '시장 규모에 따른 전략이 달라집니다'
          },
          {
            id: 'unique-value',
            text: '차별화 포인트는 무엇인가요?',
            type: 'text',
            required: true,
            placeholder: '고객에게 제공할 고유한 가치를 설명해주세요'
          }
        ],
        'persona-analysis': [
          {
            id: 'primary-users',
            text: '주요 사용자층을 설명해주세요',
            type: 'text',
            required: true,
            placeholder: '예: 20-30대 직장인, IT 업계 종사자'
          },
          {
            id: 'user-pain-points',
            text: '사용자가 겪는 주요 문제점은?',
            type: 'text',
            required: true,
            placeholder: '현재 사용자들이 겪는 불편함을 설명해주세요'
          },
          {
            id: 'user-goals',
            text: '사용자의 핵심 목표는 무엇인가요?',
            type: 'text',
            required: true,
            placeholder: '사용자가 달성하고자 하는 목표'
          }
        ],
        'proposal-writing': [
          {
            id: 'proposal-tone',
            text: '제안서의 톤앤매너를 선택해주세요',
            type: 'select',
            required: true,
            options: ['전문적/격식', '친근한/캐주얼', '기술 중심', '비즈니스 중심'],
            context: '제안서 작성 스타일을 결정합니다'
          },
          {
            id: 'key-features',
            text: '핵심 기능 Top 3를 알려주세요',
            type: 'text',
            required: true,
            placeholder: '가장 중요한 3가지 기능을 나열해주세요'
          },
          {
            id: 'success-metrics',
            text: '프로젝트 성공 지표는?',
            type: 'text',
            required: false,
            placeholder: '예: MAU 10만 달성, 전환율 5% 향상'
          }
        ],
        'cost-estimation': [
          {
            id: 'budget-flexibility',
            text: '예산의 유연성은 어느 정도인가요?',
            type: 'select',
            required: true,
            options: ['고정', '±10%', '±20%', '협의 가능'],
            context: '비용 산정의 정확도를 결정합니다'
          },
          {
            id: 'payment-terms',
            text: '선호하는 대금 지급 조건은?',
            type: 'select',
            required: false,
            options: ['선금 100%', '선금 50% + 잔금 50%', '3분할', '월별 정산'],
          },
          {
            id: 'maintenance-included',
            text: '유지보수 계약을 포함하시겠습니까?',
            type: 'boolean',
            required: true,
            context: '유지보수 포함 시 별도 비용이 추가됩니다'
          }
        ]
      },
      development: {
        'current-analysis': [
          {
            id: 'existing-system',
            text: '현재 운영 중인 시스템이 있나요?',
            type: 'boolean',
            required: true,
            context: '기존 시스템 연동 여부를 확인합니다'
          },
          {
            id: 'integration-needs',
            text: '연동이 필요한 외부 시스템을 알려주세요',
            type: 'text',
            required: false,
            placeholder: '예: ERP, CRM, 결제 시스템',
            dependsOn: { questionId: 'existing-system', value: true }
          },
          {
            id: 'data-migration',
            text: '데이터 마이그레이션이 필요한가요?',
            type: 'boolean',
            required: false,
            dependsOn: { questionId: 'existing-system', value: true }
          }
        ],
        'requirement-definition': [
          {
            id: 'must-have-features',
            text: '반드시 필요한 기능을 우선순위대로 나열해주세요',
            type: 'text',
            required: true,
            placeholder: '1. 로그인/회원가입\n2. 대시보드\n3. 데이터 분석'
          },
          {
            id: 'nice-to-have-features',
            text: '있으면 좋은 기능을 알려주세요',
            type: 'text',
            required: false,
            placeholder: '추가로 구현하면 좋을 기능들'
          },
          {
            id: 'performance-requirements',
            text: '성능 요구사항이 있나요?',
            type: 'text',
            required: false,
            placeholder: '예: 동시 접속 1000명, 응답시간 1초 이내'
          }
        ],
        'screen-design': [
          {
            id: 'design-reference',
            text: '참고할 디자인 레퍼런스가 있나요?',
            type: 'text',
            required: false,
            placeholder: 'URL 또는 서비스명을 입력해주세요'
          },
          {
            id: 'brand-guidelines',
            text: '브랜드 가이드라인이 있나요?',
            type: 'boolean',
            required: true,
            context: '색상, 폰트 등 브랜드 정체성 반영'
          },
          {
            id: 'responsive-design',
            text: '반응형 디자인이 필요한가요?',
            type: 'boolean',
            required: true,
            context: '모바일, 태블릿 대응 여부'
          }
        ]
      },
      operation: {
        'requirement-management': [
          {
            id: 'change-frequency',
            text: '요구사항 변경 빈도는 어느 정도인가요?',
            type: 'select',
            required: true,
            options: ['매일', '주 2-3회', '주 1회', '월 2-3회', '월 1회 이하'],
            context: '변경 관리 프로세스를 수립합니다'
          },
          {
            id: 'approval-levels',
            text: '승인 단계는 몇 단계인가요?',
            type: 'number',
            required: true,
            validation: { min: 1, max: 5 },
            placeholder: '예: 2'
          },
          {
            id: 'priority-criteria',
            text: '우선순위 결정 기준은?',
            type: 'multiselect',
            required: true,
            options: ['비즈니스 임팩트', '기술 복잡도', '고객 요청', '법규 준수', '비용'],
          }
        ],
        'task-distribution': [
          {
            id: 'team-structure',
            text: '팀 구성을 설명해주세요',
            type: 'text',
            required: true,
            placeholder: '예: 기획 2명, 디자인 1명, 개발 3명, QA 1명'
          },
          {
            id: 'skill-levels',
            text: '팀원들의 숙련도는?',
            type: 'select',
            required: true,
            options: ['초급 위주', '중급 위주', '고급 위주', '혼합'],
            context: '업무 할당 시 참고합니다'
          },
          {
            id: 'work-methodology',
            text: '업무 진행 방식은?',
            type: 'select',
            required: true,
            options: ['애자일/스크럼', '워터폴', '칸반', '하이브리드']
          }
        ],
        'schedule-management': [
          {
            id: 'sprint-duration',
            text: '스프린트 기간은?',
            type: 'select',
            required: false,
            options: ['1주', '2주', '3주', '4주'],
            dependsOn: { questionId: 'work-methodology', value: '애자일/스크럼' }
          },
          {
            id: 'meeting-frequency',
            text: '정기 회의 주기는?',
            type: 'select',
            required: true,
            options: ['매일', '주 2-3회', '주 1회', '격주', '월 1회']
          },
          {
            id: 'deadline-flexibility',
            text: '일정 조정 가능 여부는?',
            type: 'select',
            required: true,
            options: ['불가능', '제한적 가능', '협의 가능', '유연함']
          }
        ]
      }
    }

    return questionTemplates[workflowType]?.[stage] || []
  }

  /**
   * RFP 컨텍스트 기반 동적 질문 생성
   */
  private async generateContextualQuestions(
    workflowType: string,
    stage: string,
    rfpContext?: any
  ): Promise<Question[]> {
    if (!rfpContext) return []

    const contextualQuestions: Question[] = []

    // RFP 분석 결과에 따른 추가 질문 생성
    if (rfpContext.requirements) {
      // 요구사항이 많은 경우 우선순위 질문 추가
      if (rfpContext.requirements.functional?.length > 10) {
        contextualQuestions.push({
          id: 'req-prioritization',
          text: '많은 요구사항 중 Phase 1에서 구현할 핵심 기능을 선택해주세요',
          type: 'multiselect',
          required: true,
          options: rfpContext.requirements.functional.slice(0, 20),
          context: '단계적 구현을 위한 우선순위 설정'
        })
      }

      // 기술적 요구사항이 있는 경우 상세 질문
      if (rfpContext.requirements.technical?.length > 0) {
        contextualQuestions.push({
          id: 'tech-expertise',
          text: '기술적 요구사항 중 팀의 전문성이 부족한 영역이 있나요?',
          type: 'multiselect',
          required: false,
          options: rfpContext.requirements.technical,
          context: '외부 전문가 투입이나 교육 계획 수립에 참고'
        })
      }
    }

    // 예산 관련 추가 질문
    if (rfpContext.budget) {
      if (rfpContext.budget.max && rfpContext.budget.min) {
        const budgetRange = rfpContext.budget.max - rfpContext.budget.min
        if (budgetRange > rfpContext.budget.min * 0.3) {
          contextualQuestions.push({
            id: 'budget-allocation',
            text: '예산 범위가 넓은데, 어느 수준을 목표로 하시나요?',
            type: 'select',
            required: true,
            options: ['최소 예산', '중간 예산', '최대 예산', '품질 우선'],
            context: '제안서 작성 방향을 결정합니다'
          })
        }
      }
    }

    // 일정 관련 추가 질문
    if (rfpContext.deadline) {
      const deadline = new Date(rfpContext.deadline)
      const today = new Date()
      const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDeadline < 90) {
        contextualQuestions.push({
          id: 'fast-track',
          text: '일정이 촉박한데, Fast Track 개발이 가능한가요?',
          type: 'boolean',
          required: true,
          context: '병렬 개발, 추가 인력 투입 등 검토'
        })
      }
    }

    return contextualQuestions
  }

  /**
   * AI를 통한 답변 자동 추론
   */
  async generateAISuggestions(
    questions: Question[],
    context: any
  ): Promise<Map<string, any>> {
    const suggestions = new Map<string, any>()
    
    // 간단한 규칙 기반 추론 (실제로는 AI API 호출)
    questions.forEach(question => {
      if (!question.required) return

      switch (question.type) {
        case 'boolean':
          // 컨텍스트 기반 boolean 추론
          if (question.id === 'existing-system' && context.isNewProject) {
            suggestions.set(question.id, false)
          }
          break
          
        case 'select':
          // 가장 일반적인 옵션 선택
          if (question.options && question.options.length > 0) {
            suggestions.set(question.id, question.options[0])
          }
          break
          
        case 'number':
          // 검증 규칙 내 중간값
          if (question.validation) {
            const min = question.validation.min || 1
            const max = question.validation.max || 10
            suggestions.set(question.id, Math.floor((min + max) / 2))
          }
          break
          
        case 'text':
          // 플레이스홀더나 컨텍스트 활용
          if (question.placeholder) {
            suggestions.set(question.id, `[AI 제안] ${question.placeholder}`)
          }
          break
      }
    })
    
    return suggestions
  }

  /**
   * 질문과 답변을 데이터베이스에 저장
   */
  async saveQuestionnaire(
    projectId: string,
    workflowType: string,
    stage: string,
    questions: Question[],
    responses: QuestionnaireResponse[]
  ): Promise<void> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')

    // 답변 맵 생성
    const responseMap = new Map(
      responses.map(r => [r.questionId, r])
    )

    // 각 질문과 답변 저장
    const questionsToSave = questions.map((question, index) => {
      const response = responseMap.get(question.id)
      
      return {
        project_id: projectId,
        workflow_type: workflowType,
        workflow_stage: stage,
        question_order: index + 1,
        question_text: question.text,
        question_type: question.type,
        is_required: question.required,
        options: question.options || [],
        user_answer: response?.answeredBy === 'user' ? response.answer : null,
        ai_suggested_answer: response?.answeredBy === 'ai' ? response.answer : null,
        final_answer: response?.answer,
        answered_at: response ? new Date().toISOString() : null,
        context_data: { context: question.context, dependsOn: question.dependsOn },
        validation_rules: question.validation || {}
      }
    })

    const { error } = await supabase
      .from('workflow_questions')
      .insert(questionsToSave)

    if (error) {
      console.error('Failed to save questionnaire:', error)
      throw error
    }
  }

  /**
   * 저장된 질문과 답변 불러오기
   */
  async loadQuestionnaire(
    projectId: string,
    workflowType: string,
    stage: string
  ): Promise<{
    questions: Question[]
    responses: QuestionnaireResponse[]
  }> {
    const { data, error } = await supabase
      .from('workflow_questions')
      .select('*')
      .eq('project_id', projectId)
      .eq('workflow_type', workflowType)
      .eq('workflow_stage', stage)
      .order('question_order')

    if (error) {
      console.error('Failed to load questionnaire:', error)
      return { questions: [], responses: [] }
    }

    const questions: Question[] = data.map(item => ({
      id: item.id,
      text: item.question_text,
      type: item.question_type as any,
      required: item.is_required,
      options: item.options,
      context: item.context_data?.context,
      dependsOn: item.context_data?.dependsOn,
      validation: item.validation_rules
    }))

    const responses: QuestionnaireResponse[] = data
      .filter(item => item.final_answer !== null)
      .map(item => ({
        questionId: item.id,
        answer: item.final_answer,
        answeredBy: item.user_answer ? 'user' : 'ai',
        confidence: item.ai_suggested_answer ? 0.8 : 1.0
      }))

    return { questions, responses }
  }
}