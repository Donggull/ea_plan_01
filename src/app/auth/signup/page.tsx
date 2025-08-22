'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SignupForm from '@/components/auth/SignupForm'
import { Loading } from '@/components/ui/Loading'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()

  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  useEffect(() => {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    if (user && !loading) {
      router.replace(redirectTo)
    }
  }, [user, loading, router, redirectTo])

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
        <SignupForm
          redirectTo="/auth/login?message=회원가입이%20완료되었습니다.%20이메일%20인증%20후%20로그인해주세요."
          onSuccess={() => {
            router.replace('/auth/login?message=회원가입이%20완료되었습니다.%20이메일%20인증%20후%20로그인해주세요.')
          }}
        />
      </div>
    </div>
  )
}