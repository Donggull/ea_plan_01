'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface SignupFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function SignupForm({ onSuccess, redirectTo }: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [formErrors, setFormErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { signUp, loading, error, clearError } = useAuth()

  const validateForm = () => {
    const errors: {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

    if (!formData.name.trim()) {
      errors.name = '이름을 입력해주세요.'
    } else if (formData.name.trim().length < 2) {
      errors.name = '이름은 최소 2자 이상이어야 합니다.'
    }

    if (!formData.email.trim()) {
      errors.email = '이메일을 입력해주세요.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.'
    }

    if (!formData.password.trim()) {
      errors.password = '비밀번호를 입력해주세요.'
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다.'
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      errors.password = '비밀번호는 영문과 숫자를 포함해야 합니다.'
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    if (!agreedToTerms) {
      alert('이용약관과 개인정보처리방침에 동의해주세요.')
      return
    }

    clearError()

    try {
      const { data, error: signUpError } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.name.trim()
      )
      
      if (!signUpError && data.user) {
        setShowSuccess(true)
        
        // 자동 로그인이 되지 않은 경우 (이메일 인증 필요)
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          } else if (redirectTo) {
            window.location.href = redirectTo
          } else {
            window.location.href = '/auth/login'
          }
        }, 3000)
      }
    } catch (err) {
      console.error('Signup error:', err)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    if (error) {
      clearError()
    }
  }

  if (showSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <Card.Body className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
            회원가입 완료!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            이메일로 전송된 인증 링크를 클릭하여 계정을 활성화해주세요.
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/auth/login'}
          >
            로그인 페이지로 이동
          </Button>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Card.Header>
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-50">
          회원가입
        </h1>
        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
          새 계정을 만들어 시작하세요
        </p>
      </Card.Header>

      <Card.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이름"
            type="text"
            placeholder="홍길동"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            errorText={formErrors.name}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            disabled={loading}
            required
          />

          <Input
            label="이메일"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
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
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            errorText={formErrors.password}
            helperText="영문, 숫자 포함 6자 이상"
            showPasswordToggle
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            disabled={loading}
            required
          />

          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            errorText={formErrors.confirmPassword}
            showPasswordToggle
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            disabled={loading}
            required
          />

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              disabled={loading}
              required
            />
            <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                이용약관
              </Link>
              {' 및 '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                개인정보처리방침
              </Link>
              에 동의합니다.
            </label>
          </div>

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
            disabled={loading || !agreedToTerms}
            className="w-full"
          >
            {loading ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                이미 계정이 있으신가요?
              </span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default SignupForm