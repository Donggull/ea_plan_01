'use client'

import { useEffect, useState } from 'react'
import EnvironmentError from '@/components/ui/EnvironmentError'

interface EnvironmentProviderProps {
  children: React.ReactNode
}

export default function EnvironmentProvider({
  children,
}: EnvironmentProviderProps) {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [_error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        // 프로덕션 환경에서는 환경 변수 체크 스킵
        // Vercel에서는 빌드 타임에 환경 변수가 없어도 런타임에는 설정될 수 있음
        setIsConfigured(true)
        setError(null)
        return

        /* 
        // 환경 변수 체크 로직은 주석 처리 (나중에 필요시 활성화)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        // 개발 환경에서만 경고
        if (process.env.NODE_ENV === 'development') {
          if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('Supabase 환경 변수가 설정되지 않았습니다.')
          }
        }

        setIsConfigured(true)
        setError(null)
        */
      } catch (err) {
        console.error('Environment check error:', err)
        // 에러가 있어도 앱은 로드되도록 함
        setIsConfigured(true)
        setError(null)
      }
    }

    checkEnvironment()
  }, [])

  // 로딩 중
  if (isConfigured === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            환경 설정을 확인하는 중...
          </p>
        </div>
      </div>
    )
  }

  // 환경 변수가 설정되지 않음
  if (!isConfigured) {
    return <EnvironmentError />
  }

  // 정상적으로 설정됨
  return <>{children}</>
}
