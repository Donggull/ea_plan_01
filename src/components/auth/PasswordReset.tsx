'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface PasswordResetProps {
  onSuccess?: () => void
}

export function PasswordReset({ onSuccess }: PasswordResetProps) {
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const { resetPassword, loading, error, clearError } = useAuth()

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return '이메일을 입력해주세요.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return '올바른 이메일 형식을 입력해주세요.'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailError = validateEmail(email)
    if (emailError) {
      setFormError(emailError)
      return
    }

    setFormError('')
    clearError()

    try {
      const { error: resetError } = await resetPassword(email.trim())
      
      if (!resetError) {
        setIsSuccess(true)
        if (onSuccess) {
          setTimeout(onSuccess, 3000)
        }
      }
    } catch (err) {
      console.error('Password reset error:', err)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (formError) {
      setFormError('')
    }
    if (error) {
      clearError()
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <Card.Body className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
            이메일을 확인해주세요
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            <span className="font-medium">{email}</span>로 비밀번호 재설정 링크를 보냈습니다.
            이메일을 확인하여 비밀번호를 재설정해주세요.
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => setIsSuccess(false)}
              className="w-full"
            >
              다른 이메일로 시도
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/auth/login'}
              className="w-full"
            >
              로그인 페이지로 돌아가기
            </Button>
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Card.Header>
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-50">
          비밀번호 재설정
        </h1>
        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
          가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다
        </p>
      </Card.Header>

      <Card.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            errorText={formError || error || undefined}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
            disabled={loading}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading || !email.trim()}
            className="w-full"
          >
            {loading ? '전송 중...' : '재설정 링크 보내기'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                또는
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center space-y-2">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              로그인하기
            </Link>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              계정이 없으신가요?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                회원가입
              </Link>
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg dark:bg-slate-800">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
            이메일이 오지 않나요?
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li>• 스팸 폴더를 확인해보세요</li>
            <li>• 이메일 주소를 정확히 입력했는지 확인해보세요</li>
            <li>• 몇 분 후에 다시 시도해보세요</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  )
}

export default PasswordReset