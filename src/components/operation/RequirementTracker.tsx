'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentCheckIcon,
  UserCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

interface OperationRequirement {
  id: string
  requestType:
    | 'bug_fix'
    | 'feature_request'
    | 'improvement'
    | 'support'
    | 'change_request'
  title: string
  description: string
  customerName: string
  customerEmail: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status:
    | 'submitted'
    | 'in_review'
    | 'approved'
    | 'rejected'
    | 'in_progress'
    | 'completed'
    | 'on_hold'
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'revision_needed'
  approvedBy?: string
  approvedAt?: string
  estimatedHours?: number
  actualHours?: number
  deadline?: string
  completedAt?: string
  tags: string[]
  attachments: Array<{ id: string; name: string; type: string; url: string }>
  createdAt: string
  updatedAt: string
}

interface RequirementTrackerProps {
  projectId: string
}

export default function RequirementTracker({
  projectId: _projectId,
}: RequirementTrackerProps) {
  const [requirements, setRequirements] = useState<OperationRequirement[]>([])
  const [filteredRequirements, setFilteredRequirements] = useState<
    OperationRequirement[]
  >([])
  const [selectedRequirement, setSelectedRequirement] =
    useState<OperationRequirement | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date')

  // 새 요구사항 폼 데이터
  const [newRequirement, setNewRequirement] = useState<
    Partial<OperationRequirement>
  >({
    requestType: 'feature_request',
    priority: 'medium',
    status: 'submitted',
    approvalStatus: 'pending',
    tags: [],
    attachments: [],
  })

  // Mock data
  useEffect(() => {
    const mockData: OperationRequirement[] = [
      {
        id: '1',
        requestType: 'bug_fix',
        title: '로그인 화면 버그 수정',
        description: '소셜 로그인 시 간헐적으로 실패하는 문제가 발생합니다.',
        customerName: '김고객',
        customerEmail: 'customer@example.com',
        priority: 'urgent',
        status: 'in_progress',
        approvalStatus: 'approved',
        approvedBy: '이승인자',
        approvedAt: '2024-03-20',
        estimatedHours: 8,
        actualHours: 6,
        deadline: '2024-03-25',
        tags: ['버그', '로그인', '긴급'],
        attachments: [],
        createdAt: '2024-03-19',
        updatedAt: '2024-03-20',
      },
      {
        id: '2',
        requestType: 'feature_request',
        title: '대시보드 위젯 추가',
        description: '사용자 활동 통계를 보여주는 새로운 위젯이 필요합니다.',
        customerName: '박요청',
        customerEmail: 'request@example.com',
        priority: 'medium',
        status: 'in_review',
        approvalStatus: 'pending',
        estimatedHours: 24,
        deadline: '2024-04-01',
        tags: ['기능추가', '대시보드'],
        attachments: [],
        createdAt: '2024-03-18',
        updatedAt: '2024-03-19',
      },
    ]
    setRequirements(mockData)
    setFilteredRequirements(mockData)
  }, [])

  // 필터링 및 검색
  useEffect(() => {
    let filtered = [...requirements]

    // 상태 필터
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus)
    }

    // 우선순위 필터
    if (filterPriority !== 'all') {
      filtered = filtered.filter(req => req.priority === filterPriority)
    }

    // 검색
    if (searchTerm) {
      filtered = filtered.filter(
        req =>
          req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case 'status':
          return a.status.localeCompare(b.status)
        case 'date':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      }
    })

    setFilteredRequirements(filtered)
  }, [requirements, filterStatus, filterPriority, searchTerm, sortBy])

  const handleAddRequirement = () => {
    if (
      !newRequirement.title ||
      !newRequirement.description ||
      !newRequirement.customerName
    ) {
      alert('필수 정보를 입력해주세요.')
      return
    }

    const requirement: OperationRequirement = {
      ...(newRequirement as OperationRequirement),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setRequirements([...requirements, requirement])
    setNewRequirement({
      requestType: 'feature_request',
      priority: 'medium',
      status: 'submitted',
      approvalStatus: 'pending',
      tags: [],
      attachments: [],
    })
    setShowAddForm(false)
  }

  const handleApprove = (id: string) => {
    setRequirements(
      requirements.map(req =>
        req.id === id
          ? {
              ...req,
              approvalStatus: 'approved',
              approvedBy: '관리자',
              approvedAt: new Date().toISOString(),
              status: 'approved',
              updatedAt: new Date().toISOString(),
            }
          : req
      )
    )
  }

  const handleReject = (id: string) => {
    setRequirements(
      requirements.map(req =>
        req.id === id
          ? {
              ...req,
              approvalStatus: 'rejected',
              status: 'rejected',
              updatedAt: new Date().toISOString(),
            }
          : req
      )
    )
  }

  const handleUpdateStatus = (
    id: string,
    status: OperationRequirement['status']
  ) => {
    setRequirements(
      requirements.map(req =>
        req.id === id
          ? { ...req, status, updatedAt: new Date().toISOString() }
          : req
      )
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      default:
        return <DocumentCheckIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-800 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      case 'high':
        return 'text-orange-800 bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
      case 'medium':
        return 'text-yellow-800 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
      case 'low':
        return 'text-gray-800 bg-gray-100 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700'
      default:
        return 'text-gray-800 bg-gray-100 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bug_fix: '버그 수정',
      feature_request: '기능 요청',
      improvement: '개선 사항',
      support: '지원 요청',
      change_request: '변경 요청',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            요건 관리 시스템
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            고객 요청사항을 접수하고 승인 워크플로우를 관리합니다
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>새 요건 등록</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">모든 상태</option>
            <option value="submitted">접수됨</option>
            <option value="in_review">검토중</option>
            <option value="approved">승인됨</option>
            <option value="rejected">반려됨</option>
            <option value="in_progress">진행중</option>
            <option value="completed">완료</option>
            <option value="on_hold">보류</option>
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">모든 우선순위</option>
            <option value="urgent">긴급</option>
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>

          <select
            value={sortBy}
            onChange={e =>
              setSortBy(
                e.target.value as 'newest' | 'oldest' | 'priority' | 'status'
              )
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="date">날짜순</option>
            <option value="priority">우선순위순</option>
            <option value="status">상태순</option>
          </select>
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRequirements.map(requirement => (
          <motion.div
            key={requirement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(requirement.status)}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {requirement.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(requirement.priority)}`}
                  >
                    {requirement.priority === 'urgent'
                      ? '긴급'
                      : requirement.priority === 'high'
                        ? '높음'
                        : requirement.priority === 'medium'
                          ? '보통'
                          : '낮음'}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {getRequestTypeLabel(requirement.requestType)}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {requirement.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      고객:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {requirement.customerName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      예상 시간:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {requirement.estimatedHours
                        ? `${requirement.estimatedHours}시간`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      마감일:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {requirement.deadline || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      승인 상태:
                    </span>
                    <p
                      className={`font-medium ${
                        requirement.approvalStatus === 'approved'
                          ? 'text-green-600'
                          : requirement.approvalStatus === 'rejected'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                      }`}
                    >
                      {requirement.approvalStatus === 'approved'
                        ? '승인됨'
                        : requirement.approvalStatus === 'rejected'
                          ? '반려됨'
                          : requirement.approvalStatus === 'revision_needed'
                            ? '수정필요'
                            : '대기중'}
                    </p>
                  </div>
                </div>

                {requirement.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {requirement.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {requirement.approvalStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(requirement.id)}
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="승인"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReject(requirement.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="반려"
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedRequirement(requirement)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="상세보기"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {requirement.status === 'in_progress' &&
              requirement.estimatedHours && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>진행률</span>
                    <span>
                      {requirement.actualHours || 0} /{' '}
                      {requirement.estimatedHours} 시간
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(((requirement.actualHours || 0) / requirement.estimatedHours) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || selectedRequirement) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {selectedRequirement ? '요건 수정' : '새 요건 등록'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    요청 유형
                  </label>
                  <select
                    value={
                      selectedRequirement?.requestType ||
                      newRequirement.requestType
                    }
                    onChange={e =>
                      setNewRequirement({
                        ...newRequirement,
                        requestType: e.target.value as
                          | 'bug_fix'
                          | 'feature_request'
                          | 'improvement'
                          | 'support'
                          | 'change_request',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="bug_fix">버그 수정</option>
                    <option value="feature_request">기능 요청</option>
                    <option value="improvement">개선 사항</option>
                    <option value="support">지원 요청</option>
                    <option value="change_request">변경 요청</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    우선순위
                  </label>
                  <select
                    value={
                      selectedRequirement?.priority || newRequirement.priority
                    }
                    onChange={e =>
                      setNewRequirement({
                        ...newRequirement,
                        priority: e.target.value as
                          | 'urgent'
                          | 'high'
                          | 'medium'
                          | 'low',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="urgent">긴급</option>
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  제목 *
                </label>
                <input
                  type="text"
                  value={
                    selectedRequirement?.title || newRequirement.title || ''
                  }
                  onChange={e =>
                    setNewRequirement({
                      ...newRequirement,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="요건 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  설명 *
                </label>
                <textarea
                  value={
                    selectedRequirement?.description ||
                    newRequirement.description ||
                    ''
                  }
                  onChange={e =>
                    setNewRequirement({
                      ...newRequirement,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="상세 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    고객명 *
                  </label>
                  <input
                    type="text"
                    value={
                      selectedRequirement?.customerName ||
                      newRequirement.customerName ||
                      ''
                    }
                    onChange={e =>
                      setNewRequirement({
                        ...newRequirement,
                        customerName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="고객 이름"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    고객 이메일
                  </label>
                  <input
                    type="email"
                    value={
                      selectedRequirement?.customerEmail ||
                      newRequirement.customerEmail ||
                      ''
                    }
                    onChange={e =>
                      setNewRequirement({
                        ...newRequirement,
                        customerEmail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    예상 소요 시간
                  </label>
                  <input
                    type="number"
                    value={
                      selectedRequirement?.estimatedHours ||
                      newRequirement.estimatedHours ||
                      ''
                    }
                    onChange={e =>
                      setNewRequirement({
                        ...newRequirement,
                        estimatedHours: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="시간 단위"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    마감일
                  </label>
                  <input
                    type="date"
                    value={
                      selectedRequirement?.deadline ||
                      newRequirement.deadline ||
                      ''
                    }
                    onChange={e =>
                      setNewRequirement({
                        ...newRequirement,
                        deadline: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setSelectedRequirement(null)
                  setNewRequirement({
                    requestType: 'feature_request',
                    priority: 'medium',
                    status: 'submitted',
                    approvalStatus: 'pending',
                    tags: [],
                    attachments: [],
                  })
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddRequirement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedRequirement ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
