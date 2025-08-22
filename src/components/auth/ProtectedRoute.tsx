'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loading } from '@/components/ui/Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireSubscription?: 'pro' | 'enterprise'
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireSubscription,
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, userProfile, loading, session } = useAuth()

  useEffect(() => {
    if (loading) return // 로딩 중이면 대기

    // 인증이 필요한데 로그인되지 않은 경우
    if (requireAuth && !user) {
      const loginUrl = redirectTo || `/auth/login?redirectTo=${encodeURIComponent(pathname)}`
      router.replace(loginUrl)
      return
    }

    // 인증이 필요하지 않은데 로그인된 경우 (예: 로그인 페이지)
    if (!requireAuth && user) {
      const dashboardUrl = redirectTo || '/dashboard'
      router.replace(dashboardUrl)
      return
    }

    // 구독 레벨 체크
    if (requireSubscription && userProfile) {
      const userTier = userProfile.subscription_tier
      const hasRequiredSubscription = 
        (requireSubscription === 'pro' && (userTier === 'pro' || userTier === 'enterprise')) ||
        (requireSubscription === 'enterprise' && userTier === 'enterprise')

      if (!hasRequiredSubscription) {
        router.replace('/pricing?upgrade=' + requireSubscription)
        return
      }
    }
  }, [user, userProfile, loading, requireAuth, requireSubscription, router, pathname, redirectTo])

  // 로딩 중
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            인증 상태를 확인하는 중...
          </p>
        </div>
      </div>
    )
  }

  // 인증이 필요한데 로그인되지 않은 경우
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center dark:bg-slate-700">
            <svg className="w-8 h-8 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            이 페이지에 접근하려면 로그인해주세요.
          </p>
        </div>
      </div>
    )
  }

  // 인증이 필요하지 않은데 로그인된 경우
  if (!requireAuth && user) {
    return null // 리다이렉트 중
  }

  // 구독 레벨 체크 실패
  if (requireSubscription && userProfile) {
    const userTier = userProfile.subscription_tier
    const hasRequiredSubscription = 
      (requireSubscription === 'pro' && (userTier === 'pro' || userTier === 'enterprise')) ||
      (requireSubscription === 'enterprise' && userTier === 'enterprise')

    if (!hasRequiredSubscription) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
              구독 업그레이드 필요
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              이 기능을 사용하려면 {requireSubscription === 'pro' ? 'Pro' : 'Enterprise'} 플랜으로 업그레이드해야 합니다.
            </p>
            <button
              onClick={() => router.push('/pricing?upgrade=' + requireSubscription)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              업그레이드하기
            </button>
          </div>
        </div>
      )
    }
  }

  // 모든 조건을 만족하면 컴포넌트 렌더링
  return <>{children}</>
}

// 훅 형태로 사용할 수 있는 버전
export function useRequireAuth(options: {
  requireAuth?: boolean
  requireSubscription?: 'pro' | 'enterprise'
  redirectTo?: string
} = {}) {
  const {
    requireAuth = true,
    requireSubscription,
    redirectTo,
  } = options
  
  const router = useRouter()
  const pathname = usePathname()
  const { user, userProfile, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (requireAuth && !user) {
      const loginUrl = redirectTo || `/auth/login?redirectTo=${encodeURIComponent(pathname)}`
      router.replace(loginUrl)
      return
    }

    if (!requireAuth && user) {
      const dashboardUrl = redirectTo || '/dashboard'
      router.replace(dashboardUrl)
      return
    }

    if (requireSubscription && userProfile) {
      const userTier = userProfile.subscription_tier
      const hasRequiredSubscription = 
        (requireSubscription === 'pro' && (userTier === 'pro' || userTier === 'enterprise')) ||
        (requireSubscription === 'enterprise' && userTier === 'enterprise')

      if (!hasRequiredSubscription) {
        router.replace('/pricing?upgrade=' + requireSubscription)
        return
      }
    }
  }, [user, userProfile, loading, requireAuth, requireSubscription, router, pathname, redirectTo])

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
    userProfile,
  }
}

export default ProtectedRoute