import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: '웹·앱 서비스 기획자 플랫폼',
  description:
    'AI 기반 통합 워크플로우 플랫폼으로 제안 진행부터 구축 관리, 운영 관리까지',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-white dark:bg-slate-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
