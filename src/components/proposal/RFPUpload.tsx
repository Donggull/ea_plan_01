'use client'

import { useState, useCallback, useEffect } from 'react'
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
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import FilePreview from './FilePreview'
import mcpManagementService, { type MCPTool } from '@/lib/services/mcpManagementService'
import { useAuth } from '@/contexts/AuthContext'

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
  const { userProfile } = useAuth()
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'ready' | 'analyzing' | 'success' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedModel, setSelectedModel] = useState<string>('gemini')
  const [enableMCP, setEnableMCP] = useState<boolean>(true)
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([])
  const [availableMCPTools, setAvailableMCPTools] = useState<MCPTool[]>([])
  const [mcpLoading, setMcpLoading] = useState(true)

  // 프로젝트 설정
  const [customPrompt, setCustomPrompt] = useState('')
  const [guidelines, setGuidelines] = useState<ProjectContext['guidelines']>([])
  const [analysisInstructions, setAnalysisInstructions] = useState('')
  const [newGuidelineText, setNewGuidelineText] = useState('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // 다중 파일 업로드 지원
  const [uploadedFiles, setUploadedFiles] = useState<
    {
      id: string
      name: string
      type: string
      size: number
      textContent: string
      uploadedAt: Date
    }[]
  >([])
  const [showPreview, setShowPreview] = useState(false)
  const [previewFile, setPreviewFile] = useState<{
    name: string
    type: string
    textContent: string
  } | null>(null)

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
      description: 'MCP 도구 연동, 고품질 분석',
      icon: '🧠',
    },
  ]

  // Load available MCP tools
  useEffect(() => {
    const loadMCPTools = async () => {
      try {
        const tools = await mcpManagementService.getActiveTools()
        setAvailableMCPTools(tools)
        
        // Set default selected tools (first 2 active tools)
        const defaultTools = tools.slice(0, 2).map(tool => tool.id)
        setSelectedMCPTools(defaultTools)
        
        // Load user's saved MCP settings if available
        if (userProfile?.id) {
          const userSettings = await mcpManagementService.getUserSettings(
            userProfile.id, 
            projectId
          )
          if (userSettings && userSettings.enabled_tools.length > 0) {
            setSelectedMCPTools(userSettings.enabled_tools)
            setEnableMCP(userSettings.enabled_tools.length > 0)
          }
        }
      } catch (error) {
        console.error('Failed to load MCP tools:', error)
      } finally {
        setMcpLoading(false)
      }
    }
    
    loadMCPTools()
  }, [userProfile?.id, projectId])

  // MCP 도구 관리 함수들
  const handleMCPToolToggle = async (toolId: string) => {
    const newSelectedTools = selectedMCPTools.includes(toolId)
      ? selectedMCPTools.filter(id => id !== toolId)
      : [...selectedMCPTools, toolId]
    
    setSelectedMCPTools(newSelectedTools)
    
    // Save user's MCP settings
    if (userProfile?.id) {
      try {
        await mcpManagementService.updateUserSettings(userProfile.id, {
          projectId,
          enabledTools: newSelectedTools,
        })
      } catch (error) {
        console.error('Failed to save MCP settings:', error)
      }
    }
  }

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

      setUploadStatus('uploading')
      setError(null)

      try {
        // 프로젝트 ID 검증
        if (!projectId || projectId.trim() === '') {
          throw new Error('프로젝트 ID가 유효하지 않습니다.')
        }

        // 각 파일을 순차적으로 업로드
        for (const file of acceptedFiles) {
          // 파일 크기 검증
          if (file.size > 50 * 1024 * 1024) {
            throw new Error(`파일 "${file.name}"의 크기가 50MB를 초과합니다.`)
          }

          // 파일 업로드
          const formData = new FormData()
          formData.append('file', file)
          formData.append('projectId', projectId)

          const uploadResponse = await fetch('/api/proposal/upload-rfp', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text()
            let errorData
            try {
              errorData = JSON.parse(errorText)
            } catch (_parseError) {
              errorData = {
                error: `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`,
                details: errorText || 'No additional error details available',
              }
            }

            const errorMessage =
              errorData.error || `파일 "${file.name}" 업로드에 실패했습니다.`
            const errorDetails = errorData.details
              ? ` (${errorData.details})`
              : ''
            throw new Error(errorMessage + errorDetails)
          }

          const uploadResult = await uploadResponse.json()
          const { textContent } = uploadResult

          // 업로드된 파일 정보 저장
          const uploadedFile = {
            id: `${Date.now()}-${Math.random()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            textContent,
            uploadedAt: new Date(),
          }

          setUploadedFiles(prev => [...prev, uploadedFile])
        }

        // 모든 파일 업로드 완료
        setUploadStatus('ready')
        setError(null)
      } catch (err) {
        console.error('Upload error:', err)
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
    [projectId]
  )

  // 수동 분석 시작 함수
  const handleStartAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      setError('분석할 문서를 먼저 업로드해주세요.')
      return
    }

    setUploadStatus('analyzing')
    setError(null)
    setAnalysisProgress(0)

    try {
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

      // 모든 파일의 텍스트 내용 합치기
      const combinedTextContent = uploadedFiles
        .map(file => `=== ${file.name} ===\n${file.textContent}`)
        .join('\n\n')

      const analysisResponse = await fetch('/api/proposal/analyze-rfp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textContent: combinedTextContent,
          fileName: uploadedFiles.map(f => f.name).join(', '),
          projectId,
          aiModel: selectedModel,
          customPrompt: customPrompt.trim() || undefined,
          guidelines: guidelines?.length ? guidelines : undefined,
          analysisInstructions: analysisInstructions.trim() || undefined,
          mcpSettings:
            selectedModel === 'claude'
              ? {
                  enabled: enableMCP,
                  selectedTools: selectedMCPTools,
                }
              : undefined,
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
        // 첫 번째 파일을 대표로 전달하되 분석 결과에는 모든 파일의 내용이 포함됨
        onUpload(
          new File([combinedTextContent], `${uploadedFiles.length}개 문서`, {
            type: 'text/plain',
          }),
          analysisResult,
          projectContext
        )
      }, 1000)
    } catch (err) {
      console.error('Analysis error:', err)
      setUploadStatus('error')
      setError(
        err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.'
      )
    }
  }

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
    multiple: true, // 다중 파일 업로드 허용
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  // 파일 삭제 함수
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    if (uploadedFiles.length <= 1) {
      setUploadStatus('idle')
    }
  }

  // 파일 미리보기 함수
  const previewFileContent = (file: {
    name: string
    type: string
    textContent: string
  }) => {
    setPreviewFile(file)
    setShowPreview(true)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('text')) return '📃'
    if (fileType.includes('hwp')) return '📋'
    return '📄'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return '파일 업로드 중...'
      case 'ready':
        return `${uploadedFiles.length}개 파일 업로드 완료 - 분석 준비됨`
      case 'analyzing':
        return 'RFP 분석 진행 중...'
      case 'success':
        return '분석 완료'
      case 'error':
        return '오류 발생'
      default:
        return '파일을 업로드하세요'
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <CloudArrowUpIcon className="w-12 h-12 text-blue-500 animate-pulse" />
        )
      case 'ready':
        return <CheckCircleIcon className="w-12 h-12 text-green-500" />
      case 'analyzing':
        return <SparklesIcon className="w-12 h-12 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircleIcon className="w-12 h-12 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
      default:
        return <DocumentTextIcon className="w-12 h-12 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          RFP 문서 업로드 및 프로젝트 설정
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          RFP 문서를 업로드하고 맞춤형 분석을 위한 지침을 설정하세요 (여러 파일
          업로드 지원)
        </p>
      </div>

      {/* 파일 업로드 영역 */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : uploadStatus === 'error'
              ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
              : uploadStatus === 'success'
                ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                : uploadStatus === 'ready'
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
                  : '파일을 드래그하거나 클릭하여 선택하세요 (여러 파일 업로드 가능)'}
              </p>
            )}

            {uploadStatus === 'ready' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                추가 파일을 업로드하거나 아래에서 분석을 시작하세요
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {analysisProgress.toFixed(0)}% 완료
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg max-w-md">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* 업로드된 파일 목록 */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              업로드된 문서 ({uploadedFiles.length}개)
            </h4>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              총 크기:{' '}
              {formatFileSize(
                uploadedFiles.reduce((acc, file) => acc + file.size, 0)
              )}
            </div>
          </div>

          <div className="space-y-2">
            {uploadedFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} •{' '}
                      {file.uploadedAt.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => previewFileContent(file)}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    title="미리보기"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    title="삭제"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 모델 선택 */}
      {(uploadedFiles.length > 0 || showAdvancedOptions) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-purple-500" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              AI 모델 선택
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiModels.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedModel === model.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-2">{model.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {model.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {model.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Claude MCP 도구 선택 */}
      {(uploadedFiles.length > 0 || showAdvancedOptions) &&
        selectedModel === 'claude' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-indigo-500" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                MCP 도구 설정
              </h4>
              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 text-xs rounded-full font-medium">
                Claude 전용
              </span>
            </div>

            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={enableMCP}
                  onChange={e => setEnableMCP(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  MCP 도구 사용 활성화
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Claude가 외부 도구와 데이터에 접근하여 더 정확하고 포괄적인
                분석을 수행합니다
              </p>
            </div>

            {enableMCP && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  사용할 도구 선택
                </label>
                {mcpLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      도구를 불러오는 중...
                    </div>
                  </div>
                ) : availableMCPTools.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg">
                    사용 가능한 MCP 도구가 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableMCPTools.map(tool => (
                      <label
                        key={tool.id}
                        className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMCPTools.includes(tool.id)}
                          onChange={() => handleMCPToolToggle(tool.id)}
                          className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{tool.provider?.icon || '🔧'}</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {tool.display_name}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {tool.description}
                          </div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                            {tool.provider?.display_name}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {selectedMCPTools.length === 0 && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span className="text-sm text-amber-800 dark:text-amber-300">
                        최소 하나의 도구를 선택해주세요
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      {/* 고급 옵션 토글 */}
      <div className="text-center">
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <InformationCircleIcon className="w-4 h-4" />
          <span>
            {showAdvancedOptions
              ? '고급 옵션 숨기기'
              : '프로젝트 지침 및 고급 옵션 설정'}
          </span>
        </button>
      </div>

      {/* 프로젝트 지침 입력 */}
      {(uploadedFiles.length > 0 || showAdvancedOptions) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DocumentTextIcon className="w-5 h-5 text-green-500" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              프로젝트 지침 및 참고 자료
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            프로젝트와 관련된 추가 지침, 제약사항, 브랜드 가이드라인 등을
            텍스트로 입력하거나 문서로 업로드하세요.
          </p>

          {/* 텍스트 지침 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              텍스트 지침 추가
            </label>
            <div className="flex space-x-2">
              <textarea
                value={newGuidelineText}
                onChange={e => setNewGuidelineText(e.target.value)}
                placeholder="예: 브랜드 컬러는 파란색 계열을 사용해야 하며, 미니멀한 디자인을 선호합니다. 접근성을 고려한 UI/UX 설계가 필요합니다."
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                onClick={addTextGuideline}
                disabled={!newGuidelineText.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 지침 파일 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              지침 문서 업로드
            </label>
            <div
              {...getGuidelineRootProps()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <input {...getGuidelineInputProps()} />
              <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                브랜드 가이드, 요구사항 문서 등을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                PDF, DOC, DOCX, TXT, MD (최대 10MB)
              </p>
            </div>
          </div>

          {/* 저장된 지침 목록 */}
          {guidelines && guidelines.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                저장된 지침 ({guidelines.length}개)
              </label>
              <div className="space-y-2">
                {guidelines.map((guideline, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {guideline.type === 'file' ? '📄 파일' : '📝 텍스트'}
                        </span>
                        {guideline.fileName && (
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {guideline.fileName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {guideline.content.length > 100
                          ? `${guideline.content.substring(0, 100)}...`
                          : guideline.content}
                      </p>
                    </div>
                    <button
                      onClick={() => removeGuideline(index)}
                      className="ml-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 분석 지침 입력 */}
      {(uploadedFiles.length > 0 || showAdvancedOptions) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-purple-500" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              분석 지침
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            AI가 RFP 분석 시 특별히 고려해야 할 관점이나 중점 사항을 입력하세요.
          </p>
          <textarea
            value={analysisInstructions}
            onChange={e => setAnalysisInstructions(e.target.value)}
            placeholder="예: 기술적 복잡도보다는 비즈니스 가치에 중점을 두고 분석해주세요. 단계적 개발 방안과 위험 요소를 자세히 분석해주세요."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      )}

      {/* 커스텀 프롬프트 입력 */}
      {(uploadedFiles.length > 0 || showAdvancedOptions) && (
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
      )}

      {/* 분석 시작 버튼 */}
      {uploadStatus === 'ready' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                분석 준비 완료
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uploadedFiles.length}개의 문서가 업로드되었습니다. 분석을
                시작하시겠습니까?
              </p>
            </div>
            <button
              onClick={handleStartAnalysis}
              disabled={uploadedFiles.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              <PlayIcon className="w-5 h-5" />
              <span>분석 시작</span>
            </button>
          </div>
        </div>
      )}

      {/* 분석 성공 상태 */}
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

      {/* 파일 미리보기 모달 */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            <FilePreview
              fileName={previewFile.name}
              fileType={previewFile.type}
              textContent={previewFile.textContent}
              onClose={() => setShowPreview(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
