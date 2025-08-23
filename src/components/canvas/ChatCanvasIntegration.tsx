'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EyeIcon,
  CodeBracketIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

export interface CodeBlock {
  id: string
  language: string
  code: string
  title?: string
  description?: string
  messageId: string
  timestamp: number
}

export interface ChatCanvasIntegrationProps {
  messages?: Array<{
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: number
  }>
  onLoadCode?: (codeBlock: CodeBlock) => void
  onCreateCanvas?: (codeBlock: CodeBlock) => void
  className?: string
}

// 코드 블록 추출 정규식
const CODE_BLOCK_REGEX = /```(\w+)?\n([\s\S]*?)```/g

// 언어 감지 및 정규화
const normalizeLanguage = (lang?: string): string => {
  if (!lang) return 'javascript'

  const langMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    jsx: 'javascript',
    py: 'python',
    html: 'html',
    css: 'css',
    react: 'javascript',
    vue: 'javascript',
    angular: 'typescript',
  }

  return langMap[lang.toLowerCase()] || lang.toLowerCase()
}

// 코드 블록에서 제목 추출
const extractTitle = (code: string, language: string): string => {
  const lines = code.split('\n').slice(0, 5) // 첫 5줄에서 찾기

  // 주석에서 제목 찾기
  for (const line of lines) {
    const trimmed = line.trim()
    if (language === 'python' && trimmed.startsWith('#')) {
      const title = trimmed.slice(1).trim()
      if (title.length > 0 && title.length < 50) return title
    } else if (
      (language === 'javascript' || language === 'typescript') &&
      trimmed.startsWith('//')
    ) {
      const title = trimmed.slice(2).trim()
      if (title.length > 0 && title.length < 50) return title
    } else if (language === 'html' && trimmed.includes('<title>')) {
      const match = trimmed.match(/<title>(.*?)<\/title>/i)
      if (match) return match[1]
    }
  }

  // 함수명이나 클래스명에서 제목 추출
  if (language === 'python') {
    const functionMatch = code.match(/def\s+(\w+)/i)
    const classMatch = code.match(/class\s+(\w+)/i)
    if (functionMatch) return `Function: ${functionMatch[1]}`
    if (classMatch) return `Class: ${classMatch[1]}`
  } else if (language === 'javascript' || language === 'typescript') {
    const functionMatch = code.match(
      /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*:)/i
    )
    const componentMatch = code.match(
      /(?:export\s+default\s+)?(?:function\s+)?(\w+Component|\w+App|\w+View)/i
    )
    if (componentMatch) return `Component: ${componentMatch[1]}`
    if (functionMatch)
      return `Function: ${functionMatch[1] || functionMatch[2] || functionMatch[3]}`
  }

  // 기본 제목
  const langNames: Record<string, string> = {
    javascript: 'JavaScript Code',
    typescript: 'TypeScript Code',
    python: 'Python Script',
    html: 'HTML Document',
    css: 'CSS Styles',
  }

  return langNames[language] || 'Code Snippet'
}

