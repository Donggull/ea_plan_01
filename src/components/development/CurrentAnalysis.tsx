'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface AnalysisItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'system' | 'user' | 'business' | 'technical'
}

interface CurrentAnalysisProps {
  projectId: string
}

export default function CurrentAnalysis({ projectId: _projectId }: CurrentAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'problems' | 'solutions'>('current')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<Partial<AnalysisItem>>({})
  const [showAddForm, setShowAddForm] = useState(false)

  const [currentStatus, setCurrentStatus] = useState<AnalysisItem[]>([
    {
      id: '1',
      title: '레거시 시스템 운영',
      description: '현재 PHP 기반의 웹사이트로 5년 이상 운영 중이며, 반응형 디자인이 적용되지 않음',
      priority: 'high',
      category: 'system'
    },
    {
      id: '2',
      title: '사용자 인터페이스 노후화',
      description: 'UI/UX가 최신 트렌드를 반영하지 못하며, 모바일 사용성이 떨어짐',
      priority: 'high',
      category: 'user'
    },
    {
      id: '3',
      title: '트래픽 증가 추세',
      description: '월 방문자 수가 지속적으로 증가하고 있어 성능 개선이 필요한 상황',
      priority: 'medium',
      category: 'business'
    }
  ])

  const [problems, setProblems] = useState<AnalysisItem[]>([
    {
      id: '1',
      title: '모바일 최적화 부족',
      description: '모바일 트래픽이 전체의 70%임에도 모바일 경험이 최적화되지 않음',
      priority: 'high',
      category: 'user'
    },
    {
      id: '2',
      title: '페이지 로딩 속도 저하',
      description: '평균 로딩 시간이 5초 이상으로 사용자 이탈률이 높음',
      priority: 'high',
      category: 'technical'
    },
    {
      id: '3',
      title: '콘텐츠 관리의 어려움',
      description: 'CMS가 없어 콘텐츠 업데이트마다 개발자의 도움이 필요',
      priority: 'medium',
      category: 'business'
    }
  ])

  const [solutions, setSolutions] = useState<AnalysisItem[]>([
    {
      id: '1',
      title: '반응형 웹 디자인 적용',
      description: '모든 디바이스에서 최적화된 사용자 경험을 제공하는 반응형 디자인 구현',
      priority: 'high',
      category: 'user'
    },
    {
      id: '2',
      title: 'Next.js 기반 성능 최적화',
      description: 'SSR/SSG, 이미지 최적화, 코드 스플리팅을 통한 성능 개선',
      priority: 'high',
      category: 'technical'
    },
    {
      id: '3',
      title: 'Headless CMS 도입',
      description: '관리자가 쉽게 콘텐츠를 관리할 수 있는 CMS 시스템 구축',
      priority: 'medium',
      category: 'business'
    }
  ])

  const tabs = [
    { id: 'current', label: '현재 상황', icon: ChartBarIcon, color: 'blue' },
    { id: 'problems', label: '문제점', icon: ExclamationTriangleIcon, color: 'red' },
    { id: 'solutions', label: '개선 방안', icon: LightBulbIcon, color: 'green' }
  ]

  const getCurrentData = () => {
    switch (activeTab) {
      case 'current': return currentStatus
      case 'problems': return problems
      case 'solutions': return solutions
      default: return []
    }
  }

  const setCurrentData = (data: AnalysisItem[]) => {
    switch (activeTab) {
      case 'current': setCurrentStatus(data); break
      case 'problems': setProblems(data); break
      case 'solutions': setSolutions(data); break
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'user': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'business': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'technical': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const handleAddItem = () => {
    if (newItem.title && newItem.description) {
      const item: AnalysisItem = {
        id: Date.now().toString(),
        title: newItem.title,
        description: newItem.description,
        priority: newItem.priority || 'medium',
        category: newItem.category || 'system'
      }
      const currentData = getCurrentData()
      setCurrentData([...currentData, item])
      setNewItem({})
      setShowAddForm(false)
    }
  }

  const handleEditItem = (id: string, updates: Partial<AnalysisItem>) => {
    const currentData = getCurrentData()
    setCurrentData(currentData.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
    setEditingItem(null)
  }

  const handleDeleteItem = (id: string) => {
    const currentData = getCurrentData()
    setCurrentData(currentData.filter(item => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          현황 분석
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          현재 시스템 상황을 분석하고 문제점을 도출하여 개선 방안을 제시합니다
        </p>
      </div>

      {/* Tab Navigation */}
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
                    ? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400`
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{tab.label}</span>
                <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-100 text-${tab.color}-600 dark:bg-${tab.color}-900/30 dark:text-${tab.color}-400`
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {getCurrentData().length}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Add Item Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            항목 추가
          </button>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={newItem.title || ''}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="항목 제목을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  설명
                </label>
                <textarea
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="상세 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    우선순위
                  </label>
                  <select
                    value={newItem.priority || 'medium'}
                    onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    카테고리
                  </label>
                  <select
                    value={newItem.category || 'system'}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="system">시스템</option>
                    <option value="user">사용자</option>
                    <option value="business">비즈니스</option>
                    <option value="technical">기술</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewItem({})
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  취소
                </button>
                <button
                  onClick={handleAddItem}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          {getCurrentData().map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              {editingItem === item.id ? (
                <EditItemForm
                  item={item}
                  onSave={(updates) => handleEditItem(item.id, updates)}
                  onCancel={() => setEditingItem(null)}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority === 'high' ? '높음' : item.priority === 'medium' ? '보통' : '낮음'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category === 'system' ? '시스템' : 
                         item.category === 'user' ? '사용자' : 
                         item.category === 'business' ? '비즈니스' : '기술'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingItem(item.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {getCurrentData().length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              등록된 항목이 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              새로운 항목을 추가하여 분석을 시작하세요.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function EditItemForm({ 
  item, 
  onSave, 
  onCancel 
}: { 
  item: AnalysisItem
  onSave: (updates: Partial<AnalysisItem>) => void
  onCancel: () => void
}) {
  const [editData, setEditData] = useState<AnalysisItem>(item)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          제목
        </label>
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          설명
        </label>
        <textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            우선순위
          </label>
          <select
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            카테고리
          </label>
          <select
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="system">시스템</option>
            <option value="user">사용자</option>
            <option value="business">비즈니스</option>
            <option value="technical">기술</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <XMarkIcon className="w-4 h-4 mr-1" />
          취소
        </button>
        <button
          onClick={() => onSave(editData)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          저장
        </button>
      </div>
    </div>
  )
}