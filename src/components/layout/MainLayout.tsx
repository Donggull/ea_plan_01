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

  // Check if current page should have the new layout (exclude homepage only)
  const isHomePage = pathname === '/'
  const shouldUseSidebarLayout = !isHomePage

  if (isHomePage) {
    return <div className={isDarkMode ? 'dark' : ''}>{children}</div>
  }

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}
    >
      {/* Header - Full width at top */}
      <Header onMenuToggle={() => setSidebarOpen(true)} />

      {/* Content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Always visible on desktop, positioned below header */}
        {shouldUseSidebarLayout && (
          <div className="hidden lg:flex lg:w-80 lg:flex-col">
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

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
