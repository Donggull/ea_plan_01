'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BeakerIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BugAntIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  LinkIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  XCircleIcon as XCircleIconSolid 
} from '@heroicons/react/24/solid'

interface TestCase {
  id: string
  title: string
  description: string
  type: 'unit' | 'integration' | 'e2e' | 'manual' | 'performance' | 'security'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'inactive' | 'deprecated'
  lastRun?: string
  lastResult?: 'pass' | 'fail' | 'skip'
  steps: TestStep[]
  expectedResult: string
  actualResult?: string
  assignee?: string
  automationStatus: 'manual' | 'automated' | 'in-progress'
  tags: string[]
  relatedRequirements: string[]
  estimatedTime: number
  actualTime?: number
}

interface TestStep {
  id: string
  stepNumber: number
  description: string
  expected: string
  actual?: string
  status?: 'pass' | 'fail' | 'skip'
}

interface Bug {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'rejected'
  type: 'bug' | 'enhancement' | 'task'
  assignee?: string
  reporter: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  environment: string
  browser?: string
  os?: string
  stepsToReproduce: string[]
  expectedBehavior: string
  actualBehavior: string
  relatedTestCase?: string
  attachments: string[]
  tags: string[]
}

interface TestPlan {
  id: string
  name: string
  description: string
  version: string
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  testCases: string[]
  coverage: number
  passRate: number
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
}

interface QAManagerProps {
  projectId: string
}

