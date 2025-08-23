'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowUturnLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisVerticalIcon,
  ClipboardIcon,
  CheckIcon,
  PencilIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'
import {
  HandThumbUpIcon as HandThumbUpSolid,
  HandThumbDownIcon as HandThumbDownSolid,
  BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/solid'
import { type Message } from './MessageBubble'

interface MessageActionsProps {
  message: Message
  onRate?: (messageId: string, rating: 'up' | 'down' | null) => void
  onRegenerate?: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void
  onBookmark?: (messageId: string) => void
  onShare?: (messageId: string) => void
  onCopyCode?: (code: string) => void
}

export default function MessageActions({
  message,
  onRate,
  onRegenerate,
  onEdit,
  onBookmark,
  onShare,
  onCopyCode,
}: MessageActionsProps) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState<'up' | 'down' | null>(
    (message as Message & { rating?: 'up' | 'down' | null }).rating || null
  )
  const [isBookmarked, setIsBookmarked] = useState(
    (message as Message & { isBookmarked?: boolean }).isBookmarked || false
  )

  const handleRating = (newRating: 'up' | 'down') => {
    const finalRating = rating === newRating ? null : newRating
    setRating(finalRating)
    onRate?.(message.id, finalRating)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(message.id, editContent)
      setIsEditing(false)
    } else {
      setIsEditing(true)
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    onBookmark?.(message.id)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI 대화',
          text: message.content,
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback to copying link
      handleCopy()
    }
    onShare?.(message.id)
  }

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const blocks = []
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      })
    }

    return blocks
  }

  const codeBlocks = extractCodeBlocks(message.content)
  const isUserMessage = message.role === 'user'

  if (isEditing) {
    return (
      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <textarea
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm resize-none"
          rows={4}
        />
        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={() => {
              setIsEditing(false)
              setEditContent(message.content)
            }}
            className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
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
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Action Buttons */}
      <AnimatePresence>
        {(showActions || window.innerWidth < 768) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`flex items-center space-x-1 mt-2 ${
              isUserMessage ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Rating buttons (only for assistant messages) */}
            {!isUserMessage && (
              <>
                <button
                  onClick={() => handleRating('up')}
                  className={`p-1.5 rounded-full transition-colors ${
                    rating === 'up'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                  }`}
                  title="좋아요"
                >
                  {rating === 'up' ? (
                    <HandThumbUpSolid className="w-3 h-3" />
                  ) : (
                    <HandThumbUpIcon className="w-3 h-3" />
                  )}
                </button>

                <button
                  onClick={() => handleRating('down')}
                  className={`p-1.5 rounded-full transition-colors ${
                    rating === 'down'
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                  }`}
                  title="싫어요"
                >
                  {rating === 'down' ? (
                    <HandThumbDownSolid className="w-3 h-3" />
                  ) : (
                    <HandThumbDownIcon className="w-3 h-3" />
                  )}
                </button>
              </>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              title="복사"
            >
              {copied ? (
                <CheckIcon className="w-3 h-3 text-green-500" />
              ) : (
                <ClipboardIcon className="w-3 h-3" />
              )}
            </button>

            {/* Code copy buttons */}
            {codeBlocks.length > 0 && (
              <div className="flex space-x-1">
                {codeBlocks.map((block, idx) => (
                  <button
                    key={idx}
                    onClick={() => onCopyCode?.(block.code)}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    title={`${block.language} 코드 복사`}
                  >
                    <CodeBracketIcon className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Edit button (only for user messages) */}
            {isUserMessage && (
              <button
                onClick={handleEdit}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                title="편집"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
            )}

            {/* Regenerate button (only for assistant messages) */}
            {!isUserMessage && onRegenerate && (
              <button
                onClick={() => onRegenerate(message.id)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                title="다시 생성"
              >
                <ArrowUturnLeftIcon className="w-3 h-3" />
              </button>
            )}

            {/* Bookmark button */}
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-full transition-colors ${
                isBookmarked
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
              }`}
              title="북마크"
            >
              {isBookmarked ? (
                <BookmarkSolid className="w-3 h-3" />
              ) : (
                <BookmarkIcon className="w-3 h-3" />
              )}
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              title="공유"
            >
              <ShareIcon className="w-3 h-3" />
            </button>

            {/* More options */}
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors md:hidden"
              title="더 많은 옵션"
            >
              <EllipsisVerticalIcon className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show actions on hover (desktop only) */}
      <div
        className="absolute inset-0 hidden md:block"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      />
    </div>
  )
}
