'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bars3Icon,
  ArrowsRightLeftIcon,
  WindowIcon,
  EyeIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'

export type LayoutMode =
  | 'split'
  | 'fullscreen-editor'
  | 'fullscreen-preview'
  | 'sidebar'
  | 'popup'

export interface CanvasLayoutProps {
  children: React.ReactNode
  editorContent: React.ReactNode
  previewContent: React.ReactNode
  mode?: LayoutMode
  onModeChange?: (mode: LayoutMode) => void
  showSidebar?: boolean
  onToggleSidebar?: () => void
  className?: string
}

export default function CanvasLayout({
  children,
  editorContent,
  previewContent,
  mode = 'split',
  onModeChange,
  showSidebar = false,
  onToggleSidebar,
  className = '',
}: CanvasLayoutProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [splitRatio, setSplitRatio] = useState(50) // 에디터:미리보기 비율 (%)
  const [popupWindow, setPopupWindow] = useState<Window | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizerRef = useRef<HTMLDivElement>(null)

  // 분할 크기 조정 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'split') return

    setIsResizing(true)
    const startX = e.clientX
    const startRatio = splitRatio
    const containerWidth = containerRef.current?.offsetWidth || 1

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaRatio = (deltaX / containerWidth) * 100
      const newRatio = Math.max(20, Math.min(80, startRatio + deltaRatio))
      setSplitRatio(newRatio)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // 새창 팝업 열기
  const openPopup = () => {
    const popup = window.open(
      '',
      '_blank',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    )
    if (popup) {
      setPopupWindow(popup)
      popup.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Code Preview</title>
            <style>
              body { margin: 0; padding: 0; font-family: system-ui; }
              .popup-container { height: 100vh; overflow: hidden; }
            </style>
          </head>
          <body>
            <div id="popup-root" class="popup-container"></div>
          </body>
        </html>
      `)
      popup.document.close()

      // 팝업이 닫힐 때 상태 초기화
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          setPopupWindow(null)
          clearInterval(checkClosed)
        }
      }, 1000)
    }
  }

  // 팝업 창 닫기
  const closePopup = useCallback(() => {
    if (popupWindow) {
      popupWindow.close()
      setPopupWindow(null)
    }
  }, [popupWindow])

  // 레이아웃 모드 변경
  const handleModeChange = useCallback(
    (newMode: LayoutMode) => {
      if (newMode === 'popup') {
        openPopup()
      } else if (mode === 'popup') {
        closePopup()
      }
      onModeChange?.(newMode)
    },
    [mode, onModeChange, closePopup]
  )

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            handleModeChange('split')
            break
          case '2':
            e.preventDefault()
            handleModeChange('fullscreen-editor')
            break
          case '3':
            e.preventDefault()
            handleModeChange('fullscreen-preview')
            break
          case 'b':
            e.preventDefault()
            onToggleSidebar?.()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleModeChange, onToggleSidebar])

  // 컴포넌트 언마운트 시 팝업 정리
  useEffect(() => {
    return () => {
      if (popupWindow) {
        popupWindow.close()
      }
    }
  }, [popupWindow])

  return (
    <div className={`flex h-full ${className}`} ref={containerRef}>
      {/* 사이드바 */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <div className="h-full overflow-y-auto">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* 레이아웃 컨트롤 바 */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            {/* 사이드바 토글 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              className={`p-2 rounded-md transition-colors ${
                showSidebar
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              title="사이드바 토글 (Ctrl+B)"
            >
              <Bars3Icon className="w-4 h-4" />
            </motion.button>

            {/* 레이아웃 모드 버튼들 */}
            <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleModeChange('split')}
                className={`p-2 rounded-md transition-colors ${
                  mode === 'split'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                title="분할 뷰 (Ctrl+1)"
              >
                <ArrowsRightLeftIcon className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleModeChange('fullscreen-editor')}
                className={`p-2 rounded-md transition-colors ${
                  mode === 'fullscreen-editor'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                title="에디터 전체화면 (Ctrl+2)"
              >
                <CodeBracketIcon className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleModeChange('fullscreen-preview')}
                className={`p-2 rounded-md transition-colors ${
                  mode === 'fullscreen-preview'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                title="미리보기 전체화면 (Ctrl+3)"
              >
                <EyeIcon className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleModeChange('popup')}
                className={`p-2 rounded-md transition-colors ${
                  mode === 'popup'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                title="새창에서 미리보기"
              >
                <WindowIcon className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            {mode === 'split' && (
              <span>
                Editor: {splitRatio}% | Preview: {100 - splitRatio}%
              </span>
            )}
            <span className="capitalize">{mode.replace('-', ' ')}</span>
          </div>
        </div>

        {/* 레이아웃별 컨텐츠 */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* 분할 뷰 */}
          {mode === 'split' && (
            <>
              <motion.div
                style={{ width: `${splitRatio}%` }}
                className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700"
                animate={{ width: `${splitRatio}%` }}
                transition={{ duration: isResizing ? 0 : 0.3 }}
              >
                {editorContent}
              </motion.div>

              {/* 크기 조정 핸들 */}
              <div
                ref={resizerRef}
                onMouseDown={handleMouseDown}
                className={`w-1 bg-gray-200 dark:bg-gray-700 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors ${
                  isResizing ? 'bg-blue-500' : ''
                }`}
                title="드래그하여 크기 조정"
              />

              <motion.div
                style={{ width: `${100 - splitRatio}%` }}
                className="flex-1 min-w-0"
                animate={{ width: `${100 - splitRatio}%` }}
                transition={{ duration: isResizing ? 0 : 0.3 }}
              >
                {previewContent}
              </motion.div>
            </>
          )}

          {/* 에디터 전체화면 */}
          {mode === 'fullscreen-editor' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1"
            >
              {editorContent}
            </motion.div>
          )}

          {/* 미리보기 전체화면 */}
          {mode === 'fullscreen-preview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1"
            >
              {previewContent}
            </motion.div>
          )}

          {/* 팝업 모드 */}
          {mode === 'popup' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
            >
              <div className="text-center">
                <WindowIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  새창에서 미리보기 중
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  미리보기가 별도 창에서 열렸습니다.
                </p>
                <button
                  onClick={closePopup}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  팝업 닫기
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
