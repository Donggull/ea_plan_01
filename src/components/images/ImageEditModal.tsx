'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  X,
  Save,
  // RotateCcw,
  Copy,
  Wand2,
  Tag,
  Eye,
  EyeOff,
  // FolderPlus,
  Palette,
  Settings,
  Sparkles,
  Zap,
  // Clock,
  DollarSign,
  // Hash,
} from 'lucide-react'
import { ImageItem } from './ImageCard'

interface ImageEditModalProps {
  image: ImageItem
  isOpen: boolean
  onClose: () => void
  onSave: (updatedImage: Partial<ImageItem>) => void
  onRegenerate?: (params: RegenerateParams) => void
  availableTags?: string[]
  collections?: Array<{ id: string; name: string }>
}

interface RegenerateParams {
  prompt: string
  model: string
  style: string
  seed?: number
  variations?: number
  guidance?: number
  steps?: number
}

export default function ImageEditModal({
  image,
  isOpen,
  onClose,
  onSave,
  onRegenerate,
  availableTags = [],
  _collections = [],
}: ImageEditModalProps) {
  const [editedImage, setEditedImage] = useState<Partial<ImageItem>>({})
  const [activeTab, setActiveTab] = useState<
    'info' | 'tags' | 'regenerate' | 'variations'
  >('info')
  const [newTag, setNewTag] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)

  // Regenerate settings
  const [regenerateParams, setRegenerateParams] = useState<RegenerateParams>({
    prompt: image.prompt,
    model: image.model,
    style: image.style,
    seed: image.seed,
    variations: 4,
    guidance: 7.5,
    steps: 20,
  })

  useEffect(() => {
    if (isOpen) {
      setEditedImage({
        title: image.title,
        prompt: image.prompt,
        tags: [...(image.tags || [])],
        isPublic: image.isPublic,
      })
      setRegenerateParams({
        prompt: image.prompt,
        model: image.model,
        style: image.style,
        seed: image.seed,
        variations: 4,
        guidance: 7.5,
        steps: 20,
      })
    }
  }, [isOpen, image])

  const handleSave = () => {
    onSave(editedImage)
    onClose()
  }

  const handleAddTag = (tag: string) => {
    if (tag && !editedImage.tags?.includes(tag)) {
      setEditedImage(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }))
    }
    setNewTag('')
    setShowTagSuggestions(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedImage(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }))
  }

  const handleRegenerate = () => {
    onRegenerate?.(regenerateParams)
    onClose()
  }

  const filteredTagSuggestions = availableTags
    .filter(
      tag =>
        tag.toLowerCase().includes(newTag.toLowerCase()) &&
        !editedImage.tags?.includes(tag)
    )
    .slice(0, 8)

  const tabs = [
    { id: 'info', label: '기본 정보', icon: Settings },
    { id: 'tags', label: '태그 관리', icon: Tag },
    { id: 'regenerate', label: '재생성', icon: Wand2 },
    { id: 'variations', label: '변형 생성', icon: Sparkles },
  ]

  const models = [
    {
      id: 'flux-schnell',
      name: 'Flux Schnell',
      icon: Zap,
      description: '빠른 생성 (3-5초)',
    },
    {
      id: 'imagen3',
      name: 'Google Imagen 3',
      description: '고품질 생성 (10-15초)',
    },
    {
      id: 'flux-context',
      name: 'Flux Context',
      description: '참조 이미지 기반',
    },
  ]

  const styles = [
    '사실적',
    '예술적',
    '만화',
    '애니메이션',
    '사진',
    '일러스트',
    '추상적',
    '미니멀',
    '빈티지',
    '모던',
    '환상적',
    '사이버펑크',
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex"
          >
            {/* 왼쪽: 이미지 미리보기 */}
            <div className="w-1/2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-6">
              <div className="relative max-w-full max-h-full">
                <Image
                  src={image.url}
                  alt={image.title}
                  width={400}
                  height={300}
                  className="object-contain max-h-[60vh] rounded-lg shadow-lg"
                />

                {/* 이미지 정보 오버레이 */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur text-white p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>크기:</span>
                      <span>{image.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>모델:</span>
                      <span>{image.model}</span>
                    </div>
                    {image.cost && (
                      <div className="flex justify-between">
                        <span>비용:</span>
                        <span>${image.cost.toFixed(3)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 편집 패널 */}
            <div className="w-1/2 flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  이미지 편집
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 탭 네비게이션 */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* 탭 콘텐츠 */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    {/* 제목 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        제목
                      </label>
                      <input
                        type="text"
                        value={editedImage.title || ''}
                        onChange={e =>
                          setEditedImage(prev => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                        placeholder="이미지 제목을 입력하세요"
                      />
                    </div>

                    {/* 프롬프트 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        프롬프트
                      </label>
                      <textarea
                        value={editedImage.prompt || ''}
                        onChange={e =>
                          setEditedImage(prev => ({
                            ...prev,
                            prompt: e.target.value,
                          }))
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 resize-none"
                        placeholder="이미지 생성에 사용된 프롬프트"
                      />
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            editedImage.prompt || ''
                          )
                        }
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        프롬프트 복사
                      </button>
                    </div>

                    {/* 공개 설정 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        공개 설정
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            setEditedImage(prev => ({
                              ...prev,
                              isPublic: true,
                            }))
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            editedImage.isPublic
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          공개
                        </button>
                        <button
                          onClick={() =>
                            setEditedImage(prev => ({
                              ...prev,
                              isPublic: false,
                            }))
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            editedImage.isPublic === false
                              ? 'bg-gray-50 dark:bg-gray-700 border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <EyeOff className="w-4 h-4" />
                          비공개
                        </button>
                      </div>
                    </div>

                    {/* 메타데이터 (읽기 전용) */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        생성 정보
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            생성일:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {image.created}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            좋아요:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {image.likes}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            다운로드:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {image.downloads}
                          </span>
                        </div>
                        {image.seed && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              시드:
                            </span>
                            <span className="ml-2 text-gray-900 dark:text-white font-mono text-xs">
                              {image.seed}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tags' && (
                  <div className="space-y-6">
                    {/* 태그 추가 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        태그 추가
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newTag}
                          onChange={e => {
                            setNewTag(e.target.value)
                            setShowTagSuggestions(e.target.value.length > 0)
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddTag(newTag)
                            } else if (e.key === 'Escape') {
                              setShowTagSuggestions(false)
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                          placeholder="태그를 입력하고 Enter를 누르세요"
                        />

                        {/* 태그 제안 */}
                        {showTagSuggestions &&
                          filteredTagSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                              {filteredTagSuggestions.map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => handleAddTag(tag)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Tag className="w-3 h-3 text-gray-400" />
                                  {tag}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* 현재 태그들 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        현재 태그 ({editedImage.tags?.length || 0}개)
                      </label>
                      {editedImage.tags && editedImage.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editedImage.tags.map((tag, idx) => (
                            <motion.span
                              key={`${tag}-${idx}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm flex items-center gap-2"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-blue-900 dark:hover:text-blue-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          아직 태그가 없습니다. 위에서 태그를 추가해보세요.
                        </p>
                      )}
                    </div>

                    {/* 인기 태그 제안 */}
                    {availableTags.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          인기 태그
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableTags.slice(0, 10).map(tag => (
                            <button
                              key={tag}
                              onClick={() => handleAddTag(tag)}
                              disabled={editedImage.tags?.includes(tag)}
                              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                editedImage.tags?.includes(tag)
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'regenerate' && (
                  <div className="space-y-6">
                    {/* 프롬프트 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        새 프롬프트
                      </label>
                      <textarea
                        value={regenerateParams.prompt}
                        onChange={e =>
                          setRegenerateParams(prev => ({
                            ...prev,
                            prompt: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 resize-none"
                        placeholder="새로운 프롬프트를 입력하세요"
                      />
                    </div>

                    {/* AI 모델 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        AI 모델
                      </label>
                      <div className="space-y-2">
                        {models.map(model => {
                          const Icon = model.icon
                          return (
                            <button
                              key={model.id}
                              onClick={() =>
                                setRegenerateParams(prev => ({
                                  ...prev,
                                  model: model.id,
                                }))
                              }
                              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                                regenerateParams.model === model.id
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {Icon && <Icon className="w-4 h-4" />}
                                <div>
                                  <div className="font-medium">
                                    {model.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {model.description}
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* 스타일 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        스타일
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {styles.map(style => (
                          <button
                            key={style}
                            onClick={() =>
                              setRegenerateParams(prev => ({ ...prev, style }))
                            }
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                              regenerateParams.style === style
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 고급 설정 */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        고급 설정
                      </h4>

                      {/* 시드값 */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          시드값 (선택사항)
                        </label>
                        <input
                          type="number"
                          value={regenerateParams.seed || ''}
                          onChange={e =>
                            setRegenerateParams(prev => ({
                              ...prev,
                              seed: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                          placeholder="비워두면 랜덤 시드 사용"
                        />
                      </div>

                      {/* 가이던스 */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          가이던스 스케일: {regenerateParams.guidance}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="0.5"
                          value={regenerateParams.guidance}
                          onChange={e =>
                            setRegenerateParams(prev => ({
                              ...prev,
                              guidance: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      {/* 스텝 수 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          인퍼런스 스텝: {regenerateParams.steps}
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="50"
                          step="5"
                          value={regenerateParams.steps}
                          onChange={e =>
                            setRegenerateParams(prev => ({
                              ...prev,
                              steps: parseInt(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* 재생성 버튼 */}
                    <button
                      onClick={handleRegenerate}
                      disabled={!regenerateParams.prompt.trim()}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Wand2 className="w-4 h-4" />
                      이미지 재생성
                    </button>
                  </div>
                )}

                {activeTab === 'variations' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        변형 이미지 생성
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                        현재 이미지를 바탕으로 다양한 변형 버전을 생성합니다
                      </p>
                    </div>

                    {/* 변형 개수 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        생성할 변형 개수: {regenerateParams.variations}개
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={regenerateParams.variations}
                        onChange={e =>
                          setRegenerateParams(prev => ({
                            ...prev,
                            variations: parseInt(e.target.value),
                          }))
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>1개</span>
                        <span>8개</span>
                      </div>
                    </div>

                    {/* 변형 옵션 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Palette className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-sm">색상 변형</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          다양한 색상 조합으로 변형
                        </p>
                      </div>

                      <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-sm">구도 변형</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          다른 각도와 구도로 재구성
                        </p>
                      </div>
                    </div>

                    {/* 예상 비용 */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">
                          예상 비용
                        </span>
                      </div>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        {regenerateParams.variations}개 변형 생성 시 약 $
                        {(regenerateParams.variations * 0.015).toFixed(3)}
                      </p>
                    </div>

                    {/* 변형 생성 버튼 */}
                    <button
                      onClick={() => {
                        onRegenerate?.({
                          ...regenerateParams,
                          prompt: `${image.prompt} [변형]`,
                        })
                        onClose()
                      }}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {regenerateParams.variations}개 변형 생성
                    </button>
                  </div>
                )}
              </div>

              {/* 하단 액션 버튼들 */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    취소
                  </button>
                  {activeTab === 'info' || activeTab === 'tags' ? (
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      저장
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('info')}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      정보 편집으로 이동
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
