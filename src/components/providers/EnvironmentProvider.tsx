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
        // Vercel 배포 환경에서는 환경 변수가 설정되어 있으므로 바로 통과
        if (process.env.NODE_ENV === 'production') {
          setIsConfigured(true)
          setError(null)
          return
        }

        // 개발 환경에서만 환경 변수 검증 수행
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setError('Supabase 환경 변수가 설정되지 않았습니다.')
          setIsConfigured(false)
          return
        }

        // URL 형식 검증
        if (
          !supabaseUrl.includes('supabase.co') &&
          !supabaseUrl.includes('localhost')
        ) {
          setError('Supabase URL 형식이 올바르지 않습니다.')
          setIsConfigured(false)
          return
        }

        // API를 통해 서버 측 환경 변수도 확인 (개발 환경에서만)
        try {
          const response = await fetch('/api/health-check', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            throw new Error('서버 상태 확인 실패')
          }

          const data = await response.json()

          if (!data.configured) {
            setError(
              data.message || '서버 환경 변수가 올바르게 설정되지 않았습니다.'
            )
            setIsConfigured(false)
            return
          }

          setIsConfigured(true)
          setError(null)
        } catch (fetchError) {
          // API 호출 실패는 치명적이지 않음 (개발 환경에서는 서버가 아직 시작되지 않았을 수 있음)
          console.warn('Health check failed:', fetchError)
          setIsConfigured(true) // 클라이언트 환경 변수가 있으면 일단 진행
        }
      } catch (err) {
        console.error('Environment check error:', err)
        setError('환경 변수 확인 중 오류가 발생했습니다.')
        setIsConfigured(false)
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
