export type AIModel = 'gemini' | 'chatgpt' | 'claude'

export interface AIModelConfig {
  name: string
  displayName: string
  provider: string
  maxTokens: number
  temperature: number
  topP?: number
  topK?: number
  presencePenalty?: number
  frequencyPenalty?: number
  supportsMCP: boolean
  costPerToken: number // Cost per 1000 tokens (USD)
  description: string
}

export const AI_MODEL_CONFIGS: Record<AIModel, AIModelConfig> = {
  gemini: {
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    provider: 'Google',
    maxTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    supportsMCP: false,
    costPerToken: 0.01, // $0.01 per 1K tokens
    description: '빠르고 비용 효율적인 일반적인 질문과 답변에 최적화',
  },
  chatgpt: {
    name: 'gpt-4o',
    displayName: 'GPT-4o',
    provider: 'OpenAI',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1.0,
    presencePenalty: 0,
    frequencyPenalty: 0,
    supportsMCP: false,
    costPerToken: 0.03, // $0.03 per 1K tokens
    description: '창의적 작업과 복잡한 추론에 뛰어난 성능',
  },
  claude: {
    name: 'claude-3-5-sonnet-20241022',
    displayName: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    maxTokens: 8192,
    temperature: 0.7,
    topP: 1.0,
    supportsMCP: true,
    costPerToken: 0.02, // $0.02 per 1K tokens
    description: 'MCP 도구 연동과 고품질 분석 작업에 특화',
  },
}

export interface ModelSelectionCriteria {
  requiresMCP: boolean
  taskComplexity: 'simple' | 'medium' | 'complex'
  needsCreativity: boolean
  costPriority: 'low' | 'medium' | 'high'
  speedPriority: 'low' | 'medium' | 'high'
}

export const selectOptimalModel = (criteria: Partial<ModelSelectionCriteria>): AIModel => {
  // MCP가 필요하면 Claude만 선택 가능
  if (criteria.requiresMCP) {
    return 'claude'
  }

  // 창의적 작업이 필요하면 ChatGPT 우선
  if (criteria.needsCreativity) {
    return 'chatgpt'
  }

  // 비용 우선순위가 높으면 Gemini
  if (criteria.costPriority === 'high') {
    return 'gemini'
  }

  // 복잡한 작업이면 ChatGPT 또는 Claude
  if (criteria.taskComplexity === 'complex') {
    return Math.random() > 0.5 ? 'chatgpt' : 'claude'
  }

  // 기본적으로 Gemini (가장 비용 효율적)
  return 'gemini'
}

export const API_ENDPOINTS = {
  chat: '/api/chat',
  models: '/api/models',
  usage: '/api/usage',
} as const