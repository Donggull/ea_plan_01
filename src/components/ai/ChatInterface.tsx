'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaperAirplaneIcon,
  SparklesIcon,
  StopIcon,
  ChatBubbleLeftIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'
import { useAI, useAIModels } from '@/lib/hooks/useAI'
import type { AIModel } from '@/lib/config/aiConfig'

const modelIcons: Record<AIModel, React.ComponentType<any>> = {
  gemini: SparklesIcon,
  chatgpt: ChatBubbleLeftIcon,
  claude: ComputerDesktopIcon,
}

const modelColors: Record<AIModel, string> = {
  gemini: 'from-blue-500 to-blue-600',
  chatgpt: 'from-green-500 to-green-600',
  claude: 'from-purple-500 to-purple-600',
}

export default function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini')
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { models, fetchModels } = useAIModels()
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    clearError,
    stopGeneration,
  } = useAI({
    model: selectedModel,
    stream: true,
    onChunk: (chunk) => {
      console.log('Received chunk:', chunk)
    },
    onComplete: (response) => {
      console.log('Completed:', response)
    },
    onError: (error) => {
      console.error('AI Error:', error)
    },
  })

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const messageContent = inputValue.trim()
    setInputValue('')

    try {
      await sendMessage(messageContent, { model: selectedModel })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <CpuChipIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI 채팅 테스트
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              멀티 AI 모델 테스트
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as AIModel)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id} disabled={!model.available}>
                {model.name} {!model.available && '(N/A)'}
              </option>
            ))}
          </select>

          <button
            onClick={clearMessages}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            초기화
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CpuChipIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              AI와 대화를 시작하세요
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              원하는 AI 모델을 선택하고 메시지를 보내보세요
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const isUser = message.role === 'user'
              const ModelIcon = message.model ? modelIcons[message.model] : CpuChipIcon
              const modelColor = message.model ? modelColors[message.model] : 'from-gray-500 to-gray-600'

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isUser 
                          ? 'bg-blue-500' 
                          : `bg-gradient-to-r ${modelColor}`
                      }`}>
                        {isUser ? (
                          <span className="text-white text-sm font-medium">U</span>
                        ) : (
                          <ModelIcon className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}>
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                      
                      {/* Message Info */}
                      <div className={`flex items-center justify-between mt-2 text-xs ${
                        isUser 
                          ? 'text-blue-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {message.model && (
                            <span className="font-medium">
                              {models.find(m => m.id === message.model)?.name || message.model}
                            </span>
                          )}
                          {message.timestamp && (
                            <span>{formatTimestamp(message.timestamp)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {models.find(m => m.id === selectedModel)?.name} 생각 중...
              </span>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="max-w-md p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-red-500 mt-0.5">⚠️</div>
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    오류가 발생했습니다
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                  <button
                    onClick={clearError}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
                  >
                    오류 닫기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`${models.find(m => m.id === selectedModel)?.name || selectedModel}에게 메시지를 보내세요...`}
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                minHeight: '50px',
                maxHeight: '120px',
              }}
            />
            
            {/* Character Count */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {inputValue.length}/2000
            </div>
          </div>

          {/* Send/Stop Button */}
          <div className="flex space-x-2">
            {isLoading ? (
              <button
                onClick={stopGeneration}
                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                title="생성 중지"
              >
                <StopIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                title="메시지 전송"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}