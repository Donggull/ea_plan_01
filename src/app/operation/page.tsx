'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  DocumentTextIcon,
  UsersIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  DocumentChartBarIcon,
  PlusIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface OperationModule {
  id: string
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color: string
  bgColor: string
  route: string
  status: 'active' | 'coming_soon'
  features: string[]
}

const operationModules: OperationModule[] = [
  {
    id: 'requirements',
    title: '요건 관리',
    description: '고객 요구사항을 체계적으로 수집, 분류, 추적하는 시스템',
    icon: DocumentTextIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    route: '/operation/requirements',
    status: 'active',
    features: ['요청 접수', '우선순위 관리', '승인 워크플로우', '진행 추적'],
  },
  {
    id: 'task-distribution',
    title: '업무 분배',
    description: 'AI 기반 스마트 업무 할당 및 팀 워크로드 최적화',
    icon: UsersIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    route: '/operation/task-distribution',
    status: 'active',
    features: ['스마트 할당', '팀별 분류', '워크로드 균형', '칸반 보드'],
  },
  {
    id: 'schedule',
    title: '일정 관리',
    description: '스프린트 기반 일정 계획 및 리소스 충돌 관리',
    icon: CalendarIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    route: '/operation/schedule',
    status: 'active',
    features: ['스프린트 관리', '리소스 캘린더', '충돌 감지', '해결 제안'],
  },
  {
    id: 'performance',
    title: '성과 관리',
    description: '다차원 성과 지표를 통한 종합적 프로젝트 건강도 모니터링',
    icon: ArrowTrendingUpIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    route: '/operation/performance',
    status: 'active',
    features: ['8대 핵심 KPI', '실시간 알림', '트렌드 분석', '건강도 진단'],
  },
  {
    id: 'communication',
    title: '커뮤니케이션 허브',
    description: '팀 내외부 소통 채널 통합 관리',
    icon: ChatBubbleLeftRightIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    route: '/operation/communication',
    status: 'active',
    features: ['채널 기반 메시징', '회의 스케줄링', '파일 공유', '알림 센터'],
  },
  {
    id: 'reports',
    title: '운영 보고서',
    description: '자동화된 보고서 생성 및 경영진 대시보드 제공',
    icon: DocumentChartBarIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    route: '/operation/reports',
    status: 'active',
    features: [
      '자동 보고서 생성',
      '템플릿 시스템',
      'PDF 내보내기',
      '경영진 대시보드',
    ],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function OperationPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                운영 관리 시스템
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                서비스 런칭 후 지속적인 운영 관리를 위한 통합 플랫폼
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            >
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      활성 요건
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      24
                    </p>
                  </div>
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      진행 중인 업무
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      18
                    </p>
                  </div>
                  <UsersIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      팀 만족도
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      87%
                    </p>
                  </div>
                  <ArrowTrendingUpIcon className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      완료율
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      92%
                    </p>
                  </div>
                  <DocumentChartBarIcon className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              빠른 실행
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              <div className="flex-shrink-0">
                <PlusIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  새 요건 등록
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  고객 요청사항 추가
                </p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </button>

            <button className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              <div className="flex-shrink-0">
                <CalendarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  새 스프린트
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  스프린트 계획 시작
                </p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </button>

            <button className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              <div className="flex-shrink-0">
                <DocumentChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  성과 보고서
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  월간 보고서 생성
                </p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Operation Modules Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              운영 관리 모듈
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {operationModules.length}개 모듈 사용 가능
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {operationModules.map(module => {
              const Icon = module.icon
              return (
                <motion.div
                  key={module.id}
                  variants={itemVariants}
                  className="group"
                >
                  <Link href={module.route}>
                    <div
                      className={`h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer ${
                        selectedModule === module.id
                          ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                          : ''
                      }`}
                      onMouseEnter={() => setSelectedModule(module.id)}
                      onMouseLeave={() => setSelectedModule(null)}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${module.bgColor} rounded-lg p-3`}>
                          <Icon className={`w-6 h-6 ${module.color}`} />
                        </div>
                        {module.status === 'active' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            활성
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            준비 중
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {module.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          주요 기능
                        </h4>
                        <ul className="space-y-1">
                          {module.features.slice(0, 3).map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                            >
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                              {feature}
                            </li>
                          ))}
                          {module.features.length > 3 && (
                            <li className="text-sm text-gray-500 dark:text-gray-500">
                              +{module.features.length - 3}개 더
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          시작하기
                        </span>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Integration Workflow Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-blue-100 dark:border-blue-800">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <DocumentChartBarIcon className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    통합 운영 워크플로우
                  </h3>
                  <Link
                    href="/operation/workflow"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    워크플로우 시작
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                  </Link>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  6개 운영 관리 모듈을 통합하는 중앙 제어 패널입니다. 체계적인
                  업무 흐름 가이드와 실시간 통계를 통해 효율적인 운영 관리를
                  지원합니다.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      6
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      통합 모듈
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      98%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      자동화율
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      24/7
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      모니터링
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      50%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      효율성 향상
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
