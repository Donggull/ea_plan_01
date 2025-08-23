'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  ExternalLink,
  Search,
  Package,
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

export interface ExternalLibrary {
  name: string
  version?: string
  url: string
  type: 'js' | 'css'
  description?: string
  verified?: boolean
}

interface LibraryLoaderProps {
  onLibrariesChange: (libraries: ExternalLibrary[]) => void
  libraries: ExternalLibrary[]
  className?: string
}

// 인기있는 라이브러리 프리셋
const POPULAR_LIBRARIES: ExternalLibrary[] = [
  {
    name: 'React',
    version: '18.2.0',
    url: 'https://unpkg.com/react@18.2.0/umd/react.development.js',
    type: 'js',
    description: 'JavaScript 라이브러리 for building user interfaces',
    verified: true,
  },
  {
    name: 'React DOM',
    version: '18.2.0',
    url: 'https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js',
    type: 'js',
    description: 'DOM을 위한 React 렌더러',
    verified: true,
  },
  {
    name: 'Lodash',
    version: '4.17.21',
    url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
    type: 'js',
    description: '모던 JavaScript 유틸리티 라이브러리',
    verified: true,
  },
  {
    name: 'jQuery',
    version: '3.7.1',
    url: 'https://code.jquery.com/jquery-3.7.1.min.js',
    type: 'js',
    description: '빠르고 작고 기능이 풍부한 JavaScript 라이브러리',
    verified: true,
  },
  {
    name: 'Bootstrap CSS',
    version: '5.3.2',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    type: 'css',
    description: '프론트엔드 프레임워크',
    verified: true,
  },
  {
    name: 'Bootstrap JS',
    version: '5.3.2',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    type: 'js',
    description: '프론트엔드 프레임워크 JS 컴포넌트',
    verified: true,
  },
  {
    name: 'Tailwind CSS',
    version: '3.3.6',
    url: 'https://cdn.tailwindcss.com',
    type: 'css',
    description: '유틸리티-퍼스트 CSS 프레임워크',
    verified: true,
  },
  {
    name: 'Chart.js',
    version: '4.4.0',
    url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js',
    type: 'js',
    description: '심플하고 유연한 JavaScript 차팅',
    verified: true,
  },
  {
    name: 'D3.js',
    version: '7.8.5',
    url: 'https://d3js.org/d3.v7.min.js',
    type: 'js',
    description: '데이터 기반 문서 조작을 위한 JavaScript 라이브러리',
    verified: true,
  },
  {
    name: 'Three.js',
    version: '0.158.0',
    url: 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js',
    type: 'js',
    description: '3D 라이브러리',
    verified: true,
  },
  {
    name: 'Animate.css',
    version: '4.1.1',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    type: 'css',
    description: 'CSS 애니메이션 라이브러리',
    verified: true,
  },
  {
    name: 'Font Awesome',
    version: '6.5.0',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    type: 'css',
    description: '아이콘 툴킷',
    verified: true,
  },
]

// URL 유효성 검사
const validateLibraryUrl = (
  url: string
): { valid: boolean; reason?: string } => {
  try {
    const urlObj = new URL(url)

    // HTTPS만 허용
    if (urlObj.protocol !== 'https:') {
      return { valid: false, reason: 'HTTPS URL만 허용됩니다.' }
    }

    // 허용된 CDN 도메인
    const allowedDomains = [
      'cdnjs.cloudflare.com',
      'cdn.jsdelivr.net',
      'unpkg.com',
      'code.jquery.com',
      'stackpath.bootstrapcdn.com',
      'fonts.googleapis.com',
      'cdn.tailwindcss.com',
      'd3js.org',
      'ajax.googleapis.com',
    ]

    const isAllowedDomain = allowedDomains.some(
      domain =>
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    )

    if (!isAllowedDomain) {
      return {
        valid: false,
        reason:
          '허용되지 않은 도메인입니다. 신뢰할 수 있는 CDN을 사용해주세요.',
      }
    }

    // 파일 확장자 검사
    const pathname = urlObj.pathname.toLowerCase()
    const validExtensions = ['.js', '.css', '.min.js', '.min.css']
    const hasValidExtension = validExtensions.some(
      ext => pathname.endsWith(ext) || pathname.includes(ext)
    )

    if (!hasValidExtension && !pathname.endsWith('/')) {
      return {
        valid: false,
        reason: '유효한 JavaScript(.js) 또는 CSS(.css) 파일이어야 합니다.',
      }
    }

    return { valid: true }
  } catch {
    return { valid: false, reason: '유효하지 않은 URL입니다.' }
  }
}

