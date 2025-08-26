'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useThemeStore } from '@/stores/theme'
import { useModalStore } from '@/stores/modalStore'
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  PhotoIcon,
  PlusIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface HeaderProps {
  onMenuToggle: () => void
}

const mainNavigation = [
  { name: '대시보드', href: '/dashboard', icon: HomeIcon },
  { name: '프로젝트', href: '/projects', icon: FolderIcon },
  { name: '뉴엘', href: '/newel', icon: CpuChipIcon },
  { name: 'AI 채팅', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: '코드 캔버스', href: '/canvas', icon: CodeBracketIcon },
  { name: '이미지 생성', href: '/images', icon: PhotoIcon },
]

const projectCategories = [
  { name: '제안 진행', href: '/projects?category=proposal' },
  { name: '구축 관리', href: '/projects?category=development' },
  { name: '운영 관리', href: '/projects?category=operation' },
]

export default function Header({ onMenuToggle }: HeaderProps) {
  const { isDarkMode, toggleTheme } = useThemeStore()
  const { openCreateProjectModal } = useModalStore()
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()

  return (
    <header className="bg-gray-900 text-white shadow-lg border-b border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <Link
              href="/"
              className="flex-shrink-0 flex items-center ml-4 lg:ml-0"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-900 rounded"></div>
                </div>
                <span className="ml-3 text-xl font-bold text-white">
                  ELUO AI Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Center - Main Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {mainNavigation.map((item, _index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const isProjectMenu = item.name === '프로젝트'

              if (isProjectMenu) {
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                      <svg
                        className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </Link>

                    {/* Hover Dropdown Menu */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {projectCategories.map(category => (
                        <Link
                          key={category.name}
                          href={category.href}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="block w-64 pl-9 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 placeholder-gray-400 focus:outline-none focus:placeholder-gray-500 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-sm text-white transition-colors"
                />
              </div>
            </div>

            {/* New Project Button */}
            <button
              onClick={openCreateProjectModal}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">새 프로젝트</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 rounded-md transition-colors"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 rounded-md relative transition-colors">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">
                  <span className="sr-only">사용자 메뉴 열기</span>
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">KJ</span>
                  </div>
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
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/profile"
                        className={`${
                          active
                            ? 'bg-gray-100 dark:bg-gray-700'
                            : 'text-gray-700 dark:text-gray-300'
                        } group flex px-4 py-2 text-sm`}
                      >
                        <UserCircleIcon className="mr-3 h-5 w-5" />내 프로필
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/settings"
                        className={`${
                          active
                            ? 'bg-gray-100 dark:bg-gray-700'
                            : 'text-gray-700 dark:text-gray-300'
                        } group flex px-4 py-2 text-sm`}
                      >
                        <Cog6ToothIcon className="mr-3 h-5 w-5" />
                        설정
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          // TODO: 로그아웃 로직 구현
                          console.log('로그아웃')
                        }}
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
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  )
}
