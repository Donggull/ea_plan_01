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
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  ChartBarSquareIcon,
  LightBulbIcon,
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
      icon: ChartBarSquareIcon,
      description: '프로젝트 대시보드 및 진행 분석',
    },
  ],
  operation: [
    {
      id: 'requests',
      label: '요건 관리',
      icon: ClipboardDocumentListIcon,
      description: '고객 요청사항 접수 및 관리',
    },
    {
      id: 'planning',
      label: '기획',
      icon: LightBulbIcon,
      description: '요구사항 분석 및 기능 정의',
    },
    {
      id: 'design',
      label: '디자인',
      icon: ComputerDesktopIcon,
      description: 'UI/UX 설계 및 프로토타입',
    },
    {
      id: 'publishing',
      label: '퍼블리싱',
      icon: DocumentTextIcon,
      description: '마크업 및 스타일링 작업',
    },
    {
      id: 'development',
      label: '개발',
      icon: WrenchScrewdriverIcon,
      description: '백엔드/프론트엔드 개발',
    },
    {
      id: 'schedule',
      label: '일정 관리',
      icon: CalendarIcon,
      description: '스프린트 계획 및 태스크 관리',
    },
    {
      id: 'performance',
      label: '성과 관리',
      icon: ChartBarSquareIcon,
      description: 'KPI 모니터링 및 개선 계획',
    },
  ],
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string

  const { projects, setSelectedProject } = useProjectStore()
  const [activeTab, setActiveTab] = useState('')
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    if (projectId) {
      const foundProject = projects.find(p => p.id === projectId)
      if (foundProject) {
        setProject(foundProject)
        setSelectedProject(foundProject)
        // Set first tab as active
        const tabs = categoryTabs[foundProject.category]
        if (tabs && tabs.length > 0) {
          setActiveTab(tabs[0].id)
        }
      }
    }
  }, [projectId, projects, setSelectedProject])

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            프로젝트를 찾을 수 없습니다
          </h3>
          <button
            onClick={() => router.push('/projects')}
            className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            프로젝트 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      proposal: SparklesIcon,
      development: ChartBarIcon,
      operation: CogIcon,
    }
    return icons[category as keyof typeof icons] || SparklesIcon
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

  const CategoryIcon = getCategoryIcon(project.category)
  const statusBadge = getStatusBadge(project.status)
  const tabs = categoryTabs[project.category] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div
        className={`${project.bgColor} backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/projects')}
                className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="text-3xl">{project.avatar}</div>
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${project.color} rounded-xl flex items-center justify-center`}
                >
                  <CategoryIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {project.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
              <button className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors">
                <PencilIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  진행률
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.progress}%
                </p>
              </div>
              <ChartPieIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${project.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  마감일
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {new Date(project.deadline).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <CalendarIcon className="w-8 h-8 text-gray-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  팀 멤버
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.team.length}명
                </p>
              </div>
              <UsersIcon className="w-8 h-8 text-gray-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  남은 기간
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
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
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'text-slate-600 dark:text-slate-400 border-slate-600 dark:border-slate-400'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-8"
        >
          {/* Proposal Category - Use ProposalWorkflow */}
          {project.category === 'proposal' && (
            <ProposalWorkflow
              projectId={project.id}
              projectTitle={project.name}
              projectCategory={project.category}
            />
          )}

          {/* Development and Operation Categories - Keep existing layout for now */}
          {project.category !== 'proposal' && tabs.find(tab => tab.id === activeTab) && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {tabs.find(tab => tab.id === activeTab)?.label}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {tabs.find(tab => tab.id === activeTab)?.description}
                  </p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                  <PlusIcon className="w-4 h-4" />
                  <span>추가</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {tabs.find(tab => tab.id === activeTab) &&
                    React.createElement(
                      tabs.find(tab => tab.id === activeTab)!.icon,
                      {
                        className: 'w-8 h-8 text-gray-500 dark:text-gray-400',
                      }
                    )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  콘텐츠가 없습니다
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  이 섹션에 대한 콘텐츠를 추가하여 시작하세요
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:shadow-lg transition-all">
                  첫 번째 항목 추가
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            팀 멤버
          </h3>
          <div className="flex flex-wrap gap-3">
            {project.team.map((member, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${project.color} flex items-center justify-center text-sm font-medium text-white`}
                >
                  {member.charAt(0)}
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  {member}
                </span>
              </div>
            ))}
            <button className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <PlusIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">멤버 추가</span>
            </button>
          </div>
        </motion.div>

        {/* Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              문서 관리
            </h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>문서 업로드</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              아직 업로드된 문서가 없습니다
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              문서를 드래그하여 업로드하거나 버튼을 클릭하세요
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
