'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import ChatInterface from '@/components/chat/ChatInterface'
import { type Message } from '@/components/chat/MessageBubble'

// Conversation type for compatibility
export interface Conversation {
  id: string
  title: string
  model: 'gemini' | 'chatgpt' | 'claude'
  lastMessage: string
  timestamp: string
  messageCount: number
  isFavorite: boolean
  tags: string[]
  status: 'active' | 'idle' | 'completed'
}

export default function ChatPage() {
  // Note: Conversation management is now handled in the sidebar (ChatSidebar)
  // This page focuses on the main chat interface
  const [selectedConversation, setSelectedConversation] = useState<
    string | undefined
  >(undefined)
  const [conversationMessages, setConversationMessages] = useState<
    Record<string, Message[]>
  >({})

  const handleMessageSend = useCallback(
    async (message: string, files?: File[]) => {
      if (!selectedConversation) return
      // This would integrate with your AI service
      console.log('Sending message:', message, 'Files:', files)
    },
    [selectedConversation]
  )

  const handleCodeExecute = useCallback((code: string, language: string) => {
    // This would integrate with your code execution service
    console.log('Executing code:', { code, language })
  }, [])

  const handleNewConversation = useCallback(() => {
    const newConvId = `conv-${Date.now()}`
    setSelectedConversation(newConvId)
    // Note: The actual conversation creation is handled in the sidebar
  }, [])

  const currentConversationMessages = selectedConversation
    ? conversationMessages[selectedConversation] || []
    : []

  return (
    <ProtectedRoute>
      <div className="h-full bg-gray-50 dark:bg-gray-900">
        {/* Note: Left sidebar (Conversation History) is now handled by the main layout's Sidebar component */}

        {/* Main Chat Interface - Full width since sidebar is handled by layout */}
        {selectedConversation ? (
          <ChatInterface
            conversationId={selectedConversation}
            initialMessages={currentConversationMessages}
            onMessageSend={handleMessageSend}
            onCodeExecute={handleCodeExecute}
          />
        ) : (
          /* Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🤖</span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI와 대화를 시작하세요
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-8">
                왼쪽 사이드바에서 기존 대화를 선택하거나 새로운 대화를
                시작해보세요. 멀티 AI 모델과 파일 업로드, 코드 실행 등 다양한
                기능을 사용할 수 있습니다.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleNewConversation}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>새 대화 시작</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      emoji: '📋',
                      text: 'RFP 분석',
                      desc: '문서 업로드 및 분석',
                    },
                    {
                      emoji: '🚀',
                      text: '제안서 생성',
                      desc: '자동 제안서 작성',
                    },
                    { emoji: '💻', text: '코드 생성', desc: '프로그래밍 도움' },
                    { emoji: '🎨', text: '화면 설계', desc: 'UI/UX 설계 지원' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleNewConversation()
                        // You could pre-populate the conversation with this topic
                      }}
                      className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
                    >
                      <div className="text-2xl mb-2">{item.emoji}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.text}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
