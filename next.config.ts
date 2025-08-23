import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Vercel 배포 최적화
  serverExternalPackages: [
    '@google/generative-ai',
    'openai',
    '@anthropic-ai/sdk',
  ],

  // 환경 변수 최적화
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 빌드 최적화
  typescript: {
    // 타입 체크는 별도로 실행하므로 빌드 시간 단축
    ignoreBuildErrors: false,
  },

  eslint: {
    // ESLint는 별도로 실행하므로 빌드 시간 단축 (개발 시에는 false로 설정 권장)
    ignoreDuringBuilds: false,
  },

  // API Routes 최적화
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

export default nextConfig
