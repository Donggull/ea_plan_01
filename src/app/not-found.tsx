import Link from 'next/link'
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard">
            <Button className="w-full flex items-center justify-center">
              <HomeIcon className="w-4 h-4 mr-2" />
              대시보드로 돌아가기
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full">
              홈페이지로 이동
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            문제가 지속된다면{' '}
            <a
              href="#"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              고객 지원팀에 문의
            </a>
            해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}
