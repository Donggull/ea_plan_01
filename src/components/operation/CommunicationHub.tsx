'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  BellIcon,
  PhoneIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FaceSmileIcon,
  PaperClipIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HashtagIcon,
  AtSymbolIcon,
  MegaphoneIcon,
  UsersIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'file' | 'image' | 'system'
  timestamp: string
  isEdited: boolean
  replyTo?: string
  reactions?: { emoji: string; users: string[] }[]
  attachments?: MessageAttachment[]
}

interface MessageAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

interface ChatChannel {
  id: string
  name: string
  description: string
  type: 'general' | 'project' | 'team' | 'announcement' | 'private'
  memberCount: number
  isPrivate: boolean
  lastActivity: string
  unreadCount: number
  isPinned: boolean
  projectId?: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  team: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: string
}

interface Notification {
  id: string
  type: 'mention' | 'reply' | 'system' | 'announcement'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  channelId?: string
  senderId?: string
}

interface Meeting {
  id: string
  title: string
  description: string
  startTime: string
  duration: number
  participants: string[]
  link?: string
  type: 'video' | 'audio' | 'in-person'
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
}

// Mock data
const mockChannels: ChatChannel[] = [
  {
    id: 'ch-001',
    name: 'general',
    description: '일반 대화',
    type: 'general',
    memberCount: 12,
    isPrivate: false,
    lastActivity: '2025-01-12T14:30:00Z',
    unreadCount: 3,
    isPinned: true,
  },
  {
    id: 'ch-002',
    name: 'project-ecommerce',
    description: 'E-commerce 프로젝트',
    type: 'project',
    memberCount: 8,
    isPrivate: false,
    lastActivity: '2025-01-12T13:45:00Z',
    unreadCount: 7,
    isPinned: true,
    projectId: 'proj-001',
  },
  {
    id: 'ch-003',
    name: 'frontend-team',
    description: '프론트엔드팀 채널',
    type: 'team',
    memberCount: 4,
    isPrivate: false,
    lastActivity: '2025-01-12T12:20:00Z',
    unreadCount: 0,
    isPinned: false,
  },
  {
    id: 'ch-004',
    name: 'announcements',
    description: '공지사항',
    type: 'announcement',
    memberCount: 12,
    isPrivate: false,
    lastActivity: '2025-01-12T09:00:00Z',
    unreadCount: 1,
    isPinned: true,
  },
  {
    id: 'ch-005',
    name: 'design-review',
    description: '디자인 리뷰',
    type: 'private',
    memberCount: 3,
    isPrivate: true,
    lastActivity: '2025-01-12T11:15:00Z',
    unreadCount: 0,
    isPinned: false,
  },
]

const mockMessages: ChatMessage[] = [
  {
    id: 'msg-001',
    senderId: 'user-001',
    senderName: '김개발',
    content: '안녕하세요! 새로운 프로젝트 관련해서 회의를 진행하려고 합니다.',
    type: 'text',
    timestamp: '2025-01-12T14:30:00Z',
    isEdited: false,
    reactions: [
      { emoji: '👍', users: ['user-002', 'user-003'] },
      { emoji: '❤️', users: ['user-004'] },
    ],
  },
  {
    id: 'msg-002',
    senderId: 'user-002',
    senderName: '이디자인',
    content: '좋은 아이디어네요! 언제 진행할 예정인가요?',
    type: 'text',
    timestamp: '2025-01-12T14:32:00Z',
    isEdited: false,
    replyTo: 'msg-001',
  },
  {
    id: 'msg-003',
    senderId: 'user-001',
    senderName: '김개발',
    content: '내일 오후 2시에 진행하면 어떨까요? 회의실 예약해놨습니다.',
    type: 'text',
    timestamp: '2025-01-12T14:35:00Z',
    isEdited: false,
    attachments: [
      {
        id: 'att-001',
        name: '회의_안건.pdf',
        type: 'application/pdf',
        size: 245760,
        url: '#',
      },
    ],
  },
  {
    id: 'msg-004',
    senderId: 'system',
    senderName: 'System',
    content: '박백엔드님이 채널에 참여했습니다.',
    type: 'system',
    timestamp: '2025-01-12T14:40:00Z',
    isEdited: false,
  },
]

