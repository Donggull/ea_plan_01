'use client'

import { motion } from 'framer-motion'
import {
  SparklesIcon,
  ChatBubbleLeftIcon,
  ComputerDesktopIcon,
  StopIcon,
} from '@heroicons/react/24/outline'

type AIModel = 'gemini' | 'chatgpt' | 'claude'

interface LoadingMessageProps {
  model: AIModel
  onStop?: () => void
  message?: string
  showStopButton?: boolean
}

const modelConfig = {
  gemini: {
    name: 'Gemini',
    icon: SparklesIcon,
    color: 'from-blue-500 to-blue-600',
    bgColor:
      'from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20',
    dotColor: 'bg-blue-500',
    messages: [
      '생각하는 중...',
      '정보를 분석하고 있습니다...',
      '최적의 답변을 준비하고 있습니다...',
      '관련 데이터를 검토하고 있습니다...',
    ],
  },
  chatgpt: {
    name: 'ChatGPT',
    icon: ChatBubbleLeftIcon,
    color: 'from-green-500 to-green-600',
    bgColor:
      'from-green-50 to-slate-50 dark:from-green-900/20 dark:to-slate-900/20',
    dotColor: 'bg-green-500',
    messages: [
      '응답을 생성하고 있습니다...',
      '컨텍스트를 분석하고 있습니다...',
      '창의적인 답변을 작성하고 있습니다...',
      '정확한 정보를 확인하고 있습니다...',
    ],
  },
  claude: {
    name: 'Claude',
    icon: ComputerDesktopIcon,
    color: 'from-purple-500 to-purple-600',
    bgColor:
      'from-purple-50 to-slate-50 dark:from-purple-900/20 dark:to-slate-900/20',
    dotColor: 'bg-purple-500',
    messages: [
      '신중하게 검토하고 있습니다...',
      '도구를 활용해 답변을 준비하고 있습니다...',
      '상세한 분석을 진행하고 있습니다...',
      '종합적인 답변을 작성하고 있습니다...',
    ],
  },
}

export default function LoadingMessage({
  model,
  onStop,
  message,
  showStopButton = true,
}: LoadingMessageProps) {
  const config = modelConfig[model]
  const Icon = config.icon
  const loadingMessage =
    message ||
    config.messages[Math.floor(Math.random() * config.messages.length)]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start mb-4"
    >
      <div className="flex max-w-[85%] md:max-w-[75%]">
        {/* Avatar */}
        <div className="flex-shrink-0 mr-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${config.color}`}
          >
            <Icon className="w-4 h-4 text-white" />
          </motion.div>
        </div>

        {/* Message Content */}
        <div
          className={`relative rounded-2xl px-4 py-3 shadow-sm bg-gradient-to-r ${config.bgColor} border border-gray-200 dark:border-gray-700`}
        >
          {/* Stop Button */}
          {showStopButton && onStop && (
            <button
              onClick={onStop}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
              title="응답 중단"
            >
              <StopIcon className="w-3 h-3 text-red-500" />
            </button>
          )}

          <div className="flex items-center space-x-3">
            {/* Animated Dots */}
            <div className="flex space-x-1">
              {[0, 1, 2].map(index => (
                <motion.div
                  key={index}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: 'easeInOut',
                  }}
                  className={`w-2 h-2 rounded-full ${config.dotColor}`}
                />
              ))}
            </div>

            {/* Loading Message */}
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {loadingMessage}
              </motion.span>
            </div>
          </div>

          {/* Model Badge */}
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${config.color} text-white font-medium`}
            >
              {config.name}
            </span>

            {/* Animated Progress */}
            <div className="flex space-x-1">
              {[0, 1, 2, 3].map(index => (
                <motion.div
                  key={index}
                  animate={{
                    height: [2, 8, 2],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.1,
                    ease: 'easeInOut',
                  }}
                  className={`w-0.5 ${config.dotColor} rounded-full`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
