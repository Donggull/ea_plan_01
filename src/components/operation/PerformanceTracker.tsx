'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartPieIcon,
  CalendarIcon,
  CogIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  BellIcon,
  StarIcon,
  TrophyIcon,
  EyeIcon,
  FaceSmileIcon,
  BugAntIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

interface KPIMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
  category: 'quality' | 'performance' | 'business' | 'team'
  description: string
  lastUpdated: string
  isAlert: boolean
  alertThreshold: number
  icon: React.ComponentType<{ className?: string }>
}

interface TeamPerformance {
  teamId: string
  teamName: string
  metrics: {
    productivity: number
    quality: number
    velocity: number
    satisfaction: number
  }
  completedTasks: number
  totalTasks: number
  averageTaskTime: number
  memberCount: number
  topPerformers: string[]
  improvementAreas: string[]
}

interface ProjectHealth {
  projectId: string
  projectName: string
  healthScore: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  riskFactors: {
    schedule: 'low' | 'medium' | 'high'
    budget: 'low' | 'medium' | 'high'
    quality: 'low' | 'medium' | 'high'
    resources: 'low' | 'medium' | 'high'
  }
  milestones: {
    completed: number
    total: number
    onTime: number
    delayed: number
  }
  qualityMetrics: {
    bugCount: number
    testCoverage: number
    codeQuality: number
    customerSatisfaction: number
  }
}

interface PerformanceAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  metric: string
  threshold: number
  currentValue: number
  suggestedAction: string
  createdAt: string
  isAcknowledged: boolean
}

// Mock data
const mockKPIs: KPIMetric[] = [
  {
    id: 'kpi-001',
    name: 'Task Completion Rate',
    value: 87.5,
    target: 90,
    unit: '%',
    trend: 'up',
    changePercent: 5.2,
    category: 'performance',
    description: '완료된 작업의 비율',
    lastUpdated: '2025-01-12T10:00:00Z',
    isAlert: false,
    alertThreshold: 80,
    icon: CheckCircleIcon,
  },
  {
    id: 'kpi-002',
    name: 'Average Response Time',
    value: 2.3,
    target: 2.0,
    unit: 'hours',
    trend: 'down',
    changePercent: -12.5,
    category: 'performance',
    description: '고객 요청 응답 시간',
    lastUpdated: '2025-01-12T09:30:00Z',
    isAlert: true,
    alertThreshold: 3.0,
    icon: ClockIcon,
  },
  {
    id: 'kpi-003',
    name: 'Customer Satisfaction',
    value: 4.2,
    target: 4.5,
    unit: '/5.0',
    trend: 'stable',
    changePercent: 0,
    category: 'business',
    description: '고객 만족도 평가',
    lastUpdated: '2025-01-12T08:00:00Z',
    isAlert: false,
    alertThreshold: 3.5,
    icon: FaceSmileIcon,
  },
  {
    id: 'kpi-004',
    name: 'Bug Resolution Rate',
    value: 92,
    target: 95,
    unit: '%',
    trend: 'up',
    changePercent: 8.2,
    category: 'quality',
    description: '버그 해결률',
    lastUpdated: '2025-01-12T11:15:00Z',
    isAlert: false,
    alertThreshold: 85,
    icon: BugAntIcon,
  },
  {
    id: 'kpi-005',
    name: 'Team Velocity',
    value: 45,
    target: 50,
    unit: 'points',
    trend: 'up',
    changePercent: 12.5,
    category: 'team',
    description: '스프린트당 완료 포인트',
    lastUpdated: '2025-01-12T12:00:00Z',
    isAlert: false,
    alertThreshold: 35,
    icon: ArrowTrendingUpIcon,
  },
  {
    id: 'kpi-006',
    name: 'Code Coverage',
    value: 78,
    target: 85,
    unit: '%',
    trend: 'down',
    changePercent: -3.2,
    category: 'quality',
    description: '테스트 코드 커버리지',
    lastUpdated: '2025-01-12T13:30:00Z',
    isAlert: true,
    alertThreshold: 70,
    icon: ChartBarIcon,
  },
  {
    id: 'kpi-007',
    name: 'Revenue Impact',
    value: 125000,
    target: 150000,
    unit: 'USD',
    trend: 'up',
    changePercent: 15.8,
    category: 'business',
    description: '매출 기여도',
    lastUpdated: '2025-01-12T14:00:00Z',
    isAlert: false,
    alertThreshold: 100000,
    icon: CurrencyDollarIcon,
  },
  {
    id: 'kpi-008',
    name: 'User Engagement',
    value: 68,
    target: 75,
    unit: '%',
    trend: 'stable',
    changePercent: 1.2,
    category: 'business',
    description: '사용자 참여율',
    lastUpdated: '2025-01-12T15:00:00Z',
    isAlert: false,
    alertThreshold: 50,
    icon: EyeIcon,
  },
]