export default function QAManager({ projectId }: QAManagerProps) {
  const [activeTab, setActiveTab] = useState<'testcases' | 'bugs' | 'testplans' | 'reports'>('testcases')
  const [selectedType, setSelectedType] = useState<'all' | 'unit' | 'integration' | 'e2e' | 'manual'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all')
  const [showAddTestForm, setShowAddTestForm] = useState(false)
  const [showAddBugForm, setShowAddBugForm] = useState(false)
  const [editingTest, setEditingTest] = useState<string | null>(null)
  const [editingBug, setEditingBug] = useState<string | null>(null)
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)

  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: '1',
      title: '사용자 로그인 기능 테스트',
      description: '유효한 이메일과 비밀번호로 로그인이 정상적으로 동작하는지 확인',
      type: 'manual',
      priority: 'high',
      status: 'active',
      lastRun: '2024-08-20',
      lastResult: 'pass',
      steps: [
        {
          id: '1-1',
          stepNumber: 1,
          description: '로그인 페이지에 접속한다',
          expected: '로그인 폼이 표시된다',
          actual: '로그인 폼이 정상 표시됨',
          status: 'pass'
        },
        {
          id: '1-2',
          stepNumber: 2,
          description: '유효한 이메일과 비밀번호를 입력한다',
          expected: '입력 필드에 값이 입력된다',
          actual: '정상 입력됨',
          status: 'pass'
        },
        {
          id: '1-3',
          stepNumber: 3,
          description: '로그인 버튼을 클릭한다',
          expected: '메인 페이지로 리다이렉트된다',
          actual: '메인 페이지로 정상 이동',
          status: 'pass'
        }
      ],
      expectedResult: '사용자가 정상적으로 로그인되고 메인 페이지로 이동',
      actualResult: '예상대로 동작함',
      assignee: '김테스터',
      automationStatus: 'in-progress',
      tags: ['login', 'authentication', 'critical-path'],
      relatedRequirements: ['REQ-001', 'REQ-002'],
      estimatedTime: 15,
      actualTime: 12
    },
    {
      id: '2',
      title: '비밀번호 유효성 검사',
      description: '비밀번호 입력 시 유효성 검사 규칙이 적용되는지 확인',
      type: 'unit',
      priority: 'medium',
      status: 'active',
      lastRun: '2024-08-19',
      lastResult: 'fail',
      steps: [
        {
          id: '2-1',
          stepNumber: 1,
          description: '8자 미만의 비밀번호를 입력한다',
          expected: '에러 메시지가 표시된다',
          actual: '에러 메시지 미표시',
          status: 'fail'
        }
      ],
      expectedResult: '비밀번호 유효성 검사가 올바르게 동작',
      actualResult: '일부 검사 로직에 오류 발견',
      assignee: '이개발자',
      automationStatus: 'automated',
      tags: ['validation', 'password', 'security'],
      relatedRequirements: ['REQ-003'],
      estimatedTime: 30,
      actualTime: 45
    },
    {
      id: '3',
      title: '상품 검색 성능 테스트',
      description: '1000개 이상의 상품에서 검색 성능이 기준을 만족하는지 확인',
      type: 'performance',
      priority: 'high',
      status: 'active',
      lastRun: '2024-08-18',
      lastResult: 'skip',
      steps: [
        {
          id: '3-1',
          stepNumber: 1,
          description: '대량 테스트 데이터를 준비한다',
          expected: '1000개 이상의 상품 데이터 생성',
          status: 'skip'
        }
      ],
      expectedResult: '검색 응답 시간이 2초 이내',
      assignee: '박성능',
      automationStatus: 'manual',
      tags: ['performance', 'search', 'scalability'],
      relatedRequirements: ['REQ-004'],
      estimatedTime: 60
    }
  ])

  const [bugs, setBugs] = useState<Bug[]>([
    {
      id: '1',
      title: '로그인 후 프로필 이미지가 표시되지 않음',
      description: '사용자가 로그인한 후 헤더의 프로필 이미지가 깨진 이미지로 표시됨',
      severity: 'medium',
      priority: 'high',
      status: 'open',
      type: 'bug',
      assignee: '김개발자',
      reporter: '이테스터',
      createdAt: '2024-08-20',
      updatedAt: '2024-08-20',
      environment: 'staging',
      browser: 'Chrome 127',
      os: 'Windows 11',
      stepsToReproduce: [
        '1. 로그인 페이지에 접속',
        '2. 유효한 계정으로 로그인',
        '3. 헤더 영역의 프로필 아바타 확인'
      ],
      expectedBehavior: '사용자의 프로필 이미지가 정상적으로 표시되어야 함',
      actualBehavior: '깨진 이미지 아이콘이 표시됨',
      relatedTestCase: '1',
      attachments: ['screenshot1.png', 'network-log.json'],
      tags: ['ui', 'profile', 'image']
    },
    {
      id: '2',
      title: '검색 결과 페이지에서 무한 로딩',
      description: '특정 키워드로 검색 시 결과 페이지에서 로딩이 끝나지 않음',
      severity: 'high',
      priority: 'urgent',
      status: 'in-progress',
      type: 'bug',
      assignee: '박백엔드',
      reporter: '최테스터',
      createdAt: '2024-08-19',
      updatedAt: '2024-08-20',
      environment: 'production',
      browser: 'Firefox 129',
      os: 'macOS 14',
      stepsToReproduce: [
        '1. 메인 페이지에서 검색창에 "스페셜 문자@#$" 입력',
        '2. 검색 버튼 클릭',
        '3. 결과 페이지 로딩 상태 확인'
      ],
      expectedBehavior: '검색 결과가 표시되거나 "결과 없음" 메시지 표시',
      actualBehavior: '로딩 스피너가 계속 돌아가며 결과가 표시되지 않음',
      attachments: ['error-log.txt'],
      tags: ['search', 'loading', 'performance']
    },
    {
      id: '3',
      title: '모바일에서 네비게이션 메뉴 개선',
      description: '모바일 환경에서 햄버거 메뉴의 사용성 개선 필요',
      severity: 'low',
      priority: 'medium',
      status: 'resolved',
      type: 'enhancement',
      assignee: '정디자이너',
      reporter: '김기획자',
      createdAt: '2024-08-15',
      updatedAt: '2024-08-18',
      resolvedAt: '2024-08-18',
      environment: 'staging',
      browser: 'Safari Mobile',
      os: 'iOS 17',
      stepsToReproduce: [
        '1. 모바일 브라우저에서 사이트 접속',
        '2. 햄버거 메뉴 버튼 클릭',
        '3. 메뉴 항목들의 터치 반응성 확인'
      ],
      expectedBehavior: '메뉴 항목들이 터치에 즉시 반응해야 함',
      actualBehavior: '터치 반응이 느리고 메뉴 간격이 좁아 잘못 선택하기 쉬움',
      attachments: [],
      tags: ['mobile', 'ux', 'navigation']
    }
  ])

  const [testPlans] = useState<TestPlan[]>([
    {
      id: '1',
      name: '스프린트 3 테스트 계획',
      description: '사용자 인증 및 프로필 관리 기능 테스트',
      version: '1.3.0',
      startDate: '2024-08-20',
      endDate: '2024-08-25',
      status: 'active',
      testCases: ['1', '2'],
      coverage: 85,
      passRate: 75,
      totalTests: 8,
      passedTests: 6,
      failedTests: 1,
      skippedTests: 1
    },
    {
      id: '2',
      name: '검색 기능 테스트 계획',
      description: '상품 검색 및 필터링 기능 테스트',
      version: '1.4.0',
      startDate: '2024-08-26',
      endDate: '2024-08-30',
      status: 'planning',
      testCases: ['3'],
      coverage: 60,
      passRate: 0,
      totalTests: 12,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0
    }
  ])

  const getFilteredTestCases = () => {
    let filtered = testCases

    if (selectedType !== 'all') {
      filtered = filtered.filter(tc => tc.type === selectedType)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(tc => tc.status === selectedStatus)
    }

    return filtered
  }

  const getFilteredBugs = () => {
    let filtered = bugs

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(bug => bug.severity === selectedSeverity)
    }

    return filtered
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'unit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'integration': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'e2e': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'manual': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'performance': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'security': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'pass': return 'text-green-600'
      case 'fail': return 'text-red-600'
      case 'skip': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getResultIcon = (result?: string) => {
    switch (result) {
      case 'pass': return <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
      case 'fail': return <XCircleIconSolid className="w-5 h-5 text-red-500" />
      case 'skip': return <ExclamationTriangleIconSolid className="w-5 h-5 text-yellow-500" />
      default: return <div className="w-5 h-5 bg-gray-300 rounded-full" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getBugStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      case 'rejected': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getBugTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <BugAntIcon className="w-4 h-4" />
      case 'enhancement': return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'task': return <ClipboardDocumentListIcon className="w-4 h-4" />
      default: return <BugAntIcon className="w-4 h-4" />
    }
  }

  const tabs = [
    { id: 'testcases', label: '테스트 케이스', icon: BeakerIcon, count: testCases.length },
    { id: 'bugs', label: '버그 관리', icon: BugAntIcon, count: bugs.filter(b => b.status !== 'closed').length },
    { id: 'testplans', label: '테스트 계획', icon: ClipboardDocumentListIcon, count: testPlans.length },
    { id: 'reports', label: '품질 리포트', icon: ChartBarIcon, count: 0 }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          QA 관리
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          테스트 케이스 관리부터 버그 추적까지 체계적인 품질 관리를 수행합니다
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">총 테스트</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{testCases.length}</p>
            </div>
            <BeakerIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">통과율</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round((testCases.filter(tc => tc.lastResult === 'pass').length / testCases.length) * 100)}%
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">열린 버그</p>
              <p className="text-2xl font-bold text-red-600">
                {bugs.filter(bug => bug.status === 'open' || bug.status === 'in-progress').length}
              </p>
            </div>
            <BugAntIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">자동화율</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((testCases.filter(tc => tc.automationStatus === 'automated').length / testCases.length) * 100)}%
              </p>
            </div>
            <ArrowPathIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
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
                <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {activeTab === 'testcases' && (
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
                  테스트 유형
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">전체</option>
                  <option value="unit">단위 테스트</option>
                  <option value="integration">통합 테스트</option>
                  <option value="e2e">E2E 테스트</option>
                  <option value="manual">수동 테스트</option>
                  <option value="performance">성능 테스트</option>
                  <option value="security">보안 테스트</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  상태
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">전체</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowAddTestForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              테스트 케이스 추가
            </button>
          </div>

          {/* Test Cases Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredTestCases().map((testCase) => (
              <div
                key={testCase.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {testCase.title}
                      </h3>
                      {getResultIcon(testCase.lastResult)}
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(testCase.type)}`}>
                        {testCase.type === 'unit' ? '단위' :
                         testCase.type === 'integration' ? '통합' :
                         testCase.type === 'e2e' ? 'E2E' :
                         testCase.type === 'manual' ? '수동' :
                         testCase.type === 'performance' ? '성능' : '보안'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {testCase.priority === 'critical' ? '긴급' :
                         testCase.priority === 'high' ? '높음' :
                         testCase.priority === 'medium' ? '보통' : '낮음'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {testCase.estimatedTime}분
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {testCase.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedTestCase(testCase)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="자세히 보기"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingTest(testCase.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="편집"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTestCases(testCases.filter(tc => tc.id !== testCase.id))}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="삭제"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      {testCase.assignee && (
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{testCase.assignee}</span>
                        </div>
                      )}
                      {testCase.lastRun && (
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{testCase.lastRun}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {testCase.automationStatus === 'automated' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          자동화됨
                        </span>
                      ) : testCase.automationStatus === 'in-progress' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          자동화 중
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                          수동
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'bugs' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  심각도
                </label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">전체</option>
                  <option value="critical">치명적</option>
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowAddBugForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              버그 신고
            </button>
          </div>

          {/* Bugs List */}
          <div className="space-y-4">
            {getFilteredBugs().map((bug) => (
              <div
                key={bug.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 pt-1">
                      {getBugTypeIcon(bug.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          #{bug.id} {bug.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(bug.severity)}`}>
                          {bug.severity === 'critical' ? '치명적' :
                           bug.severity === 'high' ? '높음' :
                           bug.severity === 'medium' ? '보통' : '낮음'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBugStatusColor(bug.status)}`}>
                          {bug.status === 'open' ? '열림' :
                           bug.status === 'in-progress' ? '진행중' :
                           bug.status === 'resolved' ? '해결됨' :
                           bug.status === 'closed' ? '닫힘' : '거부됨'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {bug.description}
                      </p>

                      <div className="flex items-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-3 h-3" />
                          <span>신고: {bug.reporter}</span>
                        </div>
                        {bug.assignee && (
                          <div className="flex items-center space-x-1">
                            <UserIcon className="w-3 h-3" />
                            <span>담당: {bug.assignee}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{bug.createdAt}</span>
                        </div>
                        <span>{bug.environment}</span>
                        {bug.browser && <span>{bug.browser}</span>}
                      </div>

                      {bug.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {bug.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingBug(bug.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="편집"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setBugs(bugs.filter(b => b.id !== bug.id))}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="삭제"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'testplans' && (
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
              테스트 계획 추가
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {plan.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>v{plan.version}</span>
                      <span>{plan.startDate} - {plan.endDate}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plan.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    plan.status === 'planning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    plan.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {plan.status === 'active' ? '진행중' :
                     plan.status === 'planning' ? '계획중' :
                     plan.status === 'completed' ? '완료' : '취소'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">커버리지:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">{plan.coverage}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">통과율:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">{plan.passRate}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <div className="font-medium text-green-600">{plan.passedTests}</div>
                      <div className="text-green-500">통과</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      <div className="font-medium text-red-600">{plan.failedTests}</div>
                      <div className="text-red-500">실패</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      <div className="font-medium text-yellow-600">{plan.skippedTests}</div>
                      <div className="text-yellow-500">건너뜀</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'reports' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            품질 리포트
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            상세한 품질 리포트 기능은 개발 중입니다. 곧 제공될 예정입니다.
          </p>
        </motion.div>
      )}

      {/* Test Case Detail Modal */}
      {selectedTestCase && (
        <TestCaseDetailModal
          testCase={selectedTestCase}
          onClose={() => setSelectedTestCase(null)}
        />
      )}
    </div>
  )
}

function TestCaseDetailModal({
  testCase,
  onClose
}: {
  testCase: TestCase
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {testCase.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">기본 정보</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">유형:</dt>
                  <dd className="text-gray-900 dark:text-white">{testCase.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">우선순위:</dt>
                  <dd className="text-gray-900 dark:text-white">{testCase.priority}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">상태:</dt>
                  <dd className="text-gray-900 dark:text-white">{testCase.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">담당자:</dt>
                  <dd className="text-gray-900 dark:text-white">{testCase.assignee || '미배정'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">실행 정보</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">마지막 실행:</dt>
                  <dd className="text-gray-900 dark:text-white">{testCase.lastRun || '없음'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">결과:</dt>
                  <dd className="text-gray-900 dark:text-white">{testCase.lastResult || '없음'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">예상 시간:</dt>
                  <dd className="text-gray-900 dark:text-white">{testCase.estimatedTime}분</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">실제 시간:</dt>
                  <dd className="text-gray-900 dark:text-white">{testCase.actualTime || '-'}분</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">설명</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{testCase.description}</p>
          </div>

          {/* Test Steps */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">테스트 단계</h3>
            <div className="space-y-3">
              {testCase.steps.map((step) => (
                <div key={step.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {step.stepNumber}. {step.description}
                    </div>
                    {step.status && (
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        step.status === 'pass' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        step.status === 'fail' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {step.status === 'pass' ? '통과' : step.status === 'fail' ? '실패' : '건너뜀'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">예상 결과:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{step.expected}</p>
                    </div>
                    {step.actual && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">실제 결과:</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{step.actual}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected vs Actual Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">예상 결과</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                {testCase.expectedResult}
              </p>
            </div>
            {testCase.actualResult && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">실제 결과</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  {testCase.actualResult}
                </p>
              </div>
            )}
          </div>

          {/* Tags and Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testCase.tags.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {testCase.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {testCase.relatedRequirements.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">관련 요구사항</h3>
                <div className="flex flex-wrap gap-2">
                  {testCase.relatedRequirements.map(req => (
                    <span key={req} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {}}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            테스트 실행
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}