'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Cog6ToothIcon,
  SparklesIcon,
  ChatBubbleLeftIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export type AIModel = 'gemini' | 'chatgpt' | 'claude'

export interface ChatSettings {
  model: AIModel
  temperature: number
  maxTokens: number
  systemPrompt: string
  streamMode: boolean
  contextWindow: number
}

interface ChatSettingsProps {
  settings: ChatSettings
  onChange: (settings: ChatSettings) => void
  isOpen: boolean
  onClose: () => void
}

const modelOptions = [
  {
    id: 'gemini' as AIModel,
    name: 'Gemini Pro',
    description: '빠르고 효율적인 범용 AI 모델',
    icon: SparklesIcon,
    color: 'from-blue-500 to-blue-600',
    maxTokens: 30720,
    contextWindow: 32000,
    costPer1K: 0.00025,
    features: ['빠른 응답', '다국어 지원', '비용 효율적'],
  },
  {
    id: 'chatgpt' as AIModel,
    name: 'GPT-4',
    description: '창의적이고 정확한 텍스트 생성에 특화',
    icon: ChatBubbleLeftIcon,
    color: 'from-green-500 to-green-600',
    maxTokens: 4096,
    contextWindow: 8192,
    costPer1K: 0.03,
    features: ['창의적 작성', '논리적 추론', '고품질 출력'],
  },
  {
    id: 'claude' as AIModel,
    name: 'Claude 3.5',
    description: '도구 통합과 복잡한 작업에 최적화',
    icon: ComputerDesktopIcon,
    color: 'from-purple-500 to-purple-600',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1K: 0.015,
    features: ['도구 통합', '긴 컨텍스트', '정확한 분석'],
  },
]

const systemPromptPresets = [
  {
    name: '기본 어시스턴트',
    prompt:
      '당신은 도움이 되고 정확하며 친근한 AI 어시스턴트입니다. 사용자의 질문에 명확하고 유용한 답변을 제공해주세요.',
  },
  {
    name: '프로젝트 기획 전문가',
    prompt:
      '당신은 웹·앱 서비스 기획 전문가입니다. RFP 분석, 요구사항 정리, 제안서 작성, 기능 설계 등의 업무를 전문적으로 도와주세요. 실무적이고 구체적인 조언을 제공해주세요.',
  },
  {
    name: '개발자 도우미',
    prompt:
      '당신은 경험 많은 소프트웨어 개발자입니다. 코드 리뷰, 버그 수정, 아키텍처 설계, 기술 선택 등에 대해 전문적인 조언을 제공해주세요. 코드 예시와 함께 설명해주세요.',
  },
  {
    name: '마케팅 전략가',
    prompt:
      '당신은 디지털 마케팅 전문가입니다. 시장 분석, 사용자 니즈 파악, 마케팅 전략 수립 등을 도와주세요. 데이터 기반의 실용적인 조언을 제공해주세요.',
  },
]

export default function ChatSettings({
  settings,
  onChange,
  isOpen,
  onClose,
}: ChatSettingsProps) {
  const [selectedModel, setSelectedModel] = useState(settings.model)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showPresetDropdown, setShowPresetDropdown] = useState(false)

  if (!isOpen) return null

  const currentModelConfig = modelOptions.find(m => m.id === selectedModel)

  const handleModelChange = (modelId: AIModel) => {
    const modelConfig = modelOptions.find(m => m.id === modelId)
    if (modelConfig) {
      setSelectedModel(modelId)
      onChange({
        ...settings,
        model: modelId,
        maxTokens: Math.min(settings.maxTokens, modelConfig.maxTokens),
        contextWindow: modelConfig.contextWindow,
      })
    }
    setShowModelDropdown(false)
  }

  const handlePresetSelect = (preset: (typeof systemPromptPresets)[0]) => {
    onChange({
      ...settings,
      systemPrompt: preset.prompt,
    })
    setShowPresetDropdown(false)
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              채팅 설정
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* AI Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI 모델
          </label>
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {currentModelConfig && (
                  <>
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-r ${currentModelConfig.color} flex items-center justify-center`}
                    >
                      <currentModelConfig.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {currentModelConfig.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${currentModelConfig.costPer1K}/1K tokens
                      </div>
                    </div>
                  </>
                )}
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>

            {showModelDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
              >
                {modelOptions.map(model => {
                  const Icon = model.icon
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleModelChange(model.id)}
                      className={`w-full flex items-start p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedModel === model.id
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${model.color} flex items-center justify-center mr-3 mt-0.5`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {model.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {model.description}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {model.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </motion.div>
            )}
          </div>
        </div>

        {/* Temperature */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              창의성 (Temperature)
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {settings.temperature}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={e =>
              onChange({ ...settings, temperature: parseFloat(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>보수적</span>
            <span>창의적</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              최대 토큰 수
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {settings.maxTokens.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="256"
            max={currentModelConfig?.maxTokens || 4096}
            step="256"
            value={settings.maxTokens}
            onChange={e =>
              onChange({ ...settings, maxTokens: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>짧게</span>
            <span>길게</span>
          </div>
        </div>

        {/* System Prompt */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              시스템 프롬프트
            </label>
            <div className="relative">
              <button
                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                프리셋
              </button>

              {showPresetDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 z-10 w-64 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                >
                  {systemPromptPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetSelect(preset)}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {preset.prompt.substring(0, 100)}...
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
          <textarea
            value={settings.systemPrompt}
            onChange={e =>
              onChange({ ...settings, systemPrompt: e.target.value })
            }
            placeholder="AI의 역할과 행동을 정의하는 시스템 프롬프트를 입력하세요..."
            rows={4}
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Stream Mode */}
        <div>
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                스트리밍 모드
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                응답을 실시간으로 스트리밍
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.streamMode}
              onChange={e =>
                onChange({ ...settings, streamMode: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>

        {/* Model Info */}
        {currentModelConfig && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">모델 정보</div>
                <div className="space-y-1">
                  <div>
                    최대 토큰: {currentModelConfig.maxTokens.toLocaleString()}
                  </div>
                  <div>
                    컨텍스트 윈도우:{' '}
                    {currentModelConfig.contextWindow.toLocaleString()}
                  </div>
                  <div>비용: ${currentModelConfig.costPer1K}/1K tokens</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
