'use client'

import { useState, useEffect } from 'react'
import {
  CogIcon,
  XMarkIcon,
  CheckCircleIcon,
  CpuChipIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface AIModelConfig {
  model: string
  temperature: number
  maxTokens: number
  topP: number
}

interface AIModel {
  id: string
  name: string
  description: string
  icon: string
  available: boolean
  features: string[]
  models: string[]
  defaultConfig: AIModelConfig
  mcpTools?: string[]
}

interface MCPTool {
  id: string
  name: string
  display_name: string
  icon: string
  description?: string
}

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedModel: string
  selectedModelConfig: string
  selectedMCPTools: string[]
  onModelChange: (modelId: string) => void
  onModelConfigChange: (modelId: string, config: string) => void
  onMCPToolsChange: (toolIds: string[]) => void
}

const availableModels: AIModel[] = [
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: '빠른 분석과 문서 처리에 최적화',
    icon: '🤖',
    available: true,
    features: ['빠른 처리', '다국어 지원', '문서 분석'],
    models: ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro'],
    defaultConfig: {
      model: 'gemini-1.5-pro',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.9,
    },
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: '복잡한 추론과 창의적 작업에 강력',
    icon: '💡',
    available: true,
    features: ['고급 추론', '창의적 글쓰기', '코드 생성'],
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-4-32k'],
    defaultConfig: {
      model: 'gpt-4-turbo',
      temperature: 0.8,
      maxTokens: 4096,
      topP: 1.0,
    },
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: '정확한 분석과 전문적인 문서 작성 + MCP 도구 지원',
    icon: '📝',
    available: true,
    features: ['정확한 분석', 'MCP 통합', '전문 문서', '도구 사용'],
    models: [
      'claude-3-sonnet-20240229',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
    ],
    defaultConfig: {
      model: 'claude-3-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.95,
    },
    mcpTools: ['web_search', 'file_system', 'database'],
  },
]

export default function ProjectSidebar({
  isOpen,
  onClose,
  selectedModel,
  selectedModelConfig,
  selectedMCPTools,
  onModelChange,
  onModelConfigChange,
  onMCPToolsChange,
}: ProjectSidebarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([])
  const selectedModelData = availableModels.find(m => m.id === selectedModel)
  const [currentConfig, setCurrentConfig] = useState<AIModelConfig>(
    selectedModelData?.defaultConfig || availableModels[0].defaultConfig
  )

  useEffect(() => {
    if (selectedModel === 'claude-3-sonnet') {
      loadMcpTools()
    }
  }, [selectedModel])

  useEffect(() => {
    if (selectedModelConfig) {
      try {
        const config = JSON.parse(selectedModelConfig)
        setCurrentConfig(config)
      } catch (error) {
        console.error('Invalid model config:', error)
      }
    }
  }, [selectedModelConfig])

  const loadMcpTools = async () => {
    try {
      const { default: mcpManagementService } = await import(
        '@/lib/services/mcpManagementService'
      )
      const tools = await mcpManagementService.getActiveMcpTools()
      setMcpTools(
        tools.map(tool => ({
          id: tool.id,
          name: tool.name,
          display_name: tool.name,
          icon: tool.icon,
          description: tool.description,
        }))
      )
    } catch (error) {
      console.error('Failed to load MCP tools:', error)
      setMcpTools([
        {
          id: 'web_search',
          name: 'web_search',
          display_name: '웹 검색',
          icon: '🔍',
        },
        {
          id: 'file_system',
          name: 'file_system',
          display_name: '파일 시스템',
          icon: '📁',
        },
        {
          id: 'database',
          name: 'database',
          display_name: '데이터베이스',
          icon: '🗄️',
        },
      ])
    }
  }

  const handleModelChange = (modelId: string) => {
    onModelChange(modelId)
    const modelData = availableModels.find(m => m.id === modelId)
    if (modelData) {
      setCurrentConfig(modelData.defaultConfig)
      onModelConfigChange(modelId, JSON.stringify(modelData.defaultConfig))
    }
  }

  const handleConfigChange = (newConfig: AIModelConfig) => {
    setCurrentConfig(newConfig)
    onModelConfigChange(selectedModel, JSON.stringify(newConfig))
  }

  const handleMCPToolToggle = (toolId: string) => {
    const newTools = selectedMCPTools.includes(toolId)
      ? selectedMCPTools.filter(id => id !== toolId)
      : [...selectedMCPTools, toolId]
    onMCPToolsChange(newTools)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <CogIcon className="w-5 h-5" />
              <span>프로젝트 설정</span>
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Model Selection */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <CpuChipIcon className="w-5 h-5 text-blue-600" />
              <span>AI 모델 선택</span>
            </h4>

            <div className="space-y-3">
              {availableModels.map(model => (
                <div
                  key={model.id}
                  className={`relative border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleModelChange(model.id)}
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

                      {/* Model Configuration */}
                      {selectedModel === model.id && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              모델 설정
                            </span>
                            <button
                              onClick={() => setShowAdvanced(!showAdvanced)}
                              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                              {showAdvanced ? '간단히' : '고급 설정'}
                            </button>
                          </div>

                          {/* Model Selection */}
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              모델 버전
                            </label>
                            <select
                              value={currentConfig.model}
                              onChange={e => {
                                const newConfig = {
                                  ...currentConfig,
                                  model: e.target.value,
                                }
                                handleConfigChange(newConfig)
                              }}
                              className="w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                              {model.models.map(modelVersion => (
                                <option key={modelVersion} value={modelVersion}>
                                  {modelVersion}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Advanced Settings */}
                          {showAdvanced && (
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Temperature: {currentConfig.temperature}
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="2"
                                  step="0.1"
                                  value={currentConfig.temperature}
                                  onChange={e => {
                                    const newConfig = {
                                      ...currentConfig,
                                      temperature: parseFloat(e.target.value),
                                    }
                                    handleConfigChange(newConfig)
                                  }}
                                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Max Tokens
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="8192"
                                  value={currentConfig.maxTokens}
                                  onChange={e => {
                                    const newConfig = {
                                      ...currentConfig,
                                      maxTokens: parseInt(e.target.value),
                                    }
                                    handleConfigChange(newConfig)
                                  }}
                                  className="w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Top P: {currentConfig.topP}
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.01"
                                  value={currentConfig.topP}
                                  onChange={e => {
                                    const newConfig = {
                                      ...currentConfig,
                                      topP: parseFloat(e.target.value),
                                    }
                                    handleConfigChange(newConfig)
                                  }}
                                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MCP Tools Selection */}
          {selectedModel === 'claude-3-sonnet' && mcpTools.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                MCP 도구 선택
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-start space-x-2">
                <InformationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  관리자가 승인한 MCP 도구 중에서 선택하세요. 선택된 도구들은 AI
                  모델에서 사용할 수 있습니다.
                </span>
              </div>

              <div className="space-y-2">
                {mcpTools.map(tool => (
                  <label
                    key={tool.id}
                    className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMCPTools.includes(tool.id)}
                      onChange={() => handleMCPToolToggle(tool.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-lg mr-2">{tool.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {tool.display_name}
                      </div>
                      {tool.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {tool.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {selectedMCPTools.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>{selectedMCPTools.length}개 도구</strong>가 선택되었습니다.
                    선택된 도구들은 AI 모델에서 자동으로 활용됩니다.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Information */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <InformationCircleIcon className="w-4 h-4" />
              <span>
                설정된 AI 모델과 도구들은 모든 분석 단계에서 사용됩니다.
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}