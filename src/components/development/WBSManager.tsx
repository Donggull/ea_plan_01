'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  FlagIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid, FlagIcon as FlagIconSolid } from '@heroicons/react/24/solid'

interface Task {
  id: string
  title: string
  description: string
  type: 'phase' | 'task' | 'milestone'
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  startDate: string
  endDate: string
  estimatedHours: number
  actualHours?: number
  progress: number
  assignee?: string
  dependencies: string[]
  parentId?: string
  children?: Task[]
  tags: string[]
  notes: string
  isExpanded?: boolean
}

interface Milestone {
  id: string
  title: string
  description: string
  targetDate: string
  status: 'upcoming' | 'at-risk' | 'completed' | 'overdue'
  tasks: string[]
  progress: number
}

interface WBSManagerProps {
  projectId: string
}

export default function WBSManager({ projectId }: WBSManagerProps) {
  const [activeTab, setActiveTab] = useState<'wbs' | 'gantt' | 'milestones' | 'resources'>('wbs')
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'blocked'>('all')
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['1', '2']))

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: '기획 단계',
      description: '프로젝트 초기 기획 및 요구사항 분석',
      type: 'phase',
      status: 'completed',
      priority: 'high',
      startDate: '2024-08-01',
      endDate: '2024-08-15',
      estimatedHours: 120,
      actualHours: 115,
      progress: 100,
      dependencies: [],
      tags: ['기획', '분석'],
      notes: '모든 기획 단계가 성공적으로 완료됨',
      isExpanded: true,
      children: [
        {
          id: '1-1',
          title: '요구사항 수집',
          description: '클라이언트 인터뷰 및 요구사항 문서 작성',
          type: 'task',
          status: 'completed',
          priority: 'high',
          startDate: '2024-08-01',
          endDate: '2024-08-05',
          estimatedHours: 40,
          actualHours: 35,
          progress: 100,
          assignee: '이기획자',
          dependencies: [],
          parentId: '1',
          tags: ['요구사항', '인터뷰'],
          notes: '클라이언트와 3회 미팅 진행'
        },
        {
          id: '1-2',
          title: '기능 명세서 작성',
          description: '상세 기능 명세 및 사용자 스토리 작성',
          type: 'task',
          status: 'completed',
          priority: 'medium',
          startDate: '2024-08-06',
          endDate: '2024-08-10',
          estimatedHours: 50,
          actualHours: 48,
          progress: 100,
          assignee: '이기획자',
          dependencies: ['1-1'],
          parentId: '1',
          tags: ['명세서', '스토리'],
          notes: '총 25개 사용자 스토리 작성 완료'
        },
        {
          id: '1-3',
          title: '프로토타입 제작',
          description: '주요 화면 프로토타입 제작',
          type: 'task',
          status: 'completed',
          priority: 'medium',
          startDate: '2024-08-11',
          endDate: '2024-08-15',
          estimatedHours: 30,
          actualHours: 32,
          progress: 100,
          assignee: '박디자이너',
          dependencies: ['1-2'],
          parentId: '1',
          tags: ['프로토타입', '디자인'],
          notes: 'Figma를 사용하여 15개 화면 제작'
        }
      ]
    },
    {
      id: '2',
      title: '개발 단계',
      description: '프론트엔드 및 백엔드 개발',
      type: 'phase',
      status: 'in-progress',
      priority: 'high',
      startDate: '2024-08-16',
      endDate: '2024-09-30',
      estimatedHours: 320,
      actualHours: 180,
      progress: 60,
      dependencies: ['1'],
      tags: ['개발', 'coding'],
      notes: '현재 백엔드 개발 진행 중',
      isExpanded: true,
      children: [
        {
          id: '2-1',
          title: '백엔드 개발',
          description: 'API 서버 및 데이터베이스 구축',
          type: 'task',
          status: 'in-progress',
          priority: 'high',
          startDate: '2024-08-16',
          endDate: '2024-09-15',
          estimatedHours: 200,
          actualHours: 120,
          progress: 70,
          assignee: '김개발자',
          dependencies: [],
          parentId: '2',
          tags: ['backend', 'api'],
          notes: 'Node.js + Express + PostgreSQL 사용'
        },
        {
          id: '2-2',
          title: '프론트엔드 개발',
          description: 'React 기반 사용자 인터페이스 개발',
          type: 'task',
          status: 'not-started',
          priority: 'high',
          startDate: '2024-09-01',
          endDate: '2024-09-30',
          estimatedHours: 120,
          progress: 0,
          assignee: '최프론트',
          dependencies: ['2-1'],
          parentId: '2',
          tags: ['frontend', 'react'],
          notes: 'Next.js 14 사용 예정'
        }
      ]
    },
    {
      id: '3',
      title: 'Alpha 릴리즈',
      description: '내부 테스트용 첫 번째 릴리즈',
      type: 'milestone',
      status: 'not-started',
      priority: 'critical',
      startDate: '2024-09-30',
      endDate: '2024-09-30',
      estimatedHours: 0,
      progress: 0,
      dependencies: ['2'],
      tags: ['milestone', 'alpha'],
      notes: '내부 QA팀 테스트 진행 예정'
    },
    {
      id: '4',
      title: '테스트 단계',
      description: 'QA 테스트 및 버그 수정',
      type: 'phase',
      status: 'not-started',
      priority: 'high',
      startDate: '2024-10-01',
      endDate: '2024-10-20',
      estimatedHours: 80,
      progress: 0,
      dependencies: ['3'],
      tags: ['테스트', 'qa'],
      notes: '단위 테스트, 통합 테스트, 사용성 테스트 진행'
    }
  ])

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: '기획 완료',
      description: '모든 기획 문서 및 프로토타입 완성',
      targetDate: '2024-08-15',
      status: 'completed',
      tasks: ['1-1', '1-2', '1-3'],
      progress: 100
    },
    {
      id: '2',
      title: 'Alpha 릴리즈',
      description: '첫 번째 작동 가능한 버전 완성',
      targetDate: '2024-09-30',
      status: 'upcoming',
      tasks: ['2-1', '2-2'],
      progress: 35
    },
    {
      id: '3',
      title: 'Beta 릴리즈',
      description: '베타 테스트용 안정화 버전',
      targetDate: '2024-10-20',
      status: 'upcoming',
      tasks: ['4'],
      progress: 0
    },
    {
      id: '4',
      title: '정식 릴리즈',
      description: '최종 프로덕션 배포',
      targetDate: '2024-11-15',
      status: 'upcoming',
      tasks: [],
      progress: 0
    }
  ])

  const getFlatTasks = (tasks: Task[]): Task[] => {
    const result: Task[] = []
    tasks.forEach(task => {
      result.push(task)
      if (task.children) {
        result.push(...getFlatTasks(task.children))
      }
    })
    return result
  }

  const getFilteredTasks = () => {
    const allTasks = viewMode === 'tree' ? tasks : getFlatTasks(tasks)
    
    if (filterStatus === 'all') return allTasks
    if (filterStatus === 'active') return allTasks.filter(t => t.status === 'in-progress' || t.status === 'not-started')
    if (filterStatus === 'completed') return allTasks.filter(t => t.status === 'completed')
    if (filterStatus === 'blocked') return allTasks.filter(t => t.status === 'blocked')
    
    return allTasks
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'not-started': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'at-risk': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phase': return <ChartBarIcon className="w-4 h-4" />
      case 'task': return <CheckCircleIcon className="w-4 h-4" />
      case 'milestone': return <FlagIcon className="w-4 h-4" />
      default: return <CheckCircleIcon className="w-4 h-4" />
    }
  }

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const calculateProjectProgress = () => {
    const allTasks = getFlatTasks(tasks)
    const totalHours = allTasks.reduce((sum, task) => sum + task.estimatedHours, 0)
    const completedHours = allTasks.reduce((sum, task) => sum + (task.estimatedHours * task.progress / 100), 0)
    return totalHours > 0 ? Math.round(completedHours / totalHours * 100) : 0
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          WBS 관리
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          작업 분해 구조를 통해 프로젝트 일정과 리소스를 체계적으로 관리합니다
        </p>
      </div>

      {/* Project Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {calculateProjectProgress()}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">전체 진행률</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {getFlatTasks(tasks).filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">완료된 작업</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {getFlatTasks(tasks).filter(t => t.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">진행 중 작업</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {getFlatTasks(tasks).filter(t => t.status === 'blocked').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">블록된 작업</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'wbs', label: 'WBS', icon: ChartBarIcon },
            { id: 'gantt', label: '간트 차트', icon: CalendarIcon },
            { id: 'milestones', label: '마일스톤', icon: FlagIcon },
            { id: 'resources', label: '리소스', icon: UserIcon }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {activeTab === 'wbs' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  보기 모드
                </label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="tree">트리 구조</option>
                  <option value="flat">평면 구조</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  상태 필터
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">전체</option>
                  <option value="active">진행 중</option>
                  <option value="completed">완료</option>
                  <option value="blocked">블록됨</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowAddTaskForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              작업 추가
            </button>
          </div>

          {/* Tasks Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      작업명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      담당자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      일정
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      진행률
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {getFilteredTasks().map((task, index) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      level={task.parentId ? 1 : 0}
                      isExpanded={expandedTasks.has(task.id)}
                      onToggleExpansion={() => toggleTaskExpansion(task.id)}
                      onEdit={() => setEditingTask(task.id)}
                      onDelete={() => setTasks(tasks.filter(t => t.id !== task.id))}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'gantt' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            간트 차트
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            간트 차트 뷰는 개발 중입니다. 곧 제공될 예정입니다.
          </p>
        </motion.div>
      )}

      {activeTab === 'milestones' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex justify-end">
            <button
              onClick={() => {}}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              마일스톤 추가
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {milestone.status === 'completed' ? (
                      <FlagIconSolid className="w-6 h-6 text-green-500" />
                    ) : (
                      <FlagIcon className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                    {milestone.status === 'completed' ? '완료' :
                     milestone.status === 'upcoming' ? '예정' :
                     milestone.status === 'at-risk' ? '위험' : '지연'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">목표 날짜:</span>
                    <span className="text-gray-900 dark:text-white">{milestone.targetDate}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">진행률:</span>
                      <span className="text-gray-900 dark:text-white">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          milestone.status === 'completed' 
                            ? 'bg-green-500' 
                            : milestone.status === 'at-risk'
                            ? 'bg-yellow-500'
                            : milestone.status === 'overdue'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      관련 작업: {milestone.tasks.length}개
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'resources' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            리소스 관리
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            팀 리소스 관리 기능은 개발 중입니다. 곧 제공될 예정입니다.
          </p>
        </motion.div>
      )}
    </div>
  )
}

function TaskRow({
  task,
  level = 0,
  isExpanded,
  onToggleExpansion,
  onEdit,
  onDelete
}: {
  task: Task
  level?: number
  isExpanded: boolean
  onToggleExpansion: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'not-started': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phase': return <ChartBarIcon className="w-4 h-4" />
      case 'task': return <CheckCircleIcon className="w-4 h-4" />
      case 'milestone': return <FlagIcon className="w-4 h-4" />
      default: return <CheckCircleIcon className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIconSolid className="w-4 h-4 text-green-500" />
      case 'in-progress': return <PlayIcon className="w-4 h-4 text-blue-500" />
      case 'not-started': return <PauseIcon className="w-4 h-4 text-gray-400" />
      case 'blocked': return <StopIcon className="w-4 h-4 text-red-500" />
      default: return <PauseIcon className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
            {task.children && task.children.length > 0 && (
              <button
                onClick={onToggleExpansion}
                className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            <div className="flex items-center space-x-3">
              {getTypeIcon(task.type)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </span>
                  <span className={`${getPriorityColor(task.priority)}`}>
                    {task.priority === 'critical' && <ExclamationCircleIcon className="w-4 h-4" />}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {task.description}
                </div>
                {task.estimatedHours > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{task.estimatedHours}h</span>
                    {task.actualHours && (
                      <span>/ {task.actualHours}h 실제</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            {task.assignee ? (
              <>
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">{task.assignee}</span>
              </>
            ) : (
              <span className="text-sm text-gray-400">미배정</span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span>{task.startDate}</span>
              <ArrowRightIcon className="w-3 h-3 text-gray-400" />
              <span>{task.endDate}</span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  task.status === 'completed' 
                    ? 'bg-green-500' 
                    : task.status === 'blocked'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-900 dark:text-white min-w-[40px]">
              {task.progress}%
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            {getStatusIcon(task.status)}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status === 'completed' ? '완료' :
               task.status === 'in-progress' ? '진행중' :
               task.status === 'not-started' ? '시작전' :
               task.status === 'blocked' ? '블록됨' : '취소됨'}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-600"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && task.children && task.children.map((child) => (
        <TaskRow
          key={child.id}
          task={child}
          level={level + 1}
          isExpanded={false}
          onToggleExpansion={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      ))}
    </>
  )
}