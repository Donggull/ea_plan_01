import { supabase } from '@/lib/supabase'

export interface RFPData {
  projectTitle: string
  client: string
  scope: string
  deadline: string
  budget: {
    min?: number
    max?: number
    currency: string
  }
  deliverables: string[]
  requirements: {
    functional: string[]
    technical: string[]
    design: string[]
  }
  riskFactors: string[]
  keyPoints: string[]
  metadata?: any
}

export interface WorkflowDataMapping {
  source: string
  target: string
  transform?: (value: any) => any
}

export class RFPDataInheritanceService {
  private static instance: RFPDataInheritanceService
  
  private constructor() {}
  
  public static getInstance(): RFPDataInheritanceService {
    if (!RFPDataInheritanceService.instance) {
      RFPDataInheritanceService.instance = new RFPDataInheritanceService()
    }
    return RFPDataInheritanceService.instance
  }

  /**
   * RFP 데이터를 구축 관리 워크플로우로 매핑
   */
  async mapRFPToDevelopment(
    projectId: string,
    rfpData: RFPData,
    autoMap: boolean = true
  ): Promise<any> {
    if (!autoMap) {
      // 수동 매핑인 경우 빈 데이터 반환
      return this.getEmptyDevelopmentData()
    }

    const developmentData = {
      // 현황 분석
      currentAnalysis: {
        projectBackground: `${rfpData.client} 프로젝트 - ${rfpData.projectTitle}`,
        scope: rfpData.scope,
        constraints: rfpData.riskFactors,
        deadline: rfpData.deadline,
        budget: rfpData.budget
      },

      // 요구사항 정리
      requirements: {
        functional: rfpData.requirements.functional.map((req, index) => ({
          id: `func-${index + 1}`,
          title: req,
          priority: 'medium',
          source: 'RFP',
          status: 'identified'
        })),
        technical: rfpData.requirements.technical.map((req, index) => ({
          id: `tech-${index + 1}`,
          title: req,
          priority: 'medium',
          source: 'RFP',
          status: 'identified'
        })),
        design: rfpData.requirements.design.map((req, index) => ({
          id: `design-${index + 1}`,
          title: req,
          priority: 'medium',
          source: 'RFP',
          status: 'identified'
        }))
      },

      // 기능 정의 (초기 데이터)
      features: rfpData.deliverables.map((deliverable, index) => ({
        id: `feature-${index + 1}`,
        name: deliverable,
        description: `RFP에서 도출된 산출물: ${deliverable}`,
        requirements: [],
        priority: 'medium',
        estimatedEffort: null
      })),

      // WBS 초기 구조
      wbs: {
        projectName: rfpData.projectTitle,
        phases: [
          {
            name: '요구사항 분석',
            duration: 1,
            tasks: ['RFP 분석 완료', '요구사항 문서화']
          },
          {
            name: '설계',
            duration: 2,
            tasks: ['아키텍처 설계', 'UI/UX 설계', 'DB 설계']
          },
          {
            name: '개발',
            duration: 4,
            tasks: rfpData.deliverables
          },
          {
            name: '테스트',
            duration: 1,
            tasks: ['단위 테스트', '통합 테스트', 'UAT']
          }
        ],
        totalDuration: 8,
        startDate: new Date().toISOString(),
        endDate: rfpData.deadline
      },

      // 메타데이터
      metadata: {
        sourceType: 'RFP',
        sourceId: projectId,
        mappedAt: new Date().toISOString(),
        autoMapped: true
      }
    }

    // 데이터베이스에 저장
    await this.saveDevelopmentData(projectId, developmentData)
    
    return developmentData
  }

  /**
   * RFP 데이터를 운영 관리 워크플로우로 매핑
   */
  async mapRFPToOperation(
    projectId: string,
    rfpData: RFPData,
    autoMap: boolean = true
  ): Promise<any> {
    if (!autoMap) {
      return this.getEmptyOperationData()
    }

    const operationData = {
      // 요건 관리 초기 데이터
      requirements: {
        initialRequirements: [
          ...rfpData.requirements.functional.map(req => ({
            type: 'functional',
            title: req,
            priority: 'medium',
            status: 'pending',
            source: 'RFP'
          })),
          ...rfpData.requirements.technical.map(req => ({
            type: 'technical',
            title: req,
            priority: 'medium',
            status: 'pending',
            source: 'RFP'
          }))
        ],
        approvalProcess: {
          levels: ['PM Review', 'Technical Review', 'Client Approval'],
          currentLevel: 0
        }
      },

      // 업무 분배 초기 설정
      taskDistribution: {
        teams: {
          planning: {
            capacity: 100,
            allocated: 0,
            members: []
          },
          design: {
            capacity: 100,
            allocated: 0,
            members: []
          },
          development: {
            capacity: 100,
            allocated: 0,
            members: []
          },
          qa: {
            capacity: 100,
            allocated: 0,
            members: []
          }
        },
        estimatedTasks: this.estimateTasksFromRFP(rfpData)
      },

      // 일정 관리
      scheduleManagement: {
        projectDeadline: rfpData.deadline,
        milestones: this.generateMilestones(rfpData),
        sprints: [],
        criticalPath: []
      },

      // 성과 지표 초기 설정
      kpis: {
        deliveryRate: { target: 95, current: 0 },
        qualityScore: { target: 90, current: 0 },
        customerSatisfaction: { target: 85, current: 0 },
        budgetAdherence: { 
          target: 100,
          current: 100,
          budget: rfpData.budget
        }
      },

      metadata: {
        sourceType: 'RFP',
        sourceId: projectId,
        mappedAt: new Date().toISOString(),
        autoMapped: true
      }
    }

    await this.saveOperationData(projectId, operationData)
    
    return operationData
  }

