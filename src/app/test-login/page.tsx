'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestLoginPage() {
  const [email, setEmail] = useState('test1@example.com')
  const [password, setPassword] = useState('newpassword123')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!supabase) {
        setMessage('❌ Supabase 클라이언트가 초기화되지 않았습니다.')
        return
      }

      console.log('로그인 시도:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('로그인 오류:', error)
        setMessage(`❌ 로그인 실패: ${error.message}`)
      } else if (data.user) {
        console.log('로그인 성공:', data.user)
        setUser(data.user)
        setMessage(`✅ 로그인 성공: ${data.user.email}`)
        
        // 사용자 프로필 가져오기 시도
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()
          
          if (profileError) {
            console.error('프로필 가져오기 오류:', profileError)
            setMessage(prev => prev + `\n⚠️ 프로필 가져오기 실패: ${profileError.message}`)
          } else {
            console.log('프로필 가져오기 성공:', profile)
            setMessage(prev => prev + `\n✅ 프로필: ${profile.name} (${profile.user_role})`)
          }
        } catch (profileErr) {
          console.error('프로필 가져오기 예외:', profileErr)
          setMessage(prev => prev + `\n⚠️ 프로필 가져오기 예외: ${profileErr}`)
        }
      }
    } catch (err) {
      console.error('로그인 예외:', err)
      setMessage(`❌ 로그인 예외: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setMessage(`❌ 로그아웃 실패: ${error.message}`)
      } else {
        setUser(null)
        setMessage('✅ 로그아웃 성공')
      }
    } catch (err) {
      setMessage(`❌ 로그아웃 예외: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    setLoading(true)
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        setMessage(`❌ 세션 확인 실패: ${error.message}`)
      } else if (session) {
        setUser(session.user)
        setMessage(`✅ 현재 세션: ${session.user?.email}`)
      } else {
        setUser(null)
        setMessage('ℹ️ 활성 세션 없음')
      }
    } catch (err) {
      setMessage(`❌ 세션 확인 예외: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          로그인 테스트
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!user ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">
                현재 사용자: {user.email}
              </p>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={checkSession}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? '확인 중...' : '세션 확인'}
            </button>
          </div>

          {message && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <pre className="text-sm whitespace-pre-wrap text-gray-800">
                {message}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}