'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  HeartIcon,
  TrashIcon,
  PlusIcon,
  SparklesIcon,
  ChatBubbleLeftIcon,
  ComputerDesktopIcon,
  EllipsisVerticalIcon,
  StarIcon,
  ClockIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid'

export interface Conversation {
  id: string
  title: string
  model: 'gemini' | 'chatgpt' | 'claude'
  lastMessage: string
  timestamp: string
  messageCount: number
  isFavorite: boolean
  tags: string[]
  status: 'active' | 'idle' | 'completed'
}

interface ConversationHistoryProps {
  conversations: Conversation[]
  selectedConversation?: string
  onConversationSelect: (id: string) => void
  onConversationDelete: (id: string) => void
  onConversationToggleFavorite: (id: string) => void
  onNewConversation: () => void
}

const modelConfig = {
  gemini: {
    name: 'Gemini',
    icon: SparklesIcon,
    color: 'from-blue-500 to-blue-600',
    bgColor:
      'from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20',
  },
  chatgpt: {
    name: 'ChatGPT',
    icon: ChatBubbleLeftIcon,
    color: 'from-green-500 to-green-600',
    bgColor:
      'from-green-50 to-slate-50 dark:from-green-900/20 dark:to-slate-900/20',
  },
  claude: {
    name: 'Claude',
    icon: ComputerDesktopIcon,
    color: 'from-purple-500 to-purple-600',
    bgColor:
      'from-purple-50 to-slate-50 dark:from-purple-900/20 dark:to-slate-900/20',
  },
}

type FilterType = 'all' | 'favorites' | 'recent' | 'today' | 'week'
type SortType = 'newest' | 'oldest' | 'alphabetical' | 'most_messages'

export default function ConversationHistory({
  conversations,
  selectedConversation,
  onConversationSelect,
  onConversationDelete,
  onConversationToggleFavorite,
  onNewConversation,
}: ConversationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('newest')
  const [showDropdown, setShowDropdown] = useState<string | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)

    if (hours < 1) {
      return '방금 전'
    } else if (hours < 24) {
      return `${Math.floor(hours)}시간 전`
    } else if (hours < 48) {
      return '어제'
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const isToday = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isThisWeek = (timestamp: string) => {
    const date = new Date(timestamp)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return date > weekAgo
  }

  const filterConversations = (conversations: Conversation[]) => {
    let filtered = [...conversations]

    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        conv =>
          conv.title.toLowerCase().includes(query) ||
          conv.lastMessage.toLowerCase().includes(query) ||
          conv.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply filter
    switch (filter) {
      case 'favorites':
        filtered = filtered.filter(conv => conv.isFavorite)
        break
      case 'today':
        filtered = filtered.filter(conv => isToday(conv.timestamp))
        break
      case 'week':
        filtered = filtered.filter(conv => isThisWeek(conv.timestamp))
        break
      case 'recent':
        filtered = filtered.slice(0, 10)
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        filtered.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'most_messages':
        filtered.sort((a, b) => b.messageCount - a.messageCount)
        break
      case 'newest':
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        break
    }

    return filtered
  }

  const filteredConversations = filterConversations(conversations)

  const handleDropdownClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    setShowDropdown(showDropdown === conversationId ? null : conversationId)
  }

  const filters = [
    { id: 'all' as FilterType, name: '전체', count: conversations.length },
    {
      id: 'favorites' as FilterType,
      name: '즐겨찾기',
      count: conversations.filter(c => c.isFavorite).length,
    },
    {
      id: 'today' as FilterType,
      name: '오늘',
      count: conversations.filter(c => isToday(c.timestamp)).length,
    },
    {
      id: 'week' as FilterType,
      name: '이번 주',
      count: conversations.filter(c => isThisWeek(c.timestamp)).length,
    },
  ]

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            대화 목록
          </h2>
          <button
            onClick={onNewConversation}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title="새 대화"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="대화 검색..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-1 mb-2">
          {filters.map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === filterOption.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {filterOption.name} ({filterOption.count})
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortType)}
          className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">최신순</option>
          <option value="oldest">오래된 순</option>
          <option value="alphabetical">가나다 순</option>
          <option value="most_messages">메시지 많은 순</option>
        </select>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredConversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400"
            >
              <FolderIcon className="w-12 h-12 mb-2" />
              <p className="text-sm text-center">
                {searchQuery ? '검색 결과가 없습니다' : '아직 대화가 없습니다'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onNewConversation}
                  className="mt-2 text-xs text-blue-500 hover:underline"
                >
                  새 대화 시작하기
                </button>
              )}
            </motion.div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conversation, index) => {
                const config = modelConfig[conversation.model]
                const Icon = config.icon

                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onConversationSelect(conversation.id)}
                    className={`relative p-3 rounded-lg cursor-pointer transition-colors group ${
                      selectedConversation === conversation.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-md bg-gradient-to-r ${config.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-3 h-3 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {conversation.title}
                            </h3>
                            {conversation.isFavorite && (
                              <StarIconSolid className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                            )}
                          </div>

                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                            {conversation.lastMessage}
                          </p>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 dark:text-gray-500">
                                {formatTimestamp(conversation.timestamp)}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">
                                {conversation.messageCount}개 메시지
                              </span>
                            </div>

                            <div
                              className={`w-2 h-2 rounded-full ${
                                conversation.status === 'active'
                                  ? 'bg-green-400'
                                  : conversation.status === 'completed'
                                    ? 'bg-gray-400'
                                    : 'bg-yellow-400'
                              }`}
                            />
                          </div>

                          {conversation.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {conversation.tags.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {conversation.tags.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{conversation.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions Dropdown */}
                      <div className="relative">
                        <button
                          onClick={e => handleDropdownClick(e, conversation.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                          <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
                        </button>

                        {showDropdown === conversation.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-8 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                          >
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                onConversationToggleFavorite(conversation.id)
                                setShowDropdown(null)
                              }}
                              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                            >
                              {conversation.isFavorite ? (
                                <HeartIconSolid className="w-4 h-4 text-red-500" />
                              ) : (
                                <HeartIcon className="w-4 h-4" />
                              )}
                              <span>
                                {conversation.isFavorite
                                  ? '즐겨찾기 해제'
                                  : '즐겨찾기'}
                              </span>
                            </button>

                            <button
                              onClick={e => {
                                e.stopPropagation()
                                if (
                                  confirm('정말 이 대화를 삭제하시겠습니까?')
                                ) {
                                  onConversationDelete(conversation.id)
                                }
                                setShowDropdown(null)
                              }}
                              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>삭제</span>
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-3 h-3" />
            <span>총 {conversations.length}개 대화</span>
          </div>
          <div className="flex items-center space-x-1">
            <StarIcon className="w-3 h-3" />
            <span>
              {conversations.filter(c => c.isFavorite).length}개 즐겨찾기
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
