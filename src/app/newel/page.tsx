'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import {
  PlusIcon,
  CpuChipIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  SparklesIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'

interface CustomBot {
  id: string
  name: string
  description: string
  system_prompt?: string
  is_public: boolean
  created_at: string
  updated_at: string
  user_id: string
  tags?: string[]
  metadata?: {
    avatar?: string
    preferred_model?: 'gemini' | 'gpt' | 'claude'
  }
  knowledge_base_count?: number
  usage_count?: number
  like_count?: number
}

export default function NewelPage() {
  const router = useRouter()
  const [myBots, setMyBots] = useState<CustomBot[]>([])
  const [publicBots, setPublicBots] = useState<CustomBot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'my-bots' | 'public-bots'>(
    'my-bots'
  )
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const loadingRef = useRef(false)
  const supabase = createClientComponentClient()

  const loadBots = async () => {
    if (loadingRef.current) {
      console.log('Already loading bots, skipping...')
      return
    }

    try {
      loadingRef.current = true
      setLoading(true)
      console.log('Loading bots...')

      // Check if we're using a valid Supabase client
      const hasValidSupabase = !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      console.log('Environment check:', {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasValidSupabase,
        nodeEnv: process.env.NODE_ENV,
      })

      if (!hasValidSupabase && process.env.NODE_ENV === 'development') {
        // Development mode with mock data
        console.log('Using mock data for development (no Supabase env vars)')

        // Mock data for development
        const mockMyBots: CustomBot[] = [
          {
            id: 'b1d5c3a7-2f8e-4b9c-a1d6-3e7f9c2a5b8d',
            name: '코딩 어시스턴트',
            description:
              '프로그래밍 관련 질문에 특화된 AI 챗봇입니다. JavaScript, Python, React 등 다양한 기술 스택을 지원합니다.',
            user_id: 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d',
            is_public: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: ['개발', 'JavaScript', 'React'],
            metadata: {
              avatar: '💻',
              preferred_model: 'gemini' as const,
            },
            knowledge_base_count: 5,
            usage_count: 24,
            like_count: 0,
          },
          {
            id: 'c2e6d4b8-3g9f-5c0d-b2e7-4f8g0d3b6c9e',
            name: '기획 컨설턴트',
            description:
              '웹/앱 서비스 기획에 특화된 AI 어시스턴트입니다. 요구사항 분석부터 화면 설계까지 도와드립니다.',
            user_id: 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d',
            is_public: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: ['기획', '컨설팅', 'UX'],
            metadata: {
              avatar: '📋',
              preferred_model: 'claude' as const,
            },
            knowledge_base_count: 8,
            usage_count: 42,
            like_count: 3,
          },
        ]

        const mockPublicBots: CustomBot[] = [
          {
            id: 'd3f7e5c9-4h0g-6d1e-c3f8-5g9h1e4c7d0f',
            name: '마케팅 전략가',
            description:
              '디지털 마케팅 전략 수립과 콘텐츠 기획에 특화된 AI 어시스턴트입니다.',
            user_id: 'other-user-id',
            is_public: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: ['마케팅', '전략', 'SNS'],
            metadata: {
              avatar: '📢',
              preferred_model: 'gpt' as const,
            },
            knowledge_base_count: 12,
            usage_count: 128,
            like_count: 15,
          },
        ]

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        setMyBots(mockMyBots)
        setPublicBots(mockPublicBots)
        console.log('Loaded mock data:', {
          myBots: mockMyBots.length,
          publicBots: mockPublicBots.length,
        })
        return
      }

      // Get current user (fallback to default for testing)
      const userId = 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d'

      // Load my bots
      console.log('Attempting to load bots from Supabase...')
      const { data: myBotsData, error: myBotsError } = await supabase
        .from('custom_bots')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      console.log('My bots query result:', {
        data: myBotsData,
        error: myBotsError,
      })

      if (myBotsError) {
        console.error('Failed to load my bots:', myBotsError)
        setMyBots([])
      } else {
        const processedMyBots = (myBotsData || []).map(bot => ({
          ...bot,
          knowledge_base_count: 0,
        }))
        setMyBots(processedMyBots)
        console.log(`Loaded ${processedMyBots.length} my bots from Supabase`)
      }

      // Load public bots
      const { data: publicBotsData, error: publicBotsError } = await supabase
        .from('custom_bots')
        .select('*')
        .eq('is_public', true)
        .order('like_count', { ascending: false })
        .limit(20)

      console.log('Public bots query result:', {
        data: publicBotsData,
        error: publicBotsError,
      })

      if (publicBotsError) {
        console.error('Failed to load public bots:', publicBotsError)
        setPublicBots([])
      } else {
        const processedPublicBots = (publicBotsData || []).map(bot => ({
          ...bot,
          knowledge_base_count: 0,
        }))
        setPublicBots(processedPublicBots)
        console.log(
          `Loaded ${processedPublicBots.length} public bots from Supabase`
        )
      }
    } catch (error) {
      console.error('Failed to load bots:', error)
      setMyBots([])
      setPublicBots([])
    } finally {
      loadingRef.current = false
      setLoading(false)
      setHasLoaded(true)
      setIsInitialized(true)
      console.log('Bot loading completed. Final state:', {
        loading: false,
        hasLoaded: true,
        isInitialized: true,
        myBotsCount: myBots.length,
        publicBotsCount: publicBots.length,
      })
    }
  }

  useEffect(() => {
    // Load bots when component mounts - simple approach like other pages
    if (!isInitialized) {
      console.log('Loading bots on initial mount...')
      loadBots()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Removed complex visibility/focus handlers that were causing infinite loops
  // Data will only load once on component mount, similar to other pages

  const filteredBots = (bots: CustomBot[]) => {
    if (!searchQuery) return bots
    return bots.filter(
      bot =>
        bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.tags?.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
  }

  const handleCreateBot = () => {
    router.push('/newel/create')
  }

  const handleBotClick = (botId: string) => {
    console.log('Clicking bot with ID:', botId)
    try {
      router.push(`/newel/${botId}`)
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to direct navigation
      window.location.href = `/newel/${botId}`
    }
  }

  const BotCard = ({
    bot,
    isPublic = false,
  }: {
    bot: CustomBot
    isPublic?: boolean
  }) => (
    <motion.div
      key={bot.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        console.log('BotCard clicked for bot:', bot.id, bot.name)
        handleBotClick(bot.id)
      }}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleBotClick(bot.id)
        }
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            {bot.metadata?.avatar ? (
              <span className="text-xl">{bot.metadata.avatar}</span>
            ) : (
              <CpuChipIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {bot.name}
              </h3>
              <div
                className={`px-2 py-1 rounded text-xs font-medium text-white ${
                  bot.metadata?.preferred_model === 'gemini'
                    ? 'bg-blue-500'
                    : bot.metadata?.preferred_model === 'gpt'
                      ? 'bg-green-500'
                      : bot.metadata?.preferred_model === 'claude'
                        ? 'bg-purple-500'
                        : 'bg-gray-500'
                }`}
              >
                {(bot.metadata?.preferred_model || 'gemini').toUpperCase()}
              </div>
            </div>
            {isPublic && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <UserIcon className="w-4 h-4" />
                <span>Creator</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {bot.is_public && (
            <GlobeAltIcon
              className="w-5 h-5 text-green-500"
              title="공개 챗봇"
            />
          )}
          {isPublic && (
            <div className="flex items-center space-x-1 text-red-500">
              <HeartIcon className="w-4 h-4" />
              <span className="text-sm">{bot.like_count || 0}</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
        {bot.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <DocumentTextIcon className="w-4 h-4" />
            <span>{bot.knowledge_base_count || 0}개 문서</span>
          </div>
          <div className="flex items-center space-x-1">
            <SparklesIcon className="w-4 h-4" />
            <span>{bot.usage_count || 0}회 사용</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <ShareIcon className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {bot.tags && bot.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {bot.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {bot.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{bot.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  )

  return (
    <ProtectedRoute>
      <div className="space-y-8 p-6 pb-12">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  뉴엘 - 커스텀 챗봇
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  나만의 지식베이스로 특화된 AI 어시스턴트를 만들어보세요 🤖
                </p>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-4 md:mt-0"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateBot}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>새 챗봇 만들기</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Search and Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl leading-5 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="챗봇 이름이나 설명으로 검색..."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('my-bots')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'my-bots'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="text-sm">내 챗봇</span>
              <span className="text-xs bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                {myBots.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('public-bots')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'public-bots'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <GlobeAltIcon className="w-4 h-4" />
              <span className="text-sm">공개 챗봇</span>
              <span className="text-xs bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                {publicBots.length}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Chatbots grid */}
        <div className="space-y-6">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  챗봇을 불러오는 중...
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {activeTab === 'my-bots' ? (
                filteredBots(myBots).length > 0 ? (
                  filteredBots(myBots).map((bot, index) => (
                    <motion.div
                      key={bot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <BotCard bot={bot} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-12"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CpuChipIcon className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      아직 만든 챗봇이 없습니다
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      첫 번째 커스텀 챗봇을 만들어 특화된 AI 어시스턴트를
                      경험해보세요
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreateBot}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>첫 챗봇 만들기</span>
                    </motion.button>
                  </motion.div>
                )
              ) : filteredBots(publicBots).length > 0 ? (
                filteredBots(publicBots).map((bot, index) => (
                  <motion.div
                    key={bot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BotCard bot={bot} isPublic />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GlobeAltIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    공개된 챗봇이 없습니다
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    다른 사용자들이 공유한 챗봇을 찾을 수 없습니다
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
