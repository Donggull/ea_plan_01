'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  FolderIcon,
  ChartBarIcon,
  CogIcon,
  BoltIcon,
  ClockIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

export default function ProjectsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const projects = [
    {
      id: 1,
      name: 'AI 챗봇 플랫폼',
      description: '멀티모델 AI를 활용한 차세대 고객 서비스 플랫폼 구축',
      category: 'proposal',
      status: 'active',
      progress: 85,
      team: ['김철수', '이영희', '박민수', '정수진'],
      deadline: '2024-03-15',
      avatar: '🤖',
      color: 'from-slate-600 to-slate-700',
      bgColor:
        'bg-gradient-to-br from-slate-50/80 to-gray-50/80 dark:from-slate-800/40 dark:to-gray-800/40',
    },
    {
      id: 2,
      name: '모바일 앱 리뉴얼',
      description: 'React Native 기반 크로스 플랫폼 앱 전면 리뉴얼',
      category: 'development',
      status: 'active',
      progress: 65,
      team: ['정수진', '최동현', '강민지'],
      deadline: '2024-04-20',
      avatar: '📱',
      color: 'from-indigo-500 to-indigo-600',
      bgColor:
        'bg-gradient-to-br from-indigo-50/80 to-indigo-100/60 dark:from-indigo-900/30 dark:to-indigo-800/30',
    },
    {
      id: 3,
      name: '데이터 분석 대시보드',
      description: '실시간 비즈니스 인텔리전스 대시보드 구축',
      category: 'development',
      status: 'planning',
      progress: 40,
      team: ['홍길동', '윤서현'],
      deadline: '2024-05-10',
      avatar: '📊',
      color: 'from-gray-500 to-gray-600',
      bgColor:
        'bg-gradient-to-br from-gray-50/80 to-gray-100/60 dark:from-gray-800/40 dark:to-gray-700/40',
    },
    {
      id: 4,
      name: '운영 최적화',
      description: '서비스 성능 개선 및 모니터링 시스템 고도화',
      category: 'operation',
      status: 'completed',
      progress: 100,
      team: ['강민지', '홍길동', '윤서현'],
      deadline: '2024-02-28',
      avatar: '⚡',
      color: 'from-emerald-500 to-emerald-600',
      bgColor:
        'bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-800/30',
    },
    {
      id: 5,
      name: 'IoT 플랫폼 구축',
      description: '스마트 디바이스 연동 IoT 통합 관리 플랫폼',
      category: 'proposal',
      status: 'active',
      progress: 30,
      team: ['김철수', '박민수'],
      deadline: '2024-06-15',
      avatar: '🌐',
      color: 'from-slate-500 to-slate-600',
      bgColor:
        'bg-gradient-to-br from-slate-50/70 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-700/30',
    },
    {
      id: 6,
      name: '블록체인 지갑',
      description: '멀티체인 지원 DeFi 통합 지갑 서비스',
      category: 'development',
      status: 'active',
      progress: 55,
      team: ['최동현', '정수진', '김철수'],
      deadline: '2024-07-30',
      avatar: '🔗',
      color: 'from-indigo-600 to-indigo-700',
      bgColor:
        'bg-gradient-to-br from-indigo-50/70 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-800/30',
    },
  ]

  const filterOptions = [
    { id: 'all', label: '전체', icon: FolderIcon },
    { id: 'proposal', label: '제안 진행', icon: SparklesIcon },
    { id: 'development', label: '구축 관리', icon: ChartBarIcon },
    { id: 'operation', label: '운영 관리', icon: CogIcon },
  ]

  const getCategoryIcon = (category: string) => {
    const icons = {
      proposal: SparklesIcon,
      development: ChartBarIcon,
      operation: CogIcon,
    }
    return icons[category as keyof typeof icons] || FolderIcon
  }

  const getCategoryBadge = (category: string) => {
    const badges = {
      proposal:
        'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 dark:from-slate-800/50 dark:to-slate-700/50 dark:text-slate-300',
      development:
        'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 dark:from-indigo-900/50 dark:to-indigo-800/50 dark:text-indigo-300',
      operation:
        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-800/50 dark:to-gray-700/50 dark:text-gray-300',
    }
    const labels = {
      proposal: '제안 진행',
      development: '구축 관리',
      operation: '운영 관리',
    }
    return {
      className: badges[category as keyof typeof badges],
      label: labels[category as keyof typeof labels],
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      completed:
        'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
      planning:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }
    const labels = {
      active: '진행 중',
      completed: '완료',
      planning: '계획 중',
      archived: '보관됨',
    }
    return {
      className: badges[status as keyof typeof badges],
      label: labels[status as keyof typeof labels],
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesFilter =
      selectedFilter === 'all' || project.category === selectedFilter
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

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
          <button className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
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
        className="flex flex-col lg:flex-row gap-4"
      >
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

        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                onClick={() => setSelectedFilter(option.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedFilter === option.id
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

      {/* Projects grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project, index) => {
          const categoryBadge = getCategoryBadge(project.category)
          const statusBadge = getStatusBadge(project.status)
          const CategoryIcon = getCategoryIcon(project.category)

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`${project.bgColor} backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{project.avatar}</div>
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${project.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                {project.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                {project.description}
              </p>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryBadge.className}`}
              >
                {categoryBadge.label}
              </span>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>진행률</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className={`bg-gradient-to-r ${project.color} h-2.5 rounded-full`}
                  />
                </div>
              </div>

              {/* Team and deadline */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="w-4 h-4 text-gray-500" />
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map((member, idx) => (
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-full bg-gradient-to-r ${project.color} flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-gray-800`}
                      >
                        {member.charAt(0)}
                      </div>
                    ))}
                    {project.team.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span className="text-xs">
                    {new Date(project.deadline).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
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
    </div>
  )
}
