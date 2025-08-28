'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formErrors, setFormErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const { signIn, loading, error, clearError } = useAuth()

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      errors.email = '이메일을 입력해주세요.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.'
    }

    if (!password.trim()) {
      errors.password = '비밀번호를 입력해주세요.'
    } else if (password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    clearError()

    try {
      const { error: signInError } = await signIn(email.trim(), password)
      
      if (!signInError) {
        if (onSuccess) {
          onSuccess()
        } else if (redirectTo) {
          window.location.href = redirectTo
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value)
      if (formErrors.email) {
        setFormErrors(prev => ({ ...prev, email: undefined }))
      }
    } else {
      setPassword(value)
      if (formErrors.password) {
        setFormErrors(prev => ({ ...prev, password: undefined }))
      }
    }
    
    if (error) {
      clearError()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Card.Header>
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-50">
          로그인
        </h1>
        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
          계정에 로그인하세요
        </p>
      </Card.Header>

      <Card.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            errorText={formErrors.email}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
            disabled={loading}
            required
          />

          <Input
            label="비밀번호"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            errorText={formErrors.password}
            showPasswordToggle
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            disabled={loading}
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
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <Link
              href="/auth/reset-password"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

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

          <div className="text-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              계정이 없으신가요?{' '}
            </span>
            <Link
              href="/auth/signup"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              회원가입
            </Link>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default LoginForm