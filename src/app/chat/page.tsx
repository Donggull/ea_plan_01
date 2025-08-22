'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  RocketLaunchIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModel] = useState('gemini')
  const [generatedResults] = useState<unknown[]>([])

  // Prevent unused variable warnings by using them in a meaningful way
  console.log(
    'Selected model:',
    selectedModel,
    'Results count:',
    generatedResults.length
  )

  const conversations = [
    {
      id: 1,
      title: 'AI 챗봇 플랫폼 기획',
      model: 'Gemini',
      modelColor: 'from-slate-500 to-slate-600',
      lastMessage:
        'RFP 문서에서 핵심 요구사항을 추출했습니다. 멀티모델 AI 연동과 실시간 채팅 기능이 주요 포인트네요.',
      timestamp: '5분 전',
      unread: 2,
      avatar: '🤖',
      status: 'active',
    },
    {
      id: 2,
      title: '모바일 앱 UI/UX 설계',
      model: 'ChatGPT',
      modelColor: 'from-indigo-500 to-indigo-600',
      lastMessage:
        '사용자 플로우 다이어그램을 생성했습니다. React Native 기반의 크로스 플랫폼 설계가 적합할 것 같습니다.',
      timestamp: '1시간 전',
      unread: 0,
      avatar: '🎨',
      status: 'idle',
    },
    {
      id: 3,
      title: '데이터 분석 대시보드 코드 리뷰',
      model: 'Claude',
      modelColor: 'from-gray-500 to-gray-600',
      lastMessage:
        '코드 구조 개선 제안을 드립니다. TypeScript 타입 정의를 더 구체화하면 좋을 것 같습니다.',
      timestamp: '3시간 전',
      unread: 1,
      avatar: '💻',
      status: 'idle',
    },
    {
      id: 4,
      title: '블록체인 지갑 보안 검토',
      model: 'Gemini',
      modelColor: 'from-emerald-500 to-emerald-600',
      lastMessage: '스마트 컨트랙트 보안 감사 체크리스트를 작성했습니다.',
      timestamp: '어제',
      unread: 0,
      avatar: '🔐',
      status: 'completed',
    },
  ]

  const quickActions = [
    {
      name: 'RFP 문서 분석',
      icon: DocumentTextIcon,
      description: 'RFP 업로드 후 요구사항 자동 추출',
      color: 'from-slate-500 to-slate-600',
      bgColor:
        'bg-gradient-to-br from-slate-50/60 to-gray-50/60 dark:from-slate-900/30 dark:to-gray-900/30',
    },
    {
      name: '제안서 생성',
      icon: RocketLaunchIcon,
      description: '분석된 요구사항 기반 제안서 작성',
      color: 'from-indigo-500 to-indigo-600',
      bgColor:
        'bg-gradient-to-br from-indigo-50/60 to-slate-50/60 dark:from-indigo-900/30 dark:to-slate-900/30',
    },
    {
      name: '코드 생성',
      icon: CodeBracketIcon,
      description: '기능 명세서 기반 코드 자동 생성',
      color: 'from-gray-500 to-gray-600',
      bgColor:
        'bg-gradient-to-br from-gray-50/60 to-slate-50/60 dark:from-gray-900/30 dark:to-slate-900/30',
    },
    {
      name: '화면 설계',
      icon: PaintBrushIcon,
      description: 'UI/UX 와이어프레임 및 프로토타입',
      color: 'from-emerald-500 to-emerald-600',
      bgColor:
        'bg-gradient-to-br from-emerald-50/60 to-gray-50/60 dark:from-emerald-900/30 dark:to-gray-900/30',
    },
  ]

  const filteredConversations = conversations.filter(
    conv =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full">
      {/* Center Content - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Conversations List Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                대화 목록
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-2 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur border border-white/20 dark:border-gray-600/50 rounded-lg leading-5 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="대화 검색..."
            />
          </div>
        </div>

        {/* Conversations Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredConversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group border backdrop-blur-xl ${
                    selectedConversation === conversation.id
                      ? 'bg-gradient-to-r from-slate-50/80 to-indigo-50/80 dark:from-slate-800/40 dark:to-indigo-900/30 border-slate-200/50 dark:border-indigo-700/50 shadow-lg'
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="text-lg">{conversation.avatar}</div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                        {conversation.title}
                      </h3>
                    </div>
                    {conversation.unread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                      >
                        {conversation.unread}
                      </motion.span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                    {conversation.lastMessage}
                  </p>

                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs px-2 py-1 bg-gradient-to-r ${conversation.modelColor} text-white rounded-full font-medium`}
                    >
                      {conversation.model}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          conversation.status === 'active'
                            ? 'bg-green-400'
                            : conversation.status === 'idle'
                              ? 'bg-yellow-400'
                              : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {conversation.timestamp}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Active Chat Interface */}
        {selectedConversation && (
          <div className="border-t border-white/20 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">🤖</div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {
                        conversations.find(c => c.id === selectedConversation)
                          ?.title
                      }
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {
                        conversations.find(c => c.id === selectedConversation)
                          ?.model
                      }{' '}
                      모델 사용 중
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Cog6ToothIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <EllipsisHorizontalIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="h-64 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    대화 내용이 여기에 표시됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Chat Input */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-t border-white/20 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-4"
        >
          <div className="flex space-x-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  rows={1}
                  className="block w-full pl-4 pr-16 py-3 bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur border border-white/20 dark:border-gray-600/50 rounded-xl shadow-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed"
                  placeholder="AI에게 질문하거나 요청사항을 입력하세요..."
                  style={{ minHeight: '44px' }}
                />
                <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <PaperClipIcon className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-1.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex space-x-2 mt-3">
            {quickActions.slice(0, 4).map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 backdrop-blur border border-white/20 dark:border-gray-700/50 ${action.bgColor}`}
              >
                <action.icon className="w-3 h-3" />
                <span>{action.name}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex justify-center mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI가 생성한 내용은 정확하지 않을 수 있습니다. 중요한 정보는 검증
              후 사용해주세요.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Generated Results */}
      <div className="w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/50 flex flex-col">
        <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            생성된 결과물
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI가 생성한 결과물들이 여기에 표시됩니다
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Generated Content Examples */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-gradient-to-r from-slate-50/60 to-gray-50/60 dark:from-slate-900/30 dark:to-gray-900/30 backdrop-blur border border-white/20 dark:border-gray-700/50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ClipboardDocumentListIcon className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    요구사항 정리
                  </span>
                </div>
                <button className="text-xs text-slate-600 hover:text-slate-700 transition-colors">
                  <ArrowDownTrayIcon className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                RFP 문서에서 추출된 핵심 요구사항 목록입니다.
              </p>
              <div className="mt-2 flex space-x-1">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs rounded-full">
                  문서
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  5분 전
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-3 bg-gradient-to-r from-indigo-50/60 to-slate-50/60 dark:from-indigo-900/30 dark:to-slate-900/30 backdrop-blur border border-white/20 dark:border-gray-700/50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <CodeBracketIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    컴포넌트 코드
                  </span>
                </div>
                <button className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
                  <ArrowDownTrayIcon className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                React 대시보드 컴포넌트가 생성되었습니다.
              </p>
              <div className="mt-2 flex space-x-1">
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                  코드
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  12분 전
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-3 bg-gradient-to-r from-emerald-50/60 to-gray-50/60 dark:from-emerald-900/30 dark:to-gray-900/30 backdrop-blur border border-white/20 dark:border-gray-700/50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <PhotoIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    UI 목업
                  </span>
                </div>
                <button className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors">
                  <ArrowDownTrayIcon className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                사용자 인터페이스 디자인 목업이 생성되었습니다.
              </p>
              <div className="mt-2 flex space-x-1">
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                  이미지
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  25분 전
                </span>
              </div>
            </motion.div>
          </div>

          {/* Empty state */}
          {generatedResults.length === 0 && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <SparklesIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </motion.div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                AI와 대화를 시작하면
                <br />
                생성된 결과물이 여기에 표시됩니다
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/20 dark:border-gray-700/50">
          <button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white text-xs font-medium py-2 px-3 rounded-lg hover:shadow-lg transition-all duration-200">
            모든 결과물 보기
          </button>
        </div>
      </div>
    </div>
  )
}
