'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlayIcon,
  StopIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  CodeBracketIcon,
  EyeIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  Cog6ToothIcon,
  ClockIcon,
  BoltIcon,
  DocumentTextIcon,
  DocumentPlusIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import CodeEditor, { getLanguageTemplate } from '@/components/canvas/CodeEditor'
import CodeTemplates, {
  type CodeTemplate,
} from '@/components/canvas/CodeTemplates'
import CodeRunner from '@/components/canvas/CodeRunner'
import LibraryLoader, {
  type ExternalLibrary,
} from '@/components/canvas/LibraryLoader'
import CanvasLayout, { type LayoutMode } from '@/components/canvas/CanvasLayout'
import ChatCanvasIntegration, {
  type CodeBlock,
} from '@/components/canvas/ChatCanvasIntegration'
import CanvasManager, {
  type CanvasProject,
} from '@/components/canvas/CanvasManager'
import CanvasTools from '@/components/canvas/CanvasTools'

export default function CanvasPage() {
  // 기본 상태
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [selectedTab, setSelectedTab] = useState('preview')
  const [isRunning, setIsRunning] = useState(false)
  const [code, setCode] = useState(() => getLanguageTemplate('javascript'))
  const [showTemplates, setShowTemplates] = useState(false)
  const [libraries, setLibraries] = useState<ExternalLibrary[]>([])
  const [output, setOutput] = useState('')

  // 레이아웃 상태
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split')
  const [showSidebar, setShowSidebar] = useState(false)
  const [sidebarContent, setSidebarContent] = useState<
    'chat' | 'manager' | 'tools'
  >('chat')

  // 프로젝트 관리 상태
  const [currentProject, setCurrentProject] = useState<CanvasProject | null>(
    null
  )
  const [isLiveReloadEnabled, setIsLiveReloadEnabled] = useState(false)

  // 채팅 연동을 위한 모의 메시지 데이터
  const [mockMessages] = useState([
    {
      id: '1',
      content:
        '간단한 React 컴포넌트를 만들어보세요:\n\n```javascript\nfunction HelloWorld() {\n  return <div>Hello, World!</div>\n}\n\nexport default HelloWorld\n```\n\n이 컴포넌트는 "Hello, World!" 텍스트를 표시합니다.',
      role: 'assistant' as const,
      timestamp: Date.now() - 300000,
    },
    {
      id: '2',
      content:
        'Python으로 데이터 분석 예제를 만들어보겠습니다:\n\n```python\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# 데이터 생성\ndata = {\n    "name": ["Alice", "Bob", "Charlie"],\n    "age": [25, 30, 35],\n    "score": [85, 90, 78]\n}\n\ndf = pd.DataFrame(data)\nprint(df)\n\n# 시각화\nplt.bar(df["name"], df["score"])\nplt.title("Score by Name")\nplt.show()\n```\n\n이 코드는 pandas와 matplotlib을 사용한 기본적인 데이터 분석 예제입니다.',
      role: 'assistant' as const,
      timestamp: Date.now() - 600000,
    },
  ])

  const languages = [
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '⚡',
      color: 'from-amber-500 to-amber-600',
      description: '동적 웹 개발',
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      icon: '🔷',
      color: 'from-indigo-500 to-indigo-600',
      description: '타입 안전성',
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      color: 'from-emerald-500 to-emerald-600',
      description: '데이터 분석',
    },
    {
      id: 'jsx',
      name: 'React',
      icon: '⚛️',
      color: 'from-slate-500 to-slate-600',
      description: 'UI 컴포넌트',
    },
    {
      id: 'html',
      name: 'HTML',
      icon: '🎨',
      color: 'from-gray-500 to-gray-600',
      description: '웹 마크업',
    },
    {
      id: 'css',
      name: 'CSS',
      icon: '🎨',
      color: 'from-purple-500 to-purple-600',
      description: '스타일링',
    },
  ]

  const recentFiles = [
    {
      name: 'ai-chatbot.js',
      type: 'JavaScript',
      modified: '2분 전',
      status: 'success',
      avatar: '🤖',
      lines: 156,
    },
    {
      name: 'data-viz.py',
      type: 'Python',
      modified: '1시간 전',
      status: 'running',
      avatar: '📊',
      lines: 89,
    },
    {
      name: 'dashboard.tsx',
      type: 'TypeScript',
      modified: '3시간 전',
      status: 'error',
      avatar: '📱',
      lines: 234,
    },
    {
      name: 'api-client.js',
      type: 'JavaScript',
      modified: '어제',
      status: 'success',
      avatar: '🌐',
      lines: 67,
    },
  ]

  // 언어 변경 처리
  const handleLanguageChange = (languageId: string) => {
    setSelectedLanguage(languageId)
    const template = getLanguageTemplate(languageId)
    if (template) {
      setCode(template)
    }
  }

  // 템플릿 선택 처리
  const handleTemplateSelect = (template: CodeTemplate) => {
    setCode(template.code)
    setShowTemplates(false)
  }

  // 코드 실행
  const runCode = () => {
    setIsRunning(true)
    setOutput('')

    try {
      // 간단한 코드 실행 시뮬레이션
      const timestamp = new Date().toLocaleTimeString('ko-KR')
      let result = ''

      if (
        selectedLanguage === 'javascript' ||
        selectedLanguage === 'typescript'
      ) {
        result = `⚡ JavaScript/TypeScript 코드 실행 완료
🕒 실행 시간: ${timestamp}
📊 메모리 사용량: ${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 10)}MB
✅ 코드가 성공적으로 실행되었습니다!`
      } else if (selectedLanguage === 'python') {
        result = `🐍 Python 코드 실행 완료
🕒 실행 시간: ${timestamp}
📊 메모리 사용량: ${Math.floor(Math.random() * 8 + 2)}.${Math.floor(Math.random() * 10)}MB
✅ 코드가 성공적으로 실행되었습니다!`
      } else if (selectedLanguage === 'html' || selectedLanguage === 'css') {
        result = `🎨 HTML/CSS 렌더링 완료
🕒 렌더링 시간: ${timestamp}
📊 DOM 노드: ${Math.floor(Math.random() * 50 + 10)}개
✅ 페이지가 성공적으로 렌더링되었습니다!`
      } else if (selectedLanguage === 'jsx') {
        result = `⚛️ React 컴포넌트 렌더링 완료
🕒 렌더링 시간: ${timestamp}
📊 컴포넌트: ${Math.floor(Math.random() * 20 + 5)}개
✅ 컴포넌트가 성공적으로 렌더링되었습니다!`
      }

      setTimeout(
        () => {
          setOutput(result)
          setIsRunning(false)
        },
        1000 + Math.random() * 1000
      )
    } catch (error) {
      setOutput(`❌ 실행 오류: ${error}`)
      setIsRunning(false)
    }
  }

  // 채팅에서 코드 로드
  const handleLoadCode = useCallback((codeBlock: CodeBlock) => {
    setCode(codeBlock.code)
    setSelectedLanguage(codeBlock.language)
    setSelectedTab('preview')
  }, [])

  // 새 캔버스 생성
  const handleCreateCanvas = useCallback((codeBlock: CodeBlock) => {
    const newProject: CanvasProject = {
      id: Date.now().toString(),
      title: codeBlock.title || 'Untitled Project',
      description: codeBlock.description,
      language: codeBlock.language,
      code: codeBlock.code,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [codeBlock.language],
      isFavorite: false,
      isPublic: false,
      forkCount: 0,
      viewCount: 0,
      authorId: 'current-user',
      authorName: '사용자',
    }

    setCurrentProject(newProject)
    setCode(codeBlock.code)
    setSelectedLanguage(codeBlock.language)
    setSelectedTab('preview')
  }, [])

  // 프로젝트 저장
  const handleSaveProject = useCallback(
    async (project: Partial<CanvasProject>) => {
      // 실제로는 API 호출
      console.log('프로젝트 저장:', project)

      if (currentProject) {
        const updatedProject: CanvasProject = {
          ...currentProject,
          ...project,
          code,
          language: selectedLanguage,
          updatedAt: Date.now(),
        }
        setCurrentProject(updatedProject)
      }
    },
    [currentProject, code, selectedLanguage]
  )

  // 프로젝트 로드
  const handleLoadProject = useCallback((project: CanvasProject) => {
    setCurrentProject(project)
    setCode(project.code)
    setSelectedLanguage(project.language)
    setSelectedTab('preview')
  }, [])

  // 코드 포맷팅
  const handleFormatCode = useCallback(
    async (codeToFormat: string): Promise<string> => {
      // 실제로는 prettier 등을 사용
      return new Promise(resolve => {
        setTimeout(() => {
          // 간단한 포맷팅 시뮬레이션
          const formatted = codeToFormat
            .replace(/\s*{\s*/g, ' {\n  ')
            .replace(/;\s*/g, ';\n  ')
            .replace(/}\s*/g, '\n}\n')
          resolve(formatted)
        }, 1000)
      })
    },
    []
  )

  // 라이브 리로드
  useEffect(() => {
    if (isLiveReloadEnabled) {
      const timeoutId = setTimeout(() => {
        // 자동 실행 (실제로는 코드 변경 감지 후)
        console.log('라이브 리로드: 코드 변경 감지')
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [code, isLiveReloadEnabled])

  // 사이드바 토글
  const handleToggleSidebar = useCallback(() => {
    setShowSidebar(!showSidebar)
  }, [showSidebar])

  // 사이드바 컨텐츠 렌더링
  const renderSidebarContent = () => {
    switch (sidebarContent) {
      case 'chat':
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              AI 코드 추출
            </h3>
            <ChatCanvasIntegration
              messages={mockMessages}
              onLoadCode={handleLoadCode}
              onCreateCanvas={handleCreateCanvas}
            />
          </div>
        )
      case 'manager':
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              프로젝트 관리
            </h3>
            <CanvasManager
              currentProject={currentProject}
              onSave={handleSaveProject}
              onLoad={handleLoadProject}
              onDelete={id => console.log('삭제:', id)}
              onFork={async project => ({
                ...project,
                id: Date.now().toString(),
              })}
              onShare={async project =>
                `https://canvas.app/share/${project.id}`
              }
            />
          </div>
        )
      case 'tools':
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              개발 도구
            </h3>
            <CanvasTools
              code={code}
              language={selectedLanguage}
              onCodeChange={setCode}
              onReload={() => window.location.reload()}
              onFormat={handleFormatCode}
              onDebug={() => console.log('디버그 모드 활성화')}
              onInstallPackage={async pkg => console.log('패키지 설치:', pkg)}
              isLiveReloadEnabled={isLiveReloadEnabled}
              onToggleLiveReload={setIsLiveReloadEnabled}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
              <CodeBracketIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                코드 캔버스
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentProject
                  ? currentProject.title
                  : 'AI와 함께 코드를 작성하고 실행하세요'}{' '}
                🚀
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* 사이드바 토글 버튼들 */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSidebarContent('chat')
                setShowSidebar(true)
              }}
              className={`p-2 rounded-lg transition-colors ${
                showSidebar && sidebarContent === 'chat'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              title="AI 코드 추출"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSidebarContent('manager')
                setShowSidebar(true)
              }}
              className={`p-2 rounded-lg transition-colors ${
                showSidebar && sidebarContent === 'manager'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              title="프로젝트 관리"
            >
              <FolderIcon className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSidebarContent('tools')
                setShowSidebar(true)
              }}
              className={`p-2 rounded-lg transition-colors ${
                showSidebar && sidebarContent === 'tools'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              title="개발 도구"
            >
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              isRunning
                ? 'bg-amber-500 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-lg'
            }`}
          >
            {isRunning ? (
              <ClockIcon className="w-4 h-4 animate-spin" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
            <span>{isRunning ? '실행 중...' : '실행'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur border border-white/20 dark:border-gray-600/50 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <StopIcon className="w-4 h-4" />
            <span>중지</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSidebarContent('manager')
              setShowSidebar(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur border border-white/20 dark:border-gray-600/50 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>저장</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTemplates(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur border border-white/20 dark:border-gray-600/50 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <DocumentPlusIcon className="w-4 h-4" />
            <span>템플릿</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSidebarContent('manager')
              setShowSidebar(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <ShareIcon className="w-4 h-4" />
            <span>공유</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Language selector */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 border-b border-white/20 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur"
      >
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 overflow-x-auto">
            {languages.map(lang => (
              <motion.button
                key={lang.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageChange(lang.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedLanguage === lang.id
                    ? `bg-gradient-to-r ${lang.color} text-white shadow-lg`
                    : 'bg-white/60 dark:bg-gray-700/60 backdrop-blur text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-lg">{lang.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{lang.name}</div>
                  <div
                    className={`text-xs ${selectedLanguage === lang.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {lang.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowsPointingOutIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main content with new layout */}
      <div className="flex-1 overflow-hidden">
        <CanvasLayout
          mode={layoutMode}
          onModeChange={setLayoutMode}
          showSidebar={showSidebar}
          onToggleSidebar={handleToggleSidebar}
          editorContent={
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="h-full flex flex-col"
            >
              <CodeEditor
                value={code}
                onChange={setCode}
                language={selectedLanguage}
                onExecute={runCode}
                theme="dark"
                className="flex-1"
              />
            </motion.div>
          }
          previewContent={
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="h-full flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTab('output')}
                    className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                      selectedTab === 'output'
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>출력</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTab('preview')}
                    className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                      selectedTab === 'preview'
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>미리보기</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTab('libraries')}
                    className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                      selectedTab === 'libraries'
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <DocumentPlusIcon className="w-4 h-4" />
                    <span>라이브러리</span>
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedTab === 'output' && (
                  <div className="flex-1 p-4 bg-white dark:bg-gray-900 font-mono text-sm overflow-auto">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <BoltIcon className="w-4 h-4" />
                        <span className="font-medium">실행 결과</span>
                      </div>

                      {isRunning ? (
                        <div className="flex items-center space-x-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-amber-700 dark:text-amber-300">
                            코드를 실행하고 있습니다...
                          </span>
                        </div>
                      ) : output ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {output}
                          </pre>
                        </div>
                      ) : (
                        <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                          <div className="mb-2">🚀</div>
                          <div>Ctrl+Enter를 눌러 코드를 실행해보세요!</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedTab === 'preview' && (
                  <CodeRunner
                    code={code}
                    language={selectedLanguage}
                    onExecute={result => {
                      setIsRunning(false)
                      if (result.type === 'success') {
                        setOutput(result.output || '실행 완료')
                      } else {
                        setOutput(`오류: ${result.error}`)
                      }
                    }}
                    enableExternalLibs={libraries.length > 0}
                    maxExecutionTime={10000}
                    className="flex-1"
                  />
                )}

                {selectedTab === 'libraries' && (
                  <div className="flex-1 p-4 bg-white dark:bg-gray-900 overflow-auto">
                    <div className="max-w-4xl mx-auto">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          외부 라이브러리 관리
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          코드 실행 시 사용할 외부 JavaScript 및 CSS
                          라이브러리를 추가하고 관리할 수 있습니다.
                        </p>
                      </div>

                      <LibraryLoader
                        libraries={libraries}
                        onLibrariesChange={setLibraries}
                      />

                      {libraries.length > 0 && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            💡 사용 팁
                          </h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>
                              • JavaScript 라이브러리는 전역 변수로 접근할 수
                              있습니다
                            </li>
                            <li>
                              • CSS 라이브러리는 자동으로 스타일이 적용됩니다
                            </li>
                            <li>
                              • React 등의 라이브러리는 JSX 문법을 사용할 수
                              있습니다
                            </li>
                            <li>
                              • 로드 순서가 중요한 경우 라이브러리 순서를
                              조정하세요
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          }
          className="h-full"
        >
          {renderSidebarContent()}
        </CanvasLayout>
      </div>

      {/* Bottom panel - Recent files */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="h-40 border-t border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              최근 파일
            </h3>
          </div>
          <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium">
            전체 보기
          </button>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {recentFiles.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="flex-shrink-0 p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 border border-white/20 dark:border-gray-600/50 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{file.avatar}</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      file.status === 'success'
                        ? 'bg-green-400'
                        : file.status === 'running'
                          ? 'bg-yellow-400 animate-pulse'
                          : 'bg-red-400'
                    }`}
                  />
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    file.status === 'success'
                      ? 'bg-green-100 dark:bg-green-900'
                      : file.status === 'running'
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : 'bg-red-100 dark:bg-red-900'
                  }`}
                />
              </div>

              <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                {file.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {file.type} • {file.lines} lines • {file.modified}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 코드 템플릿 모달 */}
      <CodeTemplates
        language={selectedLanguage}
        onSelectTemplate={handleTemplateSelect}
        onClose={() => setShowTemplates(false)}
        isOpen={showTemplates}
      />
    </div>
  )
}