  /**
   * 워크플로우 간 데이터 연결 생성
   */
  async createWorkflowLink(
    projectId: string,
    sourceWorkflow: 'proposal' | 'development' | 'operation',
    targetWorkflow: 'proposal' | 'development' | 'operation',
    sourceDataId: string,
    targetDataId: string,
    mappings: WorkflowDataMapping[]
  ): Promise<void> {
    const { error } = await supabase
      .from('workflow_data_links')
      .insert({
        project_id: projectId,
        source_workflow: sourceWorkflow,
        target_workflow: targetWorkflow,
        source_data_id: sourceDataId,
        target_data_id: targetDataId,
        link_type: 'inherited',
        mappings: mappings
      })

    if (error) {
      console.error('Failed to create workflow link:', error)
      throw error
    }
  }

  /**
   * 프로젝트의 RFP 데이터 가져오기
   */
  async getRFPData(projectId: string): Promise<RFPData | null> {
    const { data, error } = await supabase
      .from('rfp_analysis')
      .select('analysis_result')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      console.error('Failed to fetch RFP data:', error)
      return null
    }

    return data.analysis_result as RFPData
  }

  /**
   * 개발 관리 데이터 저장
   */
  private async saveDevelopmentData(projectId: string, data: any): Promise<void> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('workflow_data')
      .insert({
        project_id: projectId,
        user_id: userData.user.id,
        workflow_type: 'development',
        data: data,
        status: 'draft'
      })

    if (error) {
      console.error('Failed to save development data:', error)
      throw error
    }
  }

  /**
   * 운영 관리 데이터 저장
   */
  private async saveOperationData(projectId: string, data: any): Promise<void> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('workflow_data')
      .insert({
        project_id: projectId,
        user_id: userData.user.id,
        workflow_type: 'operation',
        data: data,
        status: 'draft'
      })

    if (error) {
      console.error('Failed to save operation data:', error)
      throw error
    }
  }

  /**
   * 빈 개발 관리 데이터 생성
   */
  private getEmptyDevelopmentData(): any {
    return {
      currentAnalysis: {},
      requirements: { functional: [], technical: [], design: [] },
      features: [],
      wbs: { phases: [], totalDuration: 0 },
      metadata: { autoMapped: false }
    }
  }

  /**
   * 빈 운영 관리 데이터 생성
   */
  private getEmptyOperationData(): any {
    return {
      requirements: { initialRequirements: [] },
      taskDistribution: { teams: {} },
      scheduleManagement: { milestones: [] },
      kpis: {},
      metadata: { autoMapped: false }
    }
  }

  /**
   * RFP에서 예상 태스크 추정
   */
  private estimateTasksFromRFP(rfpData: RFPData): any {
    const totalRequirements = 
      rfpData.requirements.functional.length +
      rfpData.requirements.technical.length +
      rfpData.requirements.design.length

    return {
      planning: Math.ceil(totalRequirements * 0.2),
      design: Math.ceil(totalRequirements * 0.25),
      development: Math.ceil(totalRequirements * 0.35),
      qa: Math.ceil(totalRequirements * 0.2)
    }
  }

  /**
   * RFP 기반 마일스톤 생성
   */
  private generateMilestones(rfpData: RFPData): any[] {
    const deadline = new Date(rfpData.deadline)
    const today = new Date()
    const totalDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    const milestones = []
    const phases = [
      { name: '요구사항 확정', percentage: 0.15 },
      { name: '설계 완료', percentage: 0.35 },
      { name: '개발 50% 완료', percentage: 0.6 },
      { name: '개발 완료', percentage: 0.8 },
      { name: 'QA 완료', percentage: 0.95 },
      { name: '최종 납품', percentage: 1.0 }
    ]

    phases.forEach(phase => {
      const daysFromStart = Math.floor(totalDays * phase.percentage)
      const milestoneDate = new Date(today)
      milestoneDate.setDate(today.getDate() + daysFromStart)
      
      milestones.push({
        name: phase.name,
        date: milestoneDate.toISOString(),
        deliverables: [],
        status: 'pending'
      })
    })

    return milestones
  }

  /**
   * 워크플로우 데이터 동기화 상태 확인
   */
  async checkDataSyncStatus(projectId: string): Promise<{
    proposal: boolean
    development: boolean
    operation: boolean
    links: any[]
  }> {
    const { data: workflowData } = await supabase
      .from('workflow_data')
      .select('workflow_type')
      .eq('project_id', projectId)

    const { data: links } = await supabase
      .from('workflow_data_links')
      .select('*')
      .eq('project_id', projectId)

    const workflows = workflowData?.map(d => d.workflow_type) || []

    return {
      proposal: workflows.includes('proposal'),
      development: workflows.includes('development'),
      operation: workflows.includes('operation'),
      links: links || []
    }
  }
}