const mockTeamPerformance: TeamPerformance[] = [
  {
    teamId: 'team-001',
    teamName: '프론트엔드팀',
    metrics: {
      productivity: 85,
      quality: 92,
      velocity: 48,
      satisfaction: 4.3,
    },
    completedTasks: 34,
    totalTasks: 40,
    averageTaskTime: 5.2,
    memberCount: 4,
    topPerformers: ['김프론트', '이리액트'],
    improvementAreas: ['코드 리뷰 시간 단축', '테스트 커버리지 향상'],
  },
  {
    teamId: 'team-002',
    teamName: '백엔드팀',
    metrics: {
      productivity: 78,
      quality: 88,
      velocity: 42,
      satisfaction: 4.1,
    },
    completedTasks: 28,
    totalTasks: 36,
    averageTaskTime: 6.8,
    memberCount: 3,
    topPerformers: ['박백엔드', '최DB'],
    improvementAreas: ['API 문서화 개선', '성능 최적화'],
  },
  {
    teamId: 'team-003',
    teamName: '디자인팀',
    metrics: {
      productivity: 82,
      quality: 95,
      velocity: 32,
      satisfaction: 4.5,
    },
    completedTasks: 22,
    totalTasks: 25,
    averageTaskTime: 4.1,
    memberCount: 2,
    topPerformers: ['정디자인'],
    improvementAreas: ['디자인 시스템 구축', '프로토타입 도구 통합'],
  },
]

const mockProjectHealth: ProjectHealth[] = [
  {
    projectId: 'proj-001',
    projectName: 'E-commerce 플랫폼',
    healthScore: 85,
    status: 'good',
    riskFactors: {
      schedule: 'low',
      budget: 'medium',
      quality: 'low',
      resources: 'low',
    },
    milestones: {
      completed: 8,
      total: 12,
      onTime: 7,
      delayed: 1,
    },
    qualityMetrics: {
      bugCount: 15,
      testCoverage: 78,
      codeQuality: 8.2,
      customerSatisfaction: 4.3,
    },
  },
  {
    projectId: 'proj-002',
    projectName: 'CRM 시스템',
    healthScore: 72,
    status: 'warning',
    riskFactors: {
      schedule: 'high',
      budget: 'medium',
      quality: 'medium',
      resources: 'high',
    },
    milestones: {
      completed: 5,
      total: 10,
      onTime: 3,
      delayed: 2,
    },
    qualityMetrics: {
      bugCount: 28,
      testCoverage: 65,
      codeQuality: 7.1,
      customerSatisfaction: 3.8,
    },
  },
]

