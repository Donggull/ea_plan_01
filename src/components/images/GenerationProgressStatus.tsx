'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Users,
  Zap,
  Image as ImageIcon,
  Timer,
  Pause,
  Play,
  X,
  Download,
  Eye,
} from 'lucide-react'

interface GenerationStatus {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  estimatedTime?: number
  remainingTime?: number
  model: string
  prompt: string
  queuePosition?: number
  totalInQueue?: number
  startedAt?: Date
  completedAt?: Date
  error?: string
  results?: {
    images: Array<{
      id: string
      url: string
      thumbnail: string
    }>
    totalCost: number
    generationTime: number
  }
}

interface GenerationProgressStatusProps {
  generations: GenerationStatus[]
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  onViewResult?: (id: string) => void
  onDownload?: (id: string) => void
  className?: string
}

const STATUS_CONFIG = {
  queued: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    label: '대기 중',
    description: '생성 대기열에서 순서를 기다리고 있습니다',
  },
  processing: {
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    label: '생성 중',
    description: 'AI가 이미지를 생성하고 있습니다',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    label: '완료',
    description: '이미지 생성이 완료되었습니다',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    label: '실패',
    description: '이미지 생성 중 오류가 발생했습니다',
  },
  cancelled: {
    icon: X,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
    label: '취소됨',
    description: '사용자에 의해 취소되었습니다',
  },
}

