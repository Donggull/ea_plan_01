import { supabase } from '@/lib/supabase'

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface ApiUsageCost {
  inputCost: number
  outputCost: number
  totalCost: number
}

export interface ApiUsageData {
  modelName: 'gemini' | 'chatgpt' | 'claude' | 'flux' | 'imagen'
  endpoint: string
  tokens: TokenUsage
  cost: ApiUsageCost
  workflowType?: 'proposal' | 'development' | 'operation' | 'chat' | 'image'
  workflowStage?: string
  metadata?: any
}

// 모델별 토큰 당 비용 (USD)
const TOKEN_COSTS = {
  gemini: {
    input: 0.00025 / 1000,  // $0.25 per 1M tokens
    output: 0.00125 / 1000  // $1.25 per 1M tokens
  },
  chatgpt: {
    'gpt-4': {
      input: 0.03 / 1000,    // $30 per 1M tokens
      output: 0.06 / 1000    // $60 per 1M tokens
    },
    'gpt-3.5-turbo': {
      input: 0.0015 / 1000,  // $1.50 per 1M tokens
      output: 0.002 / 1000   // $2.00 per 1M tokens
    }
  },
  claude: {
    'claude-3-opus': {
      input: 0.015 / 1000,   // $15 per 1M tokens
      output: 0.075 / 1000   // $75 per 1M tokens
    },
    'claude-3-sonnet': {
      input: 0.003 / 1000,   // $3 per 1M tokens
      output: 0.015 / 1000   // $15 per 1M tokens
    }
  },
  flux: {
    schnell: 0.003,          // $0.003 per image
    pro: 0.055               // $0.055 per image
  },
  imagen: {
    standard: 0.02           // $0.02 per image
  }
}

export class ApiUsageTracker {
  private static instance: ApiUsageTracker
  private pendingUsages: ApiUsageData[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private sessionUsage: Map<string, ApiUsageData> = new Map()
  
  private constructor() {
    // 5초마다 배치 저장
    this.flushInterval = setInterval(() => {
      this.flushPendingUsages()
    }, 5000)
  }
  
  public static getInstance(): ApiUsageTracker {
    if (!ApiUsageTracker.instance) {
      ApiUsageTracker.instance = new ApiUsageTracker()
    }
    return ApiUsageTracker.instance
  }

  /**
   * 텍스트를 토큰으로 추정 변환
   * 실제로는 tiktoken 같은 라이브러리 사용 권장
   */
  estimateTokens(text: string): number {
    // 간단한 추정: 4글자당 1토큰
    // 한글의 경우 2-3글자당 1토큰
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)
    const charsPerToken = hasKorean ? 2.5 : 4
    return Math.ceil(text.length / charsPerToken)
  }

