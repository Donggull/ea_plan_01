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
} from '@heroicons/react/24/outline'
import useProjectStore, { Project } from '@/lib/stores/projectStore'
import ProposalWorkflow from '@/components/proposal/ProposalWorkflow'
import DevelopmentWorkflow from '@/components/development/DevelopmentWorkflow'
import OperationWorkflow from '@/components/operation/OperationWorkflow'

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

  useEffect(() => {
    if (params?.id) {
      const projectData = getProjectById(params.id as string)
      if (projectData) {
        setProject(projectData)
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
    </div>
  )
}
