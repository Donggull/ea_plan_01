'use client'

import { usePathname } from 'next/navigation'
import { useThemeStore } from '@/stores/theme'
import useProjectStore from '@/lib/stores/projectStore'

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  useThemeStore()

  // Get page-specific sidebar content
  const getSidebarContent = () => {
    if (pathname === '/dashboard') {
      return <DashboardSidebar />
    } else if (pathname === '/projects') {
      return <ProjectsSidebar />
    } else if (pathname.startsWith('/projects/')) {
      return <ProjectDetailSidebar />
    } else if (pathname === '/chat') {
      return <ChatSidebar />
    } else if (pathname === '/canvas') {
      return <CanvasSidebar />
    } else if (pathname === '/images') {
      return <ImagesSidebar />
    } else if (pathname.startsWith('/operation')) {
      return <OperationSidebar />
    }
    return <DefaultSidebar />
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Close button for mobile */}
      {onClose && (
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            설정
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Page-specific content */}
      <div className="flex-1">{getSidebarContent()}</div>
    </div>
  )
}

// Dashboard Sidebar
function DashboardSidebar() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          프로젝트 필터
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              상태
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>전체</option>
              <option>진행 중</option>
              <option>완료</option>
              <option>대기</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              카테고리
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>전체</option>
              <option>제안 진행</option>
              <option>구축 관리</option>
              <option>운영 관리</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          AGENT STATUS
        </h3>
        <div className="space-y-3">
          {[
            {
              name: 'Assist Agent',
              status: 'active',
              desc: 'AI 기반 요구사항 분석',
            },
            { name: 'UX Agent', status: 'active', desc: '사용자 경험 최적화' },
            { name: 'UI Agent', status: 'active', desc: '인터페이스 디자인' },
            { name: 'Code Agent', status: 'active', desc: '코드 생성 및 리뷰' },
          ].map(agent => (
            <div key={agent.name} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {agent.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {agent.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          PROJECT METRICS
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              전체 진행률
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              45%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: '45%' }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500 dark:text-gray-400">진행 단계</p>
              <p className="font-medium text-gray-900 dark:text-white">3단계</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">남은 시간</p>
              <p className="font-medium text-gray-900 dark:text-white">5일</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Projects Sidebar
function ProjectsSidebar() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          새 프로젝트 생성
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              프로젝트명
            </label>
            <input
              type="text"
              placeholder="프로젝트명을 입력하세요"
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              카테고리
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>제안 진행</option>
              <option>구축 관리</option>
              <option>운영 관리</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              설명
            </label>
            <textarea
              placeholder="프로젝트 설명을 입력하세요"
              rows={3}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
            프로젝트 생성
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          필터
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              상태
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>전체</option>
              <option>진행 중</option>
              <option>완료</option>
              <option>대기</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              정렬
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>최신순</option>
              <option>이름순</option>
              <option>진행률순</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

// Chat Sidebar
function ChatSidebar() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          AI 모델 선택
        </h3>
        <div className="space-y-2">
          {[
            {
              name: 'Gemini Pro',
              desc: '빠른 응답, 비용 효율적',
              color:
                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            },
            {
              name: 'ChatGPT-4',
              desc: '고품질 텍스트 생성',
              color:
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
            },
            {
              name: 'Claude',
              desc: 'MCP 도구 통합',
              color:
                'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
            },
          ].map(model => (
            <label
              key={model.name}
              className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <input type="radio" name="model" className="text-slate-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {model.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${model.color}`}
                  >
                    추천
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {model.desc}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          대화 설정
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              응답 스타일
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>일반적</option>
              <option>전문적</option>
              <option>창의적</option>
              <option>간결한</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              최대 토큰
            </label>
            <input
              type="number"
              defaultValue={2048}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          최근 대화
        </h3>
        <div className="space-y-2">
          {[
            '웹사이트 리뉴얼 기획',
            'API 설계 문서 작성',
            '사용자 요구사항 분석',
          ].map((title, index) => (
            <div
              key={index}
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <p className="text-sm text-gray-900 dark:text-white truncate">
                {title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                2시간 전
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Canvas Sidebar
function CanvasSidebar() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          코드 설정
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              언어
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>JavaScript</option>
              <option>TypeScript</option>
              <option>Python</option>
              <option>HTML</option>
              <option>CSS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              테마
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>VS Code Dark</option>
              <option>VS Code Light</option>
              <option>Monokai</option>
              <option>GitHub</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              폰트 크기
            </label>
            <input
              type="range"
              min="10"
              max="24"
              defaultValue="14"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          최근 파일
        </h3>
        <div className="space-y-2">
          {[
            { name: 'React_Component.jsx', size: '2.4KB', modified: '10분 전' },
            { name: 'API_Handler.js', size: '1.8KB', modified: '1시간 전' },
            { name: 'Dashboard.tsx', size: '5.2KB', modified: '3시간 전' },
          ].map((file, index) => (
            <div
              key={index}
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {file.name}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {file.size}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {file.modified}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          실행 환경
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
            <span className="text-sm text-gray-900 dark:text-white">
              자동 저장
            </span>
            <input type="checkbox" defaultChecked className="text-slate-600" />
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
            <span className="text-sm text-gray-900 dark:text-white">
              실시간 미리보기
            </span>
            <input type="checkbox" defaultChecked className="text-slate-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Images Sidebar
function ImagesSidebar() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          이미지 생성
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              AI 모델
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Flux Schnell (빠름)</option>
              <option>Imagen 3 (고품질)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              스타일
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>기본</option>
              <option>사진</option>
              <option>디지털 아트</option>
              <option>만화</option>
              <option>판타지</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              크기
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>1024x1024 (정사각형)</option>
              <option>1024x768 (가로)</option>
              <option>768x1024 (세로)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              개수
            </label>
            <input
              type="range"
              min="1"
              max="4"
              defaultValue="1"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          필터
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              생성일
            </label>
            <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>전체</option>
              <option>오늘</option>
              <option>이번 주</option>
              <option>이번 달</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              태그
            </label>
            <input
              type="text"
              placeholder="태그로 검색"
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          최근 생성
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(index => (
            <div
              key={index}
              className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                이미지 {index}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Project Detail Sidebar
function ProjectDetailSidebar() {
  const pathname = usePathname()
  const { getProjectById } = useProjectStore()

  // Extract project ID from pathname
  const projectId = pathname.split('/projects/')[1]
  const project = projectId ? getProjectById(projectId) : null

  // Default project data if no project is found
  const projectData = project || {
    name: 'ABC 기업 웹사이트 리뉴얼 제안',
    avatar: '📋',
    progress: 83,
    deadline: '2024-09-05',
  }

  // Check if this is a proposal project to show AI model selector
  const isProposalProject = project?.category === 'proposal'

  return (
    <div className="p-4 space-y-6">
      {/* Project Info Card */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{projectData.avatar}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {projectData.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              제안 진행
            </p>
          </div>
        </div>
      </div>

      {/* AI Model Selection for Proposal Projects */}
      {isProposalProject && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            AI 모델 선택
          </h4>
          <div className="space-y-2">
            {[
              {
                id: 'gemini-pro',
                name: 'Google Gemini',
                desc: '빠른 분석, 비용 효율적',
                icon: '🤖',
                color: 'bg-blue-500',
              },
              {
                id: 'chatgpt-4',
                name: 'ChatGPT-4',
                desc: '고품질 텍스트 분석',
                icon: '🧠',
                color: 'bg-green-500',
              },
              {
                id: 'claude-sonnet',
                name: 'Claude Sonnet',
                desc: '도구 연동 지원',
                icon: '📝',
                color: 'bg-purple-500',
              },
            ].map((model, index) => (
              <label
                key={model.id}
                className="flex items-center space-x-3 p-2 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="radio"
                  name="ai-model"
                  defaultChecked={index === 0}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-lg">{model.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {model.name}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${model.color}`} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {model.desc}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center">
              <span className="mr-1">ℹ️</span>
              모든 분석 단계에서 선택된 모델이 사용됩니다
            </p>
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          진행률
        </h4>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${projectData.progress}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-500 dark:text-gray-400">
          {projectData.progress}%
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          주요 지표
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                진행률
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {projectData.progress}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                마감일
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              9월 5일
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                팀원
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              1명
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                남은 기간
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              11일
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          빠른 실행
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors">
            새 작업
          </button>
          <button className="p-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors">
            노트 추가
          </button>
          <button className="p-2 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors">
            공유
          </button>
          <button className="p-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors">
            백업
          </button>
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          워크플로우
        </h4>
        <div className="space-y-1">
          {[
            { id: 'rfp', label: 'RFP 분석' },
            { id: 'analysis', label: 'RFP 분석' },
            { id: 'research', label: '시장 조사' },
            { id: 'proposal', label: '제안서 작성' },
            { id: 'cost', label: '비용 산정' },
          ].map((tab, index) => (
            <button
              key={tab.id}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                index === 0
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="w-4 h-4"></div>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          최근 활동
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              RFP 분석 완료
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              제안서 초안 검토 추가
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              시장조사 문서 업로드
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Operation Sidebar
function OperationSidebar() {
  const pathname = usePathname()

  const operationModules = [
    {
      id: 'requirements',
      name: '요건 관리',
      href: '/operation/requirements',
      icon: '📋',
    },
    {
      id: 'task-distribution',
      name: '업무 분배',
      href: '/operation/task-distribution',
      icon: '👥',
    },
    {
      id: 'schedule',
      name: '일정 관리',
      href: '/operation/schedule',
      icon: '📅',
    },
    {
      id: 'performance',
      name: '성과 관리',
      href: '/operation/performance',
      icon: '📊',
    },
    {
      id: 'communication',
      name: '커뮤니케이션',
      href: '/operation/communication',
      icon: '💬',
    },
    {
      id: 'reports',
      name: '운영 보고서',
      href: '/operation/reports',
      icon: '📈',
    },
    {
      id: 'workflow',
      name: '통합 워크플로우',
      href: '/operation/workflow',
      icon: '🔄',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          운영 관리 모듈
        </h3>
        <div className="space-y-2">
          {operationModules.map(module => {
            const isActive = pathname === module.href
            return (
              <a
                key={module.id}
                href={module.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{module.icon}</span>
                <span className="text-sm font-medium">{module.name}</span>
              </a>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          빠른 통계
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              활성 요건
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              24
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              진행 중인 업무
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              18
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              완료율
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              92%
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          최근 활동
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              새 요건 승인됨
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              스프린트 #23 시작
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              월간 보고서 생성
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Default Sidebar
function DefaultSidebar() {
  return (
    <div className="p-6">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
        설정
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        페이지별 설정이 여기에 표시됩니다.
      </p>
    </div>
  )
}
