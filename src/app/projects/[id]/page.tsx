'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  SparklesIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  PencilIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  ChartBarSquareIcon,
  LightBulbIcon,
  UsersIcon,
  PlusIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  LinkIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  CommandLineIcon,
  TagIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import useProjectStore, { Project } from '@/lib/stores/projectStore'
import ProposalWorkflow from '@/components/proposal/ProposalWorkflow'

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
      icon: SparklesIcon,
      description: '프로젝트 통계 및 인사이트',
    },
  ],
  operation: [
    {
      id: 'requirements',
      label: '요건 관리',
      icon: ClipboardDocumentListIcon,
      description: '고객 요청사항 관리',
    },
    {
      id: 'tasks',
      label: '업무 분배',
      icon: WrenchScrewdriverIcon,
      description: '팀별 업무 할당 및 관리',
    },
    {
      id: 'schedule',
      label: '일정 관리',
      icon: ChartBarIcon,
      description: '프로젝트 일정 계획 및 추적',
    },
    {
      id: 'performance',
      label: '성과 관리',
      icon: SparklesIcon,
      description: 'KPI 모니터링 및 성과 분석',
    },
  ],
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { projects, fetchProjects } = useProjectStore()
  const [activeTab, setActiveTab] = useState('rfp')

  const projectId = params?.id as string
  const project = projects.find((p: Project) => p.id === projectId)

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects()
    }
  }, [projects.length, fetchProjects])

  useEffect(() => {
    if (project) {
      const tabs = categoryTabs[project.category] || []
      if (tabs.length > 0 && !tabs.find(tab => tab.id === activeTab)) {
        setActiveTab(tabs[0].id)
      }
    }
  }, [project, activeTab])

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            프로젝트를 불러오는 중...
          </p>
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
  const tabs = categoryTabs[project.category] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Left Sidebar - Settings */}
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-h-screen overflow-y-auto">
          {/* Settings Header with Project Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              설정
            </h2>

            {/* Project Basic Info directly in settings header area */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl">{project.avatar}</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {project.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  제안 진행
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>진행률</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* All other content in main body */}
          <div className="p-4 space-y-6">
            {/* Key Metrics */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                주요 지표
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ChartBarIcon className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      진행률
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.progress}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <CalendarIcon className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      마감일
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(project.deadline).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <UsersIcon className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      팀원
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.team?.length || 1}명
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ClockIcon className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      남은 기간
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.max(
                        0,
                        Math.ceil(
                          (new Date(project.deadline).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )}
                      일
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                빠른 실행
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center space-x-2 p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs transition-colors">
                  <PlusIcon className="w-3 h-3" />
                  <span>새 작업</span>
                </button>
                <button className="flex items-center space-x-2 p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs transition-colors">
                  <DocumentTextIcon className="w-3 h-3" />
                  <span>노트 추가</span>
                </button>
                <button className="flex items-center space-x-2 p-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs transition-colors">
                  <LinkIcon className="w-3 h-3" />
                  <span>공유</span>
                </button>
                <button className="flex items-center space-x-2 p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-xs transition-colors">
                  <BookmarkIcon className="w-3 h-3" />
                  <span>북마크</span>
                </button>
              </div>
            </div>

            {/* Workflow Navigation */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                워크플로우
              </h4>
              <div className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                최근 활동
              </h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-4 h-4 mt-0.5 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 dark:text-white font-medium truncate">
                      RFP 분석 완료
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      김개발자 • 2시간 전
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mt-0.5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 dark:text-white font-medium truncate">
                      제안서 초안에 댓글 추가
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      박기획자 • 4시간 전
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <DocumentTextIcon className="w-4 h-4 mt-0.5 text-purple-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 dark:text-white font-medium truncate">
                      시장조사 문서 업로드
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      이분석가 • 6시간 전
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 mt-0.5 text-yellow-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 dark:text-white font-medium truncate">
                      요구사항 분석 완료
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      1일 전
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Resources */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                관련 리소스
              </h4>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
                  <DocumentTextIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                    RFP 원본 문서
                  </span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
                  <ChartBarIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                    경쟁사 분석 자료
                  </span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
                  <CommandLineIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                    기술 스택 문서
                  </span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
                  <GlobeAltIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                    프로젝트 웹사이트
                  </span>
                </button>
              </div>
            </div>

            {/* Project Tags */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                프로젝트 태그
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <TagIcon className="w-3 h-3 mr-1" />
                  웹개발
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <TagIcon className="w-3 h-3 mr-1" />
                  리뉴얼
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <TagIcon className="w-3 h-3 mr-1" />
                  제안
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen">
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
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <PencilIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
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

              {/* Development and Operation Categories - Placeholder content */}
              {project.category !== 'proposal' &&
                tabs.find(tab => tab.id === activeTab) && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      {React.createElement(
                        tabs.find(tab => tab.id === activeTab)!.icon,
                        {
                          className: 'w-8 h-8 text-gray-500 dark:text-gray-400',
                        }
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {tabs.find(tab => tab.id === activeTab)?.label}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {tabs.find(tab => tab.id === activeTab)?.description}
                    </p>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all">
                      시작하기
                    </button>
                  </div>
                )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
