'use client'

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CpuChipIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { createClientComponentClient } from '@/lib/supabase'

interface CustomBot {
  id: string
  name: string
  description: string
  system_prompt?: string
  is_public: boolean
  created_at: string
  updated_at: string
  user_id: string
  tags?: string[]
  metadata?: {
    avatar?: string
    preferred_model?: 'gemini' | 'gpt' | 'claude'
  }
  knowledge_base_count?: number
  usage_count?: number
  like_count?: number
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const ChatBotPage = memo(() => {
  const params = useParams()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)
  const isLoadingRef = useRef(false)

  // State variables
  const [bot, setBot] = useState<CustomBot | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [botName, setBotName] = useState('')
  const [botDescription, setBotDescription] = useState('')
  const [botInstructions, setBotInstructions] = useState('')
  const [conversationStarters, setConversationStarters] = useState<string[]>([])
  const [newStarter, setNewStarter] = useState('')

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addConversationStarter = useCallback(() => {
    if (newStarter.trim() && conversationStarters.length < 4) {
      setConversationStarters(prev => [...prev, newStarter.trim()])
      setNewStarter('')
    }
  }, [newStarter, conversationStarters.length])

  const removeConversationStarter = useCallback((index: number) => {
    setConversationStarters(prev => prev.filter((_, i) => i !== index))
  }, [])

  const startConversation = useCallback((starter: string) => {
    setInputMessage(starter)
    // Don't auto-send in preview mode to avoid circular dependencies
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || sending || !bot) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setSending(true)

    try {
      const model = bot.metadata?.preferred_model || 'gemini'

      // Simulate AI processing delay
      await new Promise(resolve =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      )

      // Mock response
      const mockResponses = [
        `[${model.toUpperCase()}] 안녕하세요! ${bot.name}입니다. "${userMessage.content}"에 대해 말씀드리겠습니다.\n\n${bot.description}를 바탕으로 도움을 드릴게요.`,
        `[${model.toUpperCase()}] 좋은 질문이네요! 제가 ${bot.name}으로서 이렇게 답변드리겠습니다:\n\n${userMessage.content}에 대해 자세히 설명해드리겠습니다.`,
        `[${model.toUpperCase()}] 네, 제가 도와드리겠습니다. ${bot.name}의 전문성을 활용해 답변해드릴게요.\n\n궁금하신 내용에 대해 설명드리겠습니다.`,
      ]

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          mockResponses[Math.floor(Math.random() * mockResponses.length)],
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setSending(false)
    }
  }, [bot, inputMessage, sending])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage]
  )

  const loadBot = useCallback(
    async (botId: string) => {
      // Prevent multiple simultaneous loads
      if (isLoadingRef.current || hasInitialized.current) {
        return
      }

      try {
        isLoadingRef.current = true
        setLoading(true)

        // Initialize Supabase client
        const supabase = createClientComponentClient()

        // Check for mock data first (development environment)
        const hasValidSupabase = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )

        let botData: CustomBot | null = null

        if (hasValidSupabase) {
          console.log('Attempting to load bots from Supabase...')

          try {
            // Try to load from Supabase first
            const { data: botsData, error } = await supabase
              .from('custom_bots')
              .select('*')
              .or(`id.eq.${botId},and(is_public.eq.true)`)
              .single()

            if (error) {
              console.error('Supabase error:', error)
              // If specific bot not found, try loading it directly
              const { data: directBot, error: directError } = await supabase
                .from('custom_bots')
                .select('*')
                .eq('id', botId)
                .single()

              if (directBot && !directError) {
                botData = directBot
                console.log('Loaded bot directly from Supabase:', botData.name)
              } else {
                console.log('Bot not found in Supabase, botId:', botId)
              }
            } else {
              botData = botsData
              console.log('Loaded bot from Supabase:', botData.name)
            }
          } catch (supabaseError) {
            console.error('Supabase connection error:', supabaseError)
          }
        }

        // Fallback to mock data if Supabase failed or bot not found
        if (!botData) {
          console.log('Using mock/fallback bot data for botId:', botId)
          // Create a generic fallback bot with the requested ID
          botData = {
            id: botId,
            name: '커스텀 챗봇',
            description: '이 챗봇에 대한 정보를 불러오고 있습니다.',
            system_prompt: 'You are a helpful AI assistant.',
            user_id: 'system',
            is_public: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: ['일반'],
            metadata: {
              avatar: '🤖',
              preferred_model: 'gemini' as const,
            },
            knowledge_base_count: 0,
            usage_count: 0,
            like_count: 0,
          }
          console.log('Using fallback bot data:', botData.name)
        }

        if (!botData) {
          router.push('/newel')
          return
        }

        // Batch all state updates together to minimize re-renders
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: `안녕하세요! 저는 ${botData.name}입니다. ${botData.description}\n\n무엇을 도와드릴까요?`,
          timestamp: new Date().toISOString(),
        }

        // Batch all state updates in a single React.startTransition
        React.startTransition(() => {
          // Mark as initialized to prevent re-initialization
          hasInitialized.current = true

          setBot(botData)
          setBotName(botData.name)
          setBotDescription(botData.description)
          setBotInstructions(botData.system_prompt || '')
          setConversationStarters([
            `${botData.name}의 주요 기능은 무엇인가요?`,
            `어떤 도움을 받을 수 있나요?`,
            `사용법을 알려주세요`,
          ])
          setMessages([welcomeMessage])
        })
      } catch (error) {
        console.error('Failed to load bot:', error)
        router.push('/newel')
      } finally {
        isLoadingRef.current = false
        setLoading(false)
      }
    },
    [router]
  )

  // Effects with dependency optimization
  const botId = params?.id as string

  useEffect(() => {
    if (botId && !hasInitialized.current) {
      loadBot(botId)
    }
  }, [botId, loadBot])

  // Prevent multiple re-renders by memoizing expensive operations
  const memoizedBot = useMemo(() => {
    if (!bot) return null
    return {
      ...bot,
      id: bot.id,
      name: bot.name,
      description: bot.description,
      metadata: bot.metadata,
    }
  }, [bot?.id, bot?.name, bot?.description, bot?.metadata?.avatar])

  const memoizedMessages = useMemo(() => messages, [messages.length])

  // Stable derived values
  const displayName = useMemo(
    () => botName || memoizedBot?.name || '새 GPT',
    [botName, memoizedBot?.name]
  )
  const displayDescription = useMemo(
    () => botDescription || memoizedBot?.description || '',
    [botDescription, memoizedBot?.description]
  )

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            챗봇을 불러오는 중...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (!memoizedBot) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <CpuChipIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            챗봇을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            요청하신 챗봇이 존재하지 않거나 삭제되었습니다.
          </p>
          <button
            onClick={() => router.push('/newel')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            뉴엘로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/newel')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              새 GPT
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              미리 보기
            </span>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-lg transition-colors ${
                showPreview
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              만들기
            </span>
          </div>
        </div>
      </div>

      <div className="pt-20 flex-1 flex">
        {/* Left Panel - Configuration */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
          <div className="max-w-md space-y-6">
            {/* Bot Avatar */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {memoizedBot?.metadata?.avatar ? (
                  <span className="text-2xl">
                    {memoizedBot.metadata.avatar}
                  </span>
                ) : (
                  <CpuChipIcon className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlusIcon className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                이름
              </label>
              <input
                type="text"
                value={botName}
                onChange={e => setBotName(e.target.value)}
                placeholder="GPT 이름을 입력하세요"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                설명
              </label>
              <textarea
                value={botDescription}
                onChange={e => setBotDescription(e.target.value)}
                placeholder="이 GPT 호스에 대한 짧은 주기"
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                지침
              </label>
              <textarea
                value={botInstructions}
                onChange={e => setBotInstructions(e.target.value)}
                placeholder="이 GPT의 동작 또는 이들 수행할지 여기에 지속하세요. 여기서 나의 종은 것이 있습니다."
                rows={6}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Conversation Starters */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                대화 스타터
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                사용자가 모맏할 수 있는 질 체 업 저런 가을을 뭉입니다
              </p>

              <div className="space-y-2 mb-3">
                {conversationStarters.map((starter, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={starter}
                      onChange={e => {
                        const newStarters = [...conversationStarters]
                        newStarters[index] = e.target.value
                        setConversationStarters(newStarters)
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => removeConversationStarter(index)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {conversationStarters.length < 4 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newStarter}
                    onChange={e => setNewStarter(e.target.value)}
                    onKeyPress={e =>
                      e.key === 'Enter' && addConversationStarter()
                    }
                    placeholder="새 대화 스타터 추가..."
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={addConversationStarter}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        {showPreview && (
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 flex flex-col">
              {/* Preview Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {memoizedBot?.metadata?.avatar ? (
                      <span className="text-sm">
                        {memoizedBot.metadata.avatar}
                      </span>
                    ) : (
                      <CpuChipIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {displayName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      By {memoizedBot?.user_id?.slice(0, 8) || 'user'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {memoizedMessages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-start space-x-3 max-w-xs ${
                          message.role === 'user'
                            ? 'flex-row-reverse space-x-reverse'
                            : 'flex-row'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <UserIcon className="w-3 h-3" />
                          ) : memoizedBot?.metadata?.avatar ? (
                            <span className="text-xs">
                              {memoizedBot.metadata.avatar}
                            </span>
                          ) : (
                            <CpuChipIcon className="w-3 h-3" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Conversation Starters */}
                  {memoizedMessages.length <= 1 &&
                    conversationStarters.length > 0 && (
                      <div className="mt-6">
                        <div className="grid grid-cols-1 gap-2">
                          {conversationStarters
                            .slice(0, 4)
                            .map((starter, index) => (
                              <button
                                key={index}
                                onClick={() => startConversation(starter)}
                                className="p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                              >
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {starter}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                  {sending && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                          <CpuChipIcon className="w-3 h-3" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
                              <div
                                className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"
                                style={{ animationDelay: '0.1s' }}
                              ></div>
                              <div
                                className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"
                                style={{ animationDelay: '0.2s' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="메시지를 여기에 드세요"
                      rows={1}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      style={{ minHeight: '40px', maxHeight: '120px' }}
                      disabled={sending}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || sending}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

ChatBotPage.displayName = 'ChatBotPage'

export default ChatBotPage
