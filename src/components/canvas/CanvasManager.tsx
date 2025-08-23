'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentArrowDownIcon,
  FolderOpenIcon,
  ClockIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export interface CanvasProject {
  id: string
  title: string
  description?: string
  language: string
  code: string
  createdAt: number
  updatedAt: number
  tags: string[]
  isFavorite: boolean
  isPublic: boolean
  forkCount: number
  viewCount: number
  authorId: string
  authorName: string
}

export interface CanvasVersion {
  id: string
  projectId: string
  version: string
  code: string
  message: string
  createdAt: number
  authorId: string
}

export interface CanvasManagerProps {
  currentProject?: CanvasProject
  onSave?: (project: Partial<CanvasProject>) => Promise<void>
  onLoad?: (project: CanvasProject) => void
  onDelete?: (projectId: string) => void
  onFork?: (project: CanvasProject) => Promise<CanvasProject>
  onShare?: (project: CanvasProject) => Promise<string>
  className?: string
}

export default function CanvasManager({
  currentProject,
  onSave,
  onLoad,
  onDelete,
  onFork,
  onShare,
  className = '',
}: CanvasManagerProps) {
  const [projects, setProjects] = useState<CanvasProject[]>([])
  const [versions, setVersions] = useState<CanvasVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'save' | 'load' | 'versions' | 'share'
  >('save')
  const [editingProject, setEditingProject] =
    useState<Partial<CanvasProject> | null>(null)
  const [shareUrl, setShareUrl] = useState<string>('')

  // 프로젝트 목록 로드 (모의 데이터)
  const loadProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      // 실제로는 API에서 데이터를 가져옴
      const mockProjects: CanvasProject[] = [
        {
          id: '1',
          title: 'React Todo App',
          description: '간단한 할 일 목록 앱',
          language: 'javascript',
          code: '// React Todo App\nfunction TodoApp() {\n  return <div>Hello World</div>\n}',
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now() - 3600000,
          tags: ['react', 'javascript', 'todo'],
          isFavorite: true,
          isPublic: true,
          forkCount: 5,
          viewCount: 142,
          authorId: 'user1',
          authorName: '홍길동',
        },
        {
          id: '2',
          title: 'Python Data Analysis',
          description: '데이터 분석 스크립트',
          language: 'python',
          code: '# Data Analysis\nimport pandas as pd\n\ndf = pd.read_csv("data.csv")',
          createdAt: Date.now() - 172800000,
          updatedAt: Date.now() - 7200000,
          tags: ['python', 'data', 'pandas'],
          isFavorite: false,
          isPublic: false,
          forkCount: 2,
          viewCount: 89,
          authorId: 'user1',
          authorName: '홍길동',
        },
      ]
      setProjects(mockProjects)
    } catch (error) {
      console.error('프로젝트 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 버전 히스토리 로드
  const loadVersions = useCallback(async (projectId: string) => {
    if (!projectId) return

    try {
      // 실제로는 API에서 버전 데이터를 가져옴
      const mockVersions: CanvasVersion[] = [
        {
          id: 'v1',
          projectId,
          version: '1.2.0',
          code: '// Latest version\nfunction App() { return <div>Version 1.2.0</div> }',
          message: 'Added error handling',
          createdAt: Date.now() - 1800000,
          authorId: 'user1',
        },
        {
          id: 'v2',
          projectId,
          version: '1.1.0',
          code: '// Previous version\nfunction App() { return <div>Version 1.1.0</div> }',
          message: 'Initial implementation',
          createdAt: Date.now() - 86400000,
          authorId: 'user1',
        },
      ]
      setVersions(mockVersions)
    } catch (error) {
      console.error('버전 히스토리 로드 실패:', error)
    }
  }, [])

  // 컴포넌트 마운트 시 프로젝트 로드
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // 현재 프로젝트 버전 히스토리 로드
  useEffect(() => {
    if (currentProject?.id && activeTab === 'versions') {
      loadVersions(currentProject.id)
    }
  }, [currentProject?.id, activeTab, loadVersions])

  // 프로젝트 저장
  const handleSave = async () => {
    if (!editingProject || !onSave) return

    setIsLoading(true)
    try {
      await onSave(editingProject)
      setEditingProject(null)
      await loadProjects() // 목록 새로고침
    } catch (error) {
      console.error('저장 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 즐겨찾기 토글
  const toggleFavorite = (projectId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    )
  }

  // 공유 URL 생성
  const generateShareUrl = async (project: CanvasProject) => {
    if (onShare) {
      try {
        const url = await onShare(project)
        setShareUrl(url)
      } catch (error) {
        console.error('공유 URL 생성 실패:', error)
      }
    }
  }

  // 언어별 색상
  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
      typescript:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      python:
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
      html: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
      css: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    }
    return (
      colors[language] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
    )
  }

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}
    >
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'save', label: '저장', icon: DocumentArrowDownIcon },
          { id: 'load', label: '불러오기', icon: FolderOpenIcon },
          { id: 'versions', label: '버전', icon: ClockIcon },
          { id: 'share', label: '공유', icon: ShareIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id as 'save' | 'load' | 'versions' | 'share')
            }
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-4">
        {/* 저장 탭 */}
        {activeTab === 'save' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                프로젝트 제목
              </label>
              <input
                type="text"
                value={editingProject?.title || currentProject?.title || ''}
                onChange={e =>
                  setEditingProject(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="프로젝트 제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                설명
              </label>
              <textarea
                value={
                  editingProject?.description ||
                  currentProject?.description ||
                  ''
                }
                onChange={e =>
                  setEditingProject(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="프로젝트 설명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                태그 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={
                  editingProject?.tags?.join(', ') ||
                  currentProject?.tags?.join(', ') ||
                  ''
                }
                onChange={e =>
                  setEditingProject(prev => ({
                    ...prev,
                    tags: e.target.value
                      .split(',')
                      .map(tag => tag.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="react, javascript, tutorial"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    editingProject?.isPublic ||
                    currentProject?.isPublic ||
                    false
                  }
                  onChange={e =>
                    setEditingProject(prev => ({
                      ...prev,
                      isPublic: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  공개
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    editingProject?.isFavorite ||
                    currentProject?.isFavorite ||
                    false
                  }
                  onChange={e =>
                    setEditingProject(prev => ({
                      ...prev,
                      isFavorite: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  즐겨찾기
                </span>
              </label>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={isLoading || !editingProject?.title}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 불러오기 탭 */}
        {activeTab === 'load' && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">
                  프로젝트를 불러오는 중...
                </p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpenIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm text-gray-500">
                  저장된 프로젝트가 없습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {projects.map(project => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => onLoad?.(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {project.title}
                          </h4>
                          {project.isFavorite && (
                            <StarIconSolid className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        {project.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span
                            className={`px-2 py-1 rounded ${getLanguageColor(project.language)}`}
                          >
                            {project.language}
                          </span>
                          <span>
                            {new Date(project.updatedAt).toLocaleDateString(
                              'ko-KR'
                            )}
                          </span>
                          {project.isPublic && (
                            <span className="text-green-600">공개</span>
                          )}
                        </div>
                        {project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {project.tags.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{project.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            toggleFavorite(project.id)
                          }}
                          className="p-1 text-gray-400 hover:text-yellow-500"
                        >
                          {project.isFavorite ? (
                            <StarIconSolid className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <StarIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            onDelete?.(project.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 버전 히스토리 탭 */}
        {activeTab === 'versions' && (
          <div className="space-y-3">
            {!currentProject ? (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm text-gray-500">
                  프로젝트를 먼저 선택하세요.
                </p>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">
                  버전 히스토리가 없습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            v{version.version}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 rounded">
                              최신
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {version.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(version.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onLoad?.({
                            ...currentProject,
                            code: version.code,
                            updatedAt: version.createdAt,
                          })
                        }
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        복원
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 공유 탭 */}
        {activeTab === 'share' && (
          <div className="space-y-4">
            {!currentProject ? (
              <div className="text-center py-8">
                <ShareIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm text-gray-500">
                  공유할 프로젝트를 먼저 선택하세요.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {currentProject.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {currentProject.description || '설명이 없습니다.'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span
                        className={`px-2 py-1 rounded ${getLanguageColor(currentProject.language)}`}
                      >
                        {currentProject.language}
                      </span>
                      <span>조회 {currentProject.viewCount}</span>
                      <span>포크 {currentProject.forkCount}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => generateShareUrl(currentProject)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    공유 링크 생성
                  </button>

                  {shareUrl && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-green-700 dark:text-green-300 truncate">
                            {shareUrl}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(shareUrl)
                          }
                          className="ml-2 p-1 text-green-600 hover:text-green-700"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {onFork && (
                    <button
                      onClick={() => onFork(currentProject)}
                      className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      포크하기
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
