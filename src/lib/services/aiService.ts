import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import {
  AI_MODEL_CONFIGS,
  type AIModel,
  type ModelSelectionCriteria,
} from '@/lib/config/aiConfig'
import { env, validateEnv } from '@/lib/utils/env'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  model?: AIModel
}

export interface ChatRequest {
  messages: ChatMessage[]
  model?: AIModel
  stream?: boolean
  temperature?: number
  maxTokens?: number
  criteria?: Partial<ModelSelectionCriteria>
}

export interface ChatResponse {
  content: string
  model: AIModel
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cost: number
  }
  finishReason?: string
}

export interface StreamingChatResponse {
  chunk: string
  done: boolean
  model: AIModel
  usage?: ChatResponse['usage']
  error?: string
}

class AIService {
  private geminiClient: GoogleGenerativeAI | null = null
  private openaiClient: OpenAI | null = null
  private anthropicClient: Anthropic | null = null

  constructor() {
    this.initializeClients()

    // 환경 변수 검증 (개발 환경에서만)
    if (env.NODE_ENV === 'development') {
      const validation = validateEnv()
      if (!validation.isValid) {
        console.warn('AI Service validation warnings:', validation.missingVars)
      }
      console.log('Available AI models:', validation.availableAIModels)
    }
  }

  private initializeClients() {
    try {
      // Initialize Gemini
      if (env.GOOGLE_AI_API_KEY) {
        this.geminiClient = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY)
      }

      // Initialize OpenAI
      if (env.OPENAI_API_KEY) {
        this.openaiClient = new OpenAI({
          apiKey: env.OPENAI_API_KEY,
        })
      }

      // Initialize Anthropic
      if (env.ANTHROPIC_API_KEY) {
        this.anthropicClient = new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
        })
      }
    } catch (error) {
      console.error('Failed to initialize AI clients:', error)
      // Vercel 환경에서는 에러를 던지지 않고 로그만 남김
      if (env.NODE_ENV === 'development') {
        throw error
      }
    }
  }

  private selectModel(
    criteria?: Partial<ModelSelectionCriteria>,
    requestedModel?: AIModel
  ): AIModel {
    if (requestedModel) {
      return requestedModel
    }

    // 기본 모델 선택 로직
    if (criteria?.requiresMCP) return 'claude'
    if (criteria?.needsCreativity) return 'chatgpt'
    if (criteria?.costPriority === 'high') return 'gemini'

    return 'gemini' // 기본값
  }

  private validateApiKey(model: AIModel): void {
    switch (model) {
      case 'gemini':
        if (!this.geminiClient) {
          throw new Error('Gemini API key is not configured')
        }
        break
      case 'chatgpt':
        if (!this.openaiClient) {
          throw new Error('OpenAI API key is not configured')
        }
        break
      case 'claude':
        if (!this.anthropicClient) {
          throw new Error('Anthropic API key is not configured')
        }
        break
    }
  }

  private calculateCost(
    model: AIModel,
    promptTokens: number,
    completionTokens: number
  ): number {
    const config = AI_MODEL_CONFIGS[model]
    const totalTokens = promptTokens + completionTokens
    return (totalTokens / 1000) * config.costPerToken
  }

  private formatMessagesForGemini(messages: ChatMessage[]): string {
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant'
        return `${role}: ${msg.content}`
      })
      .join('\n\n')
  }

  private formatMessagesForOpenAI(
    messages: ChatMessage[]
  ): OpenAI.ChatCompletionMessageParam[] {
    return messages.map(msg => ({
      role:
        msg.role === 'assistant'
          ? 'assistant'
          : msg.role === 'system'
            ? 'system'
            : 'user',
      content: msg.content,
    }))
  }

  private formatMessagesForClaude(messages: ChatMessage[]) {
    const systemMessage = messages.find(msg => msg.role === 'system')
    const conversationMessages = messages.filter(msg => msg.role !== 'system')

    return {
      system: systemMessage?.content,
      messages: conversationMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const model = this.selectModel(request.criteria, request.model)
    this.validateApiKey(model)

    const config = AI_MODEL_CONFIGS[model]
    const maxTokens = request.maxTokens || config.maxTokens
    const temperature = request.temperature || config.temperature

    try {
      switch (model) {
        case 'gemini':
          return await this.chatWithGemini(request.messages, {
            maxTokens,
            temperature,
          })

        case 'chatgpt':
          return await this.chatWithOpenAI(request.messages, {
            maxTokens,
            temperature,
          })

        case 'claude':
          return await this.chatWithClaude(request.messages, {
            maxTokens,
            temperature,
          })

        default:
          throw new Error(`Unsupported model: ${model}`)
      }
    } catch (error) {
      console.error(`Error with ${model}:`, error)

      // 에러 발생 시 fallback 모델 시도
      if (model !== 'gemini' && this.geminiClient) {
        console.log('Falling back to Gemini...')
        return await this.chatWithGemini(request.messages, {
          maxTokens,
          temperature,
        })
      }

      throw error
    }
  }

  private async chatWithGemini(
    messages: ChatMessage[],
    options: { maxTokens: number; temperature: number }
  ): Promise<ChatResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized')
    }

    const model = this.geminiClient.getGenerativeModel({
      model: AI_MODEL_CONFIGS.gemini.name,
      generationConfig: {
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature,
        topP: AI_MODEL_CONFIGS.gemini.topP,
        topK: AI_MODEL_CONFIGS.gemini.topK,
      },
    })

    const prompt = this.formatMessagesForGemini(messages)
    const result = await model.generateContent(prompt)
    const response = result.response

    const text = response.text()
    const usage = response.usageMetadata

    return {
      content: text,
      model: 'gemini',
      usage: usage
        ? {
            promptTokens: usage.promptTokenCount || 0,
            completionTokens: usage.candidatesTokenCount || 0,
            totalTokens: usage.totalTokenCount || 0,
            cost: this.calculateCost(
              'gemini',
              usage.promptTokenCount || 0,
              usage.candidatesTokenCount || 0
            ),
          }
        : undefined,
      finishReason: response.candidates?.[0]?.finishReason || 'stop',
    }
  }

  private async chatWithOpenAI(
    messages: ChatMessage[],
    options: { maxTokens: number; temperature: number }
  ): Promise<ChatResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized')
    }

    const formattedMessages = this.formatMessagesForOpenAI(messages)
    const completion = await this.openaiClient.chat.completions.create({
      model: AI_MODEL_CONFIGS.chatgpt.name,
      messages: formattedMessages,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: AI_MODEL_CONFIGS.chatgpt.topP,
      presence_penalty: AI_MODEL_CONFIGS.chatgpt.presencePenalty,
      frequency_penalty: AI_MODEL_CONFIGS.chatgpt.frequencyPenalty,
    })

    const choice = completion.choices[0]
    const usage = completion.usage

    return {
      content: choice.message.content || '',
      model: 'chatgpt',
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
            cost: this.calculateCost(
              'chatgpt',
              usage.prompt_tokens,
              usage.completion_tokens
            ),
          }
        : undefined,
      finishReason: choice.finish_reason || 'stop',
    }
  }

  private async chatWithClaude(
    messages: ChatMessage[],
    options: { maxTokens: number; temperature: number }
  ): Promise<ChatResponse> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized')
    }

    const { system, messages: formattedMessages } =
      this.formatMessagesForClaude(messages)

    const message = await this.anthropicClient.messages.create({
      model: AI_MODEL_CONFIGS.claude.name,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: AI_MODEL_CONFIGS.claude.topP,
      system: system || undefined,
      messages: formattedMessages,
    })

    const content = message.content[0]
    const text = content.type === 'text' ? content.text : ''

    return {
      content: text,
      model: 'claude',
      usage: message.usage
        ? {
            promptTokens: message.usage.input_tokens,
            completionTokens: message.usage.output_tokens,
            totalTokens:
              message.usage.input_tokens + message.usage.output_tokens,
            cost: this.calculateCost(
              'claude',
              message.usage.input_tokens,
              message.usage.output_tokens
            ),
          }
        : undefined,
      finishReason: message.stop_reason || 'stop',
    }
  }

  async *streamChat(
    request: ChatRequest
  ): AsyncGenerator<StreamingChatResponse> {
    const model = this.selectModel(request.criteria, request.model)
    this.validateApiKey(model)

    const config = AI_MODEL_CONFIGS[model]
    const maxTokens = request.maxTokens || config.maxTokens
    const temperature = request.temperature || config.temperature

    try {
      switch (model) {
        case 'gemini':
          yield* this.streamChatWithGemini(request.messages, {
            maxTokens,
            temperature,
          })
          break

        case 'chatgpt':
          yield* this.streamChatWithOpenAI(request.messages, {
            maxTokens,
            temperature,
          })
          break

        case 'claude':
          yield* this.streamChatWithClaude(request.messages, {
            maxTokens,
            temperature,
          })
          break

        default:
          throw new Error(`Streaming not supported for model: ${model}`)
      }
    } catch (error) {
      console.error(`Streaming error with ${model}:`, error)
      throw error
    }
  }

  private async *streamChatWithGemini(
    messages: ChatMessage[],
    options: { maxTokens: number; temperature: number }
  ): AsyncGenerator<StreamingChatResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized')
    }

    const model = this.geminiClient.getGenerativeModel({
      model: AI_MODEL_CONFIGS.gemini.name,
      generationConfig: {
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature,
        topP: AI_MODEL_CONFIGS.gemini.topP,
        topK: AI_MODEL_CONFIGS.gemini.topK,
      },
    })

    const prompt = this.formatMessagesForGemini(messages)
    const result = await model.generateContentStream(prompt)

    for await (const chunk of result.stream) {
      const text = chunk.text()

      yield {
        chunk: text,
        done: false,
        model: 'gemini',
      }
    }

    const finalResult = await result.response
    const usage = finalResult.usageMetadata

    yield {
      chunk: '',
      done: true,
      model: 'gemini',
      usage: usage
        ? {
            promptTokens: usage.promptTokenCount || 0,
            completionTokens: usage.candidatesTokenCount || 0,
            totalTokens: usage.totalTokenCount || 0,
            cost: this.calculateCost(
              'gemini',
              usage.promptTokenCount || 0,
              usage.candidatesTokenCount || 0
            ),
          }
        : undefined,
    }
  }

  private async *streamChatWithOpenAI(
    messages: ChatMessage[],
    options: { maxTokens: number; temperature: number }
  ): AsyncGenerator<StreamingChatResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized')
    }

    const formattedMessages = this.formatMessagesForOpenAI(messages)
    const stream = await this.openaiClient.chat.completions.create({
      model: AI_MODEL_CONFIGS.chatgpt.name,
      messages: formattedMessages,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: AI_MODEL_CONFIGS.chatgpt.topP,
      presence_penalty: AI_MODEL_CONFIGS.chatgpt.presencePenalty,
      frequency_penalty: AI_MODEL_CONFIGS.chatgpt.frequencyPenalty,
      stream: true,
    })

    for await (const chunk of stream) {
      const choice = chunk.choices[0]
      const delta = choice?.delta?.content || ''

      if (delta) {
        yield {
          chunk: delta,
          done: false,
          model: 'chatgpt',
        }
      }

      if (choice?.finish_reason) {
        yield {
          chunk: '',
          done: true,
          model: 'chatgpt',
        }
        break
      }
    }
  }

  private async *streamChatWithClaude(
    messages: ChatMessage[],
    options: { maxTokens: number; temperature: number }
  ): AsyncGenerator<StreamingChatResponse> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized')
    }

    const { system, messages: formattedMessages } =
      this.formatMessagesForClaude(messages)

    const stream = await this.anthropicClient.messages.create({
      model: AI_MODEL_CONFIGS.claude.name,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: AI_MODEL_CONFIGS.claude.topP,
      system: system || undefined,
      messages: formattedMessages,
      stream: true,
    })

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield {
          chunk: chunk.delta.text,
          done: false,
          model: 'claude',
        }
      }

      if (chunk.type === 'message_stop') {
        yield {
          chunk: '',
          done: true,
          model: 'claude',
        }
        break
      }
    }
  }

  getAvailableModels(): {
    model: AIModel
    config: (typeof AI_MODEL_CONFIGS)[AIModel]
    available: boolean
  }[] {
    return Object.entries(AI_MODEL_CONFIGS).map(([model, config]) => ({
      model: model as AIModel,
      config,
      available: this.isModelAvailable(model as AIModel),
    }))
  }

  private isModelAvailable(model: AIModel): boolean {
    switch (model) {
      case 'gemini':
        return !!this.geminiClient
      case 'chatgpt':
        return !!this.openaiClient
      case 'claude':
        return !!this.anthropicClient
      default:
        return false
    }
  }
}

// Singleton instance
export const aiService = new AIService()
export default aiService
