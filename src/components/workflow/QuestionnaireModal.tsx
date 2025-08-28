'use client'

import { useState, useEffect } from 'react'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { QuestionnaireService, Question, QuestionnaireResponse } from '@/services/questionnaireService'

interface QuestionnaireModalProps {
  isOpen: boolean
  onClose: () => void
  workflowType: 'proposal' | 'development' | 'operation'
  stage: string
  projectId: string
  rfpContext?: any
  onComplete: (responses: QuestionnaireResponse[]) => void
}

export default function QuestionnaireModal({
  isOpen,
  onClose,
  workflowType,
  stage,
  projectId,
  rfpContext,
  onComplete
}: QuestionnaireModalProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Map<string, QuestionnaireResponse>>(new Map())
  const [aiSuggestions, setAiSuggestions] = useState<Map<string, any>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [validationError, setValidationError] = useState<string>('')

  const questionnaireService = QuestionnaireService.getInstance()

  useEffect(() => {
    if (isOpen) {
      loadQuestions()
    }
  }, [isOpen, workflowType, stage])

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      // 질문 생성
      const generatedQuestions = await questionnaireService.generateQuestions(
        workflowType,
        stage,
        rfpContext
      )
      setQuestions(generatedQuestions)

      // AI 제안 생성
      const suggestions = await questionnaireService.generateAISuggestions(
        generatedQuestions,
        rfpContext
      )
      setAiSuggestions(suggestions)

      // 기존 답변 불러오기
      const { responses: savedResponses } = await questionnaireService.loadQuestionnaire(
        projectId,
        workflowType,
        stage
      )
      const responseMap = new Map(savedResponses.map(r => [r.questionId, r]))
      setResponses(responseMap)
    } catch (error) {
      console.error('Failed to load questions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentResponse = currentQuestion ? responses.get(currentQuestion.id) : null
  const currentSuggestion = currentQuestion ? aiSuggestions.get(currentQuestion.id) : null
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  const validateAnswer = (answer: any): boolean => {
    if (!currentQuestion) return false
    setValidationError('')

    if (currentQuestion.required && !answer) {
      setValidationError('이 질문은 필수 항목입니다')
      return false
    }

    if (currentQuestion.validation) {
      const { min, max, pattern, message } = currentQuestion.validation
      
      if (currentQuestion.type === 'number') {
        const numValue = Number(answer)
        if (min !== undefined && numValue < min) {
          setValidationError(message || `최소값은 ${min}입니다`)
          return false
        }
        if (max !== undefined && numValue > max) {
          setValidationError(message || `최대값은 ${max}입니다`)
          return false
        }
      }
      
      if (pattern && currentQuestion.type === 'text') {
        const regex = new RegExp(pattern)
        if (!regex.test(answer)) {
          setValidationError(message || '올바른 형식이 아닙니다')
          return false
        }
      }
    }

    return true
  }

  const handleAnswer = (answer: any) => {
    if (!currentQuestion) return

    const newResponse: QuestionnaireResponse = {
      questionId: currentQuestion.id,
      answer: answer,
      answeredBy: 'user',
      confidence: 1.0
    }

    const newResponses = new Map(responses)
    newResponses.set(currentQuestion.id, newResponse)
    setResponses(newResponses)
  }

  const handleUseAISuggestion = () => {
    if (!currentQuestion || !currentSuggestion) return

    const newResponse: QuestionnaireResponse = {
      questionId: currentQuestion.id,
      answer: currentSuggestion,
      answeredBy: 'ai',
      confidence: 0.8
    }

    const newResponses = new Map(responses)
    newResponses.set(currentQuestion.id, newResponse)
    setResponses(newResponses)
  }

  const handleNext = () => {
    const currentAnswer = responses.get(currentQuestion.id)?.answer
    
    if (currentQuestion.required && !currentAnswer) {
      setValidationError('이 질문은 필수 항목입니다')
      return
    }

    if (currentAnswer && !validateAnswer(currentAnswer)) {
      return
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setValidationError('')
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setValidationError('')
    }
  }

  const handleComplete = async () => {
    // 필수 질문 확인
    const unansweredRequired = questions.filter(
      q => q.required && !responses.has(q.id)
    )

    if (unansweredRequired.length > 0) {
      setValidationError(`${unansweredRequired.length}개의 필수 질문에 답변하지 않았습니다`)
      setCurrentQuestionIndex(questions.indexOf(unansweredRequired[0]))
      return
    }

    // AI로 미답변 항목 자동 완성
    const finalResponses = new Map(responses)
    questions.forEach(question => {
      if (!finalResponses.has(question.id)) {
        const aiAnswer = aiSuggestions.get(question.id)
        if (aiAnswer) {
          finalResponses.set(question.id, {
            questionId: question.id,
            answer: aiAnswer,
            answeredBy: 'ai',
            confidence: 0.6
          })
        }
      }
    })

    setIsSaving(true)
    try {
      await questionnaireService.saveQuestionnaire(
        projectId,
        workflowType,
        stage,
        questions,
        Array.from(finalResponses.values())
      )
      onComplete(Array.from(finalResponses.values()))
      onClose()
    } catch (error) {
      console.error('Failed to save questionnaire:', error)
      setValidationError('저장 중 오류가 발생했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const renderQuestionInput = () => {
    if (!currentQuestion) return null

    const value = currentResponse?.answer || ''

    switch (currentQuestion.type) {
      case 'text':
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">선택해주세요</option>
            {currentQuestion.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {currentQuestion.options?.map(option => (
              <label
                key={option}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(value as string[] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = (value as string[]) || []
                    if (e.target.checked) {
                      handleAnswer([...currentValues, option])
                    } else {
                      handleAnswer(currentValues.filter(v => v !== option))
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'boolean':
        return (
          <div className="flex space-x-4">
            <button
              onClick={() => handleAnswer(true)}
              className={`flex-1 px-6 py-3 rounded-lg border-2 transition-colors ${
                value === true
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              예
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`flex-1 px-6 py-3 rounded-lg border-2 transition-colors ${
                value === false
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              아니오
            </button>
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleAnswer(e.target.value ? Number(e.target.value) : '')}
            placeholder={currentQuestion.placeholder}
            min={currentQuestion.validation?.min}
            max={currentQuestion.validation?.max}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )

      default:
        return null
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-xl bg-white dark:bg-gray-900 px-4 pt-5 pb-4 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-2">
                      {getStageTitle(workflowType, stage)}
                    </Dialog.Title>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>진행률</span>
                        <span>{currentQuestionIndex + 1} / {questions.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">질문을 준비하고 있습니다...</p>
                      </div>
                    ) : currentQuestion ? (
                      <div className="space-y-4">
                        {/* Question */}
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {currentQuestion.text}
                            {currentQuestion.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          {currentQuestion.context && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                              {currentQuestion.context}
                            </p>
                          )}
                          {renderQuestionInput()}
                        </div>

                        {/* Validation Error */}
                        {validationError && (
                          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>{validationError}</span>
                          </div>
                        )}

                        {/* AI Suggestion */}
                        {currentSuggestion && !currentResponse && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start space-x-2">
                              <SparklesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                  AI 추천 답변
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                  {typeof currentSuggestion === 'object' 
                                    ? JSON.stringify(currentSuggestion)
                                    : currentSuggestion}
                                </p>
                                <button
                                  onClick={handleUseAISuggestion}
                                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  이 답변 사용하기
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Answer Status */}
                        {currentResponse && (
                          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>
                              {currentResponse.answeredBy === 'ai' ? 'AI 답변 사용' : '답변 완료'}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex justify-between">
                      <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        이전
                      </button>

                      <div className="flex space-x-2">
                        {currentQuestionIndex === questions.length - 1 ? (
                          <button
                            onClick={handleComplete}
                            disabled={isSaving}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? '저장 중...' : '완료하기'}
                          </button>
                        ) : (
                          <button
                            onClick={handleNext}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            다음
                            <ChevronRightIcon className="h-4 w-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

function getStageTitle(workflowType: string, stage: string): string {
  const titles: Record<string, Record<string, string>> = {
    proposal: {
      'rfp-analysis': 'RFP 분석을 위한 추가 정보',
      'market-research': '시장 조사 관련 정보',
      'persona-analysis': '페르소나 분석 정보',
      'proposal-writing': '제안서 작성 방향',
      'cost-estimation': '비용 산정 세부사항'
    },
    development: {
      'current-analysis': '현황 분석 정보',
      'requirement-definition': '요구사항 정의',
      'screen-design': '화면 설계 정보'
    },
    operation: {
      'requirement-management': '요건 관리 설정',
      'task-distribution': '업무 분배 정보',
      'schedule-management': '일정 관리 설정'
    }
  }

  return titles[workflowType]?.[stage] || '추가 정보 입력'
}