  /**
   * 모델과 토큰 수로 비용 계산
   */
  calculateCost(
    modelName: string,
    modelVariant: string,
    inputTokens: number,
    outputTokens: number
  ): ApiUsageCost {
    let inputCost = 0
    let outputCost = 0

    switch (modelName) {
      case 'gemini':
        inputCost = inputTokens * TOKEN_COSTS.gemini.input
        outputCost = outputTokens * TOKEN_COSTS.gemini.output
        break
        
      case 'chatgpt':
        const gptCosts = TOKEN_COSTS.chatgpt[modelVariant as keyof typeof TOKEN_COSTS.chatgpt]
          || TOKEN_COSTS.chatgpt['gpt-3.5-turbo']
        inputCost = inputTokens * gptCosts.input
        outputCost = outputTokens * gptCosts.output
        break
        
      case 'claude':
        const claudeCosts = TOKEN_COSTS.claude[modelVariant as keyof typeof TOKEN_COSTS.claude]
          || TOKEN_COSTS.claude['claude-3-sonnet']
        inputCost = inputTokens * claudeCosts.input
        outputCost = outputTokens * claudeCosts.output
        break
        
      case 'flux':
        // 이미지 생성은 토큰이 아닌 이미지 단위 과금
        outputCost = TOKEN_COSTS.flux[modelVariant as keyof typeof TOKEN_COSTS.flux]
          || TOKEN_COSTS.flux.schnell
        break
        
      case 'imagen':
        outputCost = TOKEN_COSTS.imagen.standard
        break
    }

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost
    }
  }

  /**
   * API 사용량 추적
   */
  async trackUsage(
    modelName: ApiUsageData['modelName'],
    endpoint: string,
    input: string | { prompt: string },
    output: string | { images: any[] },
    options?: {
      projectId?: string
      conversationId?: string
      workflowType?: ApiUsageData['workflowType']
      workflowStage?: string
      modelVariant?: string
    }
  ): Promise<void> {
    try {
      let inputTokens = 0
      let outputTokens = 0

      // 토큰 계산
      if (modelName === 'flux' || modelName === 'imagen') {
        // 이미지 생성 모델
        inputTokens = 0
        outputTokens = Array.isArray(output) ? (output as any).images?.length || 1 : 1
      } else {
        // 텍스트 모델
        const inputText = typeof input === 'string' ? input : input.prompt
        const outputText = typeof output === 'string' ? output : JSON.stringify(output)
        
        inputTokens = this.estimateTokens(inputText)
        outputTokens = this.estimateTokens(outputText)
      }

      // 비용 계산
      const cost = this.calculateCost(
        modelName,
        options?.modelVariant || '',
        inputTokens,
        outputTokens
      )

      const usageData: ApiUsageData = {
        modelName,
        endpoint,
        tokens: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens
        },
        cost,
        workflowType: options?.workflowType,
        workflowStage: options?.workflowStage,
        metadata: {
          projectId: options?.projectId,
          conversationId: options?.conversationId,
          modelVariant: options?.modelVariant,
          timestamp: new Date().toISOString()
        }
      }

      // 세션 사용량 업데이트
      this.updateSessionUsage(modelName, usageData)

      // 배치 처리를 위해 펜딩 리스트에 추가
      this.pendingUsages.push(usageData)

      // 펜딩이 10개 이상이면 즉시 flush
      if (this.pendingUsages.length >= 10) {
        await this.flushPendingUsages()
      }
    } catch (error) {
      console.error('Failed to track API usage:', error)
    }
  }

  /**
   * 세션별 사용량 업데이트
   */
  private updateSessionUsage(modelName: string, usage: ApiUsageData): void {
    const existing = this.sessionUsage.get(modelName)
    
    if (existing) {
      existing.tokens.inputTokens += usage.tokens.inputTokens
      existing.tokens.outputTokens += usage.tokens.outputTokens
      existing.tokens.totalTokens += usage.tokens.totalTokens
      existing.cost.inputCost += usage.cost.inputCost
      existing.cost.outputCost += usage.cost.outputCost
      existing.cost.totalCost += usage.cost.totalCost
    } else {
      this.sessionUsage.set(modelName, { ...usage })
    }
  }

  /**
   * 현재 세션의 사용량 가져오기
   */
  getSessionUsage(): {
    byModel: Map<string, ApiUsageData>
    total: {
      tokens: TokenUsage
      cost: ApiUsageCost
    }
  } {
    const total = {
      tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
    }

    this.sessionUsage.forEach(usage => {
      total.tokens.inputTokens += usage.tokens.inputTokens
      total.tokens.outputTokens += usage.tokens.outputTokens
      total.tokens.totalTokens += usage.tokens.totalTokens
      total.cost.inputCost += usage.cost.inputCost
      total.cost.outputCost += usage.cost.outputCost
      total.cost.totalCost += usage.cost.totalCost
    })

    return {
      byModel: new Map(this.sessionUsage),
      total
    }
  }

  /**
   * 펜딩된 사용량을 데이터베이스에 저장
   */
  private async flushPendingUsages(): Promise<void> {
    if (this.pendingUsages.length === 0) return

    const usagesToSave = [...this.pendingUsages]
    this.pendingUsages = []

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      const records = usagesToSave.map(usage => ({
        user_id: userData.user.id,
        project_id: usage.metadata?.projectId || null,
        conversation_id: usage.metadata?.conversationId || null,
        model_name: usage.modelName,
        endpoint: usage.endpoint,
        input_tokens: usage.tokens.inputTokens,
        output_tokens: usage.tokens.outputTokens,
        total_tokens: usage.tokens.totalTokens,
        input_cost: usage.cost.inputCost,
        output_cost: usage.cost.outputCost,
        total_cost: usage.cost.totalCost,
        workflow_type: usage.workflowType || null,
        workflow_stage: usage.workflowStage || null,
        request_metadata: usage.metadata || {},
        response_metadata: {}
      }))

      const { error } = await supabase
        .from('api_usage_tracking')
        .insert(records)

      if (error) {
        console.error('Failed to save API usage:', error)
        // 실패한 경우 다시 펜딩 리스트에 추가
        this.pendingUsages.push(...usagesToSave)
      }
    } catch (error) {
      console.error('Error flushing usage data:', error)
      this.pendingUsages.push(...usagesToSave)
    }
  }

  /**
   * 프로젝트의 사용량 통계 가져오기
   */
  async getProjectUsageStats(
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    byModel: Record<string, { tokens: TokenUsage; cost: ApiUsageCost }>
    byWorkflow: Record<string, { tokens: TokenUsage; cost: ApiUsageCost }>
    total: { tokens: TokenUsage; cost: ApiUsageCost }
    daily: Array<{ date: string; tokens: number; cost: number }>
  }> {
    let query = supabase
      .from('api_usage_tracking')
      .select('*')
      .eq('project_id', projectId)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error || !data) {
      console.error('Failed to fetch usage stats:', error)
      return {
        byModel: {},
        byWorkflow: {},
        total: {
          tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
        },
        daily: []
      }
    }

    // 통계 집계
    const byModel: Record<string, { tokens: TokenUsage; cost: ApiUsageCost }> = {}
    const byWorkflow: Record<string, { tokens: TokenUsage; cost: ApiUsageCost }> = {}
    const daily: Record<string, { tokens: number; cost: number }> = {}
    const total = {
      tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
    }

    data.forEach(record => {
      // 모델별 집계
      if (!byModel[record.model_name]) {
        byModel[record.model_name] = {
          tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
        }
      }
      byModel[record.model_name].tokens.inputTokens += record.input_tokens
      byModel[record.model_name].tokens.outputTokens += record.output_tokens
      byModel[record.model_name].tokens.totalTokens += record.total_tokens
      byModel[record.model_name].cost.inputCost += Number(record.input_cost)
      byModel[record.model_name].cost.outputCost += Number(record.output_cost)
      byModel[record.model_name].cost.totalCost += Number(record.total_cost)

      // 워크플로우별 집계
      if (record.workflow_type) {
        if (!byWorkflow[record.workflow_type]) {
          byWorkflow[record.workflow_type] = {
            tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
            cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
          }
        }
        byWorkflow[record.workflow_type].tokens.inputTokens += record.input_tokens
        byWorkflow[record.workflow_type].tokens.outputTokens += record.output_tokens
        byWorkflow[record.workflow_type].tokens.totalTokens += record.total_tokens
        byWorkflow[record.workflow_type].cost.inputCost += Number(record.input_cost)
        byWorkflow[record.workflow_type].cost.outputCost += Number(record.output_cost)
        byWorkflow[record.workflow_type].cost.totalCost += Number(record.total_cost)
      }

      // 일별 집계
      const date = record.usage_date
      if (date) {
        if (!daily[date]) {
          daily[date] = { tokens: 0, cost: 0 }
        }
        daily[date].tokens += record.total_tokens
        daily[date].cost += Number(record.total_cost)
      }

      // 전체 합계
      total.tokens.inputTokens += record.input_tokens
      total.tokens.outputTokens += record.output_tokens
      total.tokens.totalTokens += record.total_tokens
      total.cost.inputCost += Number(record.input_cost)
      total.cost.outputCost += Number(record.output_cost)
      total.cost.totalCost += Number(record.total_cost)
    })

    return {
      byModel,
      byWorkflow,
      total,
      daily: Object.entries(daily).map(([date, data]) => ({
        date,
        ...data
      })).sort((a, b) => a.date.localeCompare(b.date))
    }
  }

  /**
   * 사용자의 월별 사용량 가져오기
   */
  async getUserMonthlyUsage(
    userId?: string
  ): Promise<{
    currentMonth: { tokens: TokenUsage; cost: ApiUsageCost }
    previousMonth: { tokens: TokenUsage; cost: ApiUsageCost }
    trend: 'up' | 'down' | 'stable'
  }> {
    const { data: userData } = await supabase.auth.getUser()
    const targetUserId = userId || userData?.user?.id

    if (!targetUserId) {
      return {
        currentMonth: {
          tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
        },
        previousMonth: {
          tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
        },
        trend: 'stable'
      }
    }

    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // 현재 월 데이터
    const { data: currentData } = await supabase
      .from('api_usage_tracking')
      .select('input_tokens, output_tokens, total_tokens, input_cost, output_cost, total_cost')
      .eq('user_id', targetUserId)
      .gte('created_at', currentMonthStart.toISOString())

    // 이전 월 데이터
    const { data: previousData } = await supabase
      .from('api_usage_tracking')
      .select('input_tokens, output_tokens, total_tokens, input_cost, output_cost, total_cost')
      .eq('user_id', targetUserId)
      .gte('created_at', previousMonthStart.toISOString())
      .lte('created_at', previousMonthEnd.toISOString())

    const aggregateData = (data: any[]) => {
      return data?.reduce((acc, record) => ({
        tokens: {
          inputTokens: acc.tokens.inputTokens + record.input_tokens,
          outputTokens: acc.tokens.outputTokens + record.output_tokens,
          totalTokens: acc.tokens.totalTokens + record.total_tokens
        },
        cost: {
          inputCost: acc.cost.inputCost + Number(record.input_cost),
          outputCost: acc.cost.outputCost + Number(record.output_cost),
          totalCost: acc.cost.totalCost + Number(record.total_cost)
        }
      }), {
        tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
      }) || {
        tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
      }
    }

    const currentMonth = aggregateData(currentData || [])
    const previousMonth = aggregateData(previousData || [])

    // 트렌드 계산
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (previousMonth.cost.totalCost > 0) {
      const changePercent = ((currentMonth.cost.totalCost - previousMonth.cost.totalCost) / previousMonth.cost.totalCost) * 100
      if (changePercent > 10) trend = 'up'
      else if (changePercent < -10) trend = 'down'
    } else if (currentMonth.cost.totalCost > 0) {
      trend = 'up'
    }

    return {
      currentMonth,
      previousMonth,
      trend
    }
  }

  /**
   * 클린업
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    this.flushPendingUsages()
  }
}