'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentDuplicateIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CodeBracketIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { MCPRegistrationExamples } from '@/lib/services/mcpManagementService'

export default function MCPExamplesPage() {
  const [copiedIndex, setCopiedIndex] = useState<{ type: string; index: number } | null>(null)

  const copyToClipboard = (text: string, type: string, index: number) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2))
    setCopiedIndex({ type, index })
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const isCopied = (type: string, index: number) =>
    copiedIndex?.type === type && copiedIndex?.index === index

  return (
    <ProtectedRoute requireSubscription="enterprise">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <WrenchScrewdriverIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                MCP 등록 예시
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Model Context Protocol(MCP) 제공자와 도구를 등록하는 방법과 예시를 제공합니다.
            </p>
          </div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  MCP 등록 프로세스
                </h3>
                <div className="text-blue-800 dark:text-blue-200 space-y-2">
                  <p>1. <strong>제공자 등록</strong>: MCP 서비스 제공자를 먼저 등록합니다.</p>
                  <p>2. <strong>도구 등록</strong>: 해당 제공자 하위에 구체적인 도구들을 등록합니다.</p>
                  <p>3. <strong>승인 대기</strong>: 등록된 항목들은 관리자 승인을 대기합니다.</p>
                  <p>4. <strong>사용 가능</strong>: 승인 후 사용자들이 선택하여 사용할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* MCP Providers Examples */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <CubeIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  MCP 제공자 등록 예시
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                다양한 MCP 제공자 등록 형태를 참고하세요.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {MCPRegistrationExamples.providers.map((provider, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-gray-750 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{provider.icon}</span>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {provider.display_name}
                        </h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(provider, 'provider', index)}
                        className="inline-flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                      >
                        {isCopied('provider', index) ? (
                          <>
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                            복사
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {provider.description}
                    </p>
                  </div>

                  <div className="p-4">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(provider, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* MCP Tools Examples */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <CodeBracketIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  MCP 도구 등록 예시
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                각 제공자 하위에 등록할 수 있는 도구들의 예시입니다.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {MCPRegistrationExamples.tools.map((tool, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-gray-750 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">🔧</span>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {tool.display_name}
                        </h3>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {tool.tool_type}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(tool, 'tool', index)}
                        className="inline-flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                      >
                        {isCopied('tool', index) ? (
                          <>
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                            복사
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {tool.description}
                    </p>
                  </div>

                  <div className="p-4">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(tool, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Implementation Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mt-8"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                구현 가이드라인
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    제공자 필수 항목
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">name</code>: 고유 식별자</li>
                    <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">display_name</code>: 표시명</li>
                    <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">description</code>: 기능 설명</li>
                    <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">connection_type</code>: http/websocket/stdio</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    도구 필수 항목
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">provider_id</code>: 소속 제공자 ID</li>
                    <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">name</code>: 고유 식별자</li>
                    <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">display_name</code>: 표시명</li>
                    <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">tool_type</code>: function/resource/prompt</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  )
}