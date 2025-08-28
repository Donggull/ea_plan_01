'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CogIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import RequirementTracker from './RequirementTracker'
import TaskDistribution from './TaskDistribution'
import ScheduleManager from './ScheduleManager'
import PerformanceTracker from './PerformanceTracker'
import CommunicationHub from './CommunicationHub'
import OperationReport from './OperationReport'

interface OperationWorkflowProps {
  projectId: string
  projectTitle: string
  projectCategory: string
  selectedAiModel?: string
  selectedModelConfig?: string
  selectedMCPTools?: string[]
}

const operationSteps = [
  {
    id: 'requirements',
    label: '요건 관리',
    icon: ClipboardDocumentListIcon,
    description: '고객 요청 접수 및 분류',
    color: 'blue',
    component: RequirementTracker,
  },
  {
    id: 'distribution',
    label: '업무 분배',
    icon: UserGroupIcon,
    description: '팀별 작업 할당 및 관리',
    color: 'green',
    component: TaskDistribution,
  },
  {
    id: 'schedule',
    label: '일정 관리',
    icon: CalendarIcon,
    description: '스프린트 계획 및 일정 추적',
    color: 'purple',
    component: ScheduleManager,
  },
  {
    id: 'performance',
    label: '성과 관리',
    icon: ChartBarIcon,
    description: 'KPI 모니터링 및 분석',
    color: 'yellow',
    component: PerformanceTracker,
  },
  {
    id: 'communication',
    label: '소통 허브',
    icon: ChatBubbleLeftRightIcon,
    description: '팀 커뮤니케이션 및 협업',
    color: 'indigo',
    component: CommunicationHub,
  },
  {
    id: 'reports',
    label: '운영 리포트',
    icon: DocumentTextIcon,
    description: '주간/월간 리포트 생성',
    color: 'red',
    component: OperationReport,
  },
]

// Mock data for overview stats
const mockOverviewStats = {
  activeRequirements: 24,
  pendingTasks: 38,
  upcomingDeadlines: 7,
  teamUtilization: 82,
  avgResponseTime: 2.3,
  completionRate: 87.5,
  qualityScore: 4.2,
  activeProjects: 5,
}

const mockRecentActivity = [
  {
    id: 'act-001',
    type: 'requirement',
    title: '새로운 기능 요청이 접수되었습니다',
    description: 'E-commerce 플랫폼 결제 시스템 개선',
    time: '5분 전',
    priority: 'high',
    assignee: '김기획',
  },
  {
    id: 'act-002',
    type: 'task',
    title: '백엔드 API 개발 작업이 완료되었습니다',
    description: '사용자 인증 API 구현',
    time: '15분 전',
    priority: 'medium',
    assignee: '박백엔드',
  },
  {
    id: 'act-003',
    type: 'alert',
    title: '일정 지연 경고',
    description: 'CRM 프로젝트 마일스톤 2가 지연되고 있습니다',
    time: '30분 전',
    priority: 'high',
    assignee: '최PM',
  },
  {
    id: 'act-004',
    type: 'communication',
    title: '팀 미팅이 예약되었습니다',
    description: '주간 스프린트 리뷰 미팅',
    time: '1시간 전',
    priority: 'low',
    assignee: '전체팀',
  },
]

const mockUpcomingTasks = [
  {
    id: 'task-001',
    title: 'UI/UX 디자인 리뷰',
    dueDate: '2025-01-13',
    priority: 'high',
    assignee: '이디자인',
    progress: 75,
  },
  {
    id: 'task-002',
    title: 'API 문서화',
    dueDate: '2025-01-14',
    priority: 'medium',
    assignee: '박백엔드',
    progress: 40,
  },
  {
    id: 'task-003',
    title: '통합 테스트',
    dueDate: '2025-01-15',
    priority: 'high',
    assignee: '김QA',
    progress: 20,
  },
  {
    id: 'task-004',
    title: '배포 준비',
    dueDate: '2025-01-16',
    priority: 'medium',
    assignee: '최DevOps',
    progress: 0,
  },
]

export default function OperationWorkflow({
  projectId,
  projectTitle,
  projectCategory,
}: OperationWorkflowProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null)

  const getStepColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'requirement':
        return <ClipboardDocumentListIcon className="w-4 h-4" />
      case 'task':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'alert':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'communication':
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />
      default:
        return <BellIcon className="w-4 h-4" />
    }
  }

  const renderActiveComponent = () => {
    if (!activeStep) return null

    const step = operationSteps.find(s => s.id === activeStep)
    if (!step) return null

    const ActiveComponent = step.component
    return <ActiveComponent projectId={projectId} />
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Requirements
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockOverviewStats.activeRequirements}
              </p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            +3 new this week
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pending Tasks
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockOverviewStats.pendingTasks}
              </p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            -5 from yesterday
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upcoming Deadlines
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockOverviewStats.upcomingDeadlines}
              </p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Next 7 days
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Team Utilization
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockOverviewStats.teamUtilization}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${mockOverviewStats.teamUtilization}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Avg Response Time
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {mockOverviewStats.avgResponseTime}h
            </p>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              -15% from last week
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Completion Rate
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {mockOverviewStats.completionRate}%
            </p>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              +5% from last week
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quality Score
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {mockOverviewStats.qualityScore}/5.0
            </p>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              -0.1 from last week
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active Projects
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {mockOverviewStats.activeProjects}
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              +1 new project
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {mockRecentActivity.map(activity => (
              <div
                key={activity.id}
                className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div
                  className={`p-2 rounded-lg ${getPriorityColor(activity.priority)}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{activity.time}</span>
                    <span>•</span>
                    <span>{activity.assignee}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(activity.priority)}`}
                >
                  {activity.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Tasks
            </h3>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Manage Tasks
            </button>
          </div>

          <div className="space-y-4">
            {mockUpcomingTasks.map(task => (
              <div
                key={task.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span>Assigned to: {task.assignee}</span>
                  <span>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        task.progress >= 80
                          ? 'bg-green-500'
                          : task.progress >= 50
                            ? 'bg-blue-500'
                            : task.progress >= 25
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                    {task.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          운영 관리 워크플로우
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {projectTitle} - 서비스 운영 단계의 체계적 관리
        </p>
      </div>

      {/* Step Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {operationSteps.map((step, index) => {
            const IconComponent = step.icon

            return (
              <button
                key={step.id}
                onClick={() =>
                  setActiveStep(activeStep === step.id ? null : step.id)
                }
                className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  activeStep === step.id
                    ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                    : ''
                } ${getStepColor(step.color)}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-xs font-medium mb-1">{step.label}</h3>
                    <p className="text-xs opacity-75 leading-tight">
                      {step.description}
                    </p>
                  </div>

                  <div
                    className={`w-6 h-1 rounded-full ${
                      activeStep === step.id
                        ? 'bg-current'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                </div>

                {/* Step number */}
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-current rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveStep(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeStep === null
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Overview Dashboard
            </button>
            <button className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
              Quick Actions
            </button>
            <button className="px-4 py-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Active Component */}
      <motion.div
        key={activeStep || 'overview'}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        {activeStep ? renderActiveComponent() : renderOverview()}
      </motion.div>
    </div>
  )
}
