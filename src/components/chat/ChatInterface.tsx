'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  StopIcon,
  Cog6ToothIcon,
  DocumentIcon,
  XMarkIcon,
  ArrowDownIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline'
import MessageBubble, { type Message } from './MessageBubble'
import LoadingMessage from './LoadingMessage'
import ChatSettingsPanel, {
  type ChatSettings,
  type AIModel,
} from './ChatSettings'

interface ChatInterfaceProps {
  conversationId?: string
  initialMessages?: Message[]
  onMessageSend?: (message: string, files?: File[]) => Promise<void>
  onCodeExecute?: (code: string, language: string) => void
  className?: string
}

interface FilePreview {
  file: File
  id: string
  preview?: string
}

export default function ChatInterface({
  conversationId: _conversationId,
  initialMessages = [],
  onMessageSend,
  onCodeExecute: _onCodeExecute,
  className = '',
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([])
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [settings, setSettings] = useState<ChatSettings>({
    model: 'gemini' as AIModel,
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: '당신은 도움이 되고 정확하며 친근한 AI 어시스턴트입니다.',
    streamMode: true,
    contextWindow: 32000,
  })

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Handle scroll to show/hide scroll to bottom button
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollToBottom(!isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
    })
  }

  // File upload handling
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: {
        'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        'text/*': ['.txt', '.md', '.json', '.csv'],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          ['.docx'],
      },
      maxSize: 10 * 1024 * 1024, // 10MB
      onDrop: useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
          file,
          id: Math.random().toString(36).substr(2, 9),
          preview: file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : undefined,
        }))
        setSelectedFiles(prev => [...prev, ...newFiles])
      }, []),
    })

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && selectedFiles.length === 0) || isLoading) return

    const messageContent = inputValue.trim()
    const files = selectedFiles.map(f => f.file)

    // Clear input immediately for better UX
    setInputValue('')
    setSelectedFiles([])

    // Add user message
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: messageContent || `${files.length}개 파일 업로드`,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      if (onMessageSend) {
        await onMessageSend(messageContent, files)
      } else {
        // Simulate AI response for demo
        await simulateAIResponse(messageContent)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content:
          '죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date().toISOString(),
        model: settings.model,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Demo AI response simulation
  const simulateAIResponse = async (userMessage: string) => {
    // Simulate processing delay
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    )

    const responses = [
      '안녕하세요! 무엇을 도와드릴까요?',
      `"${userMessage}"에 대해 자세히 설명드리겠습니다.\n\n이는 매우 흥미로운 주제입니다. 다음과 같은 관점에서 살펴볼 수 있습니다:\n\n1. **기술적 관점**\n2. **비즈니스 관점**\n3. **사용자 경험 관점**\n\n더 구체적인 질문이 있으시면 언제든 말씀해주세요!`,
      '다음과 같은 코드 예시를 제공합니다:\n\n```typescript\nconst example = () => {\n  console.log("Hello World!");\n  return "This is a sample code block";\n};\n```\n\n이 코드는 TypeScript로 작성된 간단한 함수입니다.',
      '요청하신 내용을 분석한 결과, 다음과 같은 단계별 접근법을 권장합니다:\n\n- **1단계**: 요구사항 정리\n- **2단계**: 기술 스택 선정\n- **3단계**: 프로토타입 개발\n- **4단계**: 테스트 및 검증\n\n각 단계에 대해 더 자세히 알고 싶으시면 말씀해주세요.',
    ]

    const response: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
      model: settings.model,
      metadata: {
        tokens: Math.floor(Math.random() * 1000) + 100,
        duration: Math.floor(Math.random() * 2000) + 500,
      },
    }

    setMessages(prev => [...prev, response])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const stopGeneration = () => {
    setIsLoading(false)
    // Add interrupted message
    const interruptedMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'system',
      content: '응답이 중단되었습니다.',
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, interruptedMessage])
  }

  const handleVoiceRecord = () => {
    // Voice recording functionality would be implemented here
    setIsRecording(!isRecording)
  }

  return (
    <div
      className={`flex flex-col h-full bg-gray-50 dark:bg-gray-900 ${className}`}
    >
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
        {...getRootProps({ onClick: e => e.stopPropagation() })}
      >
        {/* Drag overlay */}
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${
              isDragReject ? 'bg-red-500/20' : 'bg-blue-500/20'
            }`}
          >
            <div
              className={`p-8 rounded-xl border-2 border-dashed ${
                isDragReject
                  ? 'border-red-500 bg-red-100 dark:bg-red-900/20'
                  : 'border-blue-500 bg-blue-100 dark:bg-blue-900/20'
              }`}
            >
              <div className="text-center">
                <DocumentIcon
                  className={`w-12 h-12 mx-auto mb-4 ${
                    isDragReject ? 'text-red-500' : 'text-blue-500'
                  }`}
                />
                <p
                  className={`text-lg font-medium ${
                    isDragReject
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {isDragReject
                    ? '지원하지 않는 파일 형식입니다'
                    : '파일을 여기에 놓으세요'}
                </p>
                {!isDragReject && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    이미지, 문서, 텍스트 파일을 업로드할 수 있습니다
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Welcome message when no messages */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              AI와 대화를 시작하세요
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              질문을 입력하거나 파일을 업로드해보세요
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'RFP 문서 분석해줘',
                '제안서 템플릿을 만들어줘',
                '프로젝트 일정을 짜보자',
                '기능 명세서를 작성해줘',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(suggestion)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              index={index}
              isLast={index === messages.length - 1}
            />
          ))}
        </AnimatePresence>

        {/* Loading Message */}
        {isLoading && (
          <LoadingMessage
            model={settings.model}
            onStop={stopGeneration}
            showStopButton={true}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => scrollToBottom()}
            className="fixed bottom-32 right-8 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all z-10"
          >
            <ArrowDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map(filePreview => (
              <motion.div
                key={filePreview.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {filePreview.preview ? (
                    <Image
                      src={filePreview.preview}
                      alt={filePreview.file.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-cover rounded"
                      unoptimized
                    />
                  ) : (
                    <DocumentIcon className="w-8 h-8 text-gray-500" />
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-32">
                      {filePreview.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(filePreview.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(filePreview.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-3">
          {/* File Upload */}
          <input
            {...getInputProps()}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="파일 업로드"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handleVoiceRecord}
              className={`p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isRecording
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={isRecording ? '녹음 중...' : '음성 입력'}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요... (Shift+Enter: 줄바꿈)"
              rows={1}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />

            {/* Character Counter */}
            <div className="absolute bottom-1 right-12 text-xs text-gray-400">
              {inputValue.length}/2000
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="설정"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>

            {isLoading ? (
              <button
                onClick={stopGeneration}
                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                title="생성 중단"
              >
                <StopIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() && selectedFiles.length === 0}
                className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                title="메시지 전송"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            {
              icon: '📋',
              text: 'RFP 분석',
              color:
                'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
            },
            {
              icon: '🚀',
              text: '제안서 생성',
              color:
                'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
            },
            {
              icon: '💻',
              text: '코드 생성',
              color:
                'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
            },
            {
              icon: '🎨',
              text: '화면 설계',
              color:
                'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300',
            },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => setInputValue(`${action.text}를 도와줘`)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:scale-105 ${action.color}`}
            >
              <span>{action.icon}</span>
              <span>{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Sidebar */}
      <ChatSettingsPanel
        settings={settings}
        onChange={setSettings}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}
