'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  FolderIcon,
  ChartBarIcon,
  CogIcon,
  BoltIcon,
  ClockIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline'
import useProjectStore from '@/lib/stores/projectStore'
import { useModalStore } from '@/stores/modalStore'
import CreateProjectModal from '@/components/project/CreateProjectModal'
import ProjectCard from '@/components/project/ProjectCard'
import { ProjectService } from '@/lib/services/projectService'

export default function ProjectsPage() {
  const {
    projects,
    viewMode,
    sortBy,
    searchQuery,
    selectedCategory,
    setViewMode,
    setSortBy,
    setSearchQuery,
    setSelectedCategory,
    getFilteredProjects,
  } = useProjectStore()

  const {
    isCreateProjectModalOpen,
    openCreateProjectModal,
    closeCreateProjectModal,
  } = useModalStore()
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load projects from Supabase
  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Loading projects...')

      // 타임아웃 설정 (10초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(new Error('로딩 시간이 초과되었습니다. 다시 시도해주세요.')),
          10000
        )
      })

      const result = (await Promise.race([
        ProjectService.listProjects(),
        timeoutPromise,
      ])) as Awaited<ReturnType<typeof ProjectService.listProjects>>

      console.log('Projects loaded:', result)

      if (result.success && result.data) {
        // Clear existing projects and add from database
        useProjectStore.getState().clearProjects()

        result.data.forEach(project => {
          // Extract team and deadline from metadata if available
          const metadata = project.metadata || {}
          const team = Array.isArray(metadata.team)
            ? metadata.team
            : ['Sample User', 'Sample Admin']
          const deadline =
            typeof metadata.deadline === 'string'
              ? metadata.deadline
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0]

          useProjectStore.getState().addProject({
            id: project.id,
            name: project.name,
            description: project.description || '',
            category: project.category as
              | 'proposal'
              | 'development'
              | 'operation',
            status: project.status as
              | 'active'
              | 'completed'
              | 'archived'
              | 'paused',
            progress: Math.floor(Math.random() * 100), // Sample progress for now
            team: team,
            deadline: deadline,
            avatar: getAvatarByCategory(project.category),
            color: getColorByCategory(project.category),
            bgColor: getBgColorByCategory(project.category),
            conversationCount: project.conversationCount || 0,
            documentCount: project.documentCount || 0,
            imageCount: project.imageCount || 0,
            lastActivity: project.lastActivity,
            created_at: project.created_at,
            updated_at: project.updated_at,
            metadata: project.metadata,
          })
        })
      } else {
        setError(result.error || 'Failed to load projects')
      }
    } catch (err) {
      setError('Unexpected error occurred')
      console.error('Load projects error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAvatarByCategory = (category: string) => {
    switch (category) {
      case 'proposal':
        return '📋'
      case 'development':
        return '🔧'
      case 'operation':
        return '⚙️'
      default:
        return '📁'
    }
  }

  const getColorByCategory = (category: string) => {
    switch (category) {
      case 'proposal':
        return 'from-blue-600 to-blue-700'
      case 'development':
        return 'from-green-600 to-green-700'
      case 'operation':
        return 'from-purple-600 to-purple-700'
      default:
        return 'from-gray-600 to-gray-700'
    }
  }

  const getBgColorByCategory = (category: string) => {
    switch (category) {
      case 'proposal':
        return 'bg-gradient-to-br from-blue-50/80 to-blue-100/60 dark:from-blue-900/30 dark:to-blue-800/30'
      case 'development':
        return 'bg-gradient-to-br from-green-50/80 to-green-100/60 dark:from-green-900/30 dark:to-green-800/30'
      case 'operation':
        return 'bg-gradient-to-br from-purple-50/80 to-purple-100/60 dark:from-purple-900/30 dark:to-purple-800/30'
      default:
        return 'bg-gradient-to-br from-gray-50/80 to-gray-100/60 dark:from-gray-900/30 dark:to-gray-800/30'
    }
  }

  const filterOptions = [
    { id: 'all', label: '전체', icon: FolderIcon },
    { id: 'proposal', label: '제안 진행', icon: SparklesIcon },
    { id: 'development', label: '구축 관리', icon: ChartBarIcon },
    { id: 'operation', label: '운영 관리', icon: CogIcon },
  ]

  const sortOptions = [
    { value: 'updated', label: '최근 수정순' },
    { value: 'created', label: '최근 생성순' },
    { value: 'name', label: '이름순' },
    { value: 'progress', label: '진행률순' },
  ]

  const filteredProjects = getFilteredProjects()

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            프로젝트를 불러오는 중...
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            로딩이 오래 걸리는 경우 페이지를 새로고침해주세요
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            프로젝트를 불러올 수 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadProjects}
            className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                프로젝트
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                진행 중인 프로젝트들을 관리하고 현황을 확인하세요 🚀
              </p>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-4 md:mt-0"
        >
          <button
            onClick={openCreateProjectModal}
            className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <BoltIcon className="w-5 h-5" />
            <span>새 프로젝트</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 dark:from-slate-800/40 dark:to-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                전체 프로젝트
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {projects.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-indigo-50/80 to-indigo-100/60 dark:from-indigo-900/30 dark:to-indigo-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                진행 중
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">완료</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-50/80 to-gray-100/60 dark:from-gray-800/40 dark:to-gray-700/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                평균 진행률
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(
                  projects.reduce((acc, p) => acc + p.progress, 0) /
                    projects.length
                )}
                %
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
                className="block w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl leading-5 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                placeholder="프로젝트 이름이나 설명으로 검색..."
              />
            </div>
          </div>

          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-slate-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="그리드 뷰"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-slate-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="리스트 뷰"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Options */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                <span className="text-sm">
                  {sortOptions.find(opt => opt.value === sortBy)?.label}
                </span>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(
                          option.value as
                            | 'created'
                            | 'updated'
                            | 'name'
                            | 'progress'
                        )
                        setShowSortMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        sortBy === option.value
                          ? 'text-slate-600 dark:text-slate-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                onClick={() => setSelectedCategory(option.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === option.id
                    ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{option.label}</span>
                {option.id !== 'all' && (
                  <span className="text-xs bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                    {projects.filter(p => p.category === option.id).length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Projects grid/list */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid gap-6 lg:grid-cols-2 xl:grid-cols-3'
            : 'space-y-4'
        }
      >
        {filteredProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            프로젝트가 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            검색 조건에 맞는 프로젝트를 찾을 수 없습니다.
          </p>
        </motion.div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={closeCreateProjectModal}
      />
    </div>
  )
}
