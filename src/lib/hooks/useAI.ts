import { useState, useCallback, useRef } from 'react'
import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  StreamingChatResponse,
} from '@/lib/services/aiService'
import type { AIModel } from '@/lib/config/aiConfig'

interface UseAIOptions {
  model?: AIModel
  stream?: boolean
  onChunk?: (chunk: string) => void
  onComplete?: (response: ChatResponse | StreamingChatResponse) => void
  onError?: (error: Error) => void
}

interface UseAIReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (
    content: string,
    options?: Partial<ChatRequest>
  ) => Promise<void>
  clearMessages: () => void
  clearError: () => void
  stopGeneration: () => void
}

export function useAI(options: UseAIOptions = {}): UseAIReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string, requestOptions: Partial<ChatRequest> = {}) => {
      if (isLoading) {
        console.warn('AI request already in progress')
        return
      }

      const userMessage: ChatMessage = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)
      setError(null)

      // Create abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        const requestBody: ChatRequest = {
          messages: [...messages, userMessage],
          model: options.model,
          stream: options.stream ?? true,
          ...requestOptions,
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer demo-token',
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        // Handle streaming response
        if (
          response.headers.get('content-type')?.includes('text/event-stream')
        ) {
          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body reader')
          }

          const decoder = new TextDecoder()
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
          }

          // Add empty assistant message that will be updated
          setMessages(prev => [...prev, assistantMessage])

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') {
                    setIsLoading(false)
                    return
                  }

                  try {
                    const parsed: StreamingChatResponse = JSON.parse(data)

                    if (parsed.error) {
                      throw new Error(parsed.error)
                    }

                    if (parsed.chunk) {
                      assistantMessage.content += parsed.chunk
                      assistantMessage.model = parsed.model

                      // Update the assistant message
                      setMessages(prev => {
                        const newMessages = [...prev]
                        newMessages[newMessages.length - 1] = {
                          ...assistantMessage,
                        }
                        return newMessages
                      })

                      options.onChunk?.(parsed.chunk)
                    }

                    if (parsed.done) {
                      if (parsed.usage) {
                        assistantMessage.model = parsed.model
                      }
                      options.onComplete?.(parsed)
                      setIsLoading(false)
                      break
                    }
                  } catch (parseError) {
                    console.error('Failed to parse streaming data:', parseError)
                  }
                }
              }
            }
          } finally {
            reader.releaseLock()
          }
        } else {
          // Handle regular response
          const responseData: ChatResponse = await response.json()

          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: responseData.content,
            timestamp: new Date().toISOString(),
            model: responseData.model,
          }

          setMessages(prev => [...prev, assistantMessage])
          options.onComplete?.(responseData)
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            console.log('Request aborted')
            return
          }

          setError(err.message)
          options.onError?.(err)
        } else {
          const errorMessage = 'An unknown error occurred'
          setError(errorMessage)
          options.onError?.(new Error(errorMessage))
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [messages, isLoading, options]
  )

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    clearError,
    stopGeneration,
  }
}

interface AIModelInfo {
  id: string
  name: string
  provider: string
  description: string
  available: boolean
  supportsMCP: boolean
  costPerToken: number
  maxTokens: number
  features: {
    streaming: boolean
    functionCalling: boolean
  }
}

// Hook for fetching available models
export function useAIModels() {
  const [models, setModels] = useState<AIModelInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchModels = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/models')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setModels(data.data.models)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch models'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    models,
    isLoading,
    error,
    fetchModels,
  }
}
