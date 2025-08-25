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
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploadStatus('uploading')
    setError(null)

    try {
      // 파일 업로드
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      const uploadResponse = await fetch('/api/proposal/upload-rfp', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('파일 업로드에 실패했습니다.')
      }

      const { fileUrl, textContent } = await uploadResponse.json()

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
        }),
      })

      clearInterval(progressInterval)

      if (!analysisResponse.ok) {
        throw new Error('RFP 분석에 실패했습니다.')
      }

      const analysisResult: RFPAnalysisResult = await analysisResponse.json()
      
      setAnalysisProgress(100)
      setUploadStatus('success')
      
      // 분석 완료 후 콜백 호출
      setTimeout(() => {
        onUpload(file, analysisResult)
      }, 1000)

    } catch (err) {
      setUploadStatus('error')
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    }
  }, [onUpload, projectId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/haansofthwp': ['.hwp'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <CloudArrowUpIcon className="w-8 h-8 text-blue-500 animate-pulse" />
      case 'analyzing':
        return <DocumentTextIcon className="w-8 h-8 text-indigo-500 animate-spin" />
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
                RFP 문서가 성공적으로 분석되었습니다. 결과를 확인하고 필요시 수정하세요.
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