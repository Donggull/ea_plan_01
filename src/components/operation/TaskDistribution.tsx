'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  UserCircleIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline'

interface TaskAssignment {
  id: string
  requirementId?: string
  taskType:
    | 'planning'
    | 'design'
    | 'publishing'
    | 'development'
    | 'testing'
    | 'deployment'
  title: string
  description: string
  team: 'planning' | 'design' | 'publishing' | 'frontend' | 'backend' | 'qa'
  assigneeId: string
  assigneeName: string
  assigneeEmail: string
  skillLevel: 'junior' | 'intermediate' | 'senior' | 'expert'
  workloadPoints: number
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'review'
    | 'completed'
    | 'blocked'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  startDate?: string
  dueDate?: string
  completedAt?: string
  dependencies: string[]
  blockers?: string
  progress: number
}

interface TeamMember {
  id: string
  name: string
  email: string
  team: string
  skillLevel: 'junior' | 'intermediate' | 'senior' | 'expert'
  currentWorkload: number
  maxWorkload: number
  skills: string[]
  availability: 'available' | 'busy' | 'unavailable'
}

interface TaskDistributionProps {
  projectId: string
}

export default function TaskDistribution({
  projectId: _projectId,
}: TaskDistributionProps) {
  const [tasks, setTasks] = useState<TaskAssignment[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedTask, setSelectedTask] = useState<TaskAssignment | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterTeam, setFilterTeam] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'workload'>(
    'kanban'
  )

  // Mock data
  useEffect(() => {
    const mockTasks: TaskAssignment[] = [
      {
        id: '1',
        taskType: 'design',
        title: '메인 페이지 UI 디자인',
        description: '새로운 메인 페이지 디자인 작업',
        team: 'design',
        assigneeId: '1',
        assigneeName: '김디자이너',
        assigneeEmail: 'designer@example.com',
        skillLevel: 'senior',
        workloadPoints: 8,
        status: 'in_progress',
        priority: 'high',
        startDate: '2024-03-20',
        dueDate: '2024-03-25',
        dependencies: [],
        progress: 60,
      },
      {
        id: '2',
        taskType: 'development',
        title: 'API 엔드포인트 개발',
        description: '사용자 관리 API 구현',
        team: 'backend',
        assigneeId: '2',
        assigneeName: '이개발자',
        assigneeEmail: 'dev@example.com',
        skillLevel: 'intermediate',
        workloadPoints: 5,
        status: 'assigned',
        priority: 'medium',
        startDate: '2024-03-21',
        dueDate: '2024-03-28',
        dependencies: [],
        progress: 0,
      },
    ]

    const mockMembers: TeamMember[] = [
      {
        id: '1',
        name: '김디자이너',
        email: 'designer@example.com',
        team: 'design',
        skillLevel: 'senior',
        currentWorkload: 8,
        maxWorkload: 13,
        skills: ['UI/UX', 'Figma', 'Photoshop'],
        availability: 'busy',
      },
      {
        id: '2',
        name: '이개발자',
        email: 'dev@example.com',
        team: 'backend',
        skillLevel: 'intermediate',
        currentWorkload: 5,
        maxWorkload: 13,
        skills: ['Node.js', 'Python', 'PostgreSQL'],
        availability: 'available',
      },
      {
        id: '3',
        name: '박프론트',
        email: 'frontend@example.com',
        team: 'frontend',
        skillLevel: 'senior',
        currentWorkload: 3,
        maxWorkload: 13,
        skills: ['React', 'TypeScript', 'Next.js'],
        availability: 'available',
      },
    ]

    setTasks(mockTasks)
    setTeamMembers(mockMembers)
  }, [])

  const handleAssignTask = (taskId: string, memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    setTasks(
      tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              assigneeId: member.id,
              assigneeName: member.name,
              assigneeEmail: member.email,
              status: 'assigned',
            }
          : task
      )
    )

    // Update member workload
    setTeamMembers(
      teamMembers.map(m =>
        m.id === memberId
          ? {
              ...m,
              currentWorkload:
                m.currentWorkload +
                (tasks.find(t => t.id === taskId)?.workloadPoints || 0),
              availability:
                m.currentWorkload +
                  (tasks.find(t => t.id === taskId)?.workloadPoints || 0) >=
                m.maxWorkload
                  ? 'busy'
                  : 'available',
            }
          : m
      )
    )
  }

  const suggestOptimalAssignment = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return null

    // Find team members with matching team and available capacity
    const eligibleMembers = teamMembers.filter(
      member =>
        member.team === task.team &&
        member.currentWorkload + task.workloadPoints <= member.maxWorkload
    )

    // Sort by skill level match and current workload
    const sorted = eligibleMembers.sort((a, b) => {
      // Prefer higher skill level for high priority tasks
      if (task.priority === 'urgent' || task.priority === 'high') {
        const skillOrder = { junior: 0, intermediate: 1, senior: 2, expert: 3 }
        const skillDiff = skillOrder[b.skillLevel] - skillOrder[a.skillLevel]
        if (skillDiff !== 0) return skillDiff
      }

      // Then prefer member with lower workload
      return a.currentWorkload - b.currentWorkload
    })

    return sorted[0] || null
  }

  const getTeamColor = (team: string) => {
    const colors: Record<string, string> = {
      planning:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      design:
        'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      publishing:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      frontend:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      backend:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      qa: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    }
    return (
      colors[team] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      assigned:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      in_progress:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      review:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      completed:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      blocked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }
    return (
      colors[status] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    )
  }

  const getWorkloadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return 'text-red-600 dark:text-red-400'
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const filteredTasks = tasks.filter(task => {
    if (filterTeam !== 'all' && task.team !== filterTeam) return false
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    return true
  })

  const renderKanbanView = () => {
    const columns = [
      'pending',
      'assigned',
      'in_progress',
      'review',
      'completed',
      'blocked',
    ]
    const columnLabels: Record<string, string> = {
      pending: '대기중',
      assigned: '할당됨',
      in_progress: '진행중',
      review: '검토중',
      completed: '완료',
      blocked: '차단됨',
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {columns.map(column => (
          <div
            key={column}
            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
              <span>{columnLabels[column]}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredTasks.filter(t => t.status === column).length}
              </span>
            </h3>
            <div className="space-y-2">
              {filteredTasks
                .filter(task => task.status === column)
                .map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTask(task)}
                  >
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                      {task.title}
                    </h4>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getTeamColor(task.team)}`}
                      >
                        {task.team}
                      </span>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {task.workloadPoints}pt
                      </span>
                    </div>
                    {task.assigneeName && (
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <UserCircleIcon className="w-3 h-3 mr-1" />
                        {task.assigneeName}
                      </div>
                    )}
                    {task.progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderWorkloadView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map(member => (
          <div
            key={member.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.team} · {member.skillLevel}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  member.availability === 'available'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : member.availability === 'busy'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {member.availability === 'available'
                  ? '가능'
                  : member.availability === 'busy'
                    ? '바쁨'
                    : '불가'}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">작업량</span>
                <span
                  className={`font-medium ${getWorkloadColor(member.currentWorkload, member.maxWorkload)}`}
                >
                  {member.currentWorkload} / {member.maxWorkload} pts
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    (member.currentWorkload / member.maxWorkload) * 100 >= 90
                      ? 'bg-red-500'
                      : (member.currentWorkload / member.maxWorkload) * 100 >=
                          70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{
                    width: `${(member.currentWorkload / member.maxWorkload) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {member.skills.map(skill => (
                <span
                  key={skill}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                할당된 작업
              </p>
              <div className="space-y-1">
                {tasks
                  .filter(task => task.assigneeId === member.id)
                  .slice(0, 3)
                  .map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                        {task.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${getStatusColor(task.status)}`}
                      >
                        {task.status === 'in_progress'
                          ? '진행중'
                          : task.status === 'completed'
                            ? '완료'
                            : '대기'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            업무 분배 관리
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            팀별 업무 할당과 작업량 균형을 관리합니다
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              /* AI 기반 자동 분배 */
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>AI 자동 분배</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>새 작업 추가</span>
          </button>
        </div>
      </div>

      {/* Filters and View Mode */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={filterTeam}
              onChange={e => setFilterTeam(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">모든 팀</option>
              <option value="planning">기획</option>
              <option value="design">디자인</option>
              <option value="publishing">퍼블리싱</option>
              <option value="frontend">프론트엔드</option>
              <option value="backend">백엔드</option>
              <option value="qa">QA</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">모든 상태</option>
              <option value="pending">대기중</option>
              <option value="assigned">할당됨</option>
              <option value="in_progress">진행중</option>
              <option value="review">검토중</option>
              <option value="completed">완료</option>
              <option value="blocked">차단됨</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="리스트 뷰"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="칸반 뷰"
            >
              <ChartBarIcon className="w-5 h-5 rotate-90" />
            </button>
            <button
              onClick={() => setViewMode('workload')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'workload'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="작업량 뷰"
            >
              <UserGroupIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'kanban' ? (
        renderKanbanView()
      ) : viewMode === 'workload' ? (
        renderWorkloadView()
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map(task => {
            const suggestedMember = suggestOptimalAssignment(task.id)
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getTeamColor(task.team)}`}
                      >
                        {task.team}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {task.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          담당자:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {task.assigneeName || '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          작업량:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {task.workloadPoints} 포인트
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          마감일:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {task.dueDate || '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          진행률:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {task.progress}%
                        </p>
                      </div>
                    </div>

                    {!task.assigneeId && suggestedMember && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                          <SparklesIcon className="w-4 h-4 inline mr-1" />
                          추천 담당자: {suggestedMember.name} (
                          {suggestedMember.team}, {suggestedMember.skillLevel})
                        </p>
                        <button
                          onClick={() =>
                            handleAssignTask(task.id, suggestedMember.id)
                          }
                          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          자동 할당
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {task.progress > 0 && (
                  <div className="mt-4">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
