'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LightBulbIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  UserIcon,
  TagIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  ArrowsRightLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface UserStory {
  id: string
  title: string
  description: string
  asA: string
  iWant: string
  soThat: string
  acceptanceCriteria: string[]
  priority: 'high' | 'medium' | 'low'
  storyPoints: number
  epic?: string
  tags: string[]
  status: 'backlog' | 'todo' | 'in-progress' | 'done'
}

interface APIEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  description: string
  parameters: Parameter[]
  responses: Response[]
  relatedStories: string[]
}

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
}

interface Response {
  statusCode: number
  description: string
  example: string
}

interface FeatureDefinitionProps {
  projectId: string
}

export default function FeatureDefinition({ projectId }: FeatureDefinitionProps) {
  const [activeTab, setActiveTab] = useState<'stories' | 'api'>('stories')
  const [selectedEpic, setSelectedEpic] = useState<string>('all')
  const [showAddStoryForm, setShowAddStoryForm] = useState(false)
  const [showAddAPIForm, setShowAddAPIForm] = useState(false)
  const [editingStory, setEditingStory] = useState<string | null>(null)
  const [editingAPI, setEditingAPI] = useState<string | null>(null)
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set())

  const [userStories, setUserStories] = useState<UserStory[]>([
    {
      id: '1',
      title: '사용자 회원가입',
      description: '새로운 사용자가 계정을 생성할 수 있다',
      asA: '새로운 사용자로서',
      iWant: '계정을 생성하고 싶다',
      soThat: '서비스를 이용할 수 있다',
      acceptanceCriteria: [
        '이메일과 비밀번호로 회원가입할 수 있어야 한다',
        '이메일 중복 검사를 해야 한다',
        '비밀번호는 최소 8자 이상이어야 한다',
        '회원가입 완료 후 이메일 인증을 받아야 한다'
      ],
      priority: 'high',
      storyPoints: 8,
      epic: 'user-management',
      tags: ['authentication', 'frontend', 'backend'],
      status: 'todo'
    },
    {
      id: '2',
      title: '사용자 로그인',
      description: '등록된 사용자가 로그인할 수 있다',
      asA: '등록된 사용자로서',
      iWant: '내 계정으로 로그인하고 싶다',
      soThat: '개인화된 서비스를 이용할 수 있다',
      acceptanceCriteria: [
        '이메일과 비밀번호로 로그인할 수 있어야 한다',
        '로그인 실패 시 적절한 오류 메시지를 표시해야 한다',
        '로그인 성공 시 메인 페이지로 리다이렉트해야 한다',
        '로그인 상태를 유지해야 한다'
      ],
      priority: 'high',
      storyPoints: 5,
      epic: 'user-management',
      tags: ['authentication', 'frontend'],
      status: 'in-progress'
    },
    {
      id: '3',
      title: '프로필 수정',
      description: '사용자가 자신의 프로필 정보를 수정할 수 있다',
      asA: '로그인한 사용자로서',
      iWant: '내 프로필 정보를 수정하고 싶다',
      soThat: '최신 정보를 유지할 수 있다',
      acceptanceCriteria: [
        '이름, 전화번호, 주소를 수정할 수 있어야 한다',
        '프로필 이미지를 업로드할 수 있어야 한다',
        '수정 전 현재 정보를 확인할 수 있어야 한다',
        '저장 성공 시 확인 메시지를 표시해야 한다'
      ],
      priority: 'medium',
      storyPoints: 3,
      epic: 'user-management',
      tags: ['profile', 'frontend'],
      status: 'backlog'
    },
    {
      id: '4',
      title: '상품 검색',
      description: '사용자가 상품을 검색할 수 있다',
      asA: '쇼핑을 하는 사용자로서',
      iWant: '원하는 상품을 검색하고 싶다',
      soThat: '빠르게 상품을 찾을 수 있다',
      acceptanceCriteria: [
        '키워드로 상품을 검색할 수 있어야 한다',
        '카테고리별로 필터링할 수 있어야 한다',
        '가격 범위로 필터링할 수 있어야 한다',
        '검색 결과를 정렬할 수 있어야 한다'
      ],
      priority: 'high',
      storyPoints: 13,
      epic: 'e-commerce',
      tags: ['search', 'frontend', 'backend'],
      status: 'todo'
    }
  ])

  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([
    {
      id: '1',
      method: 'POST',
      endpoint: '/api/auth/register',
      description: '새로운 사용자 회원가입',
      parameters: [
        { name: 'email', type: 'string', required: true, description: '사용자 이메일 주소' },
        { name: 'password', type: 'string', required: true, description: '비밀번호 (최소 8자)' },
        { name: 'name', type: 'string', required: true, description: '사용자 이름' },
        { name: 'phone', type: 'string', required: false, description: '전화번호' }
      ],
      responses: [
        { statusCode: 201, description: '회원가입 성공', example: '{"id": "123", "email": "user@example.com", "name": "홍길동"}' },
        { statusCode: 400, description: '잘못된 입력값', example: '{"error": "이미 존재하는 이메일입니다"}' },
        { statusCode: 500, description: '서버 오류', example: '{"error": "내부 서버 오류"}' }
      ],
      relatedStories: ['1']
    },
    {
      id: '2',
      method: 'POST',
      endpoint: '/api/auth/login',
      description: '사용자 로그인',
      parameters: [
        { name: 'email', type: 'string', required: true, description: '사용자 이메일 주소' },
        { name: 'password', type: 'string', required: true, description: '비밀번호' }
      ],
      responses: [
        { statusCode: 200, description: '로그인 성공', example: '{"token": "jwt-token", "user": {"id": "123", "email": "user@example.com"}}' },
        { statusCode: 401, description: '인증 실패', example: '{"error": "이메일 또는 비밀번호가 올바르지 않습니다"}' },
        { statusCode: 500, description: '서버 오류', example: '{"error": "내부 서버 오류"}' }
      ],
      relatedStories: ['2']
    },
    {
      id: '3',
      method: 'GET',
      endpoint: '/api/products/search',
      description: '상품 검색',
      parameters: [
        { name: 'q', type: 'string', required: false, description: '검색 키워드' },
        { name: 'category', type: 'string', required: false, description: '카테고리 필터' },
        { name: 'minPrice', type: 'number', required: false, description: '최소 가격' },
        { name: 'maxPrice', type: 'number', required: false, description: '최대 가격' },
        { name: 'sort', type: 'string', required: false, description: '정렬 방식 (price, name, date)' },
        { name: 'page', type: 'number', required: false, description: '페이지 번호' },
        { name: 'limit', type: 'number', required: false, description: '페이지 크기' }
      ],
      responses: [
        { statusCode: 200, description: '검색 성공', example: '{"products": [{"id": "1", "name": "상품명", "price": 10000}], "total": 100}' },
        { statusCode: 400, description: '잘못된 파라미터', example: '{"error": "잘못된 정렬 방식입니다"}' }
      ],
      relatedStories: ['4']
    }
  ])

  const epics = [
    { id: 'all', name: '전체', color: 'gray' },
    { id: 'user-management', name: '사용자 관리', color: 'blue' },
    { id: 'e-commerce', name: '이커머스', color: 'green' },
    { id: 'content-management', name: '콘텐츠 관리', color: 'purple' }
  ]

  const getFilteredStories = () => {
    if (selectedEpic === 'all') return userStories
    return userStories.filter(story => story.epic === selectedEpic)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'todo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'backlog': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'POST': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'PUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'PATCH': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const toggleStoryExpansion = (storyId: string) => {
    const newExpanded = new Set(expandedStories)
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId)
    } else {
      newExpanded.add(storyId)
    }
    setExpandedStories(newExpanded)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          기능 정의
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          사용자 스토리 작성부터 API 설계까지 상세한 기능을 정의합니다
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('stories')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'stories'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>사용자 스토리</span>
            <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full ${
              activeTab === 'stories'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {userStories.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'api'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <CodeBracketIcon className="w-5 h-5" />
            <span>API 설계</span>
            <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full ${
              activeTab === 'api'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {apiEndpoints.length}
            </span>
          </button>
        </nav>
      </div>

      {activeTab === 'stories' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Epic Filter & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  에픽 필터
                </label>
                <select
                  value={selectedEpic}
                  onChange={(e) => setSelectedEpic(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  {epics.map(epic => (
                    <option key={epic.id} value={epic.id}>{epic.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowAddStoryForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              사용자 스토리 추가
            </button>
          </div>

          {/* User Stories */}
          <div className="space-y-4">
            {getFilteredStories().map((story) => (
              <div
                key={story.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <button
                        onClick={() => toggleStoryExpansion(story.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {expandedStories.has(story.id) ? (
                          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {story.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}>
                        {story.priority === 'high' ? '높음' : story.priority === 'medium' ? '보통' : '낮음'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                        {story.status === 'done' ? '완료' : 
                         story.status === 'in-progress' ? '진행중' : 
                         story.status === 'todo' ? '할일' : '백로그'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {story.storyPoints}sp
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p><span className="font-medium">As a</span> {story.asA},</p>
                      <p><span className="font-medium">I want</span> {story.iWant},</p>
                      <p><span className="font-medium">So that</span> {story.soThat}.</p>
                    </div>

                    {story.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {story.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {expandedStories.has(story.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            수용 기준
                          </h4>
                          <ul className="space-y-1">
                            {story.acceptanceCriteria.map((criteria, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{criteria}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {story.epic && (
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">에픽: </span>
                            <span className="text-sm text-blue-600 dark:text-blue-400">
                              {epics.find(e => e.id === story.epic)?.name}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingStory(story.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setUserStories(userStories.filter(s => s.id !== story.id))}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getFilteredStories().length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                사용자 스토리가 없습니다
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                새로운 사용자 스토리를 추가하여 기능을 정의하세요.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'api' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* API Controls */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddAPIForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              API 엔드포인트 추가
            </button>
          </div>

          {/* API Endpoints */}
          <div className="space-y-4">
            {apiEndpoints.map((api) => (
              <div
                key={api.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium ${getMethodColor(api.method)}`}>
                        {api.method}
                      </span>
                      <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {api.endpoint}
                      </code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{api.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingAPI(api.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setApiEndpoints(apiEndpoints.filter(a => a.id !== api.id))}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Parameters */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">파라미터</h4>
                    <div className="space-y-2">
                      {api.parameters.map((param, index) => (
                        <div key={index} className="flex items-center space-x-3 text-sm">
                          <code className="font-mono text-blue-600 dark:text-blue-400">
                            {param.name}
                          </code>
                          <span className="text-gray-500">{param.type}</span>
                          {param.required && (
                            <span className="text-red-500 text-xs">*</span>
                          )}
                          <span className="text-gray-600 dark:text-gray-400 flex-1">
                            {param.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Responses */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">응답</h4>
                    <div className="space-y-3">
                      {api.responses.map((response, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              response.statusCode >= 200 && response.statusCode < 300
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : response.statusCode >= 400
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}>
                              {response.statusCode}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {response.description}
                            </span>
                          </div>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                            <code>{response.example}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Related Stories */}
                {api.relatedStories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">관련 스토리</h4>
                    <div className="flex flex-wrap gap-2">
                      {api.relatedStories.map(storyId => {
                        const story = userStories.find(s => s.id === storyId)
                        return story ? (
                          <span key={storyId} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <ArrowsRightLeftIcon className="w-3 h-3 mr-1" />
                            {story.title}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {apiEndpoints.length === 0 && (
            <div className="text-center py-12">
              <CodeBracketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                API 엔드포인트가 없습니다
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                새로운 API 엔드포인트를 추가하여 인터페이스를 설계하세요.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}