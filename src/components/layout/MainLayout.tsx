'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useThemeStore } from '@/stores/theme'
import Header from './Header'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isDarkMode, setTheme } = useThemeStore()
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

  // Check if current page should have the new layout (exclude homepage)
  const isHomePage = pathname === '/'
  const shouldUseSidebarLayout = !isHomePage

  if (isHomePage) {
    return <div className={isDarkMode ? 'dark' : ''}>{children}</div>
  }

  return (
    <div
      className={`h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}
    >
      {/* Left Sidebar - Always visible on desktop */}
      {shouldUseSidebarLayout && (
        <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
          <Sidebar />
        </div>
      )}

      {/* Mobile sidebar */}
      {shouldUseSidebarLayout && sidebarOpen && (
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

      {/* Main content area */}
      <div
        className={`flex flex-col flex-1 overflow-hidden ${shouldUseSidebarLayout ? 'lg:pl-80' : ''}`}
      >
        {/* Header */}
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        {/* Main content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Center content */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
