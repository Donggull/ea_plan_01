'use client'

import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import {
  ChartBarIcon,
  FolderIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowUpRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { userProfile } = useAuth()

  const stats = [
    {
      title: '총 프로젝트',
      value: '12',
      change: '+2.5%',
      changeType: 'positive',
      icon: FolderIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor:
        'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    },
    {
      title: '진행 중',
      value: '8',
      change: '+12%',
      changeType: 'positive',
      icon: ClockIcon,
      color: 'from-emerald-500 to-emerald-600',
      bgColor:
        'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
    },
    {
      title: '팀 멤버',
      value: '24',
      change: '+3%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor:
        'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    },
    {
      title: '월 성과',
      value: '94%',
      change: '+8%',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'from-orange-500 to-orange-600',
      bgColor:
        'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'project',
      title: 'AI 챗봇 플랫폼 기획 완료',
      description: 'RFP 분석 및 요구사항 정리가 완료되었습니다.',
      time: '2시간 전',
      icon: '🤖',
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      id: 2,
      type: 'code',
      title: '대시보드 컴포넌트 생성',
      description: 'React 기반 대시보드 UI 컴포넌트가 생성되었습니다.',
      time: '4시간 전',
      icon: '💻',
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      id: 3,
      type: 'design',
      title: '모바일 앱 UI 디자인 검토',
      description: '사용자 경험 개선을 위한 디자인 수정 사항이 반영되었습니다.',
      time: '6시간 전',
      icon: '🎨',
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
    {
      id: 4,
      type: 'meeting',
      title: '클라이언트 미팅',
      description: '프로젝트 진행 상황 공유 및 피드백 수집이 완료되었습니다.',
      time: '1일 전',
      icon: '📋',
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    },
  ]

  // 개발환경에서는 ProtectedRoute 없이 작동
  const content = (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              안녕하세요, {userProfile?.name || '사용자'}님! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              프로젝트 현황과 AI 어시스턴트 활동을 한눈에 확인하세요
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg"
          >
            <SparklesIcon className="w-5 h-5" />
            <span className="font-medium">AI 분석 시작</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`${stat.bgColor} backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {stat.change}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              최근 활동
            </h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-1">
              <span>전체 보기</span>
              <ArrowUpRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/70 transition-colors duration-200"
              >
                <div
                  className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center text-lg flex-shrink-0`}
                >
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                    {activity.description}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {activity.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Status Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              작업 결과
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  생성된 문서
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  15개
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  코드 스니펫
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  8개
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  이미지 생성
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  12개
                </span>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              빠른 설정
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  자동 저장
                </span>
                <div className="w-10 h-6 bg-slate-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  알림
                </span>
                <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  AI 어시스턴트
                </span>
                <div className="w-10 h-6 bg-indigo-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              알림
            </h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      프로젝트 마감 임박
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300">
                      AI 챗봇 플랫폼 - 2일 남음
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">✅</span>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      작업 완료
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300">
                      모바일 앱 리뉴얼 - UI 검토 완료
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start">
                  <span className="text-blue-400 mr-2">💡</span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      AI 제안
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      새로운 기능 아이디어가 있습니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )

  // 개발 환경에서는 인증 체크 없이 바로 렌더링
  if (process.env.NODE_ENV === 'development') {
    return content
  }

  // 프로덕션에서는 ProtectedRoute 사용
  return <ProtectedRoute>{content}</ProtectedRoute>
}
