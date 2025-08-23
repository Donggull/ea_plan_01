'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  HeartIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  SwatchIcon,
  CubeIcon,
  LightBulbIcon,
  FilmIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

// 새로운 컴포넌트 import
import ImageGenerationPanel from '@/components/images/ImageGenerationPanel'
import ReferenceImageUpload from '@/components/images/ReferenceImageUpload'
import GenerationProgressStatus from '@/components/images/GenerationProgressStatus'
import AdvancedSettingsPanel from '@/components/images/AdvancedSettingsPanel'
import PromptHelper from '@/components/images/PromptHelper'

export default function ImagesPage() {
  const [selectedModel, setSelectedModel] = useState('flux-schnell')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isGenerating, setIsGenerating] = useState(false)

  // 새로운 UI 컴포넌트 state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showPromptHelper, setShowPromptHelper] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [referenceImage, setReferenceImage] = useState<{
    file: File
    url: string
  } | null>(null)

  // 고급 설정 state
  const [advancedSettings, setAdvancedSettings] = useState({
    guidanceScale: 7.5,
    inferenceSteps: 20,
    samplerType: 'euler',
    aspectRatioLock: true,
    batchSize: 1,
  })

  // 생성 진행 상태 state (모의 데이터)
  const [generations, setGenerations] = useState<
    Array<{
      id: string
      status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
      progress: number
      model: string
      prompt: string
      remainingTime?: number
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
    }>
  >([
    {
      id: 'gen-1',
      status: 'processing',
      progress: 65,
      model: 'flux-schnell',
      prompt: '미래적인 AI 로봇, 네온 블루 컬러, 사이버펑크 스타일',
      remainingTime: 15,
      startedAt: new Date(Date.now() - 30000),
    },
    {
      id: 'gen-2',
      status: 'completed',
      progress: 100,
      model: 'imagen3',
      prompt: '평화로운 일본 정원, 벚꽃, 석등, 황금빛 일몰',
      completedAt: new Date(Date.now() - 300000),
      results: {
        images: [
          {
            id: 'img-1',
            url: '/api/images/placeholder?model=imagen3&prompt=peaceful+garden&index=0',
            thumbnail:
              '/api/images/placeholder?model=imagen3&prompt=peaceful+garden&index=0',
          },
        ],
        totalCost: 0.015,
        generationTime: 12,
      },
    },
  ])

  const images = [
    {
      id: 1,
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjUwIiBmaWxsPSIjRkZGIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzBfMSIgeDE9IjAiIHkxPSIwIiB4Mj0iNDAwIiB5Mj0iMzAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2MzY2RjEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjQTg1NUY3Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2Zz4K',
      title: 'AI 대시보드 인터페이스',
      prompt:
        '미래지향적인 데이터 시각화 대시보드, 네온 컬러와 글래스모피즘 효과',
      model: 'Flux Schnell',
      style: 'UI/UX',
      created: '1시간 전',
      likes: 24,
      downloads: 12,
      size: '1024x768',
      avatar: '🎨',
    },
    {
      id: 2,
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8cGF0aCBkPSJNMTUwIDEwMEMxNTAgOTAuMDU5NCAxNTguMDU5IDgyIDE2OCA4MkgyMzJDMjQxLjk0MSA4MiAyNTAgOTAuMDU5NCAyNTAgMTAwVjIwMEMyNTAgMjA5Ljk0MSAyNDEuOTQxIDIxOCAyMzIgMjE4SDE2OEMxNTguMDU5IDIxOCAxNTAgMjA5Ljk0MSAxNTAgMjAwVjEwMFoiIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC4zIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMF8xIiB4MT0iMCIgeTE9IjAiIHgyPSI0MDAiIHkyPSIzMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzEwQjk4MSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwNTlCNjkiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K',
      title: '친근한 AI 어시스턴트',
      prompt: '3D 스타일의 로봇 캐릭터, 파란색과 흰색 컬러 스킴, 친근한 표정',
      model: 'Imagen 3',
      style: 'Character',
      created: '3시간 전',
      likes: 18,
      downloads: 8,
      size: '512x512',
      avatar: '🤖',
    },
    {
      id: 3,
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8cG9seWdvbiBwb2ludHM9IjIwMCw4MCAyNDAsMTQwIDE2MCwxNDAiIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC40Ii8+Cjxwb2x5Z29uIHBvaW50cz0iMjAwLDE2MCAyNDAsMjIwIDE2MCwyMjAiIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMF8xIiB4MT0iMCIgeTE9IjAiIHgyPSI0MDAiIHkyPSIzMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0Y1OUUwQiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNFRjQ0NDQiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K',
      title: '모던 브랜드 로고',
      prompt: '기술 스타트업을 위한 미니멀한 로고 디자인, 기하학적 형태',
      model: 'Flux Schnell',
      style: 'Logo',
      created: '1일 전',
      likes: 32,
      downloads: 19,
      size: '1080x1080',
      avatar: '⭐',
    },
    {
      id: 4,
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfMF8xKSIvPgo8ZGVmcz4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDBfcmFkaWFsXzBfMSIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCI+CjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQwX3JhZGlhbF8wXzEiIGN4PSIwLjUiIGN5PSIwLjUiIHI9IjAuNSIgZ3JhZGllbnRVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giPgo8c3RvcCBzdG9wLWNvbG9yPSIjODA4MEZGIiBzdG9wLW9wYWNpdHk9IjAuOCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM2MzY2RjEiIHN0b3Atb3BhY2l0eT0iMC4yIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPHN2Zz4K',
      title: '추상적 배경 디자인',
      prompt: '부드러운 그라데이션과 기하학적 패턴의 추상적 배경',
      model: 'Imagen 3',
      style: 'Abstract',
      created: '2일 전',
      likes: 15,
      downloads: 22,
      size: '1920x1080',
      avatar: '🌈',
    },
    {
      id: 5,
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC42Ii8+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjIyMCIgcj0iMzAiIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC40Ii8+CjxwYXRoIGQ9Ik0xNTAgMjAwQzE1MCAyMDAgMTgwIDE1MCAyMzAgMTcwQzI4MCAyMCAzMTAgMTYwIDMwMCAxODAiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMF8xIiB4MT0iMCIgeTE9IjAiIHgyPSI0MDAiIHkyPSIzMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzE0QjhBNiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwOEI5RkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K',
      title: '사이버펑크 도시',
      prompt: '네온사인이 빛나는 미래 도시의 밤 풍경, 사이버펑크 스타일',
      model: 'Flux Schnell',
      style: 'Cyberpunk',
      created: '3일 전',
      likes: 45,
      downloads: 28,
      size: '1024x1024',
      avatar: '🌃',
    },
    {
      id: 6,
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8ZWxsaXBzZSBjeD0iMjAwIiBjeT0iMTAwIiByeD0iODAiIHJ5PSI0MCIgZmlsbD0iI0ZGRiIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPHJlY3QgeD0iMTYwIiB5PSIxNDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC4yIiByeD0iMTAiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8wXzEiIHgxPSIwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjMwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkY2QzkzIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGN0NFNSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=',
      title: '3D 제품 렌더링',
      prompt: '미니멀한 제품 패키지 디자인, 파스텔 컬러와 부드러운 그림자',
      model: 'Imagen 3',
      style: 'Product',
      created: '1주 전',
      likes: 27,
      downloads: 16,
      size: '800x800',
      avatar: '📦',
    },
  ]

  const filterOptions = [
    { id: 'all', label: '전체', icon: PhotoIcon },
    { id: 'UI/UX', label: 'UI/UX', icon: CubeIcon },
    { id: 'Character', label: '캐릭터', icon: FilmIcon },
    { id: 'Logo', label: '로고', icon: SparklesIcon },
    { id: 'Abstract', label: '추상', icon: SwatchIcon },
  ]

  // 이미지 생성 핸들러
  const handleGenerate = async (params: {
    prompt: string
    model: string
    style: string
    count: number
    size: string
    quality: string
    seed?: number
    guidance?: number
    steps?: number
  }) => {
    setIsGenerating(true)

    // 새 생성 항목 추가
    const newGeneration = {
      id: `gen-${Date.now()}`,
      status: 'queued' as const,
      progress: 0,
      model: params.model,
      prompt: params.prompt,
      queuePosition: 1,
      startedAt: new Date(),
    }

    setGenerations(prev => [newGeneration, ...prev])

    // API 호출 시뮬레이션
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          async: true,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Generation started:', result)
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 참조 이미지 핸들러
  const handleReferenceImageUpload = (file: File, url: string) => {
    setReferenceImage({ file, url })
    // Flux Context 모델로 자동 전환
    setSelectedModel('flux-context')
  }

  const handleReferenceImageRemove = () => {
    setReferenceImage(null)
    // 기본 모델로 복원
    setSelectedModel('flux-schnell')
  }

  // 생성 진행 상태 핸들러
  const handleCancelGeneration = (id: string) => {
    setGenerations(prev =>
      prev.map(gen =>
        gen.id === id ? { ...gen, status: 'cancelled' as const } : gen
      )
    )
  }

  const handleRetryGeneration = (id: string) => {
    setGenerations(prev =>
      prev.map(gen =>
        gen.id === id ? { ...gen, status: 'queued' as const, progress: 0 } : gen
      )
    )
  }

  const handleViewResult = (id: string) => {
    console.log('View result for:', id)
  }

  const handleDownloadResult = (id: string) => {
    console.log('Download result for:', id)
  }

  const filteredImages = images.filter(image => {
    const matchesFilter =
      selectedFilter === 'all' || image.style === selectedFilter
    const matchesSearch =
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-full">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                AI 이미지 스튜디오
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                상상을 현실로 만드는 AI 이미지 생성 ✨
              </p>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-4"
        >
          <button className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5" />
            <span>새 이미지 생성</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPromptHelper(!showPromptHelper)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                showPromptHelper
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <LightBulbIcon className="w-4 h-4" />
              프롬프트 도우미
            </button>
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                showAdvancedSettings
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Cog6ToothIcon className="w-4 h-4" />
              고급 설정
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* 프롬프트 헬퍼 */}
      <AnimatePresence>
        {showPromptHelper && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1 }}
          >
            <PromptHelper
              currentPrompt={currentPrompt}
              onPromptChange={setCurrentPrompt}
              model={selectedModel}
              style=""
              className="mb-6"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 새로운 이미지 생성 패널 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* 메인 생성 패널 */}
        <div className="lg:col-span-2">
          <ImageGenerationPanel
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            disabled={false}
          />
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 참조 이미지 업로드 */}
          <ReferenceImageUpload
            onImageUpload={handleReferenceImageUpload}
            onImageRemove={handleReferenceImageRemove}
            currentImage={referenceImage}
            disabled={isGenerating}
          />

          {/* 생성 진행 상태 */}
          <GenerationProgressStatus
            generations={generations}
            onCancel={handleCancelGeneration}
            onRetry={handleRetryGeneration}
            onViewResult={handleViewResult}
            onDownload={handleDownloadResult}
          />
        </div>
      </motion.div>

      {/* 고급 설정 패널 */}
      <AnimatePresence>
        {showAdvancedSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1 }}
          >
            <AdvancedSettingsPanel
              settings={advancedSettings}
              onSettingsChange={setAdvancedSettings}
              modelType={selectedModel}
              disabled={isGenerating}
              className="mb-6"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-white/20 dark:border-gray-600/50 rounded-xl leading-5 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
              placeholder="이미지 제목이나 프롬프트로 검색..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => {
            const Icon = option.icon
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedFilter(option.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedFilter === option.id
                    ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-white/20 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{option.label}</span>
                {option.id !== 'all' && (
                  <span className="text-xs bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                    {images.filter(img => img.style === option.id).length}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Images grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="relative">
                <div className="aspect-w-4 aspect-h-3 bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={image.url}
                    alt={image.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Overlay actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors"
                  >
                    <HeartIcon className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:text-slate-500 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Avatar and model badge */}
                <div className="absolute top-2 left-2 flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-sm">
                    {image.avatar}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 ${
                      image.model === 'Flux Schnell'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                        : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                    } text-white rounded-full font-medium`}
                  >
                    {image.model === 'Flux Schnell' ? 'Flux' : 'Imagen'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                  {image.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                  {image.prompt}
                </p>

                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <HeartIcon className="w-3 h-3" />
                      <span>{image.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ArrowDownTrayIcon className="w-3 h-3" />
                      <span>{image.downloads}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {image.created}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                    {image.size}
                  </span>
                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 text-gray-400 hover:text-slate-500 transition-colors"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 text-gray-400 hover:text-emerald-500 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredImages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhotoIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            이미지가 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            검색 조건에 맞는 이미지를 찾을 수 없습니다.
          </p>
        </motion.div>
      )}
    </div>
  )
}