const mockAlerts: PerformanceAlert[] = [
  {
    id: 'alert-001',
    type: 'warning',
    title: 'Code Coverage Below Target',
    description: '코드 커버리지가 목표치 85% 대비 78%로 하락했습니다',
    metric: 'Code Coverage',
    threshold: 85,
    currentValue: 78,
    suggestedAction:
      '단위 테스트 작성을 우선순위로 설정하고 팀 교육을 진행하세요',
    createdAt: '2025-01-12T13:30:00Z',
    isAcknowledged: false,
  },
  {
    id: 'alert-002',
    type: 'critical',
    title: 'Response Time Exceeded',
    description:
      '평균 응답 시간이 목표 2시간을 초과하여 2.3시간을 기록했습니다',
    metric: 'Average Response Time',
    threshold: 2.0,
    currentValue: 2.3,
    suggestedAction:
      '고객 지원팀의 리소스를 추가 배정하고 자동화 도구 도입을 검토하세요',
    createdAt: '2025-01-12T09:30:00Z',
    isAcknowledged: false,
  },
]

export default function PerformanceTracker({
  projectId,
}: {
  projectId: string
}) {
  const [kpis, setKPIs] = useState<KPIMetric[]>(mockKPIs)
  const [teamPerformance, setTeamPerformance] =
    useState<TeamPerformance[]>(mockTeamPerformance)
  const [projectHealth, setProjectHealth] =
    useState<ProjectHealth[]>(mockProjectHealth)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>(mockAlerts)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<
    'overview' | 'teams' | 'projects' | 'alerts'
  >('overview')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Get trend icon and color
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quality':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
      case 'performance':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      case 'business':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
      case 'team':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  // Get health status color
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      case 'good':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Get alert type color
  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      case 'info':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    }
  }

  // Filter KPIs by category
  const filteredKPIs =
    selectedCategory === 'all'
      ? kpis
      : kpis.filter(kpi => kpi.category === selectedCategory)

  // Acknowledge alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, isAcknowledged: true } : alert
      )
    )
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'quality', 'performance', 'business', 'team'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category === 'all'
              ? 'All Metrics'
              : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredKPIs.map(kpi => {
          const IconComponent = kpi.icon
          const progressPercent = Math.min((kpi.value / kpi.target) * 100, 100)

          return (
            <motion.div
              key={kpi.id}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-lg border-2 transition-all ${
                kpi.isAlert
                  ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${getCategoryColor(kpi.category)}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {kpi.isAlert && (
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(kpi.trend)}
                  <span
                    className={`text-xs font-medium ${
                      kpi.trend === 'up'
                        ? 'text-green-600 dark:text-green-400'
                        : kpi.trend === 'down'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {kpi.changePercent > 0 ? '+' : ''}
                    {kpi.changePercent}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {kpi.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {kpi.unit === 'USD' ? '$' : ''}
                    {kpi.value.toLocaleString()}
                    {kpi.unit !== 'USD' ? kpi.unit : ''}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    / {kpi.unit === 'USD' ? '$' : ''}
                    {kpi.target.toLocaleString()}
                    {kpi.unit !== 'USD' ? kpi.unit : ''}
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className={`h-2 rounded-full ${
                      progressPercent >= 90
                        ? 'bg-green-500'
                        : progressPercent >= 70
                          ? 'bg-blue-500'
                          : progressPercent >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                    }`}
                  />
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {kpi.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  const renderTeamsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {teamPerformance.map(team => (
        <motion.div
          key={team.teamId}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {team.teamName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {team.memberCount} members • {team.completedTasks}/
                {team.totalTasks} tasks
              </p>
            </div>
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {team.metrics.satisfaction}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4 mb-6">
            {Object.entries(team.metrics).map(([metric, value]) => (
              <div key={metric}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {metric}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metric === 'satisfaction'
                      ? `${value}/5.0`
                      : `${value}${metric === 'velocity' ? ' pts' : '%'}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${metric === 'satisfaction' ? (value / 5) * 100 : value}%`,
                    }}
                    className={`h-2 rounded-full ${
                      (metric === 'satisfaction' ? (value / 5) * 100 : value) >=
                      80
                        ? 'bg-green-500'
                        : (metric === 'satisfaction'
                              ? (value / 5) * 100
                              : value) >= 60
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Top Performers */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Top Performers
            </h4>
            <div className="flex flex-wrap gap-2">
              {team.topPerformers.map((performer, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full text-xs"
                >
                  <TrophyIcon className="w-3 h-3" />
                  {performer}
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Areas */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Improvement Areas
            </h4>
            <div className="space-y-1">
              {team.improvementAreas.map((area, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"
                >
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  {area}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderProjectsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {projectHealth.map(project => (
        <motion.div
          key={project.projectId}
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {project.projectName}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(project.status)}`}
                >
                  {project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Health Score: {project.healthScore}/100
                </span>
              </div>
            </div>
            <ChartPieIcon className="w-6 h-6 text-gray-400" />
          </div>

          {/* Health Score Progress */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.healthScore}%` }}
                className={`h-3 rounded-full ${
                  project.healthScore >= 80
                    ? 'bg-green-500'
                    : project.healthScore >= 60
                      ? 'bg-blue-500'
                      : project.healthScore >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Risk Factors */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Risk Factors
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(project.riskFactors).map(([factor, level]) => (
                <div key={factor} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {factor}
                  </span>
                  <span
                    className={`text-sm font-medium ${getRiskColor(level)}`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Milestones Progress
            </h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {project.milestones.completed}/{project.milestones.total}{' '}
                completed
              </span>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600 dark:text-green-400">
                  {project.milestones.onTime} on time
                </span>
                <span className="text-red-600 dark:text-red-400">
                  {project.milestones.delayed} delayed
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(project.milestones.completed / project.milestones.total) * 100}%`,
                }}
                className="bg-blue-500 h-2 rounded-full"
              />
            </div>
          </div>

          {/* Quality Metrics */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Quality Metrics
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Bug Count:
                </span>
                <span
                  className={`ml-2 font-medium ${
                    project.qualityMetrics.bugCount <= 10
                      ? 'text-green-600 dark:text-green-400'
                      : project.qualityMetrics.bugCount <= 25
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {project.qualityMetrics.bugCount}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Test Coverage:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {project.qualityMetrics.testCoverage}%
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Code Quality:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {project.qualityMetrics.codeQuality}/10
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Customer Sat:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {project.qualityMetrics.customerSatisfaction}/5.0
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderAlertsTab = () => (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No active alerts</p>
        </div>
      ) : (
        alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${getAlertTypeColor(alert.type)} ${
              alert.isAcknowledged ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BellIcon className="w-5 h-5" />
                  <h3 className="font-semibold">{alert.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/20">
                    {alert.type}
                  </span>
                </div>
                <p className="mb-3">{alert.description}</p>
                <div className="bg-white/10 rounded-lg p-3 mb-3">
                  <p className="text-sm">
                    <strong>Suggested Action:</strong> {alert.suggestedAction}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span>Metric: {alert.metric}</span>
                  <span>Threshold: {alert.threshold}</span>
                  <span>Current: {alert.currentValue}</span>
                  <span>
                    Created: {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {!alert.isAcknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            성과 관리
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            KPI 대시보드 및 성과 분석
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: ChartBarIcon },
            { key: 'teams', label: 'Teams', icon: UserGroupIcon },
            { key: 'projects', label: 'Projects', icon: ChartPieIcon },
            {
              key: 'alerts',
              label: 'Alerts',
              icon: BellIcon,
              count: alerts.filter(a => !a.isAcknowledged).length,
            },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() =>
                setViewMode(
                  tab.key as 'overview' | 'teams' | 'projects' | 'alerts'
                )
              }
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm relative ${
                viewMode === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.count && tab.count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'overview' && renderOverviewTab()}
          {viewMode === 'teams' && renderTeamsTab()}
          {viewMode === 'projects' && renderProjectsTab()}
          {viewMode === 'alerts' && renderAlertsTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
