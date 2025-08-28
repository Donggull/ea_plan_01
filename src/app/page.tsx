'use client'

import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import {
  ChartBarIcon,
  Square3Stack3DIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const { user, userProfile, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.refresh()
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }
  const features = [
    {
      title: '제안 진행',
      description: 'RFP 분석부터 제안서 작성까지',
      icon: ChartBarIcon,
      color: 'from-orange-400 to-yellow-500',
      bgPattern: 'dots',
      href: '/projects',
      buttonText: '제안 시작하기',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      title: '구축 관리',
      description: '요구사항 정리부터 QA까지',
      icon: Square3Stack3DIcon,
      color: 'from-pink-500 to-rose-500',
      bgPattern: 'grid',
      href: '/projects',
      buttonText: '구축 관리하기',
      buttonColor: 'bg-pink-600 hover:bg-pink-700',
    },
    {
      title: '운영 관리',
      description: '업무 분배와 일정 관리',
      icon: UserGroupIcon,
      color: 'from-emerald-500 to-teal-500',
      bgPattern: 'circles',
      href: '/dashboard',
      buttonText: '운영 시작하기',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      title: 'AI 챗봇',
      description: 'AI 모델로 스마트한 업무 지원',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-blue-500 to-indigo-600',
      bgPattern: 'waves',
      href: '/chat',
      buttonText: 'AI와 대화하기',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
  ]

  const PatternDots = () => (
    <div className="absolute inset-0 opacity-20">
      {Array.from({ length: 35 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 bg-orange-800 rounded-full"
          style={{
            left: `${15 + (i % 5) * 20}%`,
            top: `${20 + Math.floor(i / 5) * 15}%`,
          }}
        />
      ))}
    </div>
  )

  const PatternGrid = () => (
    <div className="absolute inset-0 opacity-15">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-8 h-8 border-2 border-pink-700"
          style={{
            left: `${10 + (i % 4) * 20}%`,
            top: `${25 + Math.floor(i / 4) * 20}%`,
          }}
        />
      ))}
    </div>
  )

  const PatternCircles = () => (
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-32 h-32 border-4 border-emerald-700 rounded-full"></div>
        <div className="absolute top-4 left-4 w-24 h-24 border-2 border-emerald-600 rounded-full"></div>
        <div className="absolute top-8 left-8 w-16 h-16 border-2 border-emerald-500 rounded-full"></div>
      </div>
    </div>
  )

  const PatternWaves = () => (
    <div className="absolute inset-0 opacity-15">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-4 h-1 bg-blue-700 rounded-full"
          style={{
            left: `${10 + (i % 5) * 18}%`,
            top: `${30 + Math.floor(i / 5) * 15}%`,
            transform: `rotate(${i * 18}deg)`,
          }}
        />
      ))}
    </div>
  )

  const getPattern = (pattern: string) => {
    switch (pattern) {
      case 'dots':
        return <PatternDots />
      case 'grid':
        return <PatternGrid />
      case 'circles':
        return <PatternCircles />
      case 'waves':
        return <PatternWaves />
      default:
        return null
    }
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-6">
          <div className="flex items-center space-x-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-900 rounded"></div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <ChartBarIcon className="w-5 h-5" />
                <span>제안진행</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <Square3Stack3DIcon className="w-5 h-5" />
                <span>구축관리</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <UserGroupIcon className="w-5 h-5" />
                <span>운영관리</span>
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                대시보드
              </button>
            </Link>
            <Link href="/projects">
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                프로젝트
              </button>
            </Link>
            {/* 사용자 메뉴 */}
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors">
                  {user ? (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {userProfile?.name?.charAt(0) ||
                          user.email?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl">⚙️</span>
                  )}
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  {user ? (
                    <>
                      {/* 로그인 상태 메뉴 */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {userProfile?.name || '사용자'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                        {userProfile?.user_role === 'super_admin' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            <ShieldCheckIcon className="w-3 h-3 mr-1" />
                            관리자
                          </span>
                        )}
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/dashboard"
                            className={`${
                              active
                                ? 'bg-gray-100 dark:bg-gray-700'
                                : 'text-gray-700 dark:text-gray-300'
                            } group flex px-4 py-2 text-sm`}
                          >
                            <UserCircleIcon className="mr-3 h-5 w-5" />
                            대시보드
                          </Link>
                        )}
                      </Menu.Item>
                      {userProfile?.user_role === 'super_admin' && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/admin"
                              className={`${
                                active
                                  ? 'bg-gray-100 dark:bg-gray-700'
                                  : 'text-gray-700 dark:text-gray-300'
                              } group flex px-4 py-2 text-sm`}
                            >
                              <Cog6ToothIcon className="mr-3 h-5 w-5" />
                              관리자 페이지
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active
                                ? 'bg-gray-100 dark:bg-gray-700'
                                : 'text-gray-700 dark:text-gray-300'
                            } group flex px-4 py-2 text-sm w-full text-left`}
                          >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                            로그아웃
                          </button>
                        )}
                      </Menu.Item>
                    </>
                  ) : (
                    <>
                      {/* 로그아웃 상태 메뉴 */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogin}
                            className={`${
                              active
                                ? 'bg-gray-100 dark:bg-gray-700'
                                : 'text-gray-700 dark:text-gray-300'
                            } group flex px-4 py-2 text-sm w-full text-left`}
                          >
                            <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
                            로그인
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/auth/signup"
                            className={`${
                              active
                                ? 'bg-gray-100 dark:bg-gray-700'
                                : 'text-gray-700 dark:text-gray-300'
                            } group flex px-4 py-2 text-sm`}
                          >
                            <UserCircleIcon className="mr-3 h-5 w-5" />
                            회원가입
                          </Link>
                        )}
                      </Menu.Item>
                    </>
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 px-6 pt-12 pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <p className="text-gray-400 text-lg mb-4">
                기획자를 위한 AI 통합 플랫폼
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                <span className="text-white">웹·앱 서비스 기획의</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  새로운 경험
                </span>
              </h1>
            </motion.div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div
                    className={`relative h-[500px] bg-gradient-to-br ${feature.color} rounded-3xl p-8 overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300`}
                  >
                    {/* Background Pattern */}
                    {getPattern(feature.bgPattern)}

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Icon */}
                      <div className="mb-6">
                        <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {feature.title}
                      </h3>

                      {/* Spacer */}
                      <div className="flex-1"></div>

                      {/* Description */}
                      <p className="text-white/90 text-lg font-medium mb-8 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Button */}
                      <Link href={feature.href}>
                        <button
                          className={`w-full ${feature.buttonColor} text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2`}
                        >
                          <span>{feature.buttonText}</span>
                          <ArrowRightIcon className="w-5 h-5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