export default function LibraryLoader({
  onLibrariesChange,
  libraries,
  className = '',
}: LibraryLoaderProps) {
  const [showPopular, setShowPopular] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [customLibrary, setCustomLibrary] = useState({
    name: '',
    version: '',
    url: '',
    type: 'js' as const,
    description: '',
  })
  const [urlValidation, setUrlValidation] = useState<{
    valid: boolean
    reason?: string
  } | null>(null)

  // 라이브러리 추가
  const addLibrary = useCallback(
    (library: ExternalLibrary) => {
      const exists = libraries.some(lib => lib.url === library.url)
      if (!exists) {
        onLibrariesChange([...libraries, library])
      }
    },
    [libraries, onLibrariesChange]
  )

  // 라이브러리 제거
  const removeLibrary = useCallback(
    (url: string) => {
      onLibrariesChange(libraries.filter(lib => lib.url !== url))
    },
    [libraries, onLibrariesChange]
  )

  // 커스텀 라이브러리 추가
  const handleCustomSubmit = useCallback(() => {
    const validation = validateLibraryUrl(customLibrary.url)
    setUrlValidation(validation)

    if (!validation.valid) return

    if (!customLibrary.name || !customLibrary.url) {
      setUrlValidation({ valid: false, reason: '이름과 URL은 필수입니다.' })
      return
    }

    const newLibrary: ExternalLibrary = {
      name: customLibrary.name,
      version: customLibrary.version || undefined,
      url: customLibrary.url,
      type: customLibrary.type,
      description: customLibrary.description || undefined,
      verified: false,
    }

    addLibrary(newLibrary)
    setCustomLibrary({
      name: '',
      version: '',
      url: '',
      type: 'js',
      description: '',
    })
    setShowCustomForm(false)
    setUrlValidation(null)
  }, [customLibrary, addLibrary])

  // URL 입력 시 유효성 검사
  const handleUrlChange = useCallback(
    (url: string) => {
      setCustomLibrary(prev => ({ ...prev, url }))

      if (url.trim()) {
        const validation = validateLibraryUrl(url)
        setUrlValidation(validation)

        // URL에서 라이브러리 이름 추출 시도
        if (validation.valid && !customLibrary.name) {
          try {
            const urlObj = new URL(url)
            const pathname = urlObj.pathname
            const filename = pathname.split('/').pop() || ''
            const nameMatch = filename.match(/([a-zA-Z][a-zA-Z0-9-_]*)/)?.[1]
            if (nameMatch) {
              setCustomLibrary(prev => ({ ...prev, name: nameMatch }))
            }
          } catch {
            // 이름 추출 실패 시 무시
          }
        }
      } else {
        setUrlValidation(null)
      }
    },
    [customLibrary.name]
  )

  // 인기 라이브러리 필터링
  const filteredLibraries = POPULAR_LIBRARIES.filter(
    lib =>
      lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lib.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 현재 로드된 라이브러리 */}
      {libraries.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            로드된 라이브러리 ({libraries.length})
          </h4>
          <div className="space-y-2">
            {libraries.map((library, index) => (
              <motion.div
                key={`${library.url}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      library.type === 'js' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {library.name}
                  </span>
                  {library.version && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      v{library.version}
                    </span>
                  )}
                  {library.verified && (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <a
                    href={library.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => removeLibrary(library.url)}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 라이브러리 추가 버튼 */}
      <div className="flex space-x-2">
        <button
          onClick={() => setShowPopular(!showPopular)}
          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Package className="w-4 h-4 mr-1" />
          인기 라이브러리
        </button>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          커스텀 추가
        </button>
      </div>

      {/* 인기 라이브러리 목록 */}
      <AnimatePresence>
        {showPopular && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
          >
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="라이브러리 검색..."
                  className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {filteredLibraries.map((library, index) => (
                <motion.div
                  key={`${library.name}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-white dark:hover:bg-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          library.type === 'js'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {library.name}
                      </span>
                      {library.version && (
                        <span className="text-xs text-gray-500">
                          v{library.version}
                        </span>
                      )}
                      {library.verified && (
                        <Shield className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                    {library.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {library.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => addLibrary(library)}
                    disabled={libraries.some(lib => lib.url === library.url)}
                    className="ml-2 p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 커스텀 라이브러리 추가 폼 */}
      <AnimatePresence>
        {showCustomForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              커스텀 라이브러리 추가
            </h4>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    라이브러리 이름 *
                  </label>
                  <input
                    type="text"
                    value={customLibrary.name}
                    onChange={e =>
                      setCustomLibrary(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="예: lodash"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    버전
                  </label>
                  <input
                    type="text"
                    value={customLibrary.version}
                    onChange={e =>
                      setCustomLibrary(prev => ({
                        ...prev,
                        version: e.target.value,
                      }))
                    }
                    placeholder="예: 4.17.21"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  CDN URL *
                </label>
                <input
                  type="url"
                  value={customLibrary.url}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="https://cdn.jsdelivr.net/npm/..."
                  className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 ${
                    urlValidation
                      ? urlValidation.valid
                        ? 'border-green-300 dark:border-green-600'
                        : 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {urlValidation && (
                  <div
                    className={`flex items-center mt-1 text-xs ${
                      urlValidation.valid ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {urlValidation.valid ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {urlValidation.reason || '유효한 URL입니다.'}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    타입
                  </label>
                  <select
                    value={customLibrary.type}
                    onChange={e =>
                      setCustomLibrary(prev => ({
                        ...prev,
                        type: e.target.value as 'js' | 'css',
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  >
                    <option value="js">JavaScript</option>
                    <option value="css">CSS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    설명
                  </label>
                  <input
                    type="text"
                    value={customLibrary.description}
                    onChange={e =>
                      setCustomLibrary(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="라이브러리 설명"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowCustomForm(false)
                    setUrlValidation(null)
                    setCustomLibrary({
                      name: '',
                      version: '',
                      url: '',
                      type: 'js',
                      description: '',
                    })
                  }}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleCustomSubmit}
                  disabled={
                    !customLibrary.name ||
                    !customLibrary.url ||
                    (urlValidation && !urlValidation.valid)
                  }
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  추가
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
