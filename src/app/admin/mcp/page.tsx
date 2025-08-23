'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CogIcon,
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import {
  MCPService,
  type MCPConfiguration,
  type MCPToolType,
} from '@/lib/services/mcpService'

export default function MCPAdminPage() {
  const [configurations, setConfigurations] = useState<MCPConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingConfig, setIsAddingConfig] = useState(false)
  const [editingConfig, setEditingConfig] = useState<MCPConfiguration | null>(
    null
  )
  const [usageStats, setUsageStats] = useState<{
    totalUsage: number
    byToolType: Record<string, number>
    successRate: number
    avgDuration: number
    totalTokens: number
  } | null>(null)

  // Form state
  const [configForm, setConfigForm] = useState({
    name: '',
    type: 'web_search' as MCPToolType,
    config: {},
    is_active: true,
  })

  useEffect(() => {
    loadConfigurations()
    loadUsageStats()
  }, [])

  const loadConfigurations = async () => {
    try {
      const configs = await MCPService.getConfigurations()
      setConfigurations(configs)
    } catch (error) {
      console.error('Failed to load configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsageStats = async () => {
    try {
      // For demo purposes, get stats for demo user
      const stats = await MCPService.getUserUsageStats('demo-user', 7)
      setUsageStats(stats)
    } catch (error) {
      console.error('Failed to load usage stats:', error)
    }
  }

  const handleSaveConfig = async () => {
    try {
      if (editingConfig) {
        // Update existing configuration
        const success = await MCPService.updateConfiguration(
          editingConfig.id,
          configForm
        )
        if (success) {
          await loadConfigurations()
          setEditingConfig(null)
          resetForm()
        }
      } else {
        // For demo purposes, we'll just add to local state
        // In production, you'd call a proper API endpoint
        const newConfig: MCPConfiguration = {
          id: Date.now().toString(),
          name: configForm.name,
          type: configForm.type,
          config: configForm.config,
          is_active: configForm.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setConfigurations([...configurations, newConfig])
      }

      setIsAddingConfig(false)
      resetForm()
    } catch (error) {
      console.error('Failed to save configuration:', error)
    }
  }

  const resetForm = () => {
    setConfigForm({
      name: '',
      type: 'web_search',
      config: {},
      is_active: true,
    })
  }

  const handleEdit = (config: MCPConfiguration) => {
    setEditingConfig(config)
    setConfigForm({
      name: config.name,
      type: config.type,
      config: config.config,
      is_active: config.is_active,
    })
    setIsAddingConfig(true)
  }

  const handleToggleActive = async (config: MCPConfiguration) => {
    try {
      const success = await MCPService.updateConfiguration(config.id, {
        is_active: !config.is_active,
      })
      if (success) {
        await loadConfigurations()
      }
    } catch (error) {
      console.error('Failed to toggle configuration:', error)
    }
  }

  const getToolTypeColor = (type: MCPToolType) => {
    const colors = {
      web_search: 'bg-blue-100 text-blue-800',
      file_system: 'bg-green-100 text-green-800',
      database: 'bg-purple-100 text-purple-800',
      image_generation: 'bg-pink-100 text-pink-800',
      custom: 'bg-gray-100 text-gray-800',
    }
    return colors[type] || colors.custom
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            MCP 설정을 불러오는 중...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                MCP 관리
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Model Context Protocol 도구 설정 및 관리
              </p>
            </div>
            <button
              onClick={() => setIsAddingConfig(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />새 도구 추가
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {usageStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <UsersIcon className="w-8 h-8 text-blue-500 mb-2" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    총 사용량
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usageStats.totalUsage}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mb-2" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    성공률
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usageStats.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-purple-500 mb-2" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    평균 응답시간
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usageStats.avgDuration.toFixed(0)}ms
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <CogIcon className="w-8 h-8 text-orange-500 mb-2" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    활성 도구
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {configurations.filter(c => c.is_active).length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Configurations List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              도구 설정
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {configurations.map((config, index) => (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getToolTypeColor(config.type)}`}
                    >
                      {config.type.replace('_', ' ')}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {config.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        생성일:{' '}
                        {new Date(config.created_at).toLocaleDateString(
                          'ko-KR'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(config)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        config.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.is_active ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          활성
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          비활성
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleEdit(config)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isAddingConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingConfig ? '도구 설정 편집' : '새 도구 추가'}
                </h3>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    도구 이름
                  </label>
                  <input
                    type="text"
                    value={configForm.name}
                    onChange={e =>
                      setConfigForm({ ...configForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="도구 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    도구 타입
                  </label>
                  <select
                    value={configForm.type}
                    onChange={e =>
                      setConfigForm({
                        ...configForm,
                        type: e.target.value as MCPToolType,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="web_search">웹 검색</option>
                    <option value="file_system">파일 시스템</option>
                    <option value="database">데이터베이스</option>
                    <option value="image_generation">이미지 생성</option>
                    <option value="custom">커스텀</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={configForm.is_active}
                    onChange={e =>
                      setConfigForm({
                        ...configForm,
                        is_active: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="is_active"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    도구 활성화
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAddingConfig(false)
                    setEditingConfig(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingConfig ? '수정' : '추가'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
