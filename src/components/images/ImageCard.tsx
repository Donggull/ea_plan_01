'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Heart,
  Download,
  Share2,
  Edit3,
  Trash2,
  Eye,
  Clock,
  Zap,
  Tag,
  Copy,
  ExternalLink,
  MoreVertical,
  Star,
  Bookmark,
} from 'lucide-react'

export interface ImageItem {
  id: string | number
  url: string
  thumbnail?: string
  title: string
  prompt: string
  model: string
  style: string
  created: string
  createdAt?: Date
  likes: number
  downloads: number
  size: string
  avatar: string
  isLiked?: boolean
  isBookmarked?: boolean
  tags?: string[]
  isPublic?: boolean
  cost?: number
  generationTime?: number
  seed?: number
}

interface ImageCardProps {
  image: ImageItem
  onLike?: (id: string | number) => void
  onBookmark?: (id: string | number) => void
  onDownload?: (id: string | number) => void
  onEdit?: (id: string | number) => void
  onDelete?: (id: string | number) => void
  onShare?: (id: string | number) => void
  onView?: (id: string | number) => void
  onRegenerate?: (id: string | number) => void
  showActions?: boolean
  compact?: boolean
  selected?: boolean
  onSelect?: (id: string | number) => void
}

export default function ImageCard({
  image,
  onLike,
  onBookmark,
  onDownload,
  onEdit,
  onDelete,
  onShare,
  onView,
  onRegenerate,
  showActions = true,
  compact = false,
  selected = false,
  onSelect,
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = useCallback(
    async (action: () => void, shouldLoad = false) => {
      if (shouldLoad) setIsLoading(true)
      try {
        action()
      } finally {
        if (shouldLoad) setIsLoading(false)
      }
    },
    []
  )

  const formatRelativeTime = (dateString: string) => {
    // 이미 포맷된 문자열인 경우 그대로 반환
    if (dateString.includes('전')) return dateString

    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInDays < 7) return `${diffInDays}일 전`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`
    return `${Math.floor(diffInDays / 30)}개월 전`
  }

  const getModelColor = (model: string) => {
    switch (model.toLowerCase()) {
      case 'flux schnell':
      case 'flux-schnell':
        return 'from-amber-500 to-orange-500'
      case 'imagen 3':
      case 'imagen3':
        return 'from-blue-500 to-indigo-500'
      case 'flux context':
      case 'flux-context':
        return 'from-purple-500 to-pink-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getModelIcon = (model: string) => {
    switch (model.toLowerCase()) {
      case 'flux schnell':
      case 'flux-schnell':
        return <Zap className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${
        selected ? 'ring-2 ring-blue-500' : ''
      } ${compact ? 'shadow-none hover:shadow-md' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowMenu(false)
      }}
      onClick={() => onView?.(image.id)}
    >
      {/* 선택 체크박스 */}
      {onSelect && (
        <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={e => {
              e.stopPropagation()
              onSelect(image.id)
            }}
            className={`w-6 h-6 rounded-lg border-2 transition-all ${
              selected
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white/80 backdrop-blur border-white/50 hover:bg-white'
            }`}
          >
            {selected && <Star className="w-3 h-3 m-auto" />}
          </motion.button>
        </div>
      )}

      {/* 이미지 영역 */}
      <div
        className={`relative ${compact ? 'aspect-square' : 'aspect-[4/3]'} bg-gray-100 dark:bg-gray-700 overflow-hidden`}
      >
        <Image
          src={image.thumbnail || image.url}
          alt={image.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={
            compact
              ? '(max-width: 768px) 50vw, 25vw'
              : '(max-width: 768px) 100vw, 50vw'
          }
          priority={false}
        />

        {/* 오버레이 액션 버튼들 */}
        {showActions && (
          <div
            className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isLoading ? 'opacity-100' : ''}`}
          >
            <div className="absolute top-3 right-3 flex gap-2">
              {/* 좋아요 버튼 */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                  e.stopPropagation()
                  onLike?.(image.id)
                }}
                className={`p-2 rounded-lg backdrop-blur transition-colors ${
                  image.isLiked
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={image.isLiked ? 'currentColor' : 'none'}
                />
              </motion.button>

              {/* 북마크 버튼 */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                  e.stopPropagation()
                  onBookmark?.(image.id)
                }}
                className={`p-2 rounded-lg backdrop-blur transition-colors ${
                  image.isBookmarked
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={image.isBookmarked ? 'currentColor' : 'none'}
                />
              </motion.button>

              {/* 더보기 메뉴 */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={e => {
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>

                {/* 드롭다운 메뉴 */}
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-30"
                  >
                    <div className="py-1">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleAction(() => onDownload?.(image.id), true)
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        다운로드
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          onShare?.(image.id)
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        공유
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          onEdit?.(image.id)
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        편집
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          onRegenerate?.(image.id)
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        재생성
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          onDelete?.(image.id)
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* 중앙 재생/확대 버튼 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                  e.stopPropagation()
                  onView?.(image.id)
                }}
                className="p-4 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <Eye className="w-6 h-6" />
              </motion.button>
            </div>

            {/* 하단 빠른 액션 버튼들 */}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={e => {
                  e.stopPropagation()
                  handleAction(() => onDownload?.(image.id), true)
                }}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-white/20 backdrop-blur rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4 inline mr-2" />
                다운로드
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={e => {
                  e.stopPropagation()
                  onShare?.(image.id)
                }}
                className="px-3 py-2 bg-white/20 backdrop-blur rounded-lg text-white hover:bg-white/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}

        {/* 모델 뱃지 */}
        <div className="absolute bottom-3 left-3">
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getModelColor(image.model)} flex items-center gap-1`}
          >
            {getModelIcon(image.model)}
            {image.model === 'Flux Schnell'
              ? 'Flux'
              : image.model === 'Imagen 3'
                ? 'Imagen'
                : image.model}
          </div>
        </div>

        {/* 공개/비공개 상태 */}
        {image.isPublic !== undefined && (
          <div className="absolute top-3 right-3">
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                image.isPublic
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}
            >
              {image.isPublic ? '공개' : '비공개'}
            </div>
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      {!compact && (
        <div className="p-4">
          {/* 제목과 아바타 */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                {image.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                {image.prompt}
              </p>
            </div>
            <div className="ml-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm">
                {image.avatar}
              </div>
            </div>
          </div>

          {/* 태그 */}
          {image.tags && image.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {image.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
              {image.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs">
                  +{image.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 메타데이터 */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{image.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{image.downloads}</span>
              </div>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span>{image.size}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(image.created)}</span>
            </div>
          </div>

          {/* 생성 정보 */}
          {(image.cost || image.generationTime) && (
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              {image.cost && <span>비용: ${image.cost.toFixed(3)}</span>}
              {image.generationTime && (
                <span>생성시간: {image.generationTime}초</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 컴팩트 모드 정보 */}
      {compact && (
        <div className="p-3">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1">
            {image.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3" />
              <span>{image.likes}</span>
            </div>
            <span>{formatRelativeTime(image.created)}</span>
          </div>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  )
}
