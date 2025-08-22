'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PasswordReset from '@/components/auth/PasswordReset'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { supabase } from '@/lib/supabase'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()

  const [isResetting, setIsResetting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const type = searchParams.get('type')

  useEffect(() => {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    if (user && !loading && !accessToken) {
      router.replace('/dashboard')
    }

    // URL에 토큰이 있으면 세션 설정
    if (accessToken && refreshToken && type === 'recovery') {
      setIsResetting(true)
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    }
  }, [user, loading, router, accessToken, refreshToken, type])

  const validatePasswords = () => {
    if (!newPassword.trim()) {
      setError('새 비밀번호를 입력해주세요.')
      return false
    }
    if (newPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return false
    }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      setError('비밀번호는 영문과 숫자를 포함해야 합니다.')
      return false
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return false
    }
    return true
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswords()) return

    setError('')

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setError('비밀번호 업데이트에 실패했습니다: ' + updateError.message)
        return
      }

      setSuccess(true)

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.replace(
          '/auth/login?message=비밀번호가%20성공적으로%20변경되었습니다.'
        )
      }, 3000)
    } catch (err) {
      console.error('Password update error:', err)
      setError('비밀번호 업데이트 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loading size="lg" />
      </div>
    )
  }

  if (user && !isResetting) {
    return null // 리다이렉트 중
  }

  // 비밀번호 재설정 성공
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
        <Card className="w-full max-w-md">
          <Card.Body className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
              비밀번호 변경 완료!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              새로운 비밀번호로 로그인해주세요.
            </p>
            <Loading size="sm" />
            <p className="text-xs text-slate-500 mt-2">
              잠시 후 로그인 페이지로 이동합니다...
            </p>
          </Card.Body>
        </Card>
      </div>
    )
  }

  // 비밀번호 재설정 폼 (토큰이 있을 때)
  if (isResetting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
        <Card className="w-full max-w-md">
          <Card.Header>
            <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-50">
              새 비밀번호 설정
            </h1>
            <p className="text-sm text-center text-slate-600 dark:text-slate-400">
              새로운 비밀번호를 입력해주세요
            </p>
          </Card.Header>

          <Card.Body>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <Input
                label="새 비밀번호"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value)
                  if (error) setError('')
                }}
                showPasswordToggle
                helperText="영문, 숫자 포함 6자 이상"
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
                required
              />

              <Input
                label="새 비밀번호 확인"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value)
                  if (error) setError('')
                }}
                showPasswordToggle
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                required
              />

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!newPassword || !confirmPassword}
                className="w-full"
              >
                비밀번호 변경
              </Button>
            </form>
          </Card.Body>
        </Card>
      </div>
    )
  }

  // 기본 비밀번호 재설정 요청 폼
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <PasswordReset
          onSuccess={() => {
            router.replace('/auth/login')
          }}
        />
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <Loading size="lg" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
