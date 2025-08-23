'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {
  ClipboardIcon,
  CheckIcon,
  PlayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface CodeBlockProps {
  code: string
  language: string
  filename?: string
  showLineNumbers?: boolean
  maxHeight?: string
  onExecute?: (code: string, language: string) => void
}

const executableLanguages = [
  'javascript',
  'typescript',
  'python',
  'html',
  'css',
  'json',
  'bash',
  'shell',
]

export default function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = true,
  maxHeight = '400px',
  onExecute,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isDark, setIsDark] = useState(true) // Default to dark theme

  const isExecutable = executableLanguages.includes(language.toLowerCase())

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const handleExecute = () => {
    if (onExecute && isExecutable) {
      onExecute(code, language)
    }
  }

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      bash: 'Bash',
      shell: 'Shell',
      jsx: 'JSX',
      tsx: 'TSX',
      sql: 'SQL',
      yaml: 'YAML',
      yml: 'YAML',
      xml: 'XML',
      php: 'PHP',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      csharp: 'C#',
      go: 'Go',
      rust: 'Rust',
      kotlin: 'Kotlin',
      swift: 'Swift',
    }
    return labels[lang.toLowerCase()] || lang.toUpperCase()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4 rounded-xl overflow-hidden bg-gray-900 dark:bg-gray-950 border border-gray-700 dark:border-gray-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">
            {filename || getLanguageLabel(language)}
          </span>
          {!filename && (
            <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="text-xs px-2 py-1 text-gray-400 hover:text-gray-300 transition-colors"
            title="Toggle theme"
          >
            {isDark ? '🌙' : '☀️'}
          </button>

          {/* Execute Button */}
          {isExecutable && onExecute && (
            <button
              onClick={handleExecute}
              className="flex items-center space-x-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              title="Execute code"
            >
              <PlayIcon className="w-3 h-3" />
              <span>Run</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <ClipboardIcon className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={isDark ? oneDark : oneLight}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#6b7280',
            fontSize: '0.75rem',
          }}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: isDark ? '#111827' : '#f9fafb',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          codeTagProps={{
            style: {
              fontSize: '0.875rem',
              fontFamily:
                '"Fira Code", "JetBrains Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Footer with stats */}
      <div className="px-4 py-2 bg-gray-800 dark:bg-gray-900 border-t border-gray-700 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            {code.split('\n').length} lines • {code.length} characters
          </span>
          {isExecutable && <span className="text-green-400">• Executable</span>}
        </div>
      </div>
    </motion.div>
  )
}
