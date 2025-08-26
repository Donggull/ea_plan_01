'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlayIcon,
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  PlusIcon,
  MinusIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  theme?: 'light' | 'dark'
  onExecute?: (code: string, language: string) => void
  readOnly?: boolean
  className?: string
}

export interface EditorSettings {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
  autoSave: boolean
  formatOnSave: boolean
  theme: 'light' | 'dark'
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  autoSave: true,
  formatOnSave: true,
  theme: 'dark',
}

const LANGUAGE_CONFIGS = {
  javascript: {
    defaultValue: `// 🚀 JavaScript 코드를 작성해보세요!
function greet(name) {
  return \`Hello, \${name}! 🌟\`;
}

// 실행 예시
console.log(greet('Developer'));`,
    fileExtension: 'js',
  },
  typescript: {
    defaultValue: `// 🚀 TypeScript 코드를 작성해보세요!
interface User {
  name: string;
  age: number;
  email?: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old. 🌟\`;
}

// 실행 예시
const user: User = { name: 'Developer', age: 25 };
console.log(greet(user));`,
    fileExtension: 'ts',
  },
  python: {
    defaultValue: `# 🚀 Python 코드를 작성해보세요!
def greet(name):
    return f"Hello, {name}! 🌟"

def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# 실행 예시
print(greet('Developer'))
print(f"피보나치 수열 10번째: {calculate_fibonacci(10)}")`,
    fileExtension: 'py',
  },
  html: {
    defaultValue: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 코드 캔버스 🚀</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { text-align: center; margin-bottom: 30px; }
        .card {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 AI 코드 캔버스에 오신 것을 환영합니다!</h1>
        <div class="card">
            <h3>✨ 실시간 코드 편집</h3>
            <p>Monaco Editor로 VS Code와 같은 편집 경험을 제공합니다.</p>
        </div>
        <div class="card">
            <h3>🎨 다양한 언어 지원</h3>
            <p>JavaScript, TypeScript, Python, HTML/CSS, React를 지원합니다.</p>
        </div>
    </div>
</body>
</html>`,
    fileExtension: 'html',
  },
  css: {
    defaultValue: `/* 🎨 CSS 스타일을 작성해보세요! */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
}

/* 글래스모피즘 카드 */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* 그라디언트 버튼 */
.gradient-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.gradient-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}`,
    fileExtension: 'css',
  },
  jsx: {
    defaultValue: `// 🚀 React JSX 컴포넌트를 작성해보세요!
import React, { useState } from 'react';

function WelcomeCard({ title, description }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={\`welcome-card \${isHovered ? 'hovered' : ''}\`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '15px',
        color: 'white',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered ? '0 10px 30px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.1)'
      }}
    >
      <h2 style={{ margin: '0 0 10px 0' }}>🎉 {title}</h2>
      <p style={{ margin: 0, opacity: 0.9 }}>{description}</p>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '40px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        🚀 AI 코드 캔버스 React 컴포넌트
      </h1>
      
      <WelcomeCard 
        title="Monaco Editor"
        description="VS Code와 같은 강력한 코드 편집 환경을 제공합니다!"
      />
      
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          클릭 카운트: {count} 🎯
        </button>
      </div>
    </div>
  );
}

export default App;`,
    fileExtension: 'jsx',
  },
}

export default function CodeEditor({
  value,
  onChange,
  language,
  theme = 'dark',
  onExecute,
  readOnly = false,
  className = '',
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const [settings, setSettings] = useState<EditorSettings>({
    ...DEFAULT_SETTINGS,
    theme,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [isFormatting, setIsFormatting] = useState(false)

  // 에디터가 마운트될 때 호출
  const handleEditorDidMount = useCallback(
    (editor: editor.IStandaloneCodeEditor) => {
      editorRef.current = editor

      // 키보드 단축키 설정
      editor.addCommand(
        // Ctrl+Enter 또는 Cmd+Enter로 코드 실행
        editor.getModel()?.getLanguageId() === 'python'
          ? window.navigator.platform.includes('Mac')
            ? 2080
            : 2081 // Ctrl+Enter
          : window.navigator.platform.includes('Mac')
            ? 2080
            : 2081,
        () => {
          if (onExecute) {
            onExecute(editor.getValue(), language)
          }
        }
      )

      // 자동 저장 설정
      if (settings.autoSave) {
        editor.onDidChangeModelContent(() => {
          const currentValue = editor.getValue()
          if (currentValue !== value) {
            onChange(currentValue)
          }
        })
      }
    },
    [language, onExecute, onChange, value, settings.autoSave]
  )

  // 코드 포맷팅
  const formatCode = useCallback(async () => {
    if (!editorRef.current) return

    setIsFormatting(true)
    try {
      await editorRef.current.trigger(
        'keyboard',
        'editor.action.formatDocument',
        {}
      )
    } catch (error) {
      console.warn('Code formatting failed:', error)
    } finally {
      setIsFormatting(false)
    }
  }, [])

  // 폰트 크기 조절
  const adjustFontSize = useCallback((delta: number) => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(8, Math.min(32, prev.fontSize + delta)),
    }))
  }, [])

  // 테마 토글
  const toggleTheme = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }))
  }, [])

  // 설정 저장
  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem('monaco-editor-settings', JSON.stringify(settings))
      setShowSettings(false)
    } catch (error) {
      console.warn('Failed to save editor settings:', error)
    }
  }, [settings])

  // 설정 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('monaco-editor-settings')
      if (saved) {
        const parsedSettings = JSON.parse(saved)
        setSettings(prev => ({ ...prev, ...parsedSettings }))
      }
    } catch (error) {
      console.warn('Failed to load editor settings:', error)
    }
  }, [])

  return (
    <div className={`relative h-full flex flex-col min-h-0 ${className}`}>
      {/* 에디터 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-white/20 dark:border-gray-700/50 bg-gray-900/90 backdrop-blur">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-2 text-gray-400 text-sm">
            main.
            {LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS]
              ?.fileExtension || 'js'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* 실행 버튼 */}
          {onExecute && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onExecute(value, language)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              title="Ctrl+Enter로 실행"
            >
              <PlayIcon className="w-4 h-4" />
              <span>실행</span>
            </motion.button>
          )}

          {/* 포맷팅 버튼 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={formatCode}
            disabled={isFormatting}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            title="코드 포맷팅"
          >
            {isFormatting ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <DocumentTextIcon className="w-4 h-4" />
            )}
          </motion.button>

          {/* 폰트 크기 조절 */}
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => adjustFontSize(-1)}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
              title="폰트 크기 줄이기"
            >
              <MinusIcon className="w-3 h-3" />
            </motion.button>
            <span className="text-xs text-gray-400 w-6 text-center">
              {settings.fontSize}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => adjustFontSize(1)}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
              title="폰트 크기 키우기"
            >
              <PlusIcon className="w-3 h-3" />
            </motion.button>
          </div>

          {/* 테마 토글 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            title="테마 변경"
          >
            {settings.theme === 'dark' ? (
              <SunIcon className="w-4 h-4" />
            ) : (
              <MoonIcon className="w-4 h-4" />
            )}
          </motion.button>

          {/* 설정 버튼 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            title="에디터 설정"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={newValue => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          theme={settings.theme === 'dark' ? 'vs-dark' : 'vs'}
          options={{
            fontSize: settings.fontSize,
            tabSize: settings.tabSize,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            minimap: { enabled: settings.minimap },
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            readOnly,
            automaticLayout: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            fontFamily:
              "'Fira Code', 'Monaco', 'Menlo', 'Courier New', monospace",
            fontLigatures: true,
            renderLineHighlight: 'all',
            scrollBeyondLastLine: false,
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            formatOnPaste: settings.formatOnSave,
            formatOnType: true,
          }}
        />
      </div>

      {/* 설정 패널 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800/95 backdrop-blur-xl border-l border-gray-700 p-4 overflow-y-auto z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">에디터 설정</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettings(false)}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="space-y-6">
              {/* 폰트 설정 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  폰트 크기
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={settings.fontSize}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        fontSize: Number(e.target.value),
                      }))
                    }
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-400 w-8">
                    {settings.fontSize}px
                  </span>
                </div>
              </div>

              {/* 탭 크기 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  탭 크기
                </label>
                <select
                  value={settings.tabSize}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      tabSize: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>

              {/* 토글 설정들 */}
              <div className="space-y-3">
                {[
                  { key: 'wordWrap', label: '단어 줄바꿈' },
                  { key: 'minimap', label: '미니맵' },
                  { key: 'lineNumbers', label: '줄 번호' },
                  { key: 'autoSave', label: '자동 저장' },
                  { key: 'formatOnSave', label: '저장 시 포맷팅' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={settings[key as keyof EditorSettings] as boolean}
                      onChange={e =>
                        setSettings(prev => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
                ))}
              </div>

              {/* 저장 버튼 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveSettings}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
                <span>설정 저장</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 언어별 기본 템플릿 가져오기
export function getLanguageTemplate(language: string): string {
  return (
    LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS]?.defaultValue ||
    ''
  )
}

// 언어별 파일 확장자 가져오기
export function getLanguageExtension(language: string): string {
  return (
    LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS]
      ?.fileExtension || 'js'
  )
}
