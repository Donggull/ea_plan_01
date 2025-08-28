'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, Database } from '@/lib/supabase'

export type UserProfile = Database['public']['Tables']['users']['Row']

export interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  initialized: boolean
  error: string | null
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{
    data: { user: User | null; session: Session | null }
    error: AuthError | null
  }>
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    data: { user: User | null; session: Session | null }
    error: AuthError | null
  }>
  signOut: () => Promise<{ error: AuthError | null }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // 사용자 프로필 가져오기
  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setUserProfile(data)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
    }
  }

  useEffect(() => {
    let mounted = true
    let authSubscription: { unsubscribe: () => void } | null = null

    // Supabase 설정 확인
    if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn('Supabase not configured')
      if (mounted) {
        setLoading(false)
        setInitialized(true)
      }
      return
    }

    // 인증 상태 변경 리스너 설정
    const setupAuthListener = () => {
      console.log('🔊 AuthContext: Setting up auth state listener')

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return

        console.log(
          '🔄 AuthContext: Auth state changed:',
          event,
          session ? 'Session exists' : 'No session'
        )

        try {
          // 상태 업데이트를 동기적으로 처리
          setSession(session)
          setUser(session?.user ?? null)
          setError(null)

          // 프로필 업데이트
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          } else {
            setUserProfile(null)
          }

          console.log('✅ AuthContext: State update complete', {
            user: session?.user ? 'Present' : 'None',
            event,
            initialized: true,
          })
        } catch (error) {
          console.error('❌ AuthContext: Error in auth state change:', error)
          setError('인증 상태 업데이트 중 오류가 발생했습니다.')
        } finally {
          // 모든 처리 완료 후 초기화 상태 업데이트
          setLoading(false)
          setInitialized(true)
        }
      })

      authSubscription = subscription
    }

    // 인증 상태 리스너 설정
    setupAuthListener()

    // 정리 함수
    return () => {
      console.log('🧹 AuthContext: Cleaning up')
      mounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    setError(null)

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) {
        setError(getErrorMessage(error))
      }

      return { data, error }
    } catch (err) {
      console.error('Sign up error:', err)
      const errorMessage = '회원가입 중 오류가 발생했습니다.'
      setError(errorMessage)
      return {
        data: { user: null, session: null },
        error: new Error(errorMessage) as AuthError,
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(getErrorMessage(error))
      }

      return { data, error }
    } catch (err) {
      console.error('Sign in error:', err)
      const errorMessage = '로그인 중 오류가 발생했습니다.'
      setError(errorMessage)
      return {
        data: { user: null, session: null },
        error: new Error(errorMessage) as AuthError,
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(getErrorMessage(error))
      }

      // 상태 초기화
      setUser(null)
      setUserProfile(null)
      setSession(null)

      return { error }
    } catch (err) {
      console.error('Sign out error:', err)
      const errorMessage = '로그아웃 중 오류가 발생했습니다.'
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const getErrorMessage = (error: AuthError): string => {
    switch (error.message) {
      case 'Invalid login credentials':
        return '이메일 또는 비밀번호가 올바르지 않습니다.'
      case 'User already registered':
        return '이미 가입된 이메일입니다.'
      case 'Password should be at least 6 characters':
        return '비밀번호는 최소 6자 이상이어야 합니다.'
      case 'Email not confirmed':
        return '이메일 인증이 필요합니다. 이메일을 확인해주세요.'
      case 'Too many requests':
        return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
      default:
        return error.message || '알 수 없는 오류가 발생했습니다.'
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    initialized,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
