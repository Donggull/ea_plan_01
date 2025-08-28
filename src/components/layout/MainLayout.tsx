'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useThemeStore } from '@/stores/theme'
import { useAuth } from '@/contexts/AuthContext'
import Header from './Header'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isDarkMode, setTheme } = useThemeStore()
  const { user, loading, initialized } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    // Initialize theme on mount
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        setTheme(savedTheme === 'dark')
      } else {
        // Check system preference
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
        setTheme(prefersDark)
      }
    }
  }, [setTheme])

  // Check if current page should have the new layout (exclude homepage only)
  const isHomePage = pathname === '/'
  const isAuthPage = pathname.startsWith('/auth')
  const shouldUseSidebarLayout = !isHomePage && !isAuthPage

  // For homepage, render without authentication checks
  if (isHomePage) {
    return <div className={isDarkMode ? 'dark' : ''}>{children}</div>
  }

  // For auth pages, render without header/sidebar
  if (isAuthPage) {
    return <div className={isDarkMode ? 'dark' : ''}>{children}</div>
  }

  // Wait for authentication to initialize
  if (!initialized || loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {!initialized
              ? '인증 시스템을 초기화하는 중...'
              : '인증 상태를 확인하는 중...'}
          </p>
        </div>
      </div>
    )
  }

  // Only render header and sidebar if user is authenticated
  const shouldShowHeaderAndSidebar = user && shouldUseSidebarLayout

  return (
    <div
      className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}
    >
      {/* Header - Only show if authenticated */}
      {shouldShowHeaderAndSidebar && (
        <Header onMenuToggle={() => setSidebarOpen(true)} />
      )}

      {/* Content area with sidebar */}
      <div className="flex flex-1">
        {/* Left Sidebar - Only show if authenticated */}
        {shouldShowHeaderAndSidebar && (
          <div className="hidden lg:flex lg:w-80 lg:flex-col lg:min-h-0">
            <Sidebar />
          </div>
        )}

        {/* Mobile sidebar - Only show if authenticated */}
        {shouldShowHeaderAndSidebar && sidebarOpen && (
          <div className="fixed inset-0 flex z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
