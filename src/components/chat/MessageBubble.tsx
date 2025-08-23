'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ClipboardIcon,
  CheckIcon,
  UserIcon,
  SparklesIcon,
  ChatBubbleLeftIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'
import CodeBlock from './CodeBlock'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  model?: 'gemini' | 'chatgpt' | 'claude'
  metadata?: {
    tokens?: number
    cost?: number
    duration?: number
  }
}

interface MessageBubbleProps {
  message: Message
  index: number
  isLast?: boolean
}

const modelIcons = {
  gemini: SparklesIcon,
  chatgpt: ChatBubbleLeftIcon,
  claude: ComputerDesktopIcon,
}

const modelColors = {
  gemini: 'from-blue-500 to-blue-600',
  chatgpt: 'from-green-500 to-green-600',
  claude: 'from-purple-500 to-purple-600',
}

export default function MessageBubble({
  message,
  index,
  isLast,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // System messages (hidden or minimal display)
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex justify-center my-2"
      >
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-3 py-1 rounded-full">
          {message.content}
        </div>
      </motion.div>
    )
  }

  const ModelIcon = message.model ? modelIcons[message.model] : SparklesIcon
  const modelColor = message.model
    ? modelColors[message.model]
    : 'from-gray-500 to-gray-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group mb-4 ${isLast ? 'mb-8' : ''}`}
    >
      <div
        className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-blue-500' : `bg-gradient-to-r ${modelColor}`
            }`}
          >
            {isUser ? (
              <UserIcon className="w-4 h-4 text-white" />
            ) : (
              <ModelIcon className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div
          className={`relative rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
          }`}
        >
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`absolute top-2 ${isUser ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10 dark:hover:bg-white/10`}
            title="메시지 복사"
          >
            {copied ? (
              <CheckIcon className="w-3 h-3 text-green-500" />
            ) : (
              <ClipboardIcon
                className={`w-3 h-3 ${isUser ? 'text-white/70' : 'text-gray-500'}`}
              />
            )}
          </button>

          {/* Message Content */}
          <div className="prose prose-sm max-w-none break-words">
            {isUser ? (
              <div className="whitespace-pre-wrap text-white">
                {message.content}
              </div>
            ) : (
              <div
                className={`${isUser ? 'prose-invert' : 'dark:prose-invert'}`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // @ts-expect-error ReactMarkdown code component type mismatch
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const language = match ? match[1] : ''

                      if (!inline && language) {
                        return (
                          <CodeBlock
                            code={String(children).replace(/\n$/, '')}
                            language={language}
                          />
                        )
                      }

                      return (
                        <code
                          className={`px-1.5 py-0.5 rounded text-sm font-mono bg-gray-100 dark:bg-gray-700 ${
                            isUser
                              ? 'bg-white/20 text-white'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                    pre: ({ children }) => (
                      <div className="my-2">{children}</div>
                    ),
                    p: ({ children }) => (
                      <div className="mb-2 last:mb-0 leading-relaxed">
                        {children}
                      </div>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-2 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-2 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote
                        className={`border-l-4 pl-4 italic my-2 ${
                          isUser
                            ? 'border-white/30 text-white/90'
                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {children}
                      </blockquote>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mb-2 mt-1">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-bold mb-2 mt-1">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-bold mb-1 mt-1">
                        {children}
                      </h3>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline hover:no-underline ${
                          isUser
                            ? 'text-white hover:text-white/80'
                            : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                        }`}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Message Info */}
          <div
            className={`flex items-center justify-between mt-2 text-xs ${
              isUser ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.model && !isUser && (
                <span className="font-medium capitalize">{message.model}</span>
              )}
              <span>{formatTimestamp(message.timestamp)}</span>
            </div>

            {message.metadata && (
              <div className="flex items-center space-x-2 text-xs">
                {message.metadata.tokens && (
                  <span>{message.metadata.tokens.toLocaleString()} tokens</span>
                )}
                {message.metadata.duration && (
                  <span>{message.metadata.duration}ms</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
