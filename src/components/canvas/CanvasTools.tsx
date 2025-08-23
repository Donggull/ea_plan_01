'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  ArrowPathIcon,
  BugAntIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline'

export interface CanvasToolsProps {
  code: string
  language: string
  onCodeChange?: (code: string) => void
  onReload?: () => void
  onFormat?: (code: string) => Promise<string>
  onDebug?: () => void
  onInstallPackage?: (packageName: string) => Promise<void>
  isLiveReloadEnabled?: boolean
  onToggleLiveReload?: (enabled: boolean) => void
  className?: string
}

interface PackageInfo {
  name: string
  version: string
  description: string
  installed: boolean
}

export default function CanvasTools({
  code,
  language,
  onCodeChange,
  onReload,
  onFormat,
  onDebug,
  onInstallPackage,
  isLiveReloadEnabled = false,
  onToggleLiveReload,
  className = '',
}: CanvasToolsProps) {
  const [isFormatting, setIsFormatting] = useState(false)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [showPackageManager, setShowPackageManager] = useState(false)
  const [packageSearch, setPackageSearch] = useState('')
  const [availablePackages, setAvailablePackages] = useState<PackageInfo[]>([
    {
      name: 'lodash',
      version: '4.17.21',
      description: 'JavaScript utility library',
      installed: false,
    },
    {
      name: 'moment',
      version: '2.29.4',
      description: 'Parse, validate, manipulate, and display dates',
      installed: false,
    },
    {
      name: 'axios',
      version: '1.6.0',
      description: 'Promise-based HTTP client',
      installed: false,
    },
    {
      name: 'uuid',
      version: '9.0.1',
      description: 'Generate RFC-compliant UUIDs',
      installed: true,
    },
  ])

  // 코드 포맷팅
  const handleFormat = async () => {
    if (!onFormat) return

    setIsFormatting(true)
    try {
      const formattedCode = await onFormat(code)
      onCodeChange?.(formattedCode)
    } catch (error) {
      console.error('포맷팅 실패:', error)
    } finally {
      setIsFormatting(false)
    }
  }

  // 패키지 설치
  const handleInstallPackage = async (packageName: string) => {
    if (!onInstallPackage) return

    try {
      await onInstallPackage(packageName)
      setAvailablePackages(prev =>
        prev.map(pkg =>
          pkg.name === packageName ? { ...pkg, installed: true } : pkg
        )
      )
    } catch (error) {
      console.error('패키지 설치 실패:', error)
    }
  }

  // 코드 분석 및 제안
  const analyzeCode = useCallback(() => {
    const issues = []
    const suggestions = []

    // 간단한 코드 분석
    if (language === 'javascript' || language === 'typescript') {
      if (code.includes('var ')) {
        issues.push('var 대신 let/const 사용을 권장합니다')
      }
      if (code.includes('==') && !code.includes('===')) {
        issues.push('== 대신 === 사용을 권장합니다')
      }
      if (!code.includes('use strict') && !code.includes("'use strict'")) {
        suggestions.push('strict mode 사용을 고려해보세요')
      }
    } else if (language === 'python') {
      if (!code.includes('def ') && code.length > 50) {
        suggestions.push('코드를 함수로 분리하는 것을 고려해보세요')
      }
      if (code.includes('print(') && code.split('print(').length > 5) {
        suggestions.push(
          '너무 많은 print 문이 있습니다. logging 사용을 고려해보세요'
        )
      }
    }

    return { issues, suggestions }
  }, [code, language])

  // 실시간 코드 분석 결과
  const codeAnalysis = analyzeCode()

  // 필터된 패키지 목록
  const filteredPackages = availablePackages.filter(
    pkg =>
      pkg.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
      pkg.description.toLowerCase().includes(packageSearch.toLowerCase())
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 도구 버튼들 */}
      <div className="flex flex-wrap gap-2">
        {/* 코드 포맷팅 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFormat}
          disabled={isFormatting}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>{isFormatting ? '포맷팅 중...' : '포맷팅'}</span>
        </motion.button>

        {/* 라이브 리로드 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleLiveReload?.(!isLiveReloadEnabled)}
          className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
            isLiveReloadEnabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {isLiveReloadEnabled ? (
            <PauseIcon className="w-4 h-4" />
          ) : (
            <PlayIcon className="w-4 h-4" />
          )}
          <span>라이브 리로드</span>
        </motion.button>

        {/* 새로고침 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReload}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>새로고침</span>
        </motion.button>

        {/* 디버그 모드 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsDebugMode(!isDebugMode)
            onDebug?.()
          }}
          className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
            isDebugMode
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <BugAntIcon className="w-4 h-4" />
          <span>디버그</span>
        </motion.button>

        {/* 패키지 관리 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPackageManager(!showPackageManager)}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <CubeIcon className="w-4 h-4" />
          <span>패키지</span>
        </motion.button>
      </div>

      {/* 코드 분석 결과 */}
      {(codeAnalysis.issues.length > 0 ||
        codeAnalysis.suggestions.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-2">
            <WrenchScrewdriverIcon className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              코드 분석 결과
            </span>
          </div>

          {codeAnalysis.issues.length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                문제점:
              </h4>
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                {codeAnalysis.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {codeAnalysis.suggestions.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                제안사항:
              </h4>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                {codeAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* 라이브 리로드 상태 */}
      {isLiveReloadEnabled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 dark:text-green-300">
            라이브 리로드 활성화 - 코드 변경 시 자동으로 새로고침됩니다
          </span>
        </motion.div>
      )}

      {/* 디버그 모드 정보 */}
      {isDebugMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-2">
            <BugAntIcon className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              디버그 모드
            </span>
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
            <div>• 콘솔 출력이 자세히 표시됩니다</div>
            <div>• 에러 스택 트레이스가 포함됩니다</div>
            <div>• 실행 시간이 측정됩니다</div>
          </div>
        </motion.div>
      )}

      {/* 패키지 관리자 */}
      <AnimatePresence>
        {showPackageManager && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                패키지 관리
              </h3>
              <button
                onClick={() => setShowPackageManager(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* 패키지 검색 */}
            <div className="mb-4">
              <input
                type="text"
                value={packageSearch}
                onChange={e => setPackageSearch(e.target.value)}
                placeholder="패키지 검색..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* 패키지 목록 */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredPackages.map(pkg => (
                <div
                  key={pkg.name}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {pkg.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        v{pkg.version}
                      </span>
                      {pkg.installed && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 rounded">
                          설치됨
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {pkg.description}
                    </p>
                  </div>
                  {!pkg.installed && (
                    <button
                      onClick={() => handleInstallPackage(pkg.name)}
                      className="ml-3 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      설치
                    </button>
                  )}
                </div>
              ))}

              {filteredPackages.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
