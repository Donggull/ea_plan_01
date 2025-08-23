'use client'

import { useState } from 'react'
import {
  ExclamationTriangleIcon,
  ClipboardIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

export default function EnvironmentError() {
  const [copied, setCopied] = useState(false)

  const envTemplate = `# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI API 키 (선택사항 - 최소 하나 이상 필요)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 기타 환경 설정
NODE_ENV=development`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(envTemplate)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-red-200 dark:border-red-800">
        {/* Header */}
        <div className="p-6 border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div>
              <h1 className="text-xl font-bold text-red-900 dark:text-red-100">
                환경 변수 설정 필요
              </h1>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                애플리케이션을 실행하기 위해 환경 변수가 필요합니다
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                📝 설정 방법
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-mono">
                    1
                  </span>
                  <span>
                    프로젝트 루트 디렉토리에{' '}
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                      .env.local
                    </code>{' '}
                    파일을 생성하세요
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-mono">
                    2
                  </span>
                  <span>아래 템플릿을 복사하여 실제 API 키로 교체하세요</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-mono">
                    3
                  </span>
                  <span>개발 서버를 재시작하세요 (Ctrl+C → npm run dev)</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  🔑 환경 변수 템플릿
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>복사됨!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-4 w-4" />
                      <span>복사</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto border">
                {envTemplate}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                🔗 API 키 발급 방법
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Supabase (필수)
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    데이터베이스 및 인증을 위해 필수입니다
                  </p>
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    supabase.com에서 프로젝트 생성 →
                  </a>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    AI API (선택사항)
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    최소 하나 이상의 AI API가 필요합니다
                  </p>
                  <div className="space-y-1">
                    <a
                      href="https://makersuite.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-green-600 dark:text-green-400 hover:underline text-xs"
                    >
                      • Google AI (Gemini)
                    </a>
                    <a
                      href="https://platform.openai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-green-600 dark:text-green-400 hover:underline text-xs"
                    >
                      • OpenAI (ChatGPT)
                    </a>
                    <a
                      href="https://console.anthropic.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-green-600 dark:text-green-400 hover:underline text-xs"
                    >
                      • Anthropic (Claude)
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                주의사항
              </h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• API 키는 외부에 노출되지 않도록 주의하세요</li>
                <li>• .env.local 파일은 Git에 커밋하지 마세요</li>
                <li>• 프로덕션 환경에서는 환경 변수를 안전하게 설정하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