export default function ChatCanvasIntegration({
  messages = [],
  onLoadCode,
  onCreateCanvas,
  className = '',
}: ChatCanvasIntegrationProps) {
  const [extractedCodeBlocks, setExtractedCodeBlocks] = useState<CodeBlock[]>(
    []
  )
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set())

  // 메시지에서 코드 블록 추출
  const extractCodeBlocks = useCallback(
    (messages: ChatCanvasIntegrationProps['messages']) => {
      if (!messages) return []

      const codeBlocks: CodeBlock[] = []

      messages.forEach(message => {
        if (message.role !== 'assistant') return

        const matches = [...message.content.matchAll(CODE_BLOCK_REGEX)]

        matches.forEach((match, index) => {
          const language = normalizeLanguage(match[1])
          const code = match[2].trim()

          if (code.length > 10) {
            // 최소 길이 필터
            const id = `${message.id}-${index}`
            const title = extractTitle(code, language)

            codeBlocks.push({
              id,
              language,
              code,
              title,
              messageId: message.id,
              timestamp: message.timestamp,
            })
          }
        })
      })

      return codeBlocks.reverse() // 최신 순으로 정렬
    },
    []
  )

  // 메시지 변경 시 코드 블록 추출
  useEffect(() => {
    const blocks = extractCodeBlocks(messages)
    setExtractedCodeBlocks(blocks)
  }, [messages, extractCodeBlocks])

  // 코드 복사
  const copyToClipboard = async (codeBlock: CodeBlock) => {
    try {
      await navigator.clipboard.writeText(codeBlock.code)
      setCopiedIds(prev => new Set([...prev, codeBlock.id]))

      // 3초 후 복사 상태 제거
      setTimeout(() => {
        setCopiedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(codeBlock.id)
          return newSet
        })
      }, 3000)
    } catch (error) {
      console.error('코드 복사 실패:', error)
    }
  }

  // 언어별 아이콘
  const getLanguageIcon = (language: string) => {
    const icons: Record<string, string> = {
      javascript: '⚡',
      typescript: '🔷',
      python: '🐍',
      html: '🌐',
      css: '🎨',
      react: '⚛️',
    }
    return icons[language] || '📄'
  }

  // 언어별 색상
  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: 'from-yellow-500 to-orange-500',
      typescript: 'from-blue-500 to-indigo-500',
      python: 'from-green-500 to-emerald-500',
      html: 'from-red-500 to-pink-500',
      css: 'from-purple-500 to-violet-500',
    }
    return colors[language] || 'from-gray-500 to-slate-500'
  }

  if (extractedCodeBlocks.length === 0) {
    return (
      <div
        className={`p-4 text-center text-gray-500 dark:text-gray-400 ${className}`}
      >
        <CodeBracketIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          AI가 코드를 생성하면 여기에 미리보기 버튼이 표시됩니다.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          추출된 코드 ({extractedCodeBlocks.length})
        </h3>
        {extractedCodeBlocks.length > 0 && (
          <button
            onClick={() => setExtractedCodeBlocks([])}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            전체 삭제
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        <AnimatePresence>
          {extractedCodeBlocks.map(codeBlock => (
            <motion.div
              key={codeBlock.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              {/* 코드 블록 헤더 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 bg-gradient-to-r ${getLanguageColor(codeBlock.language)} rounded-md flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {getLanguageIcon(codeBlock.language)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {codeBlock.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {codeBlock.language.charAt(0).toUpperCase() +
                        codeBlock.language.slice(1)}{' '}
                      • {codeBlock.code.split('\n').length} lines
                    </div>
                  </div>
                </div>
              </div>

              {/* 코드 미리보기 */}
              <div className="mb-3">
                <div className="bg-gray-50 dark:bg-gray-900 rounded border p-2 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-hidden">
                  <div className="line-clamp-3">
                    {codeBlock.code.split('\n').slice(0, 3).join('\n')}
                  </div>
                  {codeBlock.code.split('\n').length > 3 && (
                    <div className="text-gray-400 mt-1">
                      ... {codeBlock.code.split('\n').length - 3} more lines
                    </div>
                  )}
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* 미리보기 버튼 */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onLoadCode?.(codeBlock)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <EyeIcon className="w-3 h-3" />
                    <span>미리보기</span>
                  </motion.button>

                  {/* 캔버스 생성 버튼 */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCreateCanvas?.(codeBlock)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <PlusIcon className="w-3 h-3" />
                    <span>새 캔버스</span>
                  </motion.button>

                  {/* 복사 버튼 */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(codeBlock)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    {copiedIds.has(codeBlock.id) ? (
                      <>
                        <CheckIcon className="w-3 h-3" />
                        <span>복사됨</span>
                      </>
                    ) : (
                      <>
                        <DocumentDuplicateIcon className="w-3 h-3" />
                        <span>복사</span>
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="text-xs text-gray-400">
                  {new Date(codeBlock.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
