'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BookmarkIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  LinkIcon,
  FolderIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  CommandLineIcon,
  BugAntIcon,
} from '@heroicons/react/24/outline'
import type { Project } from '@/lib/stores/projectStore'

interface ProjectSidebarProps {
  project: Project
  activeTab: string
  onTabChange: (tabId: string) => void
  tabs: Array<{ id: string; label: string; icon: React.ComponentType<any> }>
}

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  color: string
  onClick: () => void
}

interface RecentActivity {
  id: string
  type: 'update' | 'comment' | 'file' | 'milestone'
  title: string
  time: string
  user?: string
}

interface ProjectMetric {
  label: string
  value: string | number
  icon: React.ComponentType<any>
  color: string
}

export default function ProjectSidebar({ project, activeTab, onTabChange, tabs }: ProjectSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // 프로젝트 메트릭스
  const metrics: ProjectMetric[] = [
    {
      label: '진행률',
      value: `${project.progress}%`,
      icon: ChartBarIcon,
      color: 'text-blue-500'
    },
    {
      label: '마감일',
      value: new Date(project.deadline).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      icon: CalendarIcon,
      color: 'text-purple-500'
    },
    {
      label: '팀원',
      value: `${project.team.length}명`,
      icon: UsersIcon,
      color: 'text-green-500'
    },
    {
      label: '남은 기간',
      value: `${Math.max(0, Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}일`,
      icon: ClockIcon,
      color: 'text-orange-500'
    }
  ]

  // 빠른 실행 액션들
  const quickActions: QuickAction[] = [
    {
      id: 'new-task',
      label: '새 작업',
      icon: PlusIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('새 작업 생성')
    },
    {
      id: 'add-note',
      label: '노트 추가',
      icon: DocumentTextIcon,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => console.log('노트 추가')
    },
    {
      id: 'share-project',
      label: '공유',
      icon: LinkIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('프로젝트 공유')
    },
    {
      id: 'bookmark',
      label: '북마크',
      icon: BookmarkIcon,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      onClick: () => console.log('북마크 추가')
    }
  ]

  // 최근 활동
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'update',
      title: 'RFP 분석 완료',
      time: '2시간 전',
      user: '김개발자'
    },
    {
      id: '2',
      type: 'comment',
      title: '제안서 초안에 댓글 추가',
      time: '4시간 전',
      user: '박기획자'
    },
    {
      id: '3',
      type: 'file',
      title: '시장조사 문서 업로드',
      time: '6시간 전',
      user: '이분석가'
    },
    {
      id: '4',
      type: 'milestone',
      title: '요구사항 분석 완료',
      time: '1일 전'
    }
  ]

  // 관련 리소스
  const relatedResources = [
    { id: '1', name: 'RFP 원본 문서', icon: DocumentTextIcon, type: 'document' },
    { id: '2', name: '경쟁사 분석 자료', icon: ChartBarIcon, type: 'analysis' },
    { id: '3', name: '기술 스택 문서', icon: CommandLineIcon, type: 'technical' },
    { id: '4', name: '프로젝트 웹사이트', icon: GlobeAltIcon, type: 'link' }
  ]

  const getActivityIcon = (type: RecentActivity['type']) => {
    const icons = {
      update: CheckCircleIcon,
      comment: ChatBubbleLeftRightIcon,
      file: DocumentTextIcon,
      milestone: ArrowTrendingUpIcon
    }
    return icons[type]
  }

  const getActivityColor = (type: RecentActivity['type']) => {
    const colors = {
      update: 'text-green-500',
      comment: 'text-blue-500',
      file: 'text-purple-500',
      milestone: 'text-yellow-500'
    }
    return colors[type]
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ 
          x: isCollapsed ? -240 : 0, 
          opacity: 1 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg z-40 transition-all duration-300 ${
          isCollapsed ? 'w-16 lg:w-16' : 'w-80 lg:w-80'
        } ${
          isMobileOpen ? 'translate-x-0' : isCollapsed ? 'lg:translate-x-0 -translate-x-full' : 'lg:translate-x-0 -translate-x-full lg:-translate-x-0'
        }`}
      >
      <div className="flex flex-col h-full">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                프로젝트 정보
              </h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 프로젝트 기본 정보 */}
          {!isCollapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-2xl">{project.avatar}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {project.category === 'proposal' ? '제안 진행' : 
                     project.category === 'development' ? '구축 관리' : '운영 관리'}
                  </p>
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>진행률</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${project.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 프로젝트 메트릭스 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                주요 지표
              </h4>
            )}
            <div className={`grid gap-3 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <div
                    key={metric.label}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                    {!isCollapsed && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {metric.value}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 빠른 실행 */}
          {!isCollapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                빠른 실행
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      className={`flex items-center space-x-2 p-2 rounded-lg text-white text-xs transition-colors ${action.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 탭 네비게이션 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                워크플로우
              </h4>
            )}
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{tab.label}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 최근 활동 */}
          {!isCollapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                최근 활동
              </h4>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  const colorClass = getActivityColor(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start space-x-2">
                      <Icon className={`w-4 h-4 mt-0.5 ${colorClass}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-900 dark:text-white font-medium truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.user ? `${activity.user} • ${activity.time}` : activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 관련 리소스 */}
          {!isCollapsed && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                관련 리소스
              </h4>
              <div className="space-y-2">
                {relatedResources.map((resource) => {
                  const Icon = resource.icon
                  return (
                    <button
                      key={resource.id}
                      className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                    >
                      <Icon className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        {resource.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}