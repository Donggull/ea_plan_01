'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarSquareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  BugAntIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartPieIcon,
  EyeIcon,
  ArrowRightIcon,
  CogIcon,
  BeakerIcon,
  FlagIcon,
} from '@heroicons/react/24/outline'

interface ProjectMetrics {
  overview: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    blockedTasks: number
    overallProgress: number
    onTimeDelivery: number
    budgetUtilization: number
    teamEfficiency: number
  }
  timeline: {
    startDate: string
    endDate: string
    currentPhase: string
    nextMilestone: string
    daysRemaining: number
    isOnTrack: boolean
  }
  quality: {
    testCoverage: number
    passRate: number
    openBugs: number
    criticalBugs: number
    codeQuality: number
    automationRate: number
  }
  team: {
    totalMembers: number
    activeMembers: number
    workload: { name: string; utilization: number; tasks: number }[]
    productivity: number
  }
  risks: {
    id: string
    title: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    probability: number
    impact: string
    mitigation: string
    status: 'identified' | 'mitigated' | 'resolved'
  }[]
}

interface ProjectDashboardProps {
  projectId: string
}

export default function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [showRiskDetails, setShowRiskDetails] = useState<string | null>(null)

  const [metrics] = useState<ProjectMetrics>({
    overview: {
      totalTasks: 47,
      completedTasks: 28,
      inProgressTasks: 12,
      blockedTasks: 2,
      overallProgress: 68,
      onTimeDelivery: 85,
      budgetUtilization: 72,
      teamEfficiency: 92
    },
    timeline: {
      startDate: '2024-08-01',
      endDate: '2024-11-30',
      currentPhase: '개발 단계',
      nextMilestone: 'Alpha 릴리즈',
      daysRemaining: 45,
      isOnTrack: true
    },
    quality: {
      testCoverage: 78,
      passRate: 94,
      openBugs: 8,
      criticalBugs: 2,
      codeQuality: 87,
      automationRate: 65
    },
    team: {
      totalMembers: 8,
      activeMembers: 7,
      workload: [
        { name: '김개발자', utilization: 95, tasks: 8 },
        { name: '이기획자', utilization: 80, tasks: 6 },
        { name: '박디자이너', utilization: 75, tasks: 5 },
        { name: '최프론트', utilization: 88, tasks: 7 },
        { name: '정백엔드', utilization: 92, tasks: 9 },
        { name: '윤테스터', utilization: 70, tasks: 4 },
        { name: '장DevOps', utilization: 60, tasks: 3 }
      ],
      productivity: 89
    },
    risks: [
      {
        id: '1',
        title: '핵심 개발자 부재 위험',
        severity: 'high',
        probability: 30,
        impact: '프로젝트 일정 지연 (2-3주)',
        mitigation: '지식 공유 세션 및 백업 개발자 지정',
        status: 'mitigated'
      },
      {
        id: '2',
        title: '외부 API 의존성 위험',
        severity: 'medium',
        probability: 50,
        impact: '기능 구현 제한 및 성능 저하',
        mitigation: '대안 API 조사 및 캐싱 전략 수립',
        status: 'identified'
      },
      {
        id: '3',
        title: '데이터베이스 성능 이슈',
        severity: 'critical',
        probability: 25,
        impact: '서비스 중단 및 사용자 이탈',
        mitigation: '쿼리 최적화 및 인덱스 재설계',
        status: 'resolved'
      }
    ]
  })

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600'
    if (progress >= 70) return 'text-blue-600'
    if (progress >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressBarColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500'
    if (progress >= 70) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800'
    }
  }

  const getRiskStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600'
      case 'mitigated': return 'text-blue-600'
      case 'identified': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 95) return 'text-red-600 bg-red-50 dark:bg-red-900/20'
    if (utilization >= 80) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    if (utilization >= 60) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          종합 인사이트
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          프로젝트의 전반적인 현황과 주요 지표를 한눈에 확인하세요
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기간:</span>
          <div className="flex items-center space-x-1">
            {[
              { value: '7d', label: '7일' },
              { value: '30d', label: '30일' },
              { value: '90d', label: '90일' },
              { value: 'all', label: '전체' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedTimeRange(option.value as any)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedTimeRange === option.value
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          마지막 업데이트: {new Date().toLocaleDateString('ko-KR')} {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ChartBarSquareIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">전체 진행률</p>
                <p className={`text-2xl font-bold ${getProgressColor(metrics.overview.overallProgress)}`}>
                  {metrics.overview.overallProgress}%
                </p>
              </div>
            </div>
            {metrics.overview.overallProgress >= 70 ? (
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(metrics.overview.overallProgress)}`}
              style={{ width: `${metrics.overview.overallProgress}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">완료된 작업</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.overview.completedTasks}/{metrics.overview.totalTasks}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">진행 중: {metrics.overview.inProgressTasks}</p>
              <p className="text-xs text-red-600">블록됨: {metrics.overview.blockedTasks}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BeakerIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">품질 지표</p>
                <p className={`text-2xl font-bold ${getProgressColor(metrics.quality.passRate)}`}>
                  {metrics.quality.passRate}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">커버리지: {metrics.quality.testCoverage}%</p>
              <p className="text-xs text-red-600">버그: {metrics.quality.openBugs}개</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">일정 준수</p>
                <p className={`text-2xl font-bold ${getProgressColor(metrics.overview.onTimeDelivery)}`}>
                  {metrics.overview.onTimeDelivery}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">D-{metrics.timeline.daysRemaining}</p>
              <p className={`text-xs ${metrics.timeline.isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.timeline.isOnTrack ? '정상 진행' : '지연 위험'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline & Milestones */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">타임라인</h3>
            <CalendarIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">프로젝트 기간</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {metrics.timeline.startDate} ~ {metrics.timeline.endDate}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">현재 단계</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {metrics.timeline.currentPhase}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">다음 마일스톤</span>
              <div className="flex items-center space-x-2">
                <FlagIcon className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {metrics.timeline.nextMilestone}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">남은 기간</span>
                <span className={`text-sm font-bold ${metrics.timeline.daysRemaining <= 30 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {metrics.timeline.daysRemaining}일
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    metrics.timeline.isOnTrack ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((120 - metrics.timeline.daysRemaining) / 120 * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Workload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">팀 워크로드</h3>
            <UserGroupIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {metrics.team.workload.map((member) => (
              <div key={member.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {member.tasks}개
                    </span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full text-xs ${getUtilizationColor(member.utilization)}`}>
                      {member.utilization}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      member.utilization >= 95 ? 'bg-red-500' :
                      member.utilization >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(member.utilization, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">팀 생산성</span>
                <span className={`text-sm font-bold ${getProgressColor(metrics.team.productivity)}`}>
                  {metrics.team.productivity}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quality Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">품질 현황</h3>
            <ChartPieIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{metrics.quality.testCoverage}%</div>
                <div className="text-xs text-green-600">테스트 커버리지</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{metrics.quality.passRate}%</div>
                <div className="text-xs text-blue-600">통과율</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{metrics.quality.openBugs}</div>
                <div className="text-xs text-red-600">열린 버그</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{metrics.quality.automationRate}%</div>
                <div className="text-xs text-purple-600">자동화율</div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">코드 품질</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-bold ${getProgressColor(metrics.quality.codeQuality)}`}>
                    {metrics.quality.codeQuality}%
                  </span>
                  <CodeBracketIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {metrics.quality.criticalBugs > 0 && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-600">
                    {metrics.quality.criticalBugs}개의 심각한 버그가 있습니다
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Risk Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">리스크 관리</h3>
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {metrics.risks.filter(r => r.status === 'identified').length}개 리스크 식별됨
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {metrics.risks.map((risk) => (
            <div
              key={risk.id}
              className={`border rounded-lg p-4 ${getRiskSeverityColor(risk.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium">{risk.title}</h4>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                      {risk.severity === 'critical' ? '치명적' :
                       risk.severity === 'high' ? '높음' :
                       risk.severity === 'medium' ? '보통' : '낮음'}
                    </span>
                    <span className={`text-xs font-medium ${getRiskStatusColor(risk.status)}`}>
                      {risk.status === 'resolved' ? '해결됨' :
                       risk.status === 'mitigated' ? '완화됨' : '식별됨'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">발생 가능성:</span>
                      <span className="ml-2">{risk.probability}%</span>
                    </div>
                    <div>
                      <span className="font-medium">영향:</span>
                      <span className="ml-2">{risk.impact}</span>
                    </div>
                  </div>
                  
                  {showRiskDetails === risk.id && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                      <div>
                        <span className="font-medium text-sm">완화 방안:</span>
                        <p className="mt-1 text-sm opacity-90">{risk.mitigation}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowRiskDetails(showRiskDetails === risk.id ? null : risk.id)}
                  className="ml-4 p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
                  <div
                    className="h-1.5 bg-white bg-opacity-60 rounded-full transition-all duration-500"
                    style={{ width: `${risk.probability}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">빠른 작업</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <BugAntIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">버그 리포트</span>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">문서 생성</span>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <CogIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">설정 변경</span>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <ChartBarSquareIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">상세 분석</span>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}