const mockMembers: TeamMember[] = [
  {
    id: 'user-001',
    name: '김개발',
    email: 'kim.dev@company.com',
    role: 'Senior Developer',
    team: 'Frontend',
    status: 'online',
    lastSeen: '2025-01-12T14:45:00Z',
  },
  {
    id: 'user-002',
    name: '이디자인',
    email: 'lee.design@company.com',
    role: 'UX Designer',
    team: 'Design',
    status: 'away',
    lastSeen: '2025-01-12T14:20:00Z',
  },
  {
    id: 'user-003',
    name: '박백엔드',
    email: 'park.backend@company.com',
    role: 'Backend Developer',
    team: 'Backend',
    status: 'busy',
    lastSeen: '2025-01-12T14:30:00Z',
  },
  {
    id: 'user-004',
    name: '최기획',
    email: 'choi.pm@company.com',
    role: 'Project Manager',
    team: 'Management',
    status: 'offline',
    lastSeen: '2025-01-12T12:00:00Z',
  },
]

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'mention',
    title: 'project-ecommerce에서 멘션',
    message: '김개발님이 당신을 멘션했습니다.',
    timestamp: '2025-01-12T14:30:00Z',
    isRead: false,
    channelId: 'ch-002',
    senderId: 'user-001',
  },
  {
    id: 'notif-002',
    type: 'announcement',
    title: '새로운 공지사항',
    message: '월간 전체 회의 일정이 공지되었습니다.',
    timestamp: '2025-01-12T09:00:00Z',
    isRead: false,
    channelId: 'ch-004',
  },
]

const mockMeetings: Meeting[] = [
  {
    id: 'meet-001',
    title: '프로젝트 킥오프 미팅',
    description: 'E-commerce 프로젝트 시작 회의',
    startTime: '2025-01-13T14:00:00Z',
    duration: 60,
    participants: ['user-001', 'user-002', 'user-003'],
    link: 'https://meet.google.com/abc-defg-hij',
    type: 'video',
    status: 'scheduled',
  },
  {
    id: 'meet-002',
    title: '일일 스탠드업',
    description: '데일리 스크럼 미팅',
    startTime: '2025-01-13T09:30:00Z',
    duration: 30,
    participants: ['user-001', 'user-002', 'user-003', 'user-004'],
    type: 'video',
    status: 'scheduled',
  },
]

