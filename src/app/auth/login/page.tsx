'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import { Loading } from '@/components/ui/Loading'

function LoginContent() {
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()

  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const message = searchParams.get('message')

  useEffect(() => {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    if (user && !loading) {
      console.log(
        '🏠 LoginPage: User already logged in, redirecting to:',
        redirectTo
      )
      // window.location을 사용하여 즉시 리다이렉트
      window.location.href = redirectTo
    }
  }, [user, loading, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loading size="lg" />
      </div>
    )
  }

  if (user) {
    return null // 리다이렉트 중
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        {message && (
          <div className="mb-6 p-4 text-sm bg-blue-50 border border-blue-200 rounded-lg text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
            {decodeURIComponent(message)}
          </div>
        )}

        <LoginForm
          redirectTo={redirectTo}
          onSuccess={() => {
            console.log('🎯 LoginPage: Login success callback triggered')
            // window.location을 사용하여 즉시 리다이렉트
            window.location.href = redirectTo
          }}
        />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <Loading size="lg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
