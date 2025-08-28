'use client'

import { useState } from 'react'
import {
  DocumentTextIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline'
import type { RFPAnalysisResult } from './RFPUpload'

interface RFPAnalysisProps {
  analysis: RFPAnalysisResult
  onSave: (updatedAnalysis: RFPAnalysisResult) => void
  onReanalyze?: () => void
  isEditable?: boolean
}

export default function RFPAnalysis({
  analysis,
  onSave,
  onReanalyze,
  isEditable = true,
}: RFPAnalysisProps) {
  const [editingAnalysis, setEditingAnalysis] = useState<RFPAnalysisResult>(analysis)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string>('')

  const startEditing = (section: string, value: string | string[]) => {
    setEditingSection(section)
    setTempValue(Array.isArray(value) ? value.join('\n') : value)
  }

  const saveEdit = () => {
    if (!editingSection) return

    const updatedAnalysis = { ...editingAnalysis }
    
    if (editingSection.includes('.')) {
      const [parent, child] = editingSection.split('.')
      if (parent === 'budget') {
        ;(updatedAnalysis.budget as any)[child] = child === 'currency' ? tempValue : Number(tempValue) || 0
      } else {
        ;(updatedAnalysis as any)[parent][child] = tempValue.split('\n').filter(Boolean)
      }
    } else if (editingSection === 'deliverables' || editingSection === 'riskFactors' || editingSection === 'keyPoints') {
      ;(updatedAnalysis as any)[editingSection] = tempValue.split('\n').filter(Boolean)
    } else {
      ;(updatedAnalysis as any)[editingSection] = tempValue
    }

    setEditingAnalysis(updatedAnalysis)
    setEditingSection(null)
    setTempValue('')
  }

  const cancelEdit = () => {
    setEditingSection(null)
    setTempValue('')
  }

  const handleSave = () => {
    onSave(editingAnalysis)
  }

  const EditableField = ({
    label,
    value,
    sectionKey,
    multiline = false,
    icon,
  }: {
    label: string
    value: string | string[]
    sectionKey: string
    multiline?: boolean
    icon?: React.ComponentType<any>
  }) => {
    const isEditing = editingSection === sectionKey
    const displayValue = Array.isArray(value) ? value.join(', ') : value
    const Icon = icon

    return (
      <div className="group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
          </div>
          {isEditable && !isEditing && (
            <button
              onClick={() => startEditing(sectionKey, value)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            {multiline ? (
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={Array.isArray(value) ? Math.max(3, value.length) : 3}
                placeholder={Array.isArray(value) ? '각 줄에 하나씩 입력하세요' : ''}
              />
            ) : (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelEdit}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {Array.isArray(value) ? (
              <ul className="space-y-1">
                {value.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {displayValue || '정보가 없습니다'}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            RFP 분석 결과
          </h3>
        </div>
        <div className="flex space-x-2">
          {onReanalyze && (
            <button
              onClick={onReanalyze}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              재분석
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            저장하기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            기본 정보
          </h4>
          
          <EditableField
            label="프로젝트 제목"
            value={editingAnalysis.projectTitle}
            sectionKey="projectTitle"
          />
          
          <EditableField
            label="클라이언트"
            value={editingAnalysis.client}
            sectionKey="client"
          />
          
          <EditableField
            label="마감일"
            value={editingAnalysis.deadline}
            sectionKey="deadline"
            icon={CalendarIcon}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
              <span>예산 범위</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <EditableField
                label="최소"
                value={editingAnalysis.budget.min?.toString() || ''}
                sectionKey="budget.min"
              />
              <EditableField
                label="최대"
                value={editingAnalysis.budget.max?.toString() || ''}
                sectionKey="budget.max"
              />
              <EditableField
                label="통화"
                value={editingAnalysis.budget.currency}
                sectionKey="budget.currency"
              />
            </div>
          </div>
        </div>

        {/* 프로젝트 범위 */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            프로젝트 범위
          </h4>
          
          <EditableField
            label="프로젝트 범위"
            value={editingAnalysis.scope}
            sectionKey="scope"
            multiline
          />
          
          <EditableField
            label="주요 산출물"
            value={editingAnalysis.deliverables}
            sectionKey="deliverables"
            multiline
            icon={ListBulletIcon}
          />
        </div>
      </div>

      {/* 요구사항 */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          요구사항 분석
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <EditableField
            label="기능적 요구사항"
            value={editingAnalysis.requirements.functional}
            sectionKey="requirements.functional"
            multiline
          />
          
          <EditableField
            label="기술적 요구사항"
            value={editingAnalysis.requirements.technical}
            sectionKey="requirements.technical"
            multiline
          />
          
          <EditableField
            label="디자인 요구사항"
            value={editingAnalysis.requirements.design}
            sectionKey="requirements.design"
            multiline
          />
        </div>
      </div>

      {/* 위험 요소 및 핵심 포인트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EditableField
          label="위험 요소"
          value={editingAnalysis.riskFactors}
          sectionKey="riskFactors"
          multiline
          icon={ExclamationTriangleIcon}
        />
        
        <EditableField
          label="핵심 포인트"
          value={editingAnalysis.keyPoints}
          sectionKey="keyPoints"
          multiline
        />
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-start space-x-3">
          <DocumentTextIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              분석 결과 검토
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              AI가 분석한 결과를 검토하고 수정하세요. 정확한 정보를 바탕으로 더 나은 제안서를 작성할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}