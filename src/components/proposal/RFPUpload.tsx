'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface RFPUploadProps {
  onUpload: (file: File, analysisResult?: RFPAnalysisResult) => void
  projectId: string
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
  const [selectedModel, setSelectedModel] = useState<string>('gemini')

  const aiModels: AIModel[] = [
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

        // 파일 업로드
        const formData = new FormData()
        formData.append('file', file)
        formData.append('projectId', projectId)

        console.log(
          'Uploading file:',
          file.name,
          'Size:',
          file.size,
          'Type:',
          file.type
        )

        const uploadResponse = await fetch('/api/proposal/upload-rfp', {
          method: 'POST',
          body: formData,
        })

        console.log('Upload response status:', uploadResponse.status)

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('Upload error response:', errorText)

          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = {
              error: `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`,
            }
          }

          throw new Error(errorData.error || '파일 업로드에 실패했습니다.')
        }

        const uploadResult = await uploadResponse.json()
        console.log('Upload result:', uploadResult)
        const { textContent } = uploadResult

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
            aiModel: selectedModel,
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

        // 분석 완료 후 콜백 호출
        setTimeout(() => {
          onUpload(file, analysisResult)
        }, 1000)
      } catch (err) {
        console.error('Upload/Analysis error:', err)
        setUploadStatus('error')
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
        )
      }
    },
    [onUpload, projectId, selectedModel]
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
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          RFP 문서 업로드 및 분석
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          PDF, DOC, DOCX, HWP, TXT 파일을 지원합니다 (최대 50MB)
        </p>
      </div>

      {/* AI Model Selection */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          분석에 사용할 AI 모델을 선택하세요
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {aiModels.map(model => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              disabled={
                uploadStatus === 'uploading' || uploadStatus === 'analyzing'
              }
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedModel === model.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              } ${
                uploadStatus === 'uploading' || uploadStatus === 'analyzing'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{model.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {model.name}
                </span>
                {selectedModel === model.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {model.description}
              </p>
            </button>
          ))}
        </div>
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

      {uploadStatus === 'success' && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
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
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• AI가 자동으로 요구사항, 예산, 일정 등을 추출합니다</p>
        <p>• 분석 결과는 검토하고 수정할 수 있습니다</p>
        <p>• 개인정보가 포함된 문서는 업로드하지 마세요</p>
      </div>
    </div>
  )
}
