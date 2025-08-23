'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  MagnifyingGlassIcon,
  DocumentIcon,
  CircleStackIcon,
  PhotoIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import type { MCPToolType, MCPToolResult } from '@/lib/services/mcpService'

interface ToolUsageProps {
  toolType: MCPToolType
  toolName: string
  status: 'pending' | 'running' | 'success' | 'error'
  input?: Record<string, unknown>
  result?: MCPToolResult
  startTime?: number
  endTime?: number
}

const toolIcons: Record<
  MCPToolType,
  React.ComponentType<{ className?: string }>
> = {
  web_search: MagnifyingGlassIcon,
  file_system: DocumentIcon,
  database: CircleStackIcon,
  image_generation: PhotoIcon,
  custom: SparklesIcon,
}

const toolColors: Record<MCPToolType, string> = {
  web_search: 'from-blue-500 to-blue-600',
  file_system: 'from-green-500 to-green-600',
  database: 'from-purple-500 to-purple-600',
  image_generation: 'from-pink-500 to-pink-600',
  custom: 'from-gray-500 to-gray-600',
}

export default function ToolUsage({
  toolType,
  toolName,
  status,
  input,
  result,
  startTime,
  endTime,
}: ToolUsageProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = toolIcons[toolType]
  const color = toolColors[toolType]

  const duration = startTime && endTime ? endTime - startTime : null

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-gray-400" />
      case 'running':
        return (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-red-500" />
    }
  }

  const renderResult = () => {
    if (!result) return null

    if (result.error) {
      return (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            오류: {result.error}
          </p>
        </div>
      )
    }

    switch (toolType) {
      case 'web_search':
        return (
          <div className="mt-3 space-y-2">
            {Array.isArray(result.data) &&
              result.data.map((item: unknown, index: number) => {
                const searchResult = item as {
                  url?: string
                  title?: string
                  snippet?: string
                }
                return (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <a
                      href={searchResult.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {searchResult.title || 'Search Result'}
                    </a>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {searchResult.snippet || 'No snippet available'}
                    </p>
                  </div>
                )
              })}
          </div>
        )

      case 'image_generation':
        return (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {Array.isArray(result.data) &&
              result.data.map((image: unknown, index: number) => {
                const imageObj = image as { url?: string; prompt?: string }
                return (
                  <div key={index} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageObj.url || ''}
                      alt={imageObj.prompt || 'Generated image'}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <p className="text-xs text-white text-center px-2">
                        {imageObj.prompt || 'Generated image'}
                      </p>
                    </div>
                  </div>
                )
              })}
          </div>
        )

      case 'database':
        return (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  {result.data &&
                    typeof result.data === 'object' &&
                    result.data !== null &&
                    'rows' in result.data &&
                    Array.isArray((result.data as { rows?: unknown[] }).rows) &&
                    (result.data as { rows: unknown[] }).rows[0] &&
                    typeof (result.data as { rows: unknown[] }).rows[0] ===
                      'object' &&
                    (result.data as { rows: unknown[] }).rows[0] !== null &&
                    Object.keys(
                      (result.data as { rows: Record<string, unknown>[] })
                        .rows[0]
                    ).map(key => (
                      <th
                        key={key}
                        className="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-300"
                      >
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {result.data &&
                  typeof result.data === 'object' &&
                  result.data !== null &&
                  'rows' in result.data &&
                  Array.isArray((result.data as { rows?: unknown[] }).rows) &&
                  (result.data as { rows: unknown[] }).rows.map(
                    (row: unknown, index: number) => {
                      if (typeof row === 'object' && row !== null) {
                        return (
                          <tr
                            key={index}
                            className="border-t border-gray-200 dark:border-gray-700"
                          >
                            {Object.values(row as Record<string, unknown>).map(
                              (value: unknown, i: number) => (
                                <td
                                  key={i}
                                  className="px-2 py-1 text-gray-600 dark:text-gray-400"
                                >
                                  {String(value)}
                                </td>
                              )
                            )}
                          </tr>
                        )
                      }
                      return null
                    }
                  )}
              </tbody>
            </table>
          </div>
        )

      case 'file_system':
        return (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )

      default:
        return (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div
        className={`border rounded-lg ${
          status === 'error'
            ? 'border-red-200 dark:border-red-800'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {toolName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {status === 'running'
                  ? '실행 중...'
                  : status === 'success'
                    ? `완료${duration ? ` (${duration}ms)` : ''}`
                    : status === 'error'
                      ? '오류 발생'
                      : '대기 중'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200 dark:border-gray-700 px-4 py-3"
            >
              {input && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    입력:
                  </p>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(input, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {status === 'running' && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}

              {(status === 'success' || status === 'error') && renderResult()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
