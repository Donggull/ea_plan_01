'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import { supabase } from '@/lib/supabase'

interface CustomBot {
  id: string
  name: string
  description: string
  is_public: boolean
  created_at: string
  updated_at: string
  user_id: string
  avatar?: string
  tags?: string[]
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
  const [activeTab, setActiveTab] = useState<'my-bots' | 'public-bots'>('my-bots')

  useEffect(() => {
    loadBots()
  }, [])

  const loadBots = async () => {
    try {
      setLoading(true)
      
      // Load my bots
      const { data: myBotsData, error: myBotsError } = await supabase
        .from('custom_bots')
        .select(`
          *,
          knowledge_base!inner(count)
        `)
        .eq('user_id', 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d')
        .order('updated_at', { ascending: false })

      if (myBotsError) {
        console.error('Failed to load my bots:', myBotsError)
      } else {
        setMyBots(myBotsData || [])
      }

      // Load public bots
      const { data: publicBotsData, error: publicBotsError } = await supabase
        .from('custom_bots')
        .select(`
          *,
          knowledge_base!inner(count)
        `)
        .eq('is_public', true)
        .order('like_count', { ascending: false })
        .limit(20)

      if (publicBotsError) {
        console.error('Failed to load public bots:', publicBotsError)
      } else {
        setPublicBots(publicBotsData || [])
      }
    } catch (error) {
      console.error('Failed to load bots:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBots = (bots: CustomBot[]) => {
    if (!searchQuery) return bots
    return bots.filter(bot =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  const handleCreateBot = () => {
    router.push('/newel/create')
  }

  const handleBotClick = (botId: string) => {
    router.push(`/newel/${botId}`)
  }

  const BotCard = ({ bot, isPublic = false }: { bot: CustomBot; isPublic?: boolean }) => (
    <motion.div
      key={bot.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
      onClick={() => handleBotClick(bot.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            {bot.avatar ? (
              <span className="text-xl">{bot.avatar}</span>
            ) : (
              <CpuChipIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {bot.name}
            </h3>
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
            <GlobeAltIcon className="w-5 h-5 text-green-500" title="공개 챗봇" />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                  <CpuChipIcon className="w-8 h-8 text-blue-600" />
                  <span>뉴엘 - 커스텀 챗봇</span>
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  나만의 지식베이스로 특화된 AI 어시스턴트를 만들어보세요
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateBot}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>새 챗봇 만들기</span>
              </motion.button>
            </div>

            {/* Search and Tabs */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('my-bots')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'my-bots'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  내 챗봇 ({myBots.length})
                </button>
                <button
                  onClick={() => setActiveTab('public-bots')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'public-bots'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  공개 챗봇 ({publicBots.length})
                </button>
              </div>

              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="챗봇 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'my-bots' ? (
              filteredBots(myBots).length > 0 ? (
                filteredBots(myBots).map(bot => (
                  <BotCard key={bot.id} bot={bot} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <CpuChipIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    아직 만든 챗봇이 없습니다
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    첫 번째 커스텀 챗봇을 만들어 특화된 AI 어시스턴트를 경험해보세요
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateBot}
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>첫 챗봇 만들기</span>
                  </motion.button>
                </div>
              )
            ) : (
              filteredBots(publicBots).length > 0 ? (
                filteredBots(publicBots).map(bot => (
                  <BotCard key={bot.id} bot={bot} isPublic />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <GlobeAltIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    공개된 챗봇이 없습니다
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    다른 사용자들이 공유한 챗봇을 찾을 수 없습니다
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}