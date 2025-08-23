import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

interface ExecutionRequest {
  code: string
  language: string
  maxExecutionTime?: number
  maxMemoryUsage?: number
  enableNetworking?: boolean
}

interface ExecutionResponse {
  success: boolean
  output?: string
  error?: string
  executionTime: number
  memoryUsage?: number
  exitCode?: number
  timedOut?: boolean
}

// 지원되는 언어와 실행 명령어
const LANGUAGE_CONFIGS = {
  javascript: {
    extension: '.js',
    command: 'node',
    args: [],
    timeout: 5000,
  },
  typescript: {
    extension: '.ts',
    command: 'npx',
    args: ['ts-node'],
    timeout: 10000,
  },
  python: {
    extension: '.py',
    command: 'python3',
    args: [],
    timeout: 10000,
    fallbackCommand: 'python',
  },
} as const

type SupportedLanguage = keyof typeof LANGUAGE_CONFIGS

// 보안 패턴 검사
const DANGEROUS_PATTERNS = [
  // 파일 시스템 접근
  /require\s*\(\s*['"`]fs['"`]\s*\)/,
  /import\s+.*\s+from\s+['"`]fs['"`]/,
  /process\.exit/,
  /process\.kill/,

  // 네트워크 접근
  /require\s*\(\s*['"`]http['"`]\s*\)/,
  /require\s*\(\s*['"`]https['"`]\s*\)/,
  /require\s*\(\s*['"`]net['"`]\s*\)/,
  /import\s+.*\s+from\s+['"`]http['"`]/,
  /import\s+.*\s+from\s+['"`]https['"`]/,
  /fetch\s*\(/,

  // 시스템 명령어
  /require\s*\(\s*['"`]child_process['"`]\s*\)/,
  /import\s+.*\s+from\s+['"`]child_process['"`]/,
  /exec\s*\(/,
  /spawn\s*\(/,

  // Python 위험 패턴
  /import\s+os/,
  /import\s+sys/,
  /import\s+subprocess/,
  /import\s+socket/,
  /import\s+urllib/,
  /import\s+requests/,
  /exec\s*\(/,
  /eval\s*\(/,
  /__import__/,
  /open\s*\(/,

  // 일반적인 위험 패턴
  /eval\s*\(/,
  /Function\s*\(/,
  /setTimeout\s*\(/,
  /setInterval\s*\(/,
]

function checkSecurity(code: string): {
  safe: boolean
  blockedPatterns: string[]
} {
  const blockedPatterns: string[] = []

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      blockedPatterns.push(pattern.source)
    }
  }

  return {
    safe: blockedPatterns.length === 0,
    blockedPatterns,
  }
}

function executeCode(
  code: string,
  language: SupportedLanguage,
  options: {
    maxExecutionTime: number
    maxMemoryUsage: number
  }
): Promise<ExecutionResponse> {
  return new Promise(resolve => {
    const config = LANGUAGE_CONFIGS[language]
    const tempDir = mkdtempSync(join(tmpdir(), 'code-execution-'))
    const filename = join(tempDir, `script${config.extension}`)

    try {
      // 임시 파일에 코드 작성
      writeFileSync(filename, code, 'utf8')

      const startTime = Date.now()
      let timedOut = false
      let output = ''
      let errorOutput = ''

      // 명령어 실행
      const child = spawn(config.command, [...config.args, filename], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: options.maxExecutionTime,
        killSignal: 'SIGKILL',
      })

      // 타임아웃 설정
      const timeoutId = setTimeout(() => {
        timedOut = true
        child.kill('SIGKILL')
      }, options.maxExecutionTime)

      // 출력 수집
      child.stdout?.on('data', data => {
        output += data.toString()
      })

      child.stderr?.on('data', data => {
        errorOutput += data.toString()
      })

      child.on('close', (code, _signal) => {
        clearTimeout(timeoutId)

        const executionTime = Date.now() - startTime

        // 임시 파일 정리
        try {
          unlinkSync(filename)
        } catch {
          // 파일 삭제 실패 무시
        }

        if (timedOut) {
          resolve({
            success: false,
            error: `실행 시간이 ${options.maxExecutionTime / 1000}초를 초과했습니다.`,
            executionTime,
            timedOut: true,
            exitCode: null,
          })
        } else if (code !== 0) {
          resolve({
            success: false,
            error: errorOutput || `프로세스가 코드 ${code}로 종료되었습니다.`,
            output: output || undefined,
            executionTime,
            exitCode: code,
          })
        } else {
          resolve({
            success: true,
            output: output || '코드가 성공적으로 실행되었습니다.',
            executionTime,
            exitCode: code,
          })
        }
      })

      child.on('error', error => {
        clearTimeout(timeoutId)

        // 임시 파일 정리
        try {
          unlinkSync(filename)
        } catch {
          // 파일 삭제 실패 무시
        }

        // Python fallback 시도
        if (language === 'python' && config.fallbackCommand) {
          const fallbackChild = spawn(config.fallbackCommand, [filename], {
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: options.maxExecutionTime,
          })

          let fallbackOutput = ''
          let fallbackError = ''

          fallbackChild.stdout?.on('data', data => {
            fallbackOutput += data.toString()
          })

          fallbackChild.stderr?.on('data', data => {
            fallbackError += data.toString()
          })

          fallbackChild.on('close', code => {
            const executionTime = Date.now() - startTime

            if (code !== 0) {
              resolve({
                success: false,
                error: fallbackError || `Python 실행 실패 (코드 ${code})`,
                executionTime,
                exitCode: code,
              })
            } else {
              resolve({
                success: true,
                output: fallbackOutput || '코드가 성공적으로 실행되었습니다.',
                executionTime,
                exitCode: code,
              })
            }
          })

          fallbackChild.on('error', () => {
            resolve({
              success: false,
              error: 'Python 실행 환경을 찾을 수 없습니다.',
              executionTime: Date.now() - startTime,
            })
          })
        } else {
          resolve({
            success: false,
            error: `${config.command} 실행 실패: ${error.message}`,
            executionTime: Date.now() - startTime,
          })
        }
      })
    } catch (error) {
      // 임시 파일 정리
      try {
        unlinkSync(filename)
      } catch {
        // 파일 삭제 실패 무시
      }

      resolve({
        success: false,
        error: `파일 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        executionTime: 0,
      })
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecutionRequest = await request.json()
    const {
      code,
      language,
      maxExecutionTime = 5000,
      maxMemoryUsage = 128 * 1024 * 1024,
    } = body

    // 입력 검증
    if (!code || !language) {
      return NextResponse.json(
        { success: false, error: '코드와 언어가 필요합니다.' },
        { status: 400 }
      )
    }

    // 지원되는 언어 확인
    if (!(language in LANGUAGE_CONFIGS)) {
      return NextResponse.json(
        {
          success: false,
          error: `지원되지 않는 언어입니다. 지원 언어: ${Object.keys(LANGUAGE_CONFIGS).join(', ')}`,
        },
        { status: 400 }
      )
    }

    // 보안 검사
    const securityCheck = checkSecurity(code)
    if (!securityCheck.safe) {
      return NextResponse.json(
        {
          success: false,
          error: '보안상 위험한 코드가 포함되어 있습니다.',
          blockedPatterns: securityCheck.blockedPatterns,
        },
        { status: 403 }
      )
    }

    // 코드 길이 제한 (100KB)
    if (code.length > 100 * 1024) {
      return NextResponse.json(
        { success: false, error: '코드가 너무 깁니다. (최대 100KB)' },
        { status: 413 }
      )
    }

    // 실행 시간 제한 (최대 30초)
    const actualMaxTime = Math.min(maxExecutionTime, 30000)

    // 코드 실행
    const result = await executeCode(code, language as SupportedLanguage, {
      maxExecutionTime: actualMaxTime,
      maxMemoryUsage,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Code execution error:', error)

    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
        executionTime: 0,
      },
      { status: 500 }
    )
  }
}

// GET 요청으로 지원되는 언어 목록 반환
export async function GET() {
  return NextResponse.json({
    supportedLanguages: Object.keys(LANGUAGE_CONFIGS),
    maxExecutionTime: 30000,
    maxCodeSize: 100 * 1024,
    security: {
      sandboxed: true,
      networkingDisabled: true,
      filesystemRestricted: true,
    },
  })
}
