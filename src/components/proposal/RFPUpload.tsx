'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  InformationCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import FilePreview from './FilePreview'

interface RFPUploadProps {
  onUpload: (
    file: File,
    analysisResult?: RFPAnalysisResult,
    projectContext?: ProjectContext
  ) => void
  projectId: string
}

export interface ProjectContext {
  customPrompt?: string
  guidelines?: {
    type: 'text' | 'file'
    content: string
    fileName?: string
  }[]
  analysisInstructions?: string
}

interface AIModel {
  id: string
  name: string
  description: string
  icon: string
}

export interface RFPAnalysisResult {
  projectTitle: string
  client: string
  deadline: string
  budget: {
    min?: number
    max?: number
    currency: string
  }
  requirements: {
    functional: string[]
    technical: string[]
    design: string[]
  }
  scope: string
  deliverables: string[]
  riskFactors: string[]
  keyPoints: string[]
}

export default function RFPUpload({ onUpload, projectId }: RFPUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'analyzing' | 'success' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [_selectedModel, _setSelectedModel] = useState<string>('gemini')

  // 새로운 상태들 추가
  const [customPrompt, setCustomPrompt] = useState('')
  const [guidelines, setGuidelines] = useState<ProjectContext['guidelines']>([])
  const [analysisInstructions, setAnalysisInstructions] = useState('')
  const [newGuidelineText, setNewGuidelineText] = useState('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // 파일 미리보기 상태
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    type: string
    textContent: string
  } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const _aiModels: AIModel[] = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: '빠른 분석 속도, 비용 효율적',
      icon: '🔮',
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT-4',
      description: '고품질 텍스트 분석, 정확성 높음',
      icon: '🤖',
    },
    {
      id: 'claude',
      name: 'Claude Sonnet',
      description: '도구 연동 지원, 구조화된 분석',
      icon: '🧠',
    },
  ]

  // 지침 관리 함수들
  const addTextGuideline = () => {
    if (newGuidelineText.trim()) {
      setGuidelines(prev => [
        ...(prev || []),
        { type: 'text', content: newGuidelineText.trim() },
      ])
      setNewGuidelineText('')
    }
  }

  const removeGuideline = (index: number) => {
    setGuidelines(prev => prev?.filter((_, i) => i !== index) || [])
  }

  const onGuidelineFileDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const content = e.target?.result as string
        setGuidelines(prev => [
          ...(prev || []),
          { type: 'file', content, fileName: file.name },
        ])
      }
      reader.readAsText(file)
    })
  }, [])

  const {
    getRootProps: getGuidelineRootProps,
    getInputProps: getGuidelineInputProps,
  } = useDropzone({
    onDrop: onGuidelineFileDrop,
    accept: {
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setUploadStatus('uploading')
      setError(null)

      try {
        // 파일 크기 검증
        if (file.size > 50 * 1024 * 1024) {
          throw new Error('파일 크기가 50MB를 초과합니다.')
        }

        // 프로젝트 ID 검증
        if (!projectId || projectId.trim() === '') {
          throw new Error('프로젝트 ID가 유효하지 않습니다.')
        }

        // 파일 업로드
        const formData = new FormData()
        formData.append('file', file)
        formData.append('projectId', projectId)

        console.log('=== RFP Upload Request ===')
        console.log('File info:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        })
        console.log('Project ID:', projectId)
        console.log(
          'FormData entries:',
          Array.from(formData.entries()).map(([key, value]) => [
            key,
            value instanceof File
              ? `File: ${value.name} (${value.size} bytes)`
              : value,
          ])
        )

        console.log('Sending request to /api/proposal/upload-rfp')
        const uploadResponse = await fetch('/api/proposal/upload-rfp', {
          method: 'POST',
          body: formData,
        })

        console.log('=== Upload Response ===')
        console.log('Status:', uploadResponse.status)
        console.log('Status Text:', uploadResponse.statusText)
        console.log(
          'Headers:',
          Object.fromEntries(uploadResponse.headers.entries())
        )

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('Upload error response:', errorText)
          console.error(
            'Upload response headers:',
            Object.fromEntries(uploadResponse.headers.entries())
          )

          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError)
            errorData = {
              error: `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`,
              details: errorText || 'No additional error details available',
            }
          }

          const errorMessage = errorData.error || '파일 업로드에 실패했습니다.'
          const errorDetails = errorData.details
            ? ` (${errorData.details})`
            : ''
          throw new Error(errorMessage + errorDetails)
        }

        const uploadResult = await uploadResponse.json()
        console.log('Upload result:', uploadResult)
        const { textContent } = uploadResult

        // 업로드된 파일 정보 저장 (미리보기용)
        setUploadedFile({
          name: file.name,
          type: file.type,
          textContent,
        })

        // AI 분석 시작
        setUploadStatus('analyzing')

        // 분석 진행률 시뮬레이션
        const progressInterval = setInterval(() => {
          setAnalysisProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + Math.random() * 20
          })
        }, 500)

        const analysisResponse = await fetch('/api/proposal/analyze-rfp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            textContent,
            fileName: file.name,
            projectId,
            aiModel: 'gemini', // AI model is now selected from sidebar
          }),
        })

        clearInterval(progressInterval)

        if (!analysisResponse.ok) {
          const errorText = await analysisResponse.text()
          console.error('Analysis error response:', errorText)
          throw new Error('RFP 분석에 실패했습니다.')
        }

        const analysisResult: RFPAnalysisResult = await analysisResponse.json()
        console.log('Analysis result:', analysisResult)

        setAnalysisProgress(100)
        setUploadStatus('success')

        // 분석 완료 후 콜백 호출 (프로젝트 컨텍스트 포함)
        const projectContext: ProjectContext = {
          customPrompt: customPrompt.trim() || undefined,
          guidelines: guidelines?.length ? guidelines : undefined,
          analysisInstructions: analysisInstructions.trim() || undefined,
        }

        setTimeout(() => {
          onUpload(file, analysisResult, projectContext)
        }, 1000)
      } catch (err) {
        console.error('=== Upload/Analysis Error ===')
        console.error('Error object:', err)
        console.error('Error type:', typeof err)
        console.error(
          'Error name:',
          err instanceof Error ? err.name : 'Unknown'
        )
        console.error(
          'Error message:',
          err instanceof Error ? err.message : String(err)
        )
        console.error(
          'Error stack:',
          err instanceof Error ? err.stack : 'No stack trace'
        )

        setUploadStatus('error')

        let errorMessage = '알 수 없는 오류가 발생했습니다.'
        if (err instanceof Error) {
          if (err.name === 'TypeError' && err.message.includes('fetch')) {
            errorMessage =
              '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
          } else {
            errorMessage = err.message
          }
        }

        setError(errorMessage)
      }
    },
    [onUpload, projectId, customPrompt, guidelines, analysisInstructions]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/haansofthwp': ['.hwp'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <CloudArrowUpIcon className="w-8 h-8 text-blue-500 animate-pulse" />
        )
      case 'analyzing':
        return (
          <DocumentTextIcon className="w-8 h-8 text-indigo-500 animate-spin" />
        )
      case 'success':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
      default:
        return <DocumentTextIcon className="w-8 h-8 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return '파일 업로드 중...'
      case 'analyzing':
        return `RFP 분석 중... (${Math.round(analysisProgress)}%)`
      case 'success':
        return 'RFP 분석 완료!'
      case 'error':
        return '오류가 발생했습니다'
      default:
        return 'RFP 문서를 업로드하세요'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          RFP 문서 업로드 및 프로젝트 설정
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          RFP 문서를 업로드하고 맞춤형 분석을 위한 지침을 설정하세요
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : uploadStatus === 'error'
              ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
              : uploadStatus === 'success'
                ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        } ${uploadStatus === 'uploading' || uploadStatus === 'analyzing' ? 'pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {getStatusText()}
            </p>

            {uploadStatus === 'idle' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isDragActive
                  ? '파일을 여기에 드롭하세요'
                  : '파일을 드래그하거나 클릭하여 선택하세요'}
              </p>
            )}
          </div>

          {uploadStatus === 'analyzing' && (
            <div className="w-full max-w-xs">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>
      </div>

      {uploadStatus === 'success' && uploadedFile && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  분석 완료
                </h4>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  RFP 문서가 성공적으로 분석되었습니다. 결과를 확인하고 필요시
                  수정하세요.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              <span>파일 미리보기</span>
            </button>
          </div>
        </div>
      )}

      {/* 파일 미리보기 모달 */}
      {showPreview && uploadedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            <FilePreview
              fileName={uploadedFile.name}
              fileType={uploadedFile.type}
              textContent={uploadedFile.textContent}
              onClose={() => setShowPreview(false)}
            />
          </div>
        </div>
      )}

      {/* 프로젝트 설정 섹션 - 항상 표시 */}
      <div className="space-y-6">
        {/* 커스텀 프롬프트 입력 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-blue-500" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              커스텀 분석 프롬프트
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            AI가 RFP를 분석할 때 특별히 고려해야 할 사항이나 관점을 입력하세요.
          </p>
          <textarea
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="예: 우리는 스타트업이므로 비용 효율성을 중시하며, 단계적 개발을 선호합니다. 특히 MVP 개발에 집중하고 향후 확장 가능성을 고려해주세요."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* 프로젝트 지침 업로드/입력 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <InformationCircleIcon className="w-5 h-5 text-green-500" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                프로젝트 지침
              </h4>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {showAdvancedOptions ? '간단히' : '고급 설정'}
              </button>
            </div>
          </div>

          {/* 지침 입력 영역 */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newGuidelineText}
                onChange={e => setNewGuidelineText(e.target.value)}
                placeholder="프로젝트 지침을 입력하세요 (예: 반응형 디자인 필수, 접근성 준수)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                onKeyPress={e => e.key === 'Enter' && addTextGuideline()}
              />
              <button
                onClick={addTextGuideline}
                disabled={!newGuidelineText.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            {/* 파일 업로드 영역 */}
            <div
              {...getGuidelineRootProps()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <input {...getGuidelineInputProps()} />
              <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                지침 문서 파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                TXT, MD, PDF, DOC, DOCX 지원 (최대 10MB)
              </p>
            </div>
          </div>

          {/* 등록된 지침 목록 */}
          {guidelines && guidelines.length > 0 && (
            <div className="mt-4 space-y-2">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                등록된 지침 ({guidelines.length}개)
              </h5>
              {guidelines.map((guideline, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    {guideline.type === 'file' ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {guideline.fileName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {guideline.content.length > 100
                            ? `${guideline.content.slice(0, 100)}...`
                            : guideline.content}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {guideline.content}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeGuideline(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 고급 설정 */}
        {showAdvancedOptions && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              분석 세부 지침
            </h4>
            <textarea
              value={analysisInstructions}
              onChange={e => setAnalysisInstructions(e.target.value)}
              placeholder="AI가 분석 과정에서 따라야 할 세부 지침을 입력하세요..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        )}

        {/* 안내 텍스트 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• AI가 자동으로 요구사항, 예산, 일정 등을 추출합니다</p>
          <p>• 프로젝트별 지침은 모든 분석 단계에서 참조됩니다</p>
          <p>• 문서로 업로드한 지침은 자동으로 텍스트로 변환됩니다</p>
          <p>• 개인정보가 포함된 문서는 업로드하지 마세요</p>
        </div>
      </div>
    </div>
  )
}
