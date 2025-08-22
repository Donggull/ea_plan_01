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
  CpuChipIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default function CanvasPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [selectedTab, setSelectedTab] = useState('output')
  const [isRunning, setIsRunning] = useState(false)
  const [code, setCode] = useState(`// 🚀 AI와 함께 코드를 작성해보세요!
function greet(name) {
  return \`Hello, \${name}! 🌟\`;
}

function createCard(title, content) {
  return {
    title,
    content,
    timestamp: new Date().toISOString(),
    render() {
      console.log(\`📦 \${this.title}: \${this.content}\`);
    }
  };
}

// 실행 예시
const card = createCard("Welcome", "AI 코드 캔버스에 오신 것을 환영합니다!");
card.render();
console.log(greet('Developer'));

// 배열 처리 예시
const languages = ['JavaScript', 'Python', 'TypeScript', 'React'];
languages.forEach((lang, index) => {
  console.log(\`\${index + 1}. \${lang} ⚡\`);
});`)

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
      id: 'react',
      name: 'React',
      icon: '⚛️',
      color: 'from-slate-500 to-slate-600',
      description: 'UI 컴포넌트',
    },
    {
      id: 'html',
      name: 'HTML/CSS',
      icon: '🎨',
      color: 'from-gray-500 to-gray-600',
      description: '웹 디자인',
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

  const runCode = () => {
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 2000)
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
                onClick={() => setSelectedLanguage(lang.id)}
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
          <div className="flex items-center justify-between p-3 border-b border-white/20 dark:border-gray-700/50 bg-gray-900/90 backdrop-blur">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="ml-2 text-gray-400 text-sm">
                main.
                {selectedLanguage === 'typescript'
                  ? 'ts'
                  : selectedLanguage === 'python'
                    ? 'py'
                    : 'js'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400 text-xs">
              <CpuChipIcon className="w-4 h-4" />
              <span>Line {code.split('\n').length}</span>
            </div>
          </div>

          <div className="flex-1 bg-gray-900 relative overflow-hidden">
            <div className="absolute inset-0 p-4">
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full h-full bg-transparent text-gray-100 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                placeholder="// 여기에 코드를 작성하세요..."
                style={{
                  fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
                  fontSize: '14px',
                  lineHeight: '1.6',
                }}
              />
            </div>

            {/* Line numbers overlay */}
            <div className="absolute left-0 top-4 bottom-4 w-12 bg-gray-800/50 border-r border-gray-700 pointer-events-none">
              {Array.from({ length: code.split('\n').length }, (_, i) => (
                <div
                  key={i}
                  className="h-6 px-2 text-xs text-gray-500 flex items-center justify-end"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
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

          <div className="flex-1 p-4 bg-white dark:bg-gray-900 font-mono text-sm overflow-auto">
            {selectedTab === 'output' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <BoltIcon className="w-4 h-4" />
                  <span className="font-medium">실행 결과</span>
                </div>
                <div className="pl-6 space-y-1">
                  <div className="text-emerald-600 dark:text-emerald-400">
                    📦 Welcome: AI 코드 캔버스에 오신 것을 환영합니다!
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400">
                    Hello, Developer! 🌟
                  </div>
                  <div className="text-amber-600 dark:text-amber-400">
                    1. JavaScript ⚡
                  </div>
                  <div className="text-amber-600 dark:text-amber-400">
                    2. Python ⚡
                  </div>
                  <div className="text-amber-600 dark:text-amber-400">
                    3. TypeScript ⚡
                  </div>
                  <div className="text-amber-600 dark:text-amber-400">
                    4. React ⚡
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                  <span>실행 완료 (127ms) • 메모리 사용량: 2.4MB</span>
                </div>
              </div>
            )}

            {selectedTab === 'preview' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-lg border border-slate-200/50 dark:border-gray-700/50">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    🌟 Welcome Card
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    AI 코드 캔버스에 오신 것을 환영합니다!
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date().toISOString()}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    👋 Greeting
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Hello, Developer! 🌟
                  </p>
                </div>
              </div>
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
    </div>
  )
}
