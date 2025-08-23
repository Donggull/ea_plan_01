'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ConversationHistory, {
  type Conversation,
} from '@/components/chat/ConversationHistory'
import ChatInterface from '@/components/chat/ChatInterface'
import { type Message } from '@/components/chat/MessageBubble'

// Sample conversations data
const sampleConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'AI 챗봇 플랫폼 기획',
    model: 'gemini',
    lastMessage:
      'RFP 문서에서 핵심 요구사항을 추출했습니다. 멀티모델 AI 연동과 실시간 채팅 기능이 주요 포인트네요.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    messageCount: 12,
    isFavorite: true,
    tags: ['기획', 'RFP', 'AI'],
    status: 'active',
  },
  {
    id: 'conv-2',
    title: '모바일 앱 UI/UX 설계',
    model: 'chatgpt',
    lastMessage:
      '사용자 플로우 다이어그램을 생성했습니다. React Native 기반의 크로스 플랫폼 설계가 적합할 것 같습니다.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    messageCount: 8,
    isFavorite: false,
    tags: ['UI/UX', '모바일', 'React Native'],
    status: 'idle',
  },
  {
    id: 'conv-3',
    title: '데이터 분석 대시보드 코드 리뷰',
    model: 'claude',
    lastMessage:
      '코드 구조 개선 제안을 드립니다. TypeScript 타입 정의를 더 구체화하면 좋을 것 같습니다.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    messageCount: 15,
    isFavorite: true,
    tags: ['코드리뷰', 'TypeScript', '대시보드'],
    status: 'completed',
  },
  {
    id: 'conv-4',
    title: '블록체인 지갑 보안 검토',
    model: 'gemini',
    lastMessage: '스마트 컨트랙트 보안 감사 체크리스트를 작성했습니다.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    messageCount: 6,
    isFavorite: false,
    tags: ['보안', '블록체인', '스마트컨트랙트'],
    status: 'completed',
  },
]

export default function ChatPage() {
  const [conversations, setConversations] =
    useState<Conversation[]>(sampleConversations)
  const [selectedConversation, setSelectedConversation] = useState<
    string | undefined
  >(undefined)
  const [conversationMessages, setConversationMessages] = useState<
    Record<string, Message[]>
  >({})

  const handleConversationSelect = useCallback((id: string) => {
    setSelectedConversation(id)
  }, [])

  const handleConversationDelete = useCallback(
    (id: string) => {
      setConversations(prev => prev.filter(conv => conv.id !== id))
      if (selectedConversation === id) {
        setSelectedConversation(undefined)
      }
      // Remove messages for deleted conversation
      setConversationMessages(prev => {
        const newMessages = { ...prev }
        delete newMessages[id]
        return newMessages
      })
    },
    [selectedConversation]
  )

  const handleConversationToggleFavorite = useCallback((id: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, isFavorite: !conv.isFavorite } : conv
      )
    )
  }, [])

  const handleNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: '새 대화',
      model: 'gemini',
      lastMessage: '',
      timestamp: new Date().toISOString(),
      messageCount: 0,
      isFavorite: false,
      tags: [],
      status: 'active',
    }
    setConversations(prev => [newConv, ...prev])
    setSelectedConversation(newConv.id)
  }, [])

  const handleMessageSend = useCallback(
    async (message: string, files?: File[]) => {
      if (!selectedConversation) return

      // Update conversation's last message and timestamp
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation
            ? {
                ...conv,
                lastMessage: message || `${files?.length || 0}개 파일 업로드`,
                timestamp: new Date().toISOString(),
                messageCount: conv.messageCount + 1,
                status: 'active' as const,
              }
            : conv
        )
      )

      // This would integrate with your AI service
      console.log('Sending message:', message, 'Files:', files)
    },
    [selectedConversation]
  )

  const handleCodeExecute = useCallback((code: string, language: string) => {
    // This would integrate with your code execution service
    console.log('Executing code:', { code, language })
  }, [])

  const currentConversationMessages = selectedConversation
    ? conversationMessages[selectedConversation] || []
    : []

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Conversation History */}
      <ConversationHistory
        conversations={conversations}
        selectedConversation={selectedConversation}
        onConversationSelect={handleConversationSelect}
        onConversationDelete={handleConversationDelete}
        onConversationToggleFavorite={handleConversationToggleFavorite}
        onNewConversation={handleNewConversation}
      />

      {/* Main Chat Interface */}
      <div className="flex-1">
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
                왼쪽에서 기존 대화를 선택하거나 새로운 대화를 시작해보세요. 멀티
                AI 모델과 파일 업로드, 코드 실행 등 다양한 기능을 사용할 수
                있습니다.
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
    </div>
  )
}
