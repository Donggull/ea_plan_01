'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  Heart,
  Bookmark,
  Copy,
  Edit3,
  Info,
  Maximize,
  Minimize,
  Play,
  Pause,
  // Settings,
  Tag,
  // Clock,
  Zap,
} from 'lucide-react'
import { ImageItem } from './ImageCard'

interface LightboxProps {
  image: ImageItem
  images: ImageItem[]
  currentIndex: number
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
  onAction?: (action: string, imageId: string | number, data?: unknown) => void
}

export default function Lightbox({
  image,
  images,
  currentIndex,
  onClose,
  onNavigate,
  onAction,
}: LightboxProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showInfo, setShowInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSlideshow, setIsSlideshow] = useState(false)
  const [slideshowInterval, setSlideshowInterval] =
    useState<NodeJS.Timeout | null>(null)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          onNavigate('prev')
          break
        case 'ArrowRight':
          onNavigate('next')
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case '0':
          handleReset()
          break
        case 'i':
        case 'I':
          setShowInfo(!showInfo)
          break
        case 'f':
        case 'F':
          handleFullscreen()
          break
        case ' ':
          event.preventDefault()
          handleSlideshow()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNavigate, showInfo, handleSlideshow])

  // Reset view when image changes
  useEffect(() => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  // Slideshow
  useEffect(() => {
    if (isSlideshow) {
      const interval = setInterval(() => {
        onNavigate('next')
      }, 3000)
      setSlideshowInterval(interval)
    } else if (slideshowInterval) {
      clearInterval(slideshowInterval)
      setSlideshowInterval(null)
    }

    return () => {
      if (slideshowInterval) {
        clearInterval(slideshowInterval)
      }
    }
  }, [isSlideshow, onNavigate, slideshowInterval])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.5, 0.1))
  }

  const handleRotate = () => {
    setRotation(prev => prev + 90)
  }

  const handleReset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleSlideshow = useCallback(() => {
    setIsSlideshow(!isSlideshow)
  }, [isSlideshow])

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (scale <= 1) return
      setIsDragging(true)
      setDragStart({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      })
    },
    [scale, position]
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || scale <= 1) return
      setPosition({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      })
    },
    [isDragging, dragStart, scale]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.min(Math.max(prev * delta, 0.1), 5))
  }, [])

  const formatRelativeTime = (dateString: string) => {
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* 헤더 */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">{image.title}</h2>
            <span className="text-sm text-gray-300">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* 슬라이드쇼 */}
            <button
              onClick={e => {
                e.stopPropagation()
                handleSlideshow()
              }}
              className={`p-2 rounded-lg transition-colors ${
                isSlideshow
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title="슬라이드쇼 (스페이스바)"
            >
              {isSlideshow ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* 정보 토글 */}
            <button
              onClick={e => {
                e.stopPropagation()
                setShowInfo(!showInfo)
              }}
              className={`p-2 rounded-lg transition-colors ${
                showInfo
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title="정보 보기 (I)"
            >
              <Info className="w-5 h-5" />
            </button>

            {/* 전체화면 */}
            <button
              onClick={e => {
                e.stopPropagation()
                handleFullscreen()
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="전체화면 (F)"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>

            {/* 닫기 */}
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="닫기 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 이미지 영역 */}
        <div className="flex-1 flex items-center justify-center p-6">
          {/* 이전 버튼 */}
          {images.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation()
                onNavigate('prev')
              }}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-10"
              title="이전 이미지 (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* 이미지 */}
          <div
            className="relative max-w-full max-h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              }}
              className="relative"
            >
              <Image
                src={image.url}
                alt={image.title}
                width={1200}
                height={800}
                className="object-contain max-h-[80vh] max-w-[80vw] select-none"
                priority
                draggable={false}
              />
            </motion.div>
          </div>

          {/* 다음 버튼 */}
          {images.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation()
                onNavigate('next')
              }}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-10"
              title="다음 이미지 (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* 하단 컨트롤 바 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between text-white bg-gradient-to-t from-black/50 to-transparent">
          {/* 왼쪽: 확대/축소 컨트롤 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={e => {
                e.stopPropagation()
                handleZoomOut()
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="축소 (-)"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <span className="text-sm px-2 py-1 bg-white/10 rounded-lg min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={e => {
                e.stopPropagation()
                handleZoomIn()
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="확대 (+)"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation()
                handleRotate()
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="회전"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation()
                handleReset()
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
              title="초기화 (0)"
            >
              초기화
            </button>
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={e => {
                e.stopPropagation()
                onAction?.('like', image.id)
              }}
              className={`p-2 rounded-lg transition-colors ${
                image.isLiked
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title="좋아요"
            >
              <Heart
                className="w-5 h-5"
                fill={image.isLiked ? 'currentColor' : 'none'}
              />
            </button>

            <button
              onClick={e => {
                e.stopPropagation()
                onAction?.('bookmark', image.id)
              }}
              className={`p-2 rounded-lg transition-colors ${
                image.isBookmarked
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title="북마크"
            >
              <Bookmark
                className="w-5 h-5"
                fill={image.isBookmarked ? 'currentColor' : 'none'}
              />
            </button>

            <button
              onClick={e => {
                e.stopPropagation()
                onAction?.('download', image.id)
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="다운로드"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation()
                onAction?.('share', image.id)
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="공유"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation()
                onAction?.('edit', image.id)
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="편집"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 정보 패널 */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute top-0 right-0 w-80 h-full bg-black/90 backdrop-blur-sm border-l border-white/10 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    이미지 정보
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="text-gray-400">제목</label>
                      <p className="text-white">{image.title}</p>
                    </div>

                    <div>
                      <label className="text-gray-400">프롬프트</label>
                      <p className="text-white leading-relaxed">
                        {image.prompt}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400">크기</label>
                        <p className="text-white">{image.size}</p>
                      </div>
                      <div>
                        <label className="text-gray-400">생성일</label>
                        <p className="text-white">
                          {formatRelativeTime(image.created)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400">AI 모델</label>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white bg-gradient-to-r ${getModelColor(image.model)} text-sm mt-1`}
                      >
                        {image.model === 'Flux Schnell' && (
                          <Zap className="w-4 h-4" />
                        )}
                        {image.model}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 태그 */}
                {image.tags && image.tags.length > 0 && (
                  <div>
                    <label className="text-gray-400 text-sm">태그</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {image.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/10 text-white rounded-full text-xs flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 통계 */}
                <div>
                  <label className="text-gray-400 text-sm">통계</label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-white">{image.likes}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4 text-green-400" />
                      <span className="text-white">{image.downloads}</span>
                    </div>
                  </div>
                </div>

                {/* 생성 정보 */}
                {(image.cost || image.generationTime || image.seed) && (
                  <div>
                    <label className="text-gray-400 text-sm">생성 정보</label>
                    <div className="space-y-2 mt-2 text-sm">
                      {image.cost && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">비용</span>
                          <span className="text-white">
                            ${image.cost.toFixed(3)}
                          </span>
                        </div>
                      )}
                      {image.generationTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">생성 시간</span>
                          <span className="text-white">
                            {image.generationTime}초
                          </span>
                        </div>
                      )}
                      {image.seed && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">시드값</span>
                          <span className="text-white font-mono text-xs">
                            {image.seed}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div className="space-y-2">
                  <button
                    onClick={() => onAction?.('regenerate', image.id)}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />이 이미지로 재생성
                  </button>

                  <button
                    onClick={() => onAction?.('copyPrompt', image.id)}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    프롬프트 복사
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 썸네일 네비게이션 */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-md overflow-x-auto py-2 px-4 bg-black/50 rounded-full">
            {images
              .slice(Math.max(0, currentIndex - 5), currentIndex + 6)
              .map((img, idx) => {
                const actualIndex = Math.max(0, currentIndex - 5) + idx
                return (
                  <button
                    key={img.id}
                    onClick={e => {
                      e.stopPropagation()
                      const direction =
                        actualIndex > currentIndex ? 'next' : 'prev'
                      const steps = Math.abs(actualIndex - currentIndex)
                      for (let i = 0; i < steps; i++) {
                        setTimeout(() => onNavigate(direction), i * 50)
                      }
                    }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden transition-all ${
                      actualIndex === currentIndex
                        ? 'ring-2 ring-white scale-110'
                        : 'opacity-60 hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={img.thumbnail || img.url}
                      alt={img.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                )
              })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
