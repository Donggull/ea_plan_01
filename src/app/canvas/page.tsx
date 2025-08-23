'use client'

import { useState } from 'react'
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
} from '@heroicons/react/24/outline'
import CodeEditor, { getLanguageTemplate } from '@/components/canvas/CodeEditor'
import CodeTemplates, {
  type CodeTemplate,
} from '@/components/canvas/CodeTemplates'
import PreviewRenderer from '@/components/canvas/PreviewRenderer'

export default function CanvasPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [selectedTab, setSelectedTab] = useState('preview')
  const [isRunning, setIsRunning] = useState(false)
  const [code, setCode] = useState(() => getLanguageTemplate('javascript'))
  const [showTemplates, setShowTemplates] = useState(false)
  const [output, setOutput] = useState('')

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
                AI와 함께 코드를 작성하고 실행하세요 🚀
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
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

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code editor */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-1/2 flex flex-col border-r border-white/20 dark:border-gray-700/50"
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

        {/* Output/Preview */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-1/2 flex flex-col"
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
              <PreviewRenderer
                code={code}
                language={selectedLanguage}
                onExecute={runCode}
                className="flex-1"
              />
            )}
          </div>
        </motion.div>
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
