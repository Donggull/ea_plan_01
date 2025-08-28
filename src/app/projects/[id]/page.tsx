'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PencilIcon,
  DocumentTextIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  ChartBarSquareIcon,
  LightBulbIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  BeakerIcon,
  UsersIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  CogIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import useProjectStore, { Project } from '@/lib/stores/projectStore'
import ProposalWorkflow from '@/components/proposal/ProposalWorkflow'
import DevelopmentWorkflow from '@/components/development/DevelopmentWorkflow'
import OperationWorkflow from '@/components/operation/OperationWorkflow'
import { MCPTool } from '@/lib/services/mcpManagementService'

interface TabContent {
  id: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
}

const categoryTabs: Record<string, TabContent[]> = {
  proposal: [
    {
      id: 'rfp',
      label: 'RFP 분석',
      icon: DocumentTextIcon,
      description: 'RFP 문서 분석 및 요구사항 정리',
    },
    {
      id: 'market',
      label: '시장 조사',
      icon: ChartPieIcon,
      description: '경쟁사 분석 및 시장 동향 조사',
    },
    {
      id: 'proposal',
      label: '제안서 작성',
      icon: ClipboardDocumentListIcon,
      description: '제안서 작성 및 관리',
    },
    {
      id: 'cost',
      label: '비용 산정',
      icon: ChartBarSquareIcon,
      description: '프로젝트 비용 계산 및 일정 계획',
    },
  ],
  development: [
    {
      id: 'analysis',
      label: '현황 분석',
      icon: ChartPieIcon,
      description: '현재 시스템 분석 및 문제점 도출',
    },
    {
      id: 'requirements',
      label: '요구사항',
      icon: ClipboardDocumentListIcon,
      description: '기능 및 비기능 요구사항 정의',
    },
    {
      id: 'features',
      label: '기능 정의',
      icon: LightBulbIcon,
      description: '상세 기능 명세 및 API 설계',
    },
    {
      id: 'design',
      label: '화면 설계',
      icon: ComputerDesktopIcon,
      description: '와이어프레임 및 프로토타입 제작',
    },
    {
      id: 'wbs',
      label: 'WBS 관리',
      icon: ChartBarIcon,
      description: '작업 분해 구조 및 일정 관리',
    },
    {
      id: 'qa',
      label: 'QA 관리',
      icon: BeakerIcon,
      description: '테스트 계획 및 품질 관리',
    },
    {
      id: 'insights',
      label: '종합 인사이트',
      icon: ChartBarSquareIcon,
      description: '프로젝트 대시보드 및 분석',
    },
  ],
  operation: [
    {
      id: 'requirements',
      label: '요건 관리',
      icon: DocumentTextIcon,
      description: '고객 요청사항 접수 및 관리',
    },
    {
      id: 'planning',
      label: '업무 분배',
      icon: UsersIcon,
      description: '팀별 업무 할당 및 관리',
    },
    {
      id: 'schedule',
      label: '일정 관리',
      icon: CalendarIcon,
      description: '스프린트 계획 및 추적',
    },
    {
      id: 'performance',
      label: '성과 관리',
      icon: ArrowTrendingUpIcon,
      description: 'KPI 모니터링 및 개선',
    },
  ],
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProjectById } = useProjectStore()
  const [project, setProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<string>('rfp')
  const [showSettings, setShowSettings] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini')
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([])
  const [availableMCPTools, setAvailableMCPTools] = useState<MCPTool[]>([])

  const availableModels = [
    { id: 'gemini', name: 'Google Gemini', description: '빠르고 효율적인 AI 모델' },
    { id: 'chatgpt', name: 'OpenAI GPT-4', description: '높은 품질의 텍스트 생성' },
    { id: 'claude', name: 'Anthropic Claude', description: 'MCP 연동 지원' },
  ]

  // Load MCP tools
  useEffect(() => {
    const loadMCPTools = async () => {
      try {
        // Mock MCP tools - in reality, fetch from mcpManagementService.getActiveTools()
        setAvailableMCPTools([
          { id: '1', name: 'web_search', display_name: '웹 검색', icon: '🔍' },
          { id: '2', name: 'file_system', display_name: '파일 시스템', icon: '📁' },
          { id: '3', name: 'database', display_name: '데이터베이스', icon: '🗄️' },
          { id: '4', name: 'image_gen', display_name: '이미지 생성', icon: '🎨' },
        ])
      } catch (error) {
        console.error('Failed to load MCP tools:', error)
      }
    }
    loadMCPTools()
  }, [])

  useEffect(() => {
    if (params?.id) {
      const projectData = getProjectById(params.id as string)
      if (projectData) {
        setProject(projectData)
        // Load project settings if available
        const settings = (projectData as Project & { settings?: { aiModel?: string; mcpTools?: string[] } }).settings || {}
        setSelectedModel(settings.aiModel || 'gemini')
        setSelectedMCPTools(settings.mcpTools || [])
        // Set initial active tab based on project category
        const tabs = categoryTabs[projectData.category] || []
        if (tabs.length > 0) {
          setActiveTab(tabs[0].id)
        }
      } else {
        // Create a mock project if none exists (for demo purposes)
        const mockProject: Project = {
          id: params.id as string,
          name: 'E-커머스 플랫폼 개발',
          description: '차세대 온라인 쇼핑몰 플랫폼 구축 프로젝트',
          category: 'development',
          status: 'active',
          progress: 68,
          team: ['김개발자', '이기획자', '박디자이너'],
          deadline: '2024-11-30',
          avatar: '🚀',
          color: '#10B981',
          bgColor: '#ECFDF5',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setProject(mockProject)
        setActiveTab('analysis')
      }
    }
  }, [params?.id, getProjectById, router])

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">
          프로젝트를 불러오는 중...
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      completed:
        'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
      planning:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }
    const labels = {
      active: '진행 중',
      completed: '완료',
      planning: '계획 중',
      archived: '보관됨',
    }
    return {
      className: badges[status as keyof typeof badges] || badges.planning,
      label: labels[status as keyof typeof labels] || '계획 중',
    }
  }

  const statusBadge = getStatusBadge(project.status)
  const _tabs = categoryTabs[project.category] || []

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/projects')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {project.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="프로젝트 설정"
              >
                <CogIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <PencilIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 pb-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Proposal Category - Use ProposalWorkflow */}
          {project.category === 'proposal' && (
            <ProposalWorkflow
              projectId={project.id}
              projectTitle={project.name}
              projectCategory={project.category}
            />
          )}

          {/* Development Category - Use DevelopmentWorkflow */}
          {project.category === 'development' && (
            <DevelopmentWorkflow
              projectId={project.id}
              projectTitle={project.name}
              projectCategory={project.category}
            />
          )}

          {/* Operation Category - Use OperationWorkflow */}
          {project.category === 'operation' && (
            <OperationWorkflow
              projectId={project.id}
              projectTitle={project.name}
              projectCategory={project.category}
            />
          )}
        </motion.div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  프로젝트 설정
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* AI Model Selection */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  AI 모델 선택
                </h4>
                <div className="space-y-3">
                  {availableModels.map((model) => (
                    <label
                      key={model.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedModel === model.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="aiModel"
                        value={model.id}
                        checked={selectedModel === model.id}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="mr-4"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {model.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {model.description}
                        </div>
                      </div>
                      {selectedModel === model.id && (
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* MCP Tools Selection */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  MCP 도구 선택
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  관리자가 승인한 MCP 도구 중에서 선택하세요.
                </div>
                <div className="space-y-2">
                  {availableMCPTools.map((tool) => (
                    <label
                      key={tool.id}
                      className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMCPTools.includes(tool.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMCPTools([...selectedMCPTools, tool.id])
                          } else {
                            setSelectedMCPTools(selectedMCPTools.filter(id => id !== tool.id))
                          }
                        }}
                        className="mr-3"
                      />
                      <span className="text-xl mr-3">{tool.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {tool.display_name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {tool.name}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // TODO: Save settings to project
                  console.log('Saving settings:', {
                    aiModel: selectedModel,
                    mcpTools: selectedMCPTools,
                  })
                  setShowSettings(false)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                저장
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
