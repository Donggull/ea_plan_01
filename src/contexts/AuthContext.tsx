'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, Database } from '@/lib/supabase'

export type UserProfile = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']

export interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
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
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (
    updates: Partial<UserProfile>
  ) => Promise<{ error: Error | null }>
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

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // Supabase 클라이언트가 없으면 스킵
      if (!supabase) {
        console.warn('Supabase client not initialized')
        return
      }

      // 개발 환경에서 기본 사용자 설정
      const defaultUserId = 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d'
      const actualUserId = userId || defaultUserId

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', actualUserId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 개발 환경에서 기본 프로필 사용
          if (process.env.NODE_ENV === 'development') {
            const defaultProfile: UserProfile = {
              id: defaultUserId,
              email: 'dg.an@eluocnc.com',
              name: '안동균',
              subscription_tier: 'enterprise',
              user_role: 'super_admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as UserProfile

            setUserProfile(defaultProfile)
            return
          }

          // 개발 환경에서는 사용자 생성하지 않고 기본 프로필 사용
          console.log(
            'User profile not found, using default in development mode'
          )
          const defaultProfile: UserProfile = {
            id: defaultUserId,
            email: 'dg.an@eluocnc.com',
            name: '안동균',
            subscription_tier: 'enterprise',
            user_role: 'super_admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as UserProfile

          setUserProfile(defaultProfile)
        } else {
          console.error('Error fetching user profile:', error)
          // 개발 환경에서는 에러 시 기본 프로필 사용
          if (process.env.NODE_ENV === 'development') {
            const defaultProfile: UserProfile = {
              id: defaultUserId,
              email: 'dg.an@eluocnc.com',
              name: '안동균',
              subscription_tier: 'enterprise',
              user_role: 'super_admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as UserProfile

            setUserProfile(defaultProfile)
            return
          }
          setError('사용자 프로필을 가져오는 중 오류가 발생했습니다.')
        }
        return
      }

      setUserProfile(data)
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
      // 개발 환경에서는 에러 시 기본 프로필 사용
      if (process.env.NODE_ENV === 'development') {
        const defaultUserId = 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d'
        const defaultProfile: UserProfile = {
          id: defaultUserId,
          email: 'dg.an@eluocnc.com',
          name: '안동균',
          subscription_tier: 'enterprise',
          user_role: 'super_admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserProfile

        setUserProfile(defaultProfile)
        return
      }
      setError('사용자 프로필을 가져오는 중 오류가 발생했습니다.')
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let authInitialized = false

    // 타임아웃 설정: 15초 후에도 loading이 true이면 강제로 false로 설정
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading && !authInitialized) {
        console.warn('Auth loading timeout reached, forcing loading to false')
        setLoading(false)
        authInitialized = true
      }
    }, 15000)

    // Supabase 클라이언트 유효성 확인
    const isValidSupabase =
      supabase &&
      typeof supabase.auth?.getSession === 'function' &&
      !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

    // Supabase가 제대로 설정되지 않은 경우 개발 모드에서만 폴백
    if (!isValidSupabase && process.env.NODE_ENV === 'development') {
      console.warn('Supabase not configured properly, using fallback mode')
      if (isMounted) {
        setLoading(false)
        authInitialized = true
      }
      return () => {
        isMounted = false
        clearTimeout(loadingTimeout)
      }
    }

    if (!isValidSupabase) {
      console.error('Supabase client is not properly configured')
      if (isMounted) {
        setError('인증 서비스를 초기화할 수 없습니다.')
        setLoading(false)
        authInitialized = true
      }
      return () => {
        isMounted = false
        clearTimeout(loadingTimeout)
      }
    }

    console.log('Initializing Auth with onAuthStateChange only')

    // onAuthStateChange만 사용하여 모든 인증 상태 관리
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      console.log(
        'Auth state changed:',
        event,
        session?.user?.email || 'no user'
      )

      // 첫 번째 INITIAL_SESSION 이벤트에서 로딩 완료 처리
      if (event === 'INITIAL_SESSION' && !authInitialized) {
        authInitialized = true
        setLoading(false)
        console.log('Auth initialization completed')
      }

      // 세션 상태 업데이트
      setSession(session)
      setUser(session?.user ?? null)
      setError(null)

      if (session?.user) {
        // 프로필은 백그라운드에서 로드
        try {
          await fetchUserProfile(session.user.id)
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError)
          // 프로필 로드 실패해도 세션은 유지
        }
      } else {
        setUserProfile(null)
      }

      // 로그아웃 시 추가 정리
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        setUserProfile(null)
        setError(null)
      }
    })

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<{
    data: { user: User | null; session: Session | null }
    error: AuthError | null
  }> => {
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
      console.error('Error in signUp:', err)
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

  const signIn = async (
    email: string,
    password: string
  ): Promise<{
    data: { user: User | null; session: Session | null }
    error: AuthError | null
  }> => {
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
      console.error('Error in signIn:', err)
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
      } else {
        // 상태 초기화
        setUser(null)
        setUserProfile(null)
        setSession(null)

        // 브라우저 스토리지 명시적 정리
        if (typeof window !== 'undefined') {
          // sessionStorage 정리 (세션 관련 데이터)
          sessionStorage.clear()

          // localStorage에서 Supabase 관련 항목만 제거
          const keysToRemove = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key))
        }
      }

      return { error }
    } catch (err) {
      console.error('Error in signOut:', err)
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
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(getErrorMessage(error))
      }

      return { error }
    } catch (err) {
      console.error('Error in resetPassword:', err)
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
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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
      console.error('Error in updateProfile:', err)
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
