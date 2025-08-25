'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

interface Sprint {
  id: string
  name: string
  goal: string
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  velocity: number
  plannedPoints: number
  completedPoints: number
  teamMembers: string[]
  tasks: SprintTask[]
  createdAt: string
  updatedAt: string
}

interface SprintTask {
  id: string
  title: string
  description: string
  assignee: string
  storyPoints: number
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'review' | 'done'
  startDate: string
  endDate: string
  dependencies: string[]
  blockers: string[]
}

interface ResourceCalendar {
  memberId: string
  memberName: string
  team: string
  availability: ResourceAvailability[]
  scheduledTasks: ScheduledTask[]
}

interface ResourceAvailability {
  date: string
  availableHours: number
  isHoliday: boolean
  isLeave: boolean
  notes: string
}

interface ScheduledTask {
  taskId: string
  taskTitle: string
  startDate: string
  endDate: string
  allocatedHours: number
  sprintId: string
}

interface ScheduleConflict {
  id: string
  type: 'overallocation' | 'dependency' | 'deadline' | 'resource'
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  affectedTasks: string[]
  affectedMembers: string[]
  suggestedResolution: string
  detectedAt: string
}

// Mock data
const mockSprints: Sprint[] = [
  {
    id: 'spr-001',
    name: 'Sprint 23 - 인증 시스템 개선',
    goal: '사용자 인증 프로세스 개선 및 보안 강화',
    startDate: '2025-01-06',
    endDate: '2025-01-19',
    status: 'active',
    velocity: 45,
    plannedPoints: 48,
    completedPoints: 32,
    teamMembers: ['김개발', '이프론트', '박백엔드', '최디자인'],
    tasks: [
      {
        id: 'task-001',
        title: 'OAuth 2.0 통합',
        description: 'Google, GitHub OAuth 로그인 구현',
        assignee: '박백엔드',
        storyPoints: 8,
        priority: 'high',
        status: 'done',
        startDate: '2025-01-06',
        endDate: '2025-01-08',
        dependencies: [],
        blockers: [],
      },
      {
        id: 'task-002',
        title: '2FA 구현',
        description: '이중 인증 시스템 구현',
        assignee: '김개발',
        storyPoints: 13,
        priority: 'high',
        status: 'in_progress',
        startDate: '2025-01-08',
        endDate: '2025-01-12',
        dependencies: ['task-001'],
        blockers: [],
      },
      {
        id: 'task-003',
        title: '로그인 UI 개선',
        description: '로그인 화면 UX 개선',
        assignee: '최디자인',
        storyPoints: 5,
        priority: 'medium',
        status: 'review',
        startDate: '2025-01-10',
        endDate: '2025-01-12',
        dependencies: [],
        blockers: [],
      },
    ],
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
  },
  {
    id: 'spr-002',
    name: 'Sprint 24 - 성능 최적화',
    goal: '주요 페이지 로딩 속도 50% 개선',
    startDate: '2025-01-20',
    endDate: '2025-02-02',
    status: 'planning',
    velocity: 45,
    plannedPoints: 42,
    completedPoints: 0,
    teamMembers: ['김개발', '이프론트', '박백엔드'],
    tasks: [],
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
]

const mockResourceCalendar: ResourceCalendar[] = [
  {
    memberId: 'mem-001',
    memberName: '김개발',
    team: 'frontend',
    availability: [
      {
        date: '2025-01-13',
        availableHours: 8,
        isHoliday: false,
        isLeave: false,
        notes: '',
      },
      {
        date: '2025-01-14',
        availableHours: 8,
        isHoliday: false,
        isLeave: false,
        notes: '',
      },
      {
        date: '2025-01-15',
        availableHours: 4,
        isHoliday: false,
        isLeave: false,
        notes: '오후 회의',
      },
      {
        date: '2025-01-16',
        availableHours: 8,
        isHoliday: false,
        isLeave: false,
        notes: '',
      },
      {
        date: '2025-01-17',
        availableHours: 8,
        isHoliday: false,
        isLeave: false,
        notes: '',
      },
    ],
    scheduledTasks: [
      {
        taskId: 'task-002',
        taskTitle: '2FA 구현',
        startDate: '2025-01-08',
        endDate: '2025-01-12',
        allocatedHours: 40,
        sprintId: 'spr-001',
      },
    ],
  },
  {
    memberId: 'mem-002',
    memberName: '박백엔드',
    team: 'backend',
    availability: [
      {
        date: '2025-01-13',
        availableHours: 8,
        isHoliday: false,
        isLeave: false,
        notes: '',
      },
      {
        date: '2025-01-14',
        availableHours: 0,
        isHoliday: false,
        isLeave: true,
        notes: '개인 휴가',
      },
      {
        date: '2025-01-15',
        availableHours: 8,
        isHoliday: false,
        isLeave: false,
        notes: '',
      },
      {
        date: '2025-01-16',
        availableHours: 8,
        isHoliday: false,
        isLeave: false,
        notes: '',
      },
      {
        date: '2025-01-17',
        availableHours: 8,
        isHoliday: false,
        isLeave: false,
        notes: '',
      },
    ],
    scheduledTasks: [],
  },
]

const mockConflicts: ScheduleConflict[] = [
  {
    id: 'conf-001',
    type: 'overallocation',
    severity: 'high',
    description: '김개발님이 1월 3주차에 60시간 할당되어 있습니다',
    affectedTasks: ['task-002', 'task-004'],
    affectedMembers: ['김개발'],
    suggestedResolution:
      '일부 작업을 다른 팀원에게 재할당하거나 일정을 조정하세요',
    detectedAt: '2025-01-10T15:00:00Z',
  },
  {
    id: 'conf-002',
    type: 'dependency',
    severity: 'medium',
    description: 'API 개발 작업이 지연되어 프론트엔드 작업이 블로킹됩니다',
    affectedTasks: ['task-005', 'task-006'],
    affectedMembers: ['이프론트'],
    suggestedResolution:
      'API 개발에 추가 리소스를 할당하거나 Mock API 사용을 고려하세요',
    detectedAt: '2025-01-10T14:30:00Z',
  },
]

export default function ScheduleManager({ projectId }: { projectId: string }) {
  const [sprints, setSprints] = useState<Sprint[]>(mockSprints)
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(
    mockSprints[0]
  )
  const [resourceCalendar, setResourceCalendar] =
    useState<ResourceCalendar[]>(mockResourceCalendar)
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>(mockConflicts)
  const [viewMode, setViewMode] = useState<'sprint' | 'calendar' | 'conflicts'>(
    'sprint'
  )
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [showSprintModal, setShowSprintModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [filterTeam, setFilterTeam] = useState<string>('all')

  // Calculate sprint progress
  const getSprintProgress = (sprint: Sprint) => {
    if (sprint.plannedPoints === 0) return 0
    return Math.round((sprint.completedPoints / sprint.plannedPoints) * 100)
  }

  // Calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Get week dates
  const getWeekDates = () => {
    const dates = []
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1) // Monday

    for (let i = 0; i < 5; i++) {
      // Monday to Friday
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  // Get conflict severity color
  const getConflictSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  // Get task status color
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
      case 'review':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
      case 'todo':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const renderSprintView = () => (
    <div className="space-y-6">
      {/* Sprint List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sprints.map(sprint => (
          <motion.div
            key={sprint.id}
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedSprint?.id === sprint.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
            onClick={() => setSelectedSprint(sprint)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {sprint.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {sprint.goal}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  sprint.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : sprint.status === 'completed'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : sprint.status === 'planning'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                }`}
              >
                {sprint.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {sprint.startDate} → {sprint.endDate}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getDaysRemaining(sprint.endDate)} days left
                </span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progress
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {sprint.completedPoints}/{sprint.plannedPoints} points
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getSprintProgress(sprint)}%` }}
                    className="bg-blue-500 h-2 rounded-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {sprint.teamMembers.length} members
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Velocity: {sprint.velocity}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Sprint Tasks */}
      {selectedSprint && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sprint Tasks
            </h3>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Task
            </button>
          </div>

          <div className="space-y-3">
            {selectedSprint.tasks.map(task => (
              <div
                key={task.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getTaskStatusColor(task.status)}`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    <span>Assignee: {task.assignee}</span>
                    <span>{task.storyPoints} points</span>
                    <span>
                      {task.startDate} → {task.endDate}
                    </span>
                  </div>
                  {task.dependencies.length > 0 && (
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      {task.dependencies.length} dependencies
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderCalendarView = () => {
    const weekDates = getWeekDates()

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Week of {weekDates[0].toLocaleDateString()}
            </h3>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          <select
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Teams</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="design">Design</option>
            <option value="qa">QA</option>
          </select>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Team Member
                </th>
                {weekDates.map(date => (
                  <th
                    key={date.toISOString()}
                    className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <div>
                      {date.toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div>{date.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resourceCalendar
                .filter(
                  resource =>
                    filterTeam === 'all' || resource.team === filterTeam
                )
                .map(resource => (
                  <tr
                    key={resource.memberId}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {resource.memberName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {resource.team}
                        </div>
                      </div>
                    </td>
                    {weekDates.map(date => {
                      const dateStr = date.toISOString().split('T')[0]
                      const availability = resource.availability.find(
                        a => a.date === dateStr
                      )
                      const tasks = resource.scheduledTasks.filter(
                        t =>
                          new Date(t.startDate) <= date &&
                          new Date(t.endDate) >= date
                      )

                      return (
                        <td key={date.toISOString()} className="py-4 px-4">
                          <div
                            className={`min-h-[80px] p-2 rounded-lg ${
                              availability?.isLeave
                                ? 'bg-gray-100 dark:bg-gray-700'
                                : availability?.isHoliday
                                  ? 'bg-red-50 dark:bg-red-900/20'
                                  : 'bg-gray-50 dark:bg-gray-800'
                            }`}
                          >
                            {availability?.isLeave ? (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Leave
                              </div>
                            ) : (
                              <>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  {availability?.availableHours || 8}h available
                                </div>
                                {tasks.map(task => (
                                  <div
                                    key={task.taskId}
                                    className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded p-1 mb-1"
                                  >
                                    {task.taskTitle}
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderConflictsView = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Schedule Conflicts & Warnings
        </h3>

        {conflicts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No conflicts detected in current schedule
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map(conflict => (
              <motion.div
                key={conflict.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon
                    className={`w-5 h-5 mt-0.5 ${
                      conflict.severity === 'critical' ||
                      conflict.severity === 'high'
                        ? 'text-red-500'
                        : 'text-yellow-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getConflictSeverityColor(conflict.severity)}`}
                      >
                        {conflict.severity}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {conflict.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white mb-2">
                      {conflict.description}
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Suggested Resolution:</strong>{' '}
                        {conflict.suggestedResolution}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Affects: {conflict.affectedTasks.length} tasks
                      </span>
                      <span>
                        Team members: {conflict.affectedMembers.join(', ')}
                      </span>
                      <span>
                        Detected:{' '}
                        {new Date(conflict.detectedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <XMarkIcon className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Conflict Resolution Actions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Automated Conflict Resolution
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
            <ArrowPathIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Rebalance Workload
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Automatically redistribute tasks
            </p>
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
            <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Optimize Schedule
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Adjust timelines for efficiency
            </p>
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
            <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Request Resources
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Get additional team members
            </p>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            일정 관리
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            스프린트 계획, 리소스 캘린더 및 일정 충돌 감지
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('sprint')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'sprint'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ViewColumnsIcon className="w-5 h-5 inline-block mr-2" />
              Sprint
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CalendarDaysIcon className="w-5 h-5 inline-block mr-2" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('conflicts')}
              className={`px-4 py-2 rounded-lg transition-colors relative ${
                viewMode === 'conflicts'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ExclamationTriangleIcon className="w-5 h-5 inline-block mr-2" />
              Conflicts
              {conflicts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
          <button
            onClick={() => setShowSprintModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Sprint
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ViewColumnsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Sprints
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {sprints.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completed Points
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {sprints.reduce((sum, s) => sum + s.completedPoints, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Velocity
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {Math.round(
                  sprints.reduce((sum, s) => sum + s.velocity, 0) /
                    sprints.length
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conflicts
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {conflicts.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'sprint' && renderSprintView()}
          {viewMode === 'calendar' && renderCalendarView()}
          {viewMode === 'conflicts' && renderConflictsView()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
