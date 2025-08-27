'use client'

import { useState } from 'react'
import {
  DocumentTextIcon,
  EyeIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline'

interface FilePreviewProps {
  fileName: string
  fileType: string
  textContent: string
  onClose?: () => void
}

export default function FilePreview({
  fileName,
  fileType,
  textContent,
  onClose,
}: FilePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const getFileIcon = () => {
    if (fileType.includes('pdf')) {
      return '📄'
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝'
    } else if (fileType.includes('text')) {
      return '📃'
    } else if (fileType.includes('hwp')) {
      return '📋'
    }
    return '📄'
  }

  const formatFileSize = (content: string) => {
    const sizeInKB = new Blob([content]).size / 1024
    return sizeInKB < 1024
      ? `${sizeInKB.toFixed(1)} KB`
      : `${(sizeInKB / 1024).toFixed(1)} MB`
  }

  const getWordCount = (content: string) => {
    return content.trim().split(/\s+/).length
  }

  const getLineCount = (content: string) => {
    return content.split('\n').length
  }

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900'
          : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getFileIcon()}</div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
              {fileName}
            </h3>
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatFileSize(textContent)}</span>
              <span>{getWordCount(textContent).toLocaleString()} 단어</span>
              <span>{getLineCount(textContent).toLocaleString()} 줄</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isFullscreen ? '창 모드' : '전체화면'}
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="닫기"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={`${isFullscreen ? 'flex-1 overflow-hidden' : 'max-h-96'}`}
      >
        <div className="p-4 h-full overflow-auto">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
              {textContent}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer with statistics */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>파일 타입: {fileType}</span>
          <div className="flex items-center space-x-1">
            <EyeIcon className="w-4 h-4" />
            <span>미리보기</span>
          </div>
        </div>
      </div>
    </div>
  )
}
