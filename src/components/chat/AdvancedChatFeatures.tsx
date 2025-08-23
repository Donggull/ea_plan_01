'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PencilIcon,
  ArrowPathIcon,
  StarIcon,
  ArrowsPointingOutIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  rating?: number
  versions?: Array<{
    id: string
    content: string
    timestamp: string
  }>
  parentId?: string
}

interface AdvancedChatFeaturesProps {
  message: Message
  onEdit?: (messageId: string, newContent: string) => void
  onRegenerate?: (messageId: string) => void
  onRate?: (messageId: string, rating: number) => void
  onBranch?: (messageId: string) => void
  onUseTemplate?: (content: string) => void
}

// Prompt templates
const promptTemplates = [
  {
    id: 'analyze',
    name: 'RFP 분석',
    template:
      'RFP 문서를 분석하고 다음 항목들을 정리해주세요:\n1. 핵심 요구사항\n2. 기술 스택\n3. 예산 및 일정\n4. 평가 기준',
  },
  {
    id: 'proposal',
    name: '제안서 작성',
    template:
      '다음 프로젝트에 대한 제안서를 작성해주세요:\n프로젝트명: [프로젝트명]\n목표: [목표]\n기간: [기간]\n예산: [예산]',
  },
  {
    id: 'design',
    name: '화면 설계',
    template:
      '[기능명] 화면을 설계해주세요. 다음 요소들을 포함해주세요:\n- 레이아웃 구조\n- 주요 컴포넌트\n- 사용자 플로우\n- 반응형 디자인 고려사항',
  },
  {
    id: 'code',
    name: '코드 생성',
    template:
      '[기능명]을 구현하는 코드를 작성해주세요.\n언어: [언어]\n프레임워크: [프레임워크]\n요구사항: [요구사항]',
  },
]

export default function AdvancedChatFeatures({
  message,
  onEdit,
  onRegenerate,
  onRate,
  onBranch,
  onUseTemplate,
}: AdvancedChatFeaturesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  const handleEdit = () => {
    if (isEditing && editContent !== message.content) {
      onEdit?.(message.id, editContent)
    }
    setIsEditing(!isEditing)
  }

  const handleRate = (rating: number) => {
    onRate?.(message.id, rating)
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Action buttons */}
      <div className="flex items-center space-x-1">
        {message.role === 'user' && (
          <>
            <button
              onClick={handleEdit}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="메시지 편집"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="템플릿 사용"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
            </button>
          </>
        )}

        {message.role === 'assistant' && (
          <>
            <button
              onClick={() => onRegenerate?.(message.id)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="답변 재생성"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onBranch?.(message.id)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="대화 분기"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Rating */}
        {message.role === 'assistant' && (
          <div className="flex items-center space-x-1 ml-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                {message.rating && message.rating >= star ? (
                  <StarIconSolid className="w-4 h-4 text-yellow-400" />
                ) : (
                  <StarIcon className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Version selector */}
        {message.versions && message.versions.length > 1 && (
          <select
            value={selectedVersion || ''}
            onChange={e => setSelectedVersion(e.target.value)}
            className="ml-2 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
          >
            <option value="">현재 버전</option>
            {message.versions.map((version, index) => (
              <option key={version.id} value={version.id}>
                버전 {index + 1} -{' '}
                {new Date(version.timestamp).toLocaleString()}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Edit mode */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none"
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(message.content)
                }}
                className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template selector */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2"
          >
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              프롬프트 템플릿 선택:
            </p>
            {promptTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  onUseTemplate?.(template.template)
                  setShowTemplates(false)
                }}
                className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {template.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {template.template}
                </p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