// 시간 포맷 함수
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}초`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0
    ? `${minutes}분 ${remainingSeconds}초`
    : `${minutes}분`
}

// 상대 시간 포맷 함수
const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function GenerationProgressStatus({
  generations,
  onCancel,
  onRetry,
  onViewResult,
  onDownload,
  className = '',
}: GenerationProgressStatusProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // 자동으로 진행 상태 업데이트 (실제로는 API 폴링으로 구현)
  useEffect(() => {
    const interval = setInterval(() => {
      // 실제 구현에서는 API를 호출하여 상태 업데이트
      // 현재는 모의 업데이트 로직
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const activeGenerations = generations.filter(g => g.status !== 'completed')
  const completedGenerations = generations.filter(g => g.status === 'completed')
  const totalInQueue = generations.filter(g => g.status === 'queued').length
  const processing = generations.filter(g => g.status === 'processing').length

  if (generations.length === 0) {
    return (
      <div
        className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center ${className}`}
      >
        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          생성 진행 상태가 없습니다
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 대기열 상태 요약 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            생성 상태 요약
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                {totalInQueue}
              </span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              대기 중
            </p>
          </div>

          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                {processing}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">처리 중</p>
          </div>

          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-800 dark:text-green-200">
                {completedGenerations.length}
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">완료</p>
          </div>
        </div>
      </div>

      {/* 활성 생성 목록 */}
      {activeGenerations.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            진행 중인 작업
          </h4>
          <AnimatePresence>
            {activeGenerations.map(generation => (
              <GenerationItem
                key={generation.id}
                generation={generation}
                isExpanded={expandedItems.has(generation.id)}
                onToggleExpanded={() => toggleExpanded(generation.id)}
                onCancel={onCancel}
                onRetry={onRetry}
                onViewResult={onViewResult}
                onDownload={onDownload}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 완료된 생성 목록 (접힌 상태) */}
      {completedGenerations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">
              완료된 작업 ({completedGenerations.length}개)
            </h4>
            <button
              onClick={() => {
                const currentExpanded = new Set(expandedItems)
                const hasExpandedCompleted = completedGenerations.some(g =>
                  currentExpanded.has(g.id)
                )

                if (hasExpandedCompleted) {
                  // 완료된 항목들을 모두 접기
                  completedGenerations.forEach(g =>
                    currentExpanded.delete(g.id)
                  )
                } else {
                  // 완료된 항목들을 모두 펼치기
                  completedGenerations.forEach(g => currentExpanded.add(g.id))
                }
                setExpandedItems(currentExpanded)
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {completedGenerations.some(g => expandedItems.has(g.id))
                ? '모두 접기'
                : '모두 펼치기'}
            </button>
          </div>

          <AnimatePresence>
            {completedGenerations.map(generation => (
              <GenerationItem
                key={generation.id}
                generation={generation}
                isExpanded={expandedItems.has(generation.id)}
                onToggleExpanded={() => toggleExpanded(generation.id)}
                onCancel={onCancel}
                onRetry={onRetry}
                onViewResult={onViewResult}
                onDownload={onDownload}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// 개별 생성 항목 컴포넌트
function GenerationItem({
  generation,
  isExpanded,
  onToggleExpanded,
  onCancel,
  onRetry,
  onViewResult,
  onDownload,
}: {
  generation: GenerationStatus
  isExpanded: boolean
  onToggleExpanded: () => void
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  onViewResult?: (id: string) => void
  onDownload?: (id: string) => void
}) {
  const config = STATUS_CONFIG[generation.status]
  const StatusIcon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border rounded-lg overflow-hidden ${config.bgColor} ${config.borderColor}`}
    >
      {/* 헤더 */}
      <div
        className="p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-1 ${config.color}`}>
            <StatusIcon
              className={`w-5 h-5 ${generation.status === 'processing' ? 'animate-spin' : ''}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className={`font-medium ${config.color}`}>
                {config.label}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                  {generation.model}
                </span>
                {generation.completedAt && (
                  <span>{formatRelativeTime(generation.completedAt)}</span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
              {generation.prompt}
            </p>

            {/* 진행률 바 */}
            {(generation.status === 'processing' ||
              generation.status === 'queued') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{generation.progress}% 완료</span>
                  {generation.remainingTime && (
                    <span>{formatTime(generation.remainingTime)} 남음</span>
                  )}
                  {generation.queuePosition &&
                    generation.status === 'queued' && (
                      <span>대기 순서: {generation.queuePosition}번째</span>
                    )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${generation.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {generation.status === 'failed' && generation.error && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-700 dark:text-red-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{generation.error}</span>
              </div>
            )}
          </div>

          {/* 확장 아이콘 */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            ▼
          </motion.div>
        </div>
      </div>

      {/* 확장된 내용 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-600"
          >
            <div className="p-4 space-y-4">
              {/* 상세 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      생성 ID:
                    </span>
                    <span className="font-mono text-xs">{generation.id}</span>
                  </div>
                  {generation.startedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        시작 시간:
                      </span>
                      <span>{generation.startedAt.toLocaleString()}</span>
                    </div>
                  )}
                  {generation.estimatedTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        예상 시간:
                      </span>
                      <span>{formatTime(generation.estimatedTime)}</span>
                    </div>
                  )}
                </div>

                {generation.results && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        생성 개수:
                      </span>
                      <span>{generation.results.images.length}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        소요 시간:
                      </span>
                      <span>
                        {formatTime(generation.results.generationTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        비용:
                      </span>
                      <span>${generation.results.totalCost.toFixed(3)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 결과 이미지 미리보기 */}
              {generation.results && generation.results.images.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    생성된 이미지
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {generation.results.images.map(image => (
                      <div
                        key={image.id}
                        className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative group cursor-pointer"
                        onClick={() => onViewResult?.(generation.id)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                {generation.status === 'queued' && onCancel && (
                  <button
                    onClick={() => onCancel(generation.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    취소
                  </button>
                )}

                {generation.status === 'failed' && onRetry && (
                  <button
                    onClick={() => onRetry(generation.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    재시도
                  </button>
                )}

                {generation.status === 'completed' && generation.results && (
                  <>
                    <button
                      onClick={() => onViewResult?.(generation.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-200 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      결과 보기
                    </button>
                    <button
                      onClick={() => onDownload?.(generation.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      다운로드
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
