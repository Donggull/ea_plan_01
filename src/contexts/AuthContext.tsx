'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError, AuthResponse } from '@supabase/supabase-js'
import { supabase, Database } from '@/lib/supabase'

export type UserProfile = Database['public']['Tables']['users']['Row']

export interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, name: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
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

  useEffect(() => {
    let isMounted = true

    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error getting session:', sessionError)
          setError(sessionError.message)
          return
        }

        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          }
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err)
        if (isMounted) {
          setError('세션을 가져오는 중 오류가 발생했습니다.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        console.log('Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)
        setError(null)

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }

        if (event === 'SIGNED_OUT') {
          setUserProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 사용자 프로필이 없으면 생성
          await createUserProfile(userId)
        } else {
          console.error('Error fetching user profile:', error)
          setError('사용자 프로필을 가져오는 중 오류가 발생했습니다.')
        }
        return
      }

      setUserProfile(data)
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
      setError('사용자 프로필을 가져오는 중 오류가 발생했습니다.')
    }
  }

  const createUserProfile = async (userId: string) => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) return

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: user.data.user.email!,
          name: user.data.user.user_metadata?.name || user.data.user.email!.split('@')[0],
          subscription_tier: 'free' as const,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        setError('사용자 프로필을 생성하는 중 오류가 발생했습니다.')
        return
      }

      setUserProfile(data)
    } catch (err) {
      console.error('Error in createUserProfile:', err)
      setError('사용자 프로필을 생성하는 중 오류가 발생했습니다.')
    }
  }

  const signUp = async (email: string, password: string, name: string): Promise<any> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        setError(getErrorMessage(error))
      }

      return { data, error }
    } catch (err) {
      const errorMessage = '회원가입 중 오류가 발생했습니다.'
      setError(errorMessage)
      return { 
        data: { user: null, session: null },
        error: new Error(errorMessage) as any
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<any> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(getErrorMessage(error))
      }

      return { data, error }
    } catch (err) {
      const errorMessage = '로그인 중 오류가 발생했습니다.'
      setError(errorMessage)
      return { 
        data: { user: null, session: null },
        error: new Error(errorMessage) as any
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(getErrorMessage(error))
      } else {
        setUser(null)
        setUserProfile(null)
        setSession(null)
      }

      return { error }
    } catch (err) {
      const errorMessage = '로그아웃 중 오류가 발생했습니다.'
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(getErrorMessage(error))
      }

      return { error }
    } catch (err) {
      const errorMessage = '비밀번호 재설정 중 오류가 발생했습니다.'
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      const error = new Error('로그인이 필요합니다.')
      setError(error.message)
      return { error }
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        } as any)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        setError('프로필 업데이트 중 오류가 발생했습니다.')
        return { error: new Error(error.message) }
      }

      setUserProfile(data)
      return { error: null }
    } catch (err) {
      const errorMessage = '프로필 업데이트 중 오류가 발생했습니다.'
      setError(errorMessage)
      return { error: new Error(errorMessage) }
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
      case 'Signup is disabled':
        return '회원가입이 현재 비활성화되어 있습니다.'
      default:
        return error.message || '알 수 없는 오류가 발생했습니다.'
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext