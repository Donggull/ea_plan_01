'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Square,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

interface PreviewRendererProps {
  code: string
  language: string
  className?: string
  onExecute?: () => void
}

type ExecutionResult = {
  type: 'success' | 'error' | 'loading'
  output?: string
  error?: string
}

export default function PreviewRenderer({
  code,
  language,
  className = '',
  onExecute,
}: PreviewRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null)
  const [autoPreview, setAutoPreview] = useState(true)

  // 헬퍼 함수들을 먼저 정의
  const renderWebContent = useCallback(() => {
    if (!iframeRef.current) return

    const iframe = iframeRef.current
    const doc = iframe.contentDocument || iframe.contentWindow?.document

    if (!doc) return

    let htmlContent = code

    // HTML이 아닌 경우 기본 HTML 구조로 감싸기
    if (language === 'javascript' || language === 'typescript') {
      htmlContent = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>JavaScript Preview</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 20px;
              background: white;
            }
            #output {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin-top: 16px;
              background: #f8fafc;
              min-height: 100px;
            }
          </style>
        </head>
        <body>
          <div id="output"></div>
          <script>
            // console.log 재정의
            const output = document.getElementById('output');
            const originalLog = console.log;
            console.log = function(...args) {
              originalLog.apply(console, args);
              const div = document.createElement('div');
              div.textContent = args.join(' ');
              div.style.marginBottom = '8px';
              output.appendChild(div);
            };

            try {
              ${code}
            } catch (error) {
              console.log('Error: ' + error.message);
            }
          </script>
        </body>
        </html>
      `
    } else if (
      !htmlContent.includes('<html') &&
      !htmlContent.includes('<body')
    ) {
      htmlContent = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HTML Preview</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 20px;
            }
          </style>
        </head>
        <body>
          ${code}
        </body>
        </html>
      `
    }

    doc.open()
    doc.write(htmlContent)
    doc.close()
  }, [code, language])

  const renderCSSDemo = useCallback(() => {
    if (!iframeRef.current) return

    const iframe = iframeRef.current
    const doc = iframe.contentDocument || iframe.contentWindow?.document

    if (!doc) return

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CSS Preview</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 20px;
          }
          ${code}
        </style>
      </head>
      <body>
        <div class="demo-container">
          <h1>CSS Demo</h1>
          <div class="demo-box">Demo Box</div>
          <p class="demo-text">Demo Text</p>
          <button class="demo-button">Demo Button</button>
        </div>
      </body>
      </html>
    `

    doc.open()
    doc.write(htmlContent)
    doc.close()
  }, [code])

  const executePythonCode = useCallback(async () => {
    // Python 코드 실행 시뮬레이션 (실제 환경에서는 Pyodide 등 사용)
    if (!iframeRef.current) return

    const iframe = iframeRef.current
    const doc = iframe.contentDocument || iframe.contentWindow?.document

    if (!doc) return

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Python Preview</title>
        <style>
          body {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            margin: 20px;
            background: #1e1e1e;
            color: #d4d4d4;
          }
          .python-output {
            border: 1px solid #3c3c3c;
            border-radius: 8px;
            padding: 16px;
            background: #252526;
            white-space: pre-wrap;
            min-height: 200px;
          }
        </style>
      </head>
      <body>
        <div class="python-output">
          Python 코드 실행 결과:
          
          ${code}
          
          [실제 Python 실행 환경에서는 Pyodide나 웹 워커를 사용하여 실행 결과를 표시합니다]
        </div>
      </body>
      </html>
    `

    doc.open()
    doc.write(htmlContent)
    doc.close()
  }, [code])

  const renderPlainText = useCallback(() => {
    if (!iframeRef.current) return

    const iframe = iframeRef.current
    const doc = iframe.contentDocument || iframe.contentWindow?.document

    if (!doc) return

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Preview</title>
        <style>
          body {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            margin: 20px;
            background: #f8fafc;
            color: #374151;
          }
          .code-block {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            background: white;
            white-space: pre-wrap;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <div class="code-block">${code}</div>
      </body>
      </html>
    `

    doc.open()
    doc.write(htmlContent)
    doc.close()
  }, [code])

  // 코드 실행 함수 (useCallback 없이 일반 함수로 정의하여 의존성 문제 해결)
  const executeCode = async () => {
    setIsExecuting(true)
    setExecutionResult({ type: 'loading' })

    try {
      await new Promise(resolve => setTimeout(resolve, 100)) // 실행 시뮬레이션

      if (
        language === 'html' ||
        language === 'javascript' ||
        language === 'typescript'
      ) {
        renderWebContent()
      } else if (language === 'python') {
        await executePythonCode()
      } else if (language === 'css') {
        renderCSSDemo()
      } else {
        renderPlainText()
      }

      setExecutionResult({
        type: 'success',
        output: '코드가 성공적으로 실행되었습니다.',
      })
    } catch (error) {
      setExecutionResult({
        type: 'error',
        error:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
      })
    } finally {
      setIsExecuting(false)
      onExecute?.()
    }
  }

  // 코드 변경 시 자동 미리보기 실행 (디바운스된 버전)
  useEffect(() => {
    if (!autoPreview || !code.trim()) return

    const debounceTimer = setTimeout(() => {
      executeCode()
    }, 500) // 500ms 디바운스

    return () => clearTimeout(debounceTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, autoPreview, language]) // executeCode를 의존성에 포함하면 무한 루프 발생

  const handleReset = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        doc.open()
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head><title>Preview</title></head>
          <body style="font-family: system-ui; padding: 20px; color: #666;">
            <p>코드를 실행하려면 실행 버튼을 클릭하세요.</p>
          </body>
          </html>
        `)
        doc.close()
      }
    }
    setExecutionResult(null)
  }

  const openInNewWindow = () => {
    if (!iframeRef.current) return

    const iframe = iframeRef.current
    const doc = iframe.contentDocument || iframe.contentWindow?.document

    if (doc) {
      const newWindow = window.open('', '_blank', 'width=800,height=600')
      if (newWindow) {
        newWindow.document.write(doc.documentElement.outerHTML)
        newWindow.document.close()
      }
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 컨트롤 패널 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={executeCode}
            disabled={isExecuting}
            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <>
                <Square className="w-3 h-3 mr-1" />
                실행 중...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                실행
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            초기화
          </button>

          <button
            onClick={openInNewWindow}
            className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            새창
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={autoPreview}
              onChange={e => setAutoPreview(e.target.checked)}
              className="mr-1"
            />
            자동 미리보기
          </label>

          {executionResult && (
            <div className="flex items-center text-sm">
              {executionResult.type === 'loading' && (
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              )}
              {executionResult.type === 'success' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {executionResult.type === 'error' && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 실행 결과 또는 오류 메시지 */}
      {executionResult?.type === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
        >
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="text-sm">{executionResult.error}</span>
          </div>
        </motion.div>
      )}

      {/* 미리보기 프레임 */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none bg-white"
          title="Code Preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
          srcDoc={`
            <!DOCTYPE html>
            <html>
            <head><title>Preview</title></head>
            <body style="font-family: system-ui; padding: 20px; color: #666;">
              <p>코드를 실행하려면 실행 버튼을 클릭하세요.</p>
            </body>
            </html>
          `}
        />

        {isExecuting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                코드 실행 중...
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
