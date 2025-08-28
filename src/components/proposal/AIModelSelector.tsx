'use client'

import { useState, useEffect } from 'react'
import {
  CpuChipIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface AIModel {
  id: string
  name: string
  description: string
  icon: string
  available: boolean
  features: string[]
}

interface AIModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  className?: string
}

const availableModels: AIModel[] = [
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: '빠른 분석과 문서 처리에 최적화',
    icon: '🤖',
    available: true,
    features: ['빠른 처리', '다국어 지원', '문서 분석'],
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: '복잡한 추론과 창의적 작업에 강력',
    icon: '💡',
    available: true,
    features: ['고급 추론', '창의적 글쓰기', '코드 생성'],
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: '정확한 분석과 전문적인 문서 작성',
    icon: '📝',
    available: true,
    features: ['정확한 분석', 'MCP 통합', '전문 문서'],
  },
]

export default function AIModelSelector({
  selectedModel,
  onModelChange,
  className = '',
}: AIModelSelectorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <CpuChipIcon className="w-5 h-5 text-blue-600" />
          <span>AI 모델 선택</span>
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <InformationCircleIcon className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-3">
          {availableModels.map(model => (
            <div
              key={model.id}
              className={`relative border rounded-lg p-3 cursor-pointer transition-all ${
                selectedModel === model.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${!model.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => model.available && onModelChange(model.id)}
            >
              {selectedModel === model.id && (
                <CheckCircleIcon className="absolute top-2 right-2 w-4 h-4 text-blue-600" />
              )}

              <div className="flex items-start space-x-3">
                <span className="text-2xl">{model.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {model.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {model.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {model.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {!model.available && (
                    <div className="mt-2">
                      <span className="text-xs text-red-600 dark:text-red-400">
                        현재 사용 불가
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <InformationCircleIcon className="w-4 h-4" />
          <span>모든 분석 단계에서 동일한 모델이 사용됩니다</span>
        </div>
      </div>
    </div>
  )
}
