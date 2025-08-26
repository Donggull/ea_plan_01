'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  DocumentPlusIcon,
  TrashIcon,
  CloudArrowUpIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  LockClosedIcon,
  TagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import KnowledgeBaseProcessor from '@/lib/services/knowledgeBaseProcessor'

interface KnowledgeFile {
  id: string
  name: string
  type: string
  size: number
  content?: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
}

export default function CreateBotPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Bot basic info
  const [botName, setBotName] = useState('')
  const [botDescription, setBotDescription] = useState('')
  const [botAvatar, setBotAvatar] = useState('🤖')
  const [botTags, setBotTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [preferredModel, setPreferredModel] = useState<
    'gemini' | 'gpt' | 'claude'
  >('gemini')

  // Knowledge base
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([])
  const [instructions, setInstructions] = useState('')

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push('/newel')
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !botTags.includes(currentTag.trim())) {
      setBotTags([...botTags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setBotTags(botTags.filter(tag => tag !== tagToRemove))
  }

  const handleFileUpload = async (files: FileList) => {
    const newFiles: KnowledgeFile[] = Array.from(files).map(file => ({
      id: Date.now() + Math.random().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading' as const,
    }))

    setKnowledgeFiles(prev => [...prev, ...newFiles])

    // Process files and extract content
    for (const file of Array.from(files)) {
      const fileId = newFiles.find(f => f.name === file.name)?.id
      if (!fileId) continue

      try {
        // Update status to processing
        setKnowledgeFiles(prev =>
          prev.map(f => (f.id === fileId ? { ...f, status: 'processing' } : f))
        )

        // Extract file content
        let content = ''
        if (file.type === 'text/plain' || file.type === 'text/markdown') {
          content = await file.text()
        } else {
          // For other file types, we'll use a placeholder
          content = `File: ${file.name}\\nType: ${file.type}\\nSize: ${file.size} bytes\\n\\n[Content would be extracted with proper parsing library]`
        }

        // Update file with content and ready status
        setKnowledgeFiles(prev =>
          prev.map(f =>
            f.id === fileId ? { ...f, content, status: 'ready' } : f
          )
        )
      } catch (error) {
        console.error('File processing failed:', error)
        setKnowledgeFiles(prev =>
          prev.map(f => (f.id === fileId ? { ...f, status: 'error' } : f))
        )
      }
    }
  }

  const removeFile = (fileId: string) => {
    setKnowledgeFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleCreateBot = async () => {
    if (!botName.trim() || !botDescription.trim()) {
      alert('봇 이름과 설명을 입력해주세요.')
      return
    }

    try {
      setLoading(true)

      // Get current user (fallback to default for testing)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const userId = user?.id || 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d'

      // Create custom bot
      const { data: botData, error: botError } = await supabase
        .from('custom_bots')
        .insert({
          name: botName,
          description: botDescription,
          is_public: isPublic,
          user_id: userId,
          system_prompt: instructions,
          tags: botTags,
          metadata: {
            avatar: botAvatar,
            preferred_model: preferredModel,
          },
        })
        .select()
        .single()

      if (botError) {
        throw new Error(botError.message)
      }

      // Process and store knowledge base files
      if (knowledgeFiles.length > 0) {
        const items = knowledgeFiles.map(file => ({
          title: file.name,
          content:
            file.content ||
            `File: ${file.name}\\nType: ${file.type}\\nSize: ${file.size} bytes\\n\\n[File content would be processed here]`,
          metadata: {
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
          },
        }))

        const result = await KnowledgeBaseProcessor.processKnowledgeBase(
          botData.id,
          items
        )

        if (!result.success) {
          console.error('Failed to create knowledge base:', result.errors)
        }
      }

      router.push(`/newel/${botData.id}`)
    } catch (error) {
      console.error('Failed to create bot:', error)
      alert('챗봇 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: KnowledgeFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600'
      case 'processing':
        return 'text-yellow-600'
      case 'ready':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: KnowledgeFile['status']) => {
    switch (status) {
      case 'uploading':
        return '업로드 중...'
      case 'processing':
        return '처리 중...'
      case 'ready':
        return '준비 완료'
      case 'error':
        return '오류 발생'
      default:
        return '알 수 없음'
    }
  }

  return (
    <div className="space-y-8 p-6 pb-12">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                새 챗봇 만들기
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                단계 {step}/3:{' '}
                {step === 1
                  ? '기본 정보'
                  : step === 2
                    ? '지식베이스'
                    : '설정 완료'}{' '}
                ✨
              </p>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-4 md:mt-0"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">
            필수 항목을 모두 입력해주세요
          </div>
        </motion.div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center">
          {[1, 2, 3].map(stepNumber => (
            <React.Fragment key={stepNumber}>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step >= stepNumber
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    step > stepNumber
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl p-8"
      >
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                챗봇 기본 정보
              </h2>

              <div className="space-y-6">
                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    아바타
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                      {botAvatar}
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        '🤖',
                        '🧠',
                        '💡',
                        '⚡',
                        '🚀',
                        '🎯',
                        '🔥',
                        '⭐',
                        '💎',
                        '🎨',
                        '📊',
                        '🔬',
                      ].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setBotAvatar(emoji)}
                          className={`w-10 h-10 rounded-lg border-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            botAvatar === emoji
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    챗봇 이름 *
                  </label>
                  <input
                    type="text"
                    value={botName}
                    onChange={e => setBotName(e.target.value)}
                    placeholder="예: 마케팅 전문가, 개발 도우미, 법무 상담사"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    챗봇 설명 *
                  </label>
                  <textarea
                    value={botDescription}
                    onChange={e => setBotDescription(e.target.value)}
                    placeholder="이 챗봇이 어떤 도움을 줄 수 있는지 자세히 설명해주세요"
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* AI Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    AI 모델 선택
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        id: 'gemini',
                        name: 'Gemini',
                        description: '빠른 응답, 비용 효율적',
                        icon: '⚡',
                        color: 'from-blue-500 to-blue-600',
                      },
                      {
                        id: 'gpt',
                        name: 'ChatGPT',
                        description: '창의적 텍스트 생성',
                        icon: '🎯',
                        color: 'from-green-500 to-green-600',
                      },
                      {
                        id: 'claude',
                        name: 'Claude',
                        description: '도구 연동, 분석 특화',
                        icon: '🔧',
                        color: 'from-purple-500 to-purple-600',
                      },
                    ].map(model => (
                      <div
                        key={model.id}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          preferredModel === model.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() =>
                          setPreferredModel(
                            model.id as 'gemini' | 'gpt' | 'claude'
                          )
                        }
                      >
                        <div className="text-center">
                          <div
                            className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-r ${model.color} flex items-center justify-center text-white font-medium`}
                          >
                            {model.icon}
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                            {model.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {model.description}
                          </p>
                        </div>
                        {preferredModel === model.id && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    태그
                  </label>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={e => setCurrentTag(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addTag()}
                      placeholder="태그를 입력하고 Enter를 누르세요"
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <TagIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {botTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {botTags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!botName.trim() || !botDescription.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                지식베이스 구성
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                챗봇이 참조할 문서나 자료를 업로드하세요. PDF, DOC, TXT 파일을
                지원합니다.
              </p>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    파일을 드래그하여 업로드
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    또는 클릭하여 파일을 선택하세요
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={e =>
                    e.target.files && handleFileUpload(e.target.files)
                  }
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                >
                  <DocumentPlusIcon className="w-5 h-5" />
                  <span>파일 선택</span>
                </label>
              </div>

              {/* Uploaded Files */}
              {knowledgeFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    업로드된 파일 ({knowledgeFiles.length}개)
                  </h4>
                  <div className="space-y-3">
                    {knowledgeFiles.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <DocumentPlusIcon className="w-6 h-6 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {file.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {(file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-sm font-medium ${getStatusColor(file.status)}`}
                          >
                            {getStatusText(file.status)}
                          </span>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  챗봇 지시사항 (선택사항)
                </label>
                <textarea
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="챗봇이 어떻게 응답해야 하는지 구체적인 지시사항을 입력하세요. 예: 친근하게 대화하기, 전문용어 설명하기 등"
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                이전 단계
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                공개 설정 및 완료
              </h2>

              {/* Privacy Settings */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isPublic
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-gray-100 dark:bg-gray-600'
                      }`}
                    >
                      {isPublic ? (
                        <GlobeAltIcon className="w-6 h-6 text-green-600" />
                      ) : (
                        <LockClosedIcon className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {isPublic ? '공개 챗봇' : '비공개 챗봇'}
                      </h3>
                      <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isPublic
                            ? 'bg-blue-600'
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isPublic ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isPublic
                        ? '다른 사용자들이 이 챗봇을 검색하고 사용할 수 있습니다'
                        : '나만 이 챗봇을 사용할 수 있습니다'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      챗봇 생성 요약
                    </h4>
                    <div className="text-blue-800 dark:text-blue-400 space-y-1">
                      <p>
                        <strong>이름:</strong> {botName}
                      </p>
                      <p>
                        <strong>설명:</strong> {botDescription}
                      </p>
                      <p>
                        <strong>지식베이스:</strong> {knowledgeFiles.length}개
                        파일
                      </p>
                      <p>
                        <strong>태그:</strong> {botTags.join(', ') || '없음'}
                      </p>
                      <p>
                        <strong>공개 설정:</strong>{' '}
                        {isPublic ? '공개' : '비공개'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                이전 단계
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateBot}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                <SparklesIcon className="w-5 h-5" />
                <span>{loading ? '생성 중...' : '챗봇 생성하기'}</span>
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
