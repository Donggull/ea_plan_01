'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Requirement {
  id: string
  title: string
  description: string
  type: 'functional' | 'non-functional' | 'business' | 'technical'
  priority: 'must-have' | 'should-have' | 'could-have' | 'wont-have'
  status: 'draft' | 'review' | 'approved' | 'rejected'
  acceptanceCriteria: string[]
  estimatedEffort: number
  dependencies: string[]
  assignee?: string
  dueDate?: string
}

interface RequirementManagerProps {
  projectId: string
}

export default function RequirementManager({ projectId }: RequirementManagerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'functional' | 'non-functional' | 'business' | 'technical'>('all')
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRequirement, setNewRequirement] = useState<Partial<Requirement>>({})
  const [sortBy, setSortBy] = useState<'priority' | 'effort' | 'status'>('priority')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'review' | 'approved' | 'rejected'>('all')

  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: '1',
      title: '사용자 인증 시스템',
      description: '이메일/패스워드 기반 로그인, 소셜 로그인 (구글, 네이버, 카카오) 지원',
      type: 'functional',
      priority: 'must-have',
      status: 'approved',
      acceptanceCriteria: [
        '이메일과 패스워드로 로그인할 수 있어야 한다',
        '구글, 네이버, 카카오 소셜 로그인을 지원해야 한다',
        '로그인 실패 시 적절한 오류 메시지를 표시해야 한다',
        '비밀번호 찾기 기능을 제공해야 한다'
      ],
      estimatedEffort: 40,
      dependencies: [],
      assignee: '김개발자',
      dueDate: '2024-12-15'
    },
    {
      id: '2',
      title: '반응형 웹 디자인',
      description: '모바일, 태블릿, 데스크톱 모든 디바이스에서 최적화된 UI/UX 제공',
      type: 'non-functional',
      priority: 'must-have',
      status: 'approved',
      acceptanceCriteria: [
        '모바일(320px 이상)에서 정상 동작해야 한다',
        '태블릿(768px 이상)에서 최적화된 레이아웃을 제공해야 한다',
        '데스크톱(1024px 이상)에서 완전한 기능을 제공해야 한다',
        '터치 인터페이스를 지원해야 한다'
      ],
      estimatedEffort: 60,
      dependencies: [],
      assignee: '박디자이너',
      dueDate: '2024-12-20'
    },
    {
      id: '3',
      title: '콘텐츠 관리 시스템',
      description: '관리자가 웹사이트 콘텐츠를 쉽게 관리할 수 있는 CMS 기능',
      type: 'functional',
      priority: 'should-have',
      status: 'review',
      acceptanceCriteria: [
        '텍스트, 이미지, 동영상 콘텐츠를 업로드할 수 있어야 한다',
        'WYSIWYG 에디터를 제공해야 한다',
        '콘텐츠 발행 일정을 설정할 수 있어야 한다',
        '콘텐츠 버전 관리 기능을 제공해야 한다'
      ],
      estimatedEffort: 80,
      dependencies: ['1'],
      assignee: '이기획자',
      dueDate: '2024-12-30'
    },
    {
      id: '4',
      title: '페이지 로딩 성능',
      description: '모든 페이지가 3초 이내에 로딩되어야 함',
      type: 'non-functional',
      priority: 'should-have',
      status: 'draft',
      acceptanceCriteria: [
        '초기 페이지 로딩 시간이 3초를 초과하지 않아야 한다',
        'First Contentful Paint가 1.5초 이내여야 한다',
        'Time to Interactive가 3초 이내여야 한다',
        'Core Web Vitals 기준을 만족해야 한다'
      ],
      estimatedEffort: 30,
      dependencies: ['2'],
      dueDate: '2025-01-10'
    },
    {
      id: '5',
      title: 'SEO 최적화',
      description: '검색엔진 최적화를 위한 메타태그, 구조화된 데이터 등 적용',
      type: 'business',
      priority: 'could-have',
      status: 'draft',
      acceptanceCriteria: [
        '모든 페이지에 적절한 meta title, description을 설정해야 한다',
        '구조화된 데이터(Schema.org)를 적용해야 한다',
        'Open Graph 태그를 설정해야 한다',
        'XML 사이트맵을 생성해야 한다'
      ],
      estimatedEffort: 20,
      dependencies: ['2'],
      dueDate: '2025-01-15'
    }
  ])

  const requirementTypes = [
    { id: 'all', label: '전체', icon: ClipboardDocumentListIcon, color: 'gray' },
    { id: 'functional', label: '기능 요구사항', icon: CogIcon, color: 'blue' },
    { id: 'non-functional', label: '비기능 요구사항', icon: ChartBarIcon, color: 'green' },
    { id: 'business', label: '비즈니스 요구사항', icon: DocumentTextIcon, color: 'purple' },
    { id: 'technical', label: '기술 요구사항', icon: UserIcon, color: 'orange' }
  ]

  const getFilteredRequirements = () => {
    let filtered = requirements

    // Type filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(req => req.type === activeTab)
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'must-have': 0, 'should-have': 1, 'could-have': 2, 'wont-have': 3 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case 'effort':
          return b.estimatedEffort - a.estimatedEffort
        case 'status':
          const statusOrder = { 'draft': 0, 'review': 1, 'approved': 2, 'rejected': 3 }
          return statusOrder[a.status] - statusOrder[b.status]
        default:
          return 0
      }
    })

    return filtered
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'must-have': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'should-have': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'could-have': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'wont-have': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const handleAddRequirement = () => {
    if (newRequirement.title && newRequirement.description) {
      const requirement: Requirement = {
        id: Date.now().toString(),
        title: newRequirement.title,
        description: newRequirement.description,
        type: newRequirement.type || 'functional',
        priority: newRequirement.priority || 'should-have',
        status: 'draft',
        acceptanceCriteria: newRequirement.acceptanceCriteria || [],
        estimatedEffort: newRequirement.estimatedEffort || 0,
        dependencies: newRequirement.dependencies || [],
        assignee: newRequirement.assignee,
        dueDate: newRequirement.dueDate
      }
      setRequirements([...requirements, requirement])
      setNewRequirement({})
      setShowAddForm(false)
    }
  }

  const handleEditRequirement = (id: string, updates: Partial<Requirement>) => {
    setRequirements(requirements.map(req => 
      req.id === id ? { ...req, ...updates } : req
    ))
    setEditingRequirement(null)
  }

  const handleDeleteRequirement = (id: string) => {
    setRequirements(requirements.filter(req => req.id !== id))
  }

  const handleStatusChange = (id: string, status: Requirement['status']) => {
    setRequirements(requirements.map(req => 
      req.id === id ? { ...req, status } : req
    ))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          요구사항 관리
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          프로젝트의 기능 및 비기능 요구사항을 체계적으로 관리합니다
        </p>
      </div>

      {/* Type Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {requirementTypes.map((type) => {
            const IconComponent = type.icon
            const count = type.id === 'all' ? requirements.length : requirements.filter(req => req.type === type.id).length
            return (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === type.id
                    ? `border-${type.color}-500 text-${type.color}-600 dark:text-${type.color}-400`
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{type.label}</span>
                <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full ${
                  activeTab === type.id
                    ? `bg-${type.color}-100 text-${type.color}-600 dark:bg-${type.color}-900/30 dark:text-${type.color}-400`
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              정렬 기준
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="priority">우선순위</option>
              <option value="effort">예상 공수</option>
              <option value="status">상태</option>
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
              <option value="draft">초안</option>
              <option value="review">검토중</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거부됨</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          요구사항 추가
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <RequirementForm
            requirement={newRequirement}
            onChange={setNewRequirement}
            onSave={handleAddRequirement}
            onCancel={() => {
              setShowAddForm(false)
              setNewRequirement({})
            }}
            isNew={true}
          />
        </motion.div>
      )}

      {/* Requirements List */}
      <motion.div
        key={`${activeTab}-${sortBy}-${filterStatus}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {getFilteredRequirements().map((requirement) => (
          <div
            key={requirement.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            {editingRequirement === requirement.id ? (
              <RequirementForm
                requirement={requirement}
                onChange={(updates) => {}}
                onSave={(updates) => handleEditRequirement(requirement.id, updates)}
                onCancel={() => setEditingRequirement(null)}
                isNew={false}
              />
            ) : (
              <RequirementView
                requirement={requirement}
                onEdit={() => setEditingRequirement(requirement.id)}
                onDelete={() => handleDeleteRequirement(requirement.id)}
                onStatusChange={(status) => handleStatusChange(requirement.id, status)}
              />
            )}
          </div>
        ))}
      </motion.div>

      {getFilteredRequirements().length === 0 && (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            요구사항이 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            새로운 요구사항을 추가하여 프로젝트를 시작하세요.
          </p>
        </div>
      )}
    </div>
  )
}

function RequirementView({
  requirement,
  onEdit,
  onDelete,
  onStatusChange
}: {
  requirement: Requirement
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: Requirement['status']) => void
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'must-have': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'should-have': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'could-have': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'wont-have': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getPriorityStars = (priority: string) => {
    const count = priority === 'must-have' ? 5 : priority === 'should-have' ? 4 : priority === 'could-have' ? 3 : 2
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < count ? (
          <StarIconSolid className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        )}
      </span>
    ))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {requirement.title}
            </h3>
            <div className="flex items-center space-x-1">
              {getPriorityStars(requirement.priority)}
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(requirement.priority)}`}>
              {requirement.priority === 'must-have' ? 'Must Have' : 
               requirement.priority === 'should-have' ? 'Should Have' : 
               requirement.priority === 'could-have' ? 'Could Have' : 'Won\'t Have'}
            </span>
            <select
              value={requirement.status}
              onChange={(e) => onStatusChange(e.target.value as any)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(requirement.status)}`}
            >
              <option value="draft">초안</option>
              <option value="review">검토중</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거부됨</option>
            </select>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {requirement.estimatedEffort}시간
            </span>
            {requirement.assignee && (
              <span className="text-xs text-blue-600 dark:text-blue-400">
                담당: {requirement.assignee}
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {requirement.description}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Acceptance Criteria */}
      {requirement.acceptanceCriteria.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            수용 기준
          </h4>
          <ul className="space-y-1">
            {requirement.acceptanceCriteria.map((criteria, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dependencies */}
      {requirement.dependencies.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            의존성
          </h4>
          <div className="flex flex-wrap gap-2">
            {requirement.dependencies.map((depId) => (
              <span key={depId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                요구사항 #{depId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Due Date */}
      {requirement.dueDate && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>완료 예정:</span>
          <span className="font-medium">{requirement.dueDate}</span>
        </div>
      )}
    </div>
  )
}

function RequirementForm({
  requirement,
  onChange,
  onSave,
  onCancel,
  isNew
}: {
  requirement: Partial<Requirement>
  onChange: (requirement: Partial<Requirement>) => void
  onSave: (requirement: Partial<Requirement>) => void
  onCancel: () => void
  isNew: boolean
}) {
  const [formData, setFormData] = useState<Partial<Requirement>>(requirement)
  const [newCriteria, setNewCriteria] = useState('')

  const handleAddCriteria = () => {
    if (newCriteria.trim()) {
      setFormData({
        ...formData,
        acceptanceCriteria: [...(formData.acceptanceCriteria || []), newCriteria.trim()]
      })
      setNewCriteria('')
    }
  }

  const handleRemoveCriteria = (index: number) => {
    const criteria = formData.acceptanceCriteria || []
    setFormData({
      ...formData,
      acceptanceCriteria: criteria.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            제목 *
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="요구사항 제목을 입력하세요"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            설명 *
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="상세 설명을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            유형
          </label>
          <select
            value={formData.type || 'functional'}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="functional">기능 요구사항</option>
            <option value="non-functional">비기능 요구사항</option>
            <option value="business">비즈니스 요구사항</option>
            <option value="technical">기술 요구사항</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            우선순위
          </label>
          <select
            value={formData.priority || 'should-have'}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="must-have">Must Have</option>
            <option value="should-have">Should Have</option>
            <option value="could-have">Could Have</option>
            <option value="wont-have">Won't Have</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            예상 공수 (시간)
          </label>
          <input
            type="number"
            value={formData.estimatedEffort || ''}
            onChange={(e) => setFormData({ ...formData, estimatedEffort: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            담당자
          </label>
          <input
            type="text"
            value={formData.assignee || ''}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="담당자명"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            완료 예정일
          </label>
          <input
            type="date"
            value={formData.dueDate || ''}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Acceptance Criteria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          수용 기준
        </label>
        <div className="space-y-2">
          {(formData.acceptanceCriteria || []).map((criteria, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={criteria}
                onChange={(e) => {
                  const newCriteria = [...(formData.acceptanceCriteria || [])]
                  newCriteria[index] = e.target.value
                  setFormData({ ...formData, acceptanceCriteria: newCriteria })
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={() => handleRemoveCriteria(index)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newCriteria}
              onChange={(e) => setNewCriteria(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCriteria()}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="새 수용 기준 추가"
            />
            <button
              onClick={handleAddCriteria}
              className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          취소
        </button>
        <button
          onClick={() => onSave(formData)}
          disabled={!formData.title || !formData.description}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
        >
          {isNew ? '추가' : '저장'}
        </button>
      </div>
    </div>
  )
}