'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  ShareIcon,
  HeartIcon,
  DocumentTextIcon,
  SparklesIcon,
  UserIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import RAGService from '@/lib/services/ragService'
import KnowledgeBaseProcessor from '@/lib/services/knowledgeBaseProcessor'

interface CustomBot {
  id: string
  name: string
  description: string
  is_public: boolean
  created_at: string
  updated_at: string
  user_id: string
  avatar?: string
  tags?: string[]
  instructions?: string
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

interface KnowledgeBaseItem {
  id: string
  title: string
  content: string
  created_at: string
  metadata?: Record<string, unknown>
}

export default function ChatBotPage() {
  const params = useParams()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [bot, setBot] = useState<CustomBot | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([])
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false)

  useEffect(() => {
    if (params?.id) {
      loadBot(params.id as string)
      loadKnowledgeBase(params.id as string)
    }
  }, [params?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadBot = async (botId: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('custom_bots')
        .select('*')
        .eq('id', botId)
        .single()

      if (error) {
        console.error('Failed to load bot:', error)
        router.push('/newel')
        return
      }

      setBot(data)

      // Load chat history if exists
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `안녕하세요! 저는 ${data.name}입니다. ${data.description}\n\n무엇을 도와드릴까요?`,
        timestamp: new Date().toISOString(),
      }
      setMessages([welcomeMessage])

    } catch (error) {
      console.error('Failed to load bot:', error)
      router.push('/newel')
    } finally {
      setLoading(false)
    }
  }

  const loadKnowledgeBase = async (botId: string) => {
    try {
      const knowledgeBaseData = await KnowledgeBaseProcessor.getKnowledgeBase(botId)
      setKnowledgeBase(knowledgeBaseData)
    } catch (error) {
      console.error('Failed to load knowledge base:', error)
    }
  }

  const handleSendMessage = async () => {
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
      // Use RAG service for custom bot
      const ragResponse = await RAGService.queryCustomBot(
        bot.id,
        userMessage.content,
        bot.instructions
      )

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ragResponse.answer,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update usage count
      await supabase
        .from('custom_bots')
        .update({
          usage_count: (bot.usage_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bot.id)

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
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    if (!bot) return
    
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `안녕하세요! 저는 ${bot.name}입니다. ${bot.description}\n\n무엇을 도와드릴까요?`,
      timestamp: new Date().toISOString(),
    }
    setMessages([welcomeMessage])
  }

  const handleShare = async () => {
    if (!bot) return

    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('챗봇 링크가 클립보드에 복사되었습니다!')
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('링크 복사에 실패했습니다.')
    }
  }

  const deleteKnowledgeItem = async (itemId: string) => {
    if (!confirm('이 지식베이스 항목을 삭제하시겠습니까?')) return

    try {
      const success = await KnowledgeBaseProcessor.deleteKnowledgeBaseItem(itemId)
      
      if (success) {
        setKnowledgeBase(prev => prev.filter(item => item.id !== itemId))
      } else {
        alert('삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete knowledge item:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">챗봇을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!bot) {
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
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/newel')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {bot.avatar ? (
                    <span className="text-lg">{bot.avatar}</span>
                  ) : (
                    <CpuChipIcon className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {bot.name}
                  </h1>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-3 h-3" />
                      <span>{bot.usage_count || 0}회 사용</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DocumentTextIcon className="w-3 h-3" />
                      <span>{knowledgeBase.length}개 지식</span>
                    </div>
                    {bot.is_public && (
                      <div className="flex items-center space-x-1 text-red-500">
                        <HeartIcon className="w-3 h-3" />
                        <span>{bot.like_count || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
                className={`p-2 rounded-lg transition-colors ${
                  showKnowledgeBase
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title="지식베이스 보기"
              >
                <DocumentTextIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="공유하기"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              <button
                onClick={clearChat}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="대화 초기화"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push(`/newel/${bot.id}/settings`)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="설정"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    }`}>
                      {message.role === 'user' ? (
                        <UserIcon className="w-4 h-4" />
                      ) : bot.avatar ? (
                        <span className="text-sm">{bot.avatar}</span>
                      ) : (
                        <CpuChipIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {sending && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                      {bot.avatar ? (
                        <span className="text-sm">{bot.avatar}</span>
                      ) : (
                        <CpuChipIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">생각 중...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`${bot.name}에게 무엇이든 물어보세요...`}
                    rows={1}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                    disabled={sending}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || sending}
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Base Sidebar */}
        {showKnowledgeBase && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '384px' }}
            exit={{ width: 0 }}
            className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  지식베이스
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {knowledgeBase.length}개 항목
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {knowledgeBase.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                          {item.content.substring(0, 150)}...
                        </p>
                      </div>
                      <button
                        onClick={() => deleteKnowledgeItem(item.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors ml-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {knowledgeBase.length === 0 && (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      지식베이스가 비어있습니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}