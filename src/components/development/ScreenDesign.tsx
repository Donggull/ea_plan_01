'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ComputerDesktopIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  RectangleStackIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ArrowsPointingOutIcon,
  LinkIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

interface Wireframe {
  id: string
  title: string
  description: string
  type: 'wireframe' | 'mockup' | 'prototype'
  device: 'desktop' | 'tablet' | 'mobile'
  status: 'draft' | 'review' | 'approved' | 'archived'
  imageUrl?: string
  figmaUrl?: string
  userFlow?: string
  components: Component[]
  interactions: Interaction[]
  notes: Note[]
  version: string
  createdAt: string
  updatedAt: string
  createdBy: string
  tags: string[]
  isFavorite: boolean
}

interface Component {
  id: string
  name: string
  type: 'header' | 'navigation' | 'content' | 'sidebar' | 'footer' | 'form' | 'button' | 'card' | 'modal'
  description: string
  specifications: string[]
}

interface Interaction {
  id: string
  trigger: string
  action: string
  result: string
}

interface Note {
  id: string
  content: string
  author: string
  timestamp: string
  resolved: boolean
}

interface ScreenDesignProps {
  projectId: string
}

export default function ScreenDesign({ projectId }: ScreenDesignProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'wireframe' | 'mockup' | 'prototype'>('all')
  const [selectedDevice, setSelectedDevice] = useState<'all' | 'desktop' | 'tablet' | 'mobile'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'review' | 'approved' | 'archived'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingWireframe, setEditingWireframe] = useState<string | null>(null)
  const [selectedWireframe, setSelectedWireframe] = useState<Wireframe | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [wireframes, setWireframes] = useState<Wireframe[]>([
    {
      id: '1',
      title: '메인 페이지 (데스크톱)',
      description: '홈페이지 메인 화면 디자인 - 히어로 섹션, 주요 기능 소개, CTA 버튼 포함',
      type: 'wireframe',
      device: 'desktop',
      status: 'approved',
      imageUrl: '/wireframes/main-desktop.png',
      figmaUrl: 'https://figma.com/file/abc123',
      userFlow: 'main-flow',
      components: [
        {
          id: '1',
          name: '상단 네비게이션',
          type: 'navigation',
          description: '로고, 메인 메뉴, 로그인/회원가입 버튼',
          specifications: [
            '높이: 80px',
            '배경색: 흰색',
            '로고: 좌측 정렬',
            '메뉴: 중앙 정렬',
            '로그인 버튼: 우측 정렬'
          ]
        },
        {
          id: '2',
          name: '히어로 섹션',
          type: 'content',
          description: '메인 타이틀, 서브 타이틀, CTA 버튼',
          specifications: [
            '높이: 600px',
            '배경: 그라디언트',
            '타이틀: 48px 볼드',
            '서브 타이틀: 18px 레귤러',
            'CTA 버튼: 16px 미디움'
          ]
        }
      ],
      interactions: [
        {
          id: '1',
          trigger: 'CTA 버튼 클릭',
          action: '회원가입 페이지로 이동',
          result: '새 탭에서 회원가입 폼 표시'
        },
        {
          id: '2',
          trigger: '로고 클릭',
          action: '메인 페이지로 이동',
          result: '페이지 새로고침'
        }
      ],
      notes: [
        {
          id: '1',
          content: '히어로 섹션의 CTA 버튼 색상을 브랜드 컬러로 변경 필요',
          author: '박디자이너',
          timestamp: '2024-08-20 14:30',
          resolved: false
        },
        {
          id: '2',
          content: '모바일 버전에서 네비게이션 메뉴를 햄버거 메뉴로 변경했습니다',
          author: '김개발자',
          timestamp: '2024-08-19 09:15',
          resolved: true
        }
      ],
      version: '1.2',
      createdAt: '2024-08-15',
      updatedAt: '2024-08-20',
      createdBy: '박디자이너',
      tags: ['main', 'hero', 'navigation'],
      isFavorite: true
    },
    {
      id: '2',
      title: '로그인 페이지 (모바일)',
      description: '모바일 로그인 화면 - 이메일/패스워드 폼, 소셜 로그인 옵션',
      type: 'mockup',
      device: 'mobile',
      status: 'review',
      imageUrl: '/wireframes/login-mobile.png',
      figmaUrl: 'https://figma.com/file/def456',
      userFlow: 'auth-flow',
      components: [
        {
          id: '1',
          name: '헤더',
          type: 'header',
          description: '뒤로가기 버튼, 페이지 타이틀',
          specifications: [
            '높이: 56px',
            '뒤로가기 버튼: 24px 아이콘',
            '타이틀: 18px 미디움 중앙 정렬'
          ]
        },
        {
          id: '2',
          name: '로그인 폼',
          type: 'form',
          description: '이메일, 패스워드 입력 필드, 로그인 버튼',
          specifications: [
            '입력 필드: 48px 높이',
            '버튼: 48px 높이, 전체 너비',
            '패딩: 16px',
            '마진: 8px'
          ]
        }
      ],
      interactions: [
        {
          id: '1',
          trigger: '로그인 버튼 클릭',
          action: '로그인 API 호출',
          result: '성공 시 메인 페이지로 이동'
        }
      ],
      notes: [
        {
          id: '1',
          content: '비밀번호 찾기 링크 추가 필요',
          author: '이기획자',
          timestamp: '2024-08-21 11:20',
          resolved: false
        }
      ],
      version: '1.0',
      createdAt: '2024-08-18',
      updatedAt: '2024-08-21',
      createdBy: '박디자이너',
      tags: ['auth', 'mobile', 'form'],
      isFavorite: false
    },
    {
      id: '3',
      title: '상품 목록 (태블릿)',
      description: '태블릿용 상품 목록 화면 - 그리드 레이아웃, 필터 사이드바',
      type: 'prototype',
      device: 'tablet',
      status: 'draft',
      imageUrl: '/wireframes/products-tablet.png',
      figmaUrl: 'https://figma.com/file/ghi789',
      userFlow: 'shopping-flow',
      components: [
        {
          id: '1',
          name: '필터 사이드바',
          type: 'sidebar',
          description: '카테고리, 가격, 브랜드 필터',
          specifications: [
            '너비: 280px',
            '배경: 회색',
            '패딩: 24px'
          ]
        },
        {
          id: '2',
          name: '상품 그리드',
          type: 'content',
          description: '3x4 그리드 레이아웃으로 상품 카드 배치',
          specifications: [
            '그리드: 3열',
            '간격: 16px',
            '카드 높이: 320px'
          ]
        }
      ],
      interactions: [
        {
          id: '1',
          trigger: '필터 선택',
          action: '상품 목록 필터링',
          result: '조건에 맞는 상품만 표시'
        }
      ],
      notes: [],
      version: '0.8',
      createdAt: '2024-08-22',
      updatedAt: '2024-08-22',
      createdBy: '최UI',
      tags: ['products', 'tablet', 'grid'],
      isFavorite: false
    }
  ])

  const getFilteredWireframes = () => {
    let filtered = wireframes

    if (activeTab !== 'all') {
      filtered = filtered.filter(w => w.type === activeTab)
    }

    if (selectedDevice !== 'all') {
      filtered = filtered.filter(w => w.device === selectedDevice)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(w => w.status === selectedStatus)
    }

    return filtered
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wireframe': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      case 'mockup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'prototype': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'draft': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <ComputerDesktopIcon className="w-4 h-4" />
      case 'tablet': return <DeviceTabletIcon className="w-4 h-4" />
      case 'mobile': return <DevicePhoneMobileIcon className="w-4 h-4" />
      default: return <ComputerDesktopIcon className="w-4 h-4" />
    }
  }

  const toggleFavorite = (wireframeId: string) => {
    setWireframes(wireframes.map(w => 
      w.id === wireframeId ? { ...w, isFavorite: !w.isFavorite } : w
    ))
  }

  const tabs = [
    { id: 'all', label: '전체', count: wireframes.length },
    { id: 'wireframe', label: '와이어프레임', count: wireframes.filter(w => w.type === 'wireframe').length },
    { id: 'mockup', label: '목업', count: wireframes.filter(w => w.type === 'mockup').length },
    { id: 'prototype', label: '프로토타입', count: wireframes.filter(w => w.type === 'prototype').length }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          화면 설계
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          와이어프레임부터 프로토타입까지 체계적인 UI/UX 설계를 관리합니다
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              디바이스
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">전체</option>
              <option value="desktop">데스크톱</option>
              <option value="tablet">태블릿</option>
              <option value="mobile">모바일</option>
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
              <option value="draft">초안</option>
              <option value="review">검토중</option>
              <option value="approved">승인됨</option>
              <option value="archived">보관됨</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <RectangleStackIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          화면 설계 추가
        </button>
      </div>

      {/* Wireframes Grid/List */}
      <motion.div
        key={`${activeTab}-${selectedDevice}-${selectedStatus}-${viewMode}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredWireframes().map((wireframe) => (
              <WireframeCard
                key={wireframe.id}
                wireframe={wireframe}
                onView={() => setSelectedWireframe(wireframe)}
                onEdit={() => setEditingWireframe(wireframe.id)}
                onDelete={() => setWireframes(wireframes.filter(w => w.id !== wireframe.id))}
                onToggleFavorite={() => toggleFavorite(wireframe.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredWireframes().map((wireframe) => (
              <WireframeListItem
                key={wireframe.id}
                wireframe={wireframe}
                onView={() => setSelectedWireframe(wireframe)}
                onEdit={() => setEditingWireframe(wireframe.id)}
                onDelete={() => setWireframes(wireframes.filter(w => w.id !== wireframe.id))}
                onToggleFavorite={() => toggleFavorite(wireframe.id)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {getFilteredWireframes().length === 0 && (
        <div className="text-center py-12">
          <ComputerDesktopIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            화면 설계가 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            새로운 와이어프레임이나 목업을 추가하여 설계를 시작하세요.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedWireframe && (
        <WireframeDetailModal
          wireframe={selectedWireframe}
          onClose={() => setSelectedWireframe(null)}
        />
      )}
    </div>
  )
}

function WireframeCard({
  wireframe,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite
}: {
  wireframe: Wireframe
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wireframe': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      case 'mockup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'prototype': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'draft': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <ComputerDesktopIcon className="w-4 h-4" />
      case 'tablet': return <DeviceTabletIcon className="w-4 h-4" />
      case 'mobile': return <DevicePhoneMobileIcon className="w-4 h-4" />
      default: return <ComputerDesktopIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {wireframe.imageUrl ? (
            <img src={wireframe.imageUrl} alt={wireframe.title} className="w-full h-full object-cover" />
          ) : (
            <PhotoIcon className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <button
          onClick={onToggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          {wireframe.isFavorite ? (
            <HeartIconSolid className="w-4 h-4 text-red-500" />
          ) : (
            <HeartIcon className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(wireframe.type)}`}>
              {getDeviceIcon(wireframe.device)}
              <span>{wireframe.type === 'wireframe' ? '와이어프레임' : wireframe.type === 'mockup' ? '목업' : '프로토타입'}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(wireframe.status)}`}>
              {wireframe.status === 'approved' ? '승인됨' : 
               wireframe.status === 'review' ? '검토중' : 
               wireframe.status === 'draft' ? '초안' : '보관됨'}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">v{wireframe.version}</span>
        </div>

        <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">
          {wireframe.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {wireframe.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {wireframe.createdBy} • {wireframe.updatedAt}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={onView}
              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="자세히 보기"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            {wireframe.figmaUrl && (
              <a
                href={wireframe.figmaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                title="Figma에서 보기"
              >
                <LinkIcon className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="편집"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
              title="삭제"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function WireframeListItem({
  wireframe,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite
}: {
  wireframe: Wireframe
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wireframe': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      case 'mockup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'prototype': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'draft': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <ComputerDesktopIcon className="w-4 h-4" />
      case 'tablet': return <DeviceTabletIcon className="w-4 h-4" />
      case 'mobile': return <DevicePhoneMobileIcon className="w-4 h-4" />
      default: return <ComputerDesktopIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-24 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
            {wireframe.imageUrl ? (
              <img src={wireframe.imageUrl} alt={wireframe.title} className="w-full h-full object-cover rounded" />
            ) : (
              <PhotoIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {wireframe.title}
              </h3>
              <button onClick={onToggleFavorite}>
                {wireframe.isFavorite ? (
                  <HeartIconSolid className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {wireframe.description}
            </p>

            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(wireframe.type)}`}>
                {getDeviceIcon(wireframe.device)}
                <span>{wireframe.type === 'wireframe' ? '와이어프레임' : wireframe.type === 'mockup' ? '목업' : '프로토타입'}</span>
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(wireframe.status)}`}>
                {wireframe.status === 'approved' ? '승인됨' : 
                 wireframe.status === 'review' ? '검토중' : 
                 wireframe.status === 'draft' ? '초안' : '보관됨'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">v{wireframe.version}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {wireframe.createdBy} • {wireframe.updatedAt}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onView}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="자세히 보기"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {wireframe.figmaUrl && (
            <a
              href={wireframe.figmaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              title="Figma에서 보기"
            >
              <LinkIcon className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="편집"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="삭제"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function WireframeDetailModal({
  wireframe,
  onClose
}: {
  wireframe: Wireframe
  onClose: () => void
}) {
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'components' | 'interactions' | 'notes'>('overview')

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {wireframe.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: '개요' },
              { id: 'components', label: '컴포넌트' },
              { id: 'interactions', label: '인터랙션' },
              { id: 'notes', label: '노트' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeDetailTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeDetailTab === 'overview' && (
            <div className="space-y-6">
              {wireframe.imageUrl && (
                <div>
                  <img src={wireframe.imageUrl} alt={wireframe.title} className="w-full rounded-lg border border-gray-200 dark:border-gray-700" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">기본 정보</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">유형:</dt>
                      <dd className="text-gray-900 dark:text-white">{wireframe.type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">디바이스:</dt>
                      <dd className="text-gray-900 dark:text-white">{wireframe.device}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">상태:</dt>
                      <dd className="text-gray-900 dark:text-white">{wireframe.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">버전:</dt>
                      <dd className="text-gray-900 dark:text-white">{wireframe.version}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">메타데이터</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">생성자:</dt>
                      <dd className="text-gray-900 dark:text-white">{wireframe.createdBy}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">생성일:</dt>
                      <dd className="text-gray-900 dark:text-white">{wireframe.createdAt}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">수정일:</dt>
                      <dd className="text-gray-900 dark:text-white">{wireframe.updatedAt}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">설명</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{wireframe.description}</p>
              </div>
            </div>
          )}

          {activeDetailTab === 'components' && (
            <div className="space-y-4">
              {wireframe.components.map(component => (
                <div key={component.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{component.name}</h4>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {component.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{component.description}</p>
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">상세 명세</h5>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {component.specifications.map((spec, index) => (
                        <li key={index}>• {spec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeDetailTab === 'interactions' && (
            <div className="space-y-4">
              {wireframe.interactions.map(interaction => (
                <div key={interaction.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1">트리거</h5>
                      <p className="text-gray-600 dark:text-gray-400">{interaction.trigger}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1">액션</h5>
                      <p className="text-gray-600 dark:text-gray-400">{interaction.action}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1">결과</h5>
                      <p className="text-gray-600 dark:text-gray-400">{interaction.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeDetailTab === 'notes' && (
            <div className="space-y-4">
              {wireframe.notes.map(note => (
                <div key={note.id} className={`border rounded-lg p-4 ${
                  note.resolved 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                    : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white mb-2">{note.content}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{note.author}</span>
                        <span>•</span>
                        <span>{note.timestamp}</span>
                        {note.resolved && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 dark:text-green-400">해결됨</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChatBubbleLeftRightIcon className={`w-4 h-4 ${
                      note.resolved 
                        ? 'text-green-500' 
                        : 'text-yellow-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}