export default function CommunicationHub({ projectId }: { projectId: string }) {
  const [channels, setChannels] = useState<ChatChannel[]>(mockChannels)
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(
    mockChannels[0]
  )
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [members, setMembers] = useState<TeamMember[]>(mockMembers)
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications)
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'chat' | 'members' | 'meetings'>(
    'chat'
  )
  const [showNotifications, setShowNotifications] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  // Get channel icon
  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'general':
        return <HashtagIcon className="w-4 h-4" />
      case 'project':
        return <DocumentTextIcon className="w-4 h-4" />
      case 'team':
        return <UserGroupIcon className="w-4 h-4" />
      case 'announcement':
        return <MegaphoneIcon className="w-4 h-4" />
      case 'private':
        return <UsersIcon className="w-4 h-4" />
      default:
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />
    }
  }

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-current',
      senderName: '현재 사용자',
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
      isEdited: false,
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Update channel last activity
    setChannels(prev =>
      prev.map(ch =>
        ch.id === selectedChannel.id
          ? { ...ch, lastActivity: new Date().toISOString() }
          : ch
      )
    )
  }

  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    )
  }

  // Add reaction
  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || []
          const existingReaction = reactions.find(r => r.emoji === emoji)

          if (existingReaction) {
            // Toggle reaction
            if (existingReaction.users.includes('user-current')) {
              existingReaction.users = existingReaction.users.filter(
                u => u !== 'user-current'
              )
            } else {
              existingReaction.users.push('user-current')
            }
            return {
              ...msg,
              reactions: reactions.filter(r => r.users.length > 0),
            }
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [...reactions, { emoji, users: ['user-current'] }],
            }
          }
        }
        return msg
      })
    )
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderChannelList = () => (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-2">
            Pinned Channels
          </div>
          {channels
            .filter(ch => ch.isPinned)
            .map(channel => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
                  selectedChannel?.id === channel.id
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="text-gray-400">
                  {getChannelIcon(channel.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{channel.name}</span>
                    {channel.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {channel.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {channel.memberCount} members
                  </div>
                </div>
              </button>
            ))}

          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-2 mt-4">
            Other Channels
          </div>
          {channels
            .filter(ch => !ch.isPinned)
            .map(channel => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
                  selectedChannel?.id === channel.id
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="text-gray-400">
                  {getChannelIcon(channel.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{channel.name}</span>
                    {channel.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {channel.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {channel.memberCount} members
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Add Channel Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <PlusIcon className="w-4 h-4" />
          <span className="text-sm">Add Channel</span>
        </button>
      </div>
    </div>
  )

  const renderChatArea = () => (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-gray-400">
              {selectedChannel && getChannelIcon(selectedChannel.type)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedChannel?.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedChannel?.description} • {selectedChannel?.memberCount}{' '}
                members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <PhoneIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <VideoCameraIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === 'system' ? 'justify-center' : ''
            }`}
          >
            {message.type === 'system' ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                {message.content}
              </div>
            ) : (
              <>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                  {message.senderName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {message.senderName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>

                  {message.replyTo && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 mb-2 text-sm border-l-2 border-gray-300 dark:border-gray-600">
                      Reply to previous message
                    </div>
                  )}

                  <div className="text-gray-900 dark:text-white">
                    {message.content}
                  </div>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map(attachment => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          <PaperClipIcon className="w-4 h-4 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                          <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {message.reactions.map((reaction, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            addReaction(message.id, reaction.emoji)
                          }
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm"
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {reaction.users.length}
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm"
                      >
                        ➕
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Message #${selectedChannel?.name}`}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              className="w-full px-4 py-3 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <PaperClipIcon className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FaceSmileIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderMembersTab = () => (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Team Members
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {members.filter(m => m.status === 'online').length} online,{' '}
          {members.length} total
        </p>
      </div>

      <div className="space-y-4">
        {['online', 'away', 'busy', 'offline'].map(status => {
          const statusMembers = members.filter(m => m.status === status)
          if (statusMembers.length === 0) return null

          return (
            <div key={status}>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 capitalize">
                {status} ({statusMembers.length})
              </h4>
              <div className="space-y-2">
                {statusMembers.map(member => (
                  <motion.div
                    key={member.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(member.status)}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {member.name}
                        </span>
                        {member.role === 'Project Manager' && (
                          <StarIcon className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {member.role} • {member.team}
                      </div>
                      {member.status === 'offline' && (
                        <div className="text-xs text-gray-400">
                          Last seen {new Date(member.lastSeen).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg">
                        <VideoCameraIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderMeetingsTab = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Meetings
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {meetings.filter(m => m.status === 'scheduled').length} scheduled
            meetings
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      <div className="space-y-4">
        {meetings.map(meeting => (
          <motion.div
            key={meeting.id}
            whileHover={{ scale: 1.01 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {meeting.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {meeting.description}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  meeting.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : meeting.status === 'ongoing'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : meeting.status === 'completed'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {meeting.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {new Date(meeting.startTime).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {new Date(meeting.startTime).toLocaleTimeString()} (
                {meeting.duration} min)
              </div>
              <div className="flex items-center gap-1">
                {meeting.type === 'video' ? (
                  <VideoCameraIcon className="w-4 h-4" />
                ) : (
                  <PhoneIcon className="w-4 h-4" />
                )}
                {meeting.type === 'video' ? 'Video Call' : 'Audio Call'}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {meeting.participants.length} participants
                </span>
                <div className="flex -space-x-2">
                  {meeting.participants
                    .slice(0, 3)
                    .map((participantId, index) => {
                      const participant = members.find(
                        m => m.id === participantId
                      )
                      return (
                        <div
                          key={participantId}
                          className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800"
                        >
                          {participant?.name.charAt(0)}
                        </div>
                      )
                    })}
                  {meeting.participants.length > 3 && (
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
                      +{meeting.participants.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {meeting.link && (
                  <button className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-sm">
                    Join
                  </button>
                )}
                <button className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm">
                  Edit
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="h-[800px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex">
      {/* Channel List */}
      {renderChannelList()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Navigation */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              소통 허브
            </h2>
            <div className="flex items-center gap-4">
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('chat')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'chat'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 inline-block mr-2" />
                  Chat
                </button>
                <button
                  onClick={() => setViewMode('members')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'members'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <UserGroupIcon className="w-4 h-4 inline-block mr-2" />
                  Members
                </button>
                <button
                  onClick={() => setViewMode('meetings')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'meetings'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <VideoCameraIcon className="w-4 h-4 inline-block mr-2" />
                  Meetings
                </button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
                >
                  <BellIcon className="w-5 h-5" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              !notification.isRead
                                ? 'bg-blue-50 dark:bg-blue-900/10'
                                : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    notification.timestamp
                                  ).toLocaleString()}
                                </span>
                              </div>
                              {!notification.isRead && (
                                <button
                                  onClick={() =>
                                    markNotificationAsRead(notification.id)
                                  }
                                  className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {viewMode === 'chat' && renderChatArea()}
              {viewMode === 'members' && renderMembersTab()}
              {viewMode === 'meetings' && renderMeetingsTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
