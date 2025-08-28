'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

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
  TrashIcon,
} from '@heroicons/react/24/outline'
import mcpManagementService, {
  type MCPProvider,
  type MCPTool,
} from '@/lib/services/mcpManagementService'

export default function MCPAdminPage() {
  const [providers, setProviders] = useState<MCPProvider[]>([])
  const [tools, setTools] = useState<MCPTool[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'providers' | 'tools'>('providers')
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [isAddingTool, setIsAddingTool] = useState(false)
  const [editingProvider, setEditingProvider] = useState<MCPProvider | null>(null)
  const [editingTool, setEditingTool] = useState<MCPTool | null>(null)

  // Provider form state
  const [providerForm, setProviderForm] = useState({
    name: '',
    display_name: '',
    description: '',
    icon: '🔧',
    endpoint_url: '',
    connection_type: 'http' as 'http' | 'websocket' | 'stdio',
    is_active: true,
  })

  // Tool form state
  const [toolForm, setToolForm] = useState({
    provider_id: '',
    name: '',
    display_name: '',
    description: '',
    tool_type: 'function' as 'function' | 'resource' | 'prompt',
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [providersData, toolsData] = await Promise.all([
        mcpManagementService.getProviders(),
        mcpManagementService.getTools(),
      ])
      setProviders(providersData)
      setTools(toolsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProvider = async () => {
    try {
      if (editingProvider) {
        await mcpManagementService.updateProvider(editingProvider.id, providerForm)
      } else {
        await mcpManagementService.createProvider(providerForm)
      }
      await loadData()
      setIsAddingProvider(false)
      setEditingProvider(null)
      resetProviderForm()
    } catch (error) {
      console.error('Failed to save provider:', error)
    }
  }

  const handleSaveTool = async () => {
    try {
      if (editingTool) {
        await mcpManagementService.updateTool(editingTool.id, toolForm)
      } else {
        await mcpManagementService.createTool(toolForm)
      }
      await loadData()
      setIsAddingTool(false)
      setEditingTool(null)
      resetToolForm()
    } catch (error) {
      console.error('Failed to save tool:', error)
    }
  }

  const resetProviderForm = () => {
    setProviderForm({
      name: '',
      display_name: '',
      description: '',
      icon: '🔧',
      endpoint_url: '',
      connection_type: 'http',
      is_active: true,
    })
  }

  const resetToolForm = () => {
    setToolForm({
      provider_id: '',
      name: '',
      display_name: '',
      description: '',
      tool_type: 'function',
      sort_order: 0,
      is_active: true,
    })
  }

  const handleEditProvider = (provider: MCPProvider) => {
    setEditingProvider(provider)
    setProviderForm({
      name: provider.name,
      display_name: provider.display_name,
      description: provider.description || '',
      icon: provider.icon,
      endpoint_url: provider.endpoint_url || '',
      connection_type: provider.connection_type,
      is_active: provider.is_active,
    })
    setIsAddingProvider(true)
  }

  const handleEditTool = (tool: MCPTool) => {
    setEditingTool(tool)
    setToolForm({
      provider_id: tool.provider_id,
      name: tool.name,
      display_name: tool.display_name,
      description: tool.description || '',
      tool_type: tool.tool_type,
      sort_order: tool.sort_order,
      is_active: tool.is_active,
    })
    setIsAddingTool(true)
  }

  const handleToggleProviderActive = async (provider: MCPProvider) => {
    try {
      await mcpManagementService.updateProvider(provider.id, {
        is_active: !provider.is_active,
      })
      await loadData()
    } catch (error) {
      console.error('Failed to toggle provider:', error)
    }
  }

  const handleToggleToolActive = async (tool: MCPTool) => {
    try {
      await mcpManagementService.updateTool(tool.id, {
        is_active: !tool.is_active,
      })
      await loadData()
    } catch (error) {
      console.error('Failed to toggle tool:', error)
    }
  }

  const handleDeleteProvider = async (provider: MCPProvider) => {
    if (window.confirm(`"${provider.display_name}" 제공자를 삭제하시겠습니까? 관련된 모든 도구도 함께 삭제됩니다.`)) {
      try {
        await mcpManagementService.deleteProvider(provider.id)
        await loadData()
      } catch (error) {
        console.error('Failed to delete provider:', error)
      }
    }
  }

  const handleDeleteTool = async (tool: MCPTool) => {
    if (window.confirm(`"${tool.display_name}" 도구를 삭제하시겠습니까?`)) {
      try {
        await mcpManagementService.deleteTool(tool.id)
        await loadData()
      } catch (error) {
        console.error('Failed to delete tool:', error)
      }
    }
  }

  const getConnectionTypeColor = (type: string) => {
    const colors = {
      http: 'bg-blue-100 text-blue-800',
      websocket: 'bg-green-100 text-green-800',
      stdio: 'bg-purple-100 text-purple-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getToolTypeColor = (type: string) => {
    const colors = {
      function: 'bg-blue-100 text-blue-800',
      resource: 'bg-green-100 text-green-800',
      prompt: 'bg-purple-100 text-purple-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
    <ProtectedRoute requireSubscription="enterprise">
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
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsAddingProvider(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />새 제공자 추가
                </button>
                <button
                  onClick={() => setIsAddingTool(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />새 도구 추가
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <CogIcon className="w-8 h-8 text-blue-500 mb-2" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    총 제공자
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {providers.length}
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
                <UsersIcon className="w-8 h-8 text-green-500 mb-2" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    총 도구
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tools.length}
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
                <CheckCircleIcon className="w-8 h-8 text-purple-500 mb-2" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    활성 제공자
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {providers.filter(p => p.is_active).length}
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
                <ChartBarIcon className="w-8 h-8 text-orange-500 mb-2" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    활성 도구
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tools.filter(t => t.is_active).length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('providers')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'providers'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  MCP 제공자 ({providers.length})
                </button>
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'tools'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  MCP 도구 ({tools.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {activeTab === 'providers' ? 'MCP 제공자 관리' : 'MCP 도구 관리'}
              </h2>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeTab === 'providers' ? (
                providers.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{provider.icon}</span>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {provider.display_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {provider.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConnectionTypeColor(provider.connection_type)}`}
                            >
                              {provider.connection_type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(provider.created_at).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleProviderActive(provider)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            provider.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {provider.is_active ? (
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
                          onClick={() => handleEditProvider(provider)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDeleteProvider(provider)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{tool.provider?.icon || '🔧'}</span>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {tool.display_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {tool.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getToolTypeColor(tool.tool_type)}`}
                            >
                              {tool.tool_type}
                            </span>
                            <span className="text-xs text-gray-400">
                              Provider: {tool.provider?.display_name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleToolActive(tool)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            tool.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tool.is_active ? (
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
                          onClick={() => handleEditTool(tool)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDeleteTool(tool)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Add/Edit Provider Modal */}
          {isAddingProvider && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4"
              >
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingProvider ? '제공자 편집' : '새 제공자 추가'}
                  </h3>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      식별자 (name)
                    </label>
                    <input
                      type="text"
                      value={providerForm.name}
                      onChange={e =>
                        setProviderForm({ ...providerForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: web_search"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      표시명
                    </label>
                    <input
                      type="text"
                      value={providerForm.display_name}
                      onChange={e =>
                        setProviderForm({ ...providerForm, display_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 웹 검색"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      설명
                    </label>
                    <textarea
                      value={providerForm.description}
                      onChange={e =>
                        setProviderForm({ ...providerForm, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MCP 제공자에 대한 설명을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      아이콘
                    </label>
                    <input
                      type="text"
                      value={providerForm.icon}
                      onChange={e =>
                        setProviderForm({ ...providerForm, icon: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 🔍"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      연결 타입
                    </label>
                    <select
                      value={providerForm.connection_type}
                      onChange={e =>
                        setProviderForm({
                          ...providerForm,
                          connection_type: e.target.value as 'http' | 'websocket' | 'stdio',
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="http">HTTP</option>
                      <option value="websocket">WebSocket</option>
                      <option value="stdio">STDIO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      엔드포인트 URL (선택사항)
                    </label>
                    <input
                      type="url"
                      value={providerForm.endpoint_url}
                      onChange={e =>
                        setProviderForm({ ...providerForm, endpoint_url: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://api.example.com/mcp"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="provider_is_active"
                      checked={providerForm.is_active}
                      onChange={e =>
                        setProviderForm({
                          ...providerForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor="provider_is_active"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      제공자 활성화
                    </label>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsAddingProvider(false)
                      setEditingProvider(null)
                      resetProviderForm()
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveProvider}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingProvider ? '수정' : '추가'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Add/Edit Tool Modal */}
          {isAddingTool && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4"
              >
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingTool ? '도구 편집' : '새 도구 추가'}
                  </h3>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      제공자
                    </label>
                    <select
                      value={toolForm.provider_id}
                      onChange={e =>
                        setToolForm({ ...toolForm, provider_id: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">제공자를 선택하세요</option>
                      {providers.filter(p => p.is_active).map(provider => (
                        <option key={provider.id} value={provider.id}>
                          {provider.icon} {provider.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      도구 식별자 (name)
                    </label>
                    <input
                      type="text"
                      value={toolForm.name}
                      onChange={e =>
                        setToolForm({ ...toolForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: search_web"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      표시명
                    </label>
                    <input
                      type="text"
                      value={toolForm.display_name}
                      onChange={e =>
                        setToolForm({ ...toolForm, display_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 웹 검색"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      설명
                    </label>
                    <textarea
                      value={toolForm.description}
                      onChange={e =>
                        setToolForm({ ...toolForm, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="도구의 기능에 대한 설명을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      도구 타입
                    </label>
                    <select
                      value={toolForm.tool_type}
                      onChange={e =>
                        setToolForm({
                          ...toolForm,
                          tool_type: e.target.value as 'function' | 'resource' | 'prompt',
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="function">Function (함수 호출)</option>
                      <option value="resource">Resource (리소스 접근)</option>
                      <option value="prompt">Prompt (프롬프트 템플릿)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      정렬 순서
                    </label>
                    <input
                      type="number"
                      value={toolForm.sort_order}
                      onChange={e =>
                        setToolForm({ ...toolForm, sort_order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tool_is_active"
                      checked={toolForm.is_active}
                      onChange={e =>
                        setToolForm({
                          ...toolForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor="tool_is_active"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      도구 활성화
                    </label>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsAddingTool(false)
                      setEditingTool(null)
                      resetToolForm()
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveTool}
                    disabled={!toolForm.provider_id || !toolForm.name || !toolForm.display_name}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {editingTool ? '수정' : '추가'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
