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
  Clock,
  Monitor,
  Shield,
} from 'lucide-react'

interface CodeRunnerProps {
  code: string
  language: string
  className?: string
  onExecute?: (result: ExecutionResult) => void
  enableExternalLibs?: boolean
  maxExecutionTime?: number
}

export interface ExecutionResult {
  type: 'success' | 'error' | 'timeout' | 'loading'
  output?: string
  error?: string
  executionTime?: number
  memoryUsage?: number
  consoleOutput?: ConsoleMessage[]
  stackTrace?: string
}

interface ConsoleMessage {
  type: 'log' | 'warn' | 'error' | 'info'
  message: string
  timestamp: number
}

interface SecurityCheck {
  passed: boolean
  blockedFeatures?: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

// 보안 위험 패턴 정의
const SECURITY_PATTERNS = {
  high: [
    /eval\s*\(/,
    /Function\s*\(/,
    /document\.write/,
    /innerHTML\s*=/,
    /outerHTML\s*=/,
    /window\.open/,
    /location\s*=/,
    /\.prototype\./,
  ],
  medium: [
    /fetch\s*\(/,
    /XMLHttpRequest/,
    /localStorage/,
    /sessionStorage/,
    /cookie/i,
    /navigator\./,
  ],
  low: [/console\./, /alert\s*\(/, /confirm\s*\(/, /prompt\s*\(/],
}

export default function CodeRunner({
  code,
  language,
  className = '',
  onExecute,
  enableExternalLibs: _enableExternalLibs = false,
  maxExecutionTime = 5000,
}: CodeRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null)
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([])
  const [securityCheck, setSecurityCheck] = useState<SecurityCheck | null>(null)
  const [pyodideReady, setPyodideReady] = useState(false)
  const [executionStartTime, setExecutionStartTime] = useState<number>(0)

  // Pyodide 인스턴스 참조 (타입 안전성을 위한 인터페이스 정의)
  interface PyodideInstance {
    runPython: (code: string) => Promise<unknown>
    globals: {
      get: (name: string) => unknown
    }
  }
  const pyodideRef = useRef<PyodideInstance | null>(null)

  // 보안 검사 함수
  const performSecurityCheck = useCallback((code: string): SecurityCheck => {
    const blockedFeatures: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' = 'low'

    // 고위험 패턴 검사
    for (const pattern of SECURITY_PATTERNS.high) {
      if (pattern.test(code)) {
        blockedFeatures.push(`High risk: ${pattern.source}`)
        riskLevel = 'high'
      }
    }

    // 중간 위험 패턴 검사
    if (riskLevel !== 'high') {
      for (const pattern of SECURITY_PATTERNS.medium) {
        if (pattern.test(code)) {
          blockedFeatures.push(`Medium risk: ${pattern.source}`)
          riskLevel = 'medium'
        }
      }
    }

    // 낮은 위험 패턴 검사
    if (riskLevel === 'low') {
      for (const pattern of SECURITY_PATTERNS.low) {
        if (pattern.test(code)) {
          blockedFeatures.push(`Low risk: ${pattern.source}`)
        }
      }
    }

    return {
      passed: riskLevel !== 'high',
      blockedFeatures: blockedFeatures.length > 0 ? blockedFeatures : undefined,
      riskLevel,
    }
  }, [])

  // Pyodide 초기화
  useEffect(() => {
    if (language === 'python' && !pyodideReady) {
      const loadPyodide = async () => {
        try {
          // Pyodide CDN에서 로드
          if (!window.pyodide) {
            const script = document.createElement('script')
            script.src =
              'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
            script.onload = async () => {
              try {
                // @ts-expect-error - Pyodide global function not typed
                const pyodide = await loadPyodide({
                  indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
                })
                pyodideRef.current = pyodide as PyodideInstance
                setPyodideReady(true)
              } catch (error) {
                console.error('Pyodide 초기화 실패:', error)
              }
            }
            document.head.appendChild(script)
          }
        } catch (error) {
          console.error('Pyodide 로드 실패:', error)
        }
      }

      loadPyodide()
    }
  }, [language, pyodideReady])

  // 콘솔 메시지 추가
  const addConsoleMessage = useCallback(
    (type: ConsoleMessage['type'], message: string) => {
      const newMessage: ConsoleMessage = {
        type,
        message,
        timestamp: Date.now(),
      }
      setConsoleMessages(prev => [...prev, newMessage])
    },
    []
  )

  // JavaScript/HTML/CSS 실행
  const executeWebCode = useCallback(async (): Promise<ExecutionResult> => {
    return new Promise(resolve => {
      if (!iframeRef.current) {
        resolve({ type: 'error', error: 'iframe를 찾을 수 없습니다.' })
        return
      }

      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (!doc) {
        resolve({ type: 'error', error: '문서에 접근할 수 없습니다.' })
        return
      }

      let htmlContent = code

      // JavaScript/TypeScript 코드를 HTML로 감싸기
      if (language === 'javascript' || language === 'typescript') {
        htmlContent = `
          <!DOCTYPE html>
          <html lang="ko">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Execution</title>
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
                font-family: 'Monaco', 'Menlo', monospace;
              }
              .console-message {
                margin: 4px 0;
                padding: 2px 0;
              }
              .console-error { color: #ef4444; }
              .console-warn { color: #f59e0b; }
              .console-info { color: #3b82f6; }
              .console-log { color: #374151; }
            </style>
          </head>
          <body>
            <div id="output"></div>
            <script>
              const output = document.getElementById('output');
              const startTime = performance.now();
              
              // 콘솔 메서드 오버라이드
              const originalConsole = {
                log: console.log,
                warn: console.warn,
                error: console.error,
                info: console.info
              };
              
              function createMessage(type, args) {
                const div = document.createElement('div');
                div.className = 'console-message console-' + type;
                div.textContent = args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                return div;
              }
              
              console.log = function(...args) {
                originalConsole.log.apply(console, args);
                output.appendChild(createMessage('log', args));
                parent.postMessage({type: 'console', level: 'log', message: args.join(' ')}, '*');
              };
              
              console.warn = function(...args) {
                originalConsole.warn.apply(console, args);
                output.appendChild(createMessage('warn', args));
                parent.postMessage({type: 'console', level: 'warn', message: args.join(' ')}, '*');
              };
              
              console.error = function(...args) {
                originalConsole.error.apply(console, args);
                output.appendChild(createMessage('error', args));
                parent.postMessage({type: 'console', level: 'error', message: args.join(' ')}, '*');
              };
              
              console.info = function(...args) {
                originalConsole.info.apply(console, args);
                output.appendChild(createMessage('info', args));
                parent.postMessage({type: 'console', level: 'info', message: args.join(' ')}, '*');
              };
              
              // 에러 캐칭
              window.onerror = function(message, source, lineno, colno, error) {
                const errorDiv = createMessage('error', ['Error: ' + message + ' at line ' + lineno]);
                output.appendChild(errorDiv);
                parent.postMessage({
                  type: 'error', 
                  message: message, 
                  source: source, 
                  line: lineno, 
                  column: colno,
                  stack: error ? error.stack : ''
                }, '*');
                return true;
              };
              
              // 사용자 코드 실행
              try {
                ${code}
                
                const endTime = performance.now();
                const executionTime = endTime - startTime;
                
                parent.postMessage({
                  type: 'success',
                  executionTime: executionTime,
                  memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
                }, '*');
              } catch (error) {
                console.error('실행 오류:', error.message);
                parent.postMessage({
                  type: 'error',
                  message: error.message,
                  stack: error.stack
                }, '*');
              }
            </script>
          </body>
          </html>
        `
      } else if (language === 'css') {
        htmlContent = `
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
              <h1 class="demo-heading">CSS Demo</h1>
              <div class="demo-box">Demo Box</div>
              <p class="demo-text">Demo Text</p>
              <button class="demo-button">Demo Button</button>
              <div class="custom-element">Custom Element</div>
            </div>
            <script>
              parent.postMessage({type: 'success', executionTime: 0}, '*');
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
            <script>
              parent.postMessage({type: 'success', executionTime: 0}, '*');
            </script>
          </body>
          </html>
        `
      }

      // iframe에 메시지 리스너 설정
      const handleMessage = (event: MessageEvent) => {
        if (event.source !== iframe.contentWindow) return

        const { type, level, message, executionTime, memoryUsage, stack } =
          event.data

        if (type === 'console') {
          addConsoleMessage(level as ConsoleMessage['type'], message)
        } else if (type === 'success') {
          resolve({
            type: 'success',
            output: '코드가 성공적으로 실행되었습니다.',
            executionTime,
            memoryUsage,
          })
          window.removeEventListener('message', handleMessage)
        } else if (type === 'error') {
          resolve({
            type: 'error',
            error: message,
            stackTrace: stack,
          })
          window.removeEventListener('message', handleMessage)
        }
      }

      window.addEventListener('message', handleMessage)

      // HTML 콘텐츠 로드
      doc.open()
      doc.write(htmlContent)
      doc.close()

      // 타임아웃 설정
      setTimeout(() => {
        window.removeEventListener('message', handleMessage)
        resolve({
          type: 'timeout',
          error: `코드 실행이 ${maxExecutionTime / 1000}초를 초과했습니다.`,
        })
      }, maxExecutionTime)
    })
  }, [code, language, maxExecutionTime, addConsoleMessage])

  // Python 코드 실행
  const executePythonCode = useCallback(async (): Promise<ExecutionResult> => {
    if (!pyodideReady || !pyodideRef.current) {
      return {
        type: 'error',
        error:
          'Python 실행 환경이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.',
      }
    }

    try {
      const pyodide = pyodideRef.current

      // 콘솔 출력 캡처를 위한 Python 코드
      const wrappedCode = `
import sys
from io import StringIO
import traceback
import time

# 표준 출력 캡처
old_stdout = sys.stdout
old_stderr = sys.stderr
stdout_capture = StringIO()
stderr_capture = StringIO()
sys.stdout = stdout_capture
sys.stderr = stderr_capture

start_time = time.time()

try:
${code
  .split('\n')
  .map(line => '    ' + line)
  .join('\n')}
    
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    traceback.print_exc()

finally:
    end_time = time.time()
    execution_time = (end_time - start_time) * 1000
    
    # 출력 복원
    sys.stdout = old_stdout
    sys.stderr = old_stderr
    
    # 결과 반환
    stdout_result = stdout_capture.getvalue()
    stderr_result = stderr_capture.getvalue()
`

      await pyodide.runPython(wrappedCode)
      const stdout = pyodide.globals.get('stdout_result') as string
      const stderr = pyodide.globals.get('stderr_result') as string
      const executionTime = pyodide.globals.get('execution_time') as number

      if (stderr) {
        return {
          type: 'error',
          error: stderr,
          executionTime,
        }
      }

      return {
        type: 'success',
        output: stdout || '코드가 성공적으로 실행되었습니다.',
        executionTime,
      }
    } catch (error) {
      return {
        type: 'error',
        error:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
      }
    }
  }, [code, pyodideReady])

  // 코드 실행 메인 함수
  const executeCode = async () => {
    setIsExecuting(true)
    setConsoleMessages([])
    setExecutionStartTime(Date.now())

    // 보안 검사
    const security = performSecurityCheck(code)
    setSecurityCheck(security)

    if (!security.passed) {
      const result: ExecutionResult = {
        type: 'error',
        error:
          '보안 검사를 통과하지 못했습니다. 위험한 코드가 포함되어 있습니다.',
      }
      setExecutionResult(result)
      setIsExecuting(false)
      onExecute?.(result)
      return
    }

    setExecutionResult({ type: 'loading' })

    try {
      let result: ExecutionResult

      if (language === 'python') {
        result = await executePythonCode()
      } else {
        result = await executeWebCode()
      }

      // 실행 시간 계산
      const totalExecutionTime = Date.now() - executionStartTime
      result.executionTime = result.executionTime || totalExecutionTime

      setExecutionResult(result)
      onExecute?.(result)
    } catch (error) {
      const result: ExecutionResult = {
        type: 'error',
        error:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
        executionTime: Date.now() - executionStartTime,
      }
      setExecutionResult(result)
      onExecute?.(result)
    } finally {
      setIsExecuting(false)
    }
  }

  // 리셋 함수
  const handleReset = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        doc.open()
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head><title>Code Runner</title></head>
          <body style="font-family: system-ui; padding: 20px; color: #666;">
            <p>코드를 실행하려면 실행 버튼을 클릭하세요.</p>
          </body>
          </html>
        `)
        doc.close()
      }
    }
    setExecutionResult(null)
    setConsoleMessages([])
    setSecurityCheck(null)
  }

  // 새 창에서 열기
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
            disabled={isExecuting || (language === 'python' && !pyodideReady)}
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
                {language === 'python' && !pyodideReady
                  ? 'Python 로드 중...'
                  : '실행'}
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

        <div className="flex items-center space-x-4">
          {/* 보안 상태 */}
          {securityCheck && (
            <div className="flex items-center text-sm">
              <Shield
                className={`w-4 h-4 mr-1 ${
                  securityCheck.riskLevel === 'low'
                    ? 'text-green-500'
                    : securityCheck.riskLevel === 'medium'
                      ? 'text-yellow-500'
                      : 'text-red-500'
                }`}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {securityCheck.riskLevel === 'low'
                  ? '안전'
                  : securityCheck.riskLevel === 'medium'
                    ? '주의'
                    : '위험'}
              </span>
            </div>
          )}

          {/* 실행 시간 */}
          {executionResult?.executionTime && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              {Math.round(executionResult.executionTime)}ms
            </div>
          )}

          {/* 메모리 사용량 */}
          {executionResult?.memoryUsage && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Monitor className="w-4 h-4 mr-1" />
              {Math.round(executionResult.memoryUsage / 1024 / 1024)}MB
            </div>
          )}

          {/* 실행 상태 */}
          {executionResult && (
            <div className="flex items-center text-sm">
              {executionResult.type === 'loading' && (
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              )}
              {executionResult.type === 'success' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {(executionResult.type === 'error' ||
                executionResult.type === 'timeout') && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {executionResult?.type === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
        >
          <div className="flex items-start text-red-700 dark:text-red-400">
            <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">{executionResult.error}</div>
              {executionResult.stackTrace && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">
                    Stack Trace
                  </summary>
                  <pre className="mt-1 text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-x-auto">
                    {executionResult.stackTrace}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 콘솔 출력 */}
      {consoleMessages.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
          <div className="p-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              콘솔 출력
            </div>
            <div className="font-mono text-xs space-y-1">
              {consoleMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`${
                    msg.type === 'error'
                      ? 'text-red-600'
                      : msg.type === 'warn'
                        ? 'text-yellow-600'
                        : msg.type === 'info'
                          ? 'text-blue-600'
                          : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-gray-400">[{msg.type}]</span>{' '}
                  {msg.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 실행 결과 프레임 */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none bg-white"
          title="Code Execution Result"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          srcDoc={`
            <!DOCTYPE html>
            <html>
            <head><title>Code Runner</title></head>
            <body style="font-family: system-ui; padding: 20px; color: #666;">
              <p>코드를 실행하려면 실행 버튼을 클릭하세요.</p>
            </body>
            </html>
          `}
        />

        {/* 로딩 오버레이 */}
        {isExecuting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'python'
                  ? 'Python 코드 실행 중...'
                  : '코드 실행 중...'}
              </p>
              {language === 'python' && !pyodideReady && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Python 환경 로드 중... (최초 실행시 시간이 걸릴 수 있습니다)
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
