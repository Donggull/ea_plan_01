'use client'

import { useEffect } from 'react'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)

    // 특정 환경 변수 오류인지 확인
    if (
      error.message?.includes('supabase') ||
      error.message?.includes('SUPABASE')
    ) {
      console.error('Supabase configuration error detected')
    }
  }, [error])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={reset}
            className="w-full flex items-center justify-center"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            다시 시도
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = '/dashboard')}
          >
            대시보드로 돌아가기
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <details className="text-left">
            <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              오류 세부정보 (개발자용)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto">
              {error.message}
              {error.digest && (
                <div className="mt-2 text-gray-500">
                  Error ID: {error.digest}
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
