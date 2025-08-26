'use client'

import { useState, useCallback } from 'react'
import { useAI } from '@/lib/hooks/useAI'
import {
  QuestionMarkCircleIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'
import type { RFPAnalysisResult } from './RFPUpload'
import type { MarketResearchResult } from './MarketResearch'
import type { PersonaAnalysisResult } from './PersonaAnalysis'

interface AIQuestion {
  id: string
  question: string
  category: 'clarification' | 'expansion' | 'validation' | 'insight'
  priority: 'high' | 'medium' | 'low'
  answered?: boolean
  answer?: string
}

interface AIQuestionGeneratorProps {
  stage: 'rfp' | 'research' | 'persona' | 'proposal'
  data: {
    projectTitle: string
    rfpAnalysis?: RFPAnalysisResult | null
    marketResearch?: MarketResearchResult | null
    personaAnalysis?: PersonaAnalysisResult | null
  }
  onQuestionsGenerated?: (questions: AIQuestion[]) => void
  onAllAnswered?: (questionsAndAnswers: AIQuestion[]) => void
}

const stageLabels = {
  rfp: 'RFP 분석',
  research: '시장 조사',
  persona: '페르소나 분석',
  proposal: '제안서 작성',
}

const categoryLabels = {
  clarification: '명확화',
  expansion: '확장',
  validation: '검증',
  insight: '인사이트',
}

const categoryColors = {
  clarification: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  expansion: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
  validation: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  insight: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300',
}

export default function AIQuestionGenerator({
  stage,
  data,
  onQuestionsGenerated,
  onAllAnswered,
}: AIQuestionGeneratorProps) {
  const [questions, setQuestions] = useState<AIQuestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [tempAnswer, setTempAnswer] = useState('')

  const { sendMessage, isLoading } = useAI({
    onComplete: (response) => {
      try {
        const generatedQuestions = JSON.parse(response.content)
        const questionsWithIds: AIQuestion[] = generatedQuestions.map((q: unknown, index: number) => ({
          ...q,
          id: `question-${index}-${Date.now()}`,
          answered: false,
        }))
        
        setQuestions(questionsWithIds)
        onQuestionsGenerated?.(questionsWithIds)
        setIsGenerating(false)
      } catch (error) {
        console.error('AI 질문 파싱 오류:', error)
        setIsGenerating(false)
      }
    },
  })

  const generateQuestions = useCallback(async () => {
    setIsGenerating(true)

    const contextData = {
      projectTitle: data.projectTitle,
      stage,
      ...(data.rfpAnalysis && { rfpAnalysis: data.rfpAnalysis }),
      ...(data.marketResearch && { marketResearch: data.marketResearch }),
      ...(data.personaAnalysis && { personaAnalysis: data.personaAnalysis }),
    }

    let prompt = ''

    switch (stage) {
      case 'rfp':
        prompt = `
다음 RFP 분석 결과를 바탕으로, 더 나은 시장조사를 위한 AI 질문들을 생성해주세요:

프로젝트: ${data.projectTitle}
RFP 분석 결과: ${JSON.stringify(data.rfpAnalysis, null, 2)}

다음 카테고리별로 5-7개의 질문을 생성해주세요:

1. **clarification (명확화)**: 불분명하거나 애매한 부분을 명확히 하기 위한 질문
2. **expansion (확장)**: 추가적으로 알아야 할 정보에 대한 질문  
3. **validation (검증)**: 분석 결과를 검증하기 위한 질문
4. **insight (인사이트)**: 더 깊은 통찰을 얻기 위한 질문

각 질문은 우선순위(high, medium, low)를 포함해야 합니다.
        `
        break

      case 'research':
        prompt = `
다음 정보를 바탕으로, 더 나은 페르소나 분석을 위한 AI 질문들을 생성해주세요:

프로젝트: ${data.projectTitle}
RFP 분석: ${JSON.stringify(data.rfpAnalysis, null, 2)}
시장 조사 결과: ${JSON.stringify(data.marketResearch, null, 2)}

시장조사 결과를 바탕으로 페르소나 분석에 필요한 질문들을 생성해주세요.
        `
        break

      case 'persona':
        prompt = `
다음 정보를 바탕으로, 더 나은 제안서 작성을 위한 AI 질문들을 생성해주세요:

프로젝트: ${data.projectTitle}
RFP 분석: ${JSON.stringify(data.rfpAnalysis, null, 2)}
시장 조사: ${JSON.stringify(data.marketResearch, null, 2)}
페르소나 분석: ${JSON.stringify(data.personaAnalysis, null, 2)}

페르소나 분석 결과를 바탕으로 제안서 작성에 필요한 질문들을 생성해주세요.
        `
        break

      case 'proposal':
        prompt = `
다음 정보를 바탕으로, 제안서를 더욱 개선하기 위한 AI 질문들을 생성해주세요:

프로젝트: ${data.projectTitle}
전체 분석 결과: ${JSON.stringify(contextData, null, 2)}

제안서의 품질을 높이기 위한 검토 질문들을 생성해주세요.
        `
        break
    }

    prompt += `

다음 JSON 형식으로 응답해주세요:
[
  {
    "question": "질문 내용",
    "category": "clarification|expansion|validation|insight",
    "priority": "high|medium|low"
  }
]

한국어로 실용적이고 구체적인 질문들을 생성해주세요.`

    await sendMessage(prompt)
  }, [stage, data, sendMessage])

  const handleAnswerQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    if (question) {
      setEditingQuestion(questionId)
      setTempAnswer(question.answer || '')
    }
  }

  const saveAnswer = () => {
    if (!editingQuestion) return

    const updatedQuestions = questions.map(q =>
      q.id === editingQuestion
        ? { ...q, answered: true, answer: tempAnswer }
        : q
    )

    setQuestions(updatedQuestions)
    setEditingQuestion(null)
    setTempAnswer('')

    // 모든 질문이 답변되었는지 확인
    const allAnswered = updatedQuestions.every(q => q.answered)
    if (allAnswered) {
      onAllAnswered?.(updatedQuestions)
    }
  }

  const cancelAnswer = () => {
    setEditingQuestion(null)
    setTempAnswer('')
  }

  const answeredCount = questions.filter(q => q.answered).length
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <QuestionMarkCircleIcon className="w-6 h-6 text-indigo-600" />
              <span>AI 질문 생성 - {stageLabels[stage]}</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {stage === 'rfp' && '분석 결과를 바탕으로 더 나은 시장조사를 위한 질문을 생성합니다'}
              {stage === 'research' && '시장조사 결과를 바탕으로 페르소나 분석을 위한 질문을 생성합니다'}
              {stage === 'persona' && '페르소나 분석을 바탕으로 제안서 작성을 위한 질문을 생성합니다'}
              {stage === 'proposal' && '제안서 품질 개선을 위한 검토 질문을 생성합니다'}
            </p>
          </div>

          {questions.length === 0 && (
            <button
              onClick={generateQuestions}
              disabled={isLoading || isGenerating}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>
                {isLoading || isGenerating ? '질문 생성 중...' : '질문 생성'}
              </span>
            </button>
          )}
        </div>

        {/* 진행률 표시 */}
        {questions.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                답변 진행률: {answeredCount} / {questions.length}
              </span>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 질문 목록 */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              생성된 질문들
            </h4>
            <button
              onClick={generateQuestions}
              disabled={isLoading || isGenerating}
              className="px-4 py-2 text-sm border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            >
              질문 재생성
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`border rounded-xl p-5 transition-all ${
                  question.answered
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium border rounded-full ${categoryColors[question.category]}`}>
                          {categoryLabels[question.category]}
                        </span>
                        
                        <span className={`px-2 py-1 text-xs font-medium border rounded-full ${
                          question.priority === 'high'
                            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                            : question.priority === 'medium'
                            ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
                            : 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300'
                        }`}>
                          {question.priority === 'high' ? '높음' : question.priority === 'medium' ? '보통' : '낮음'}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 dark:text-white font-medium mb-3">
                        {question.question}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {question.answered ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <button
                        onClick={() => handleAnswerQuestion(question.id)}
                        className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <ArrowRightIcon className="w-3 h-3" />
                        <span>답변</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 답변 입력/표시 영역 */}
                {editingQuestion === question.id ? (
                  <div className="space-y-3 pl-11">
                    <textarea
                      value={tempAnswer}
                      onChange={(e) => setTempAnswer(e.target.value)}
                      placeholder="답변을 입력하세요..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={cancelAnswer}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={saveAnswer}
                        disabled={!tempAnswer.trim()}
                        className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : question.answered && question.answer ? (
                  <div className="pl-11">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <LightBulbIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">답변</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {question.answer}
                      </p>
                      <button
                        onClick={() => handleAnswerQuestion(question.id)}
                        className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
                      >
                        수정
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {(isLoading || isGenerating) && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                AI 질문 생성 중
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {stageLabels[stage]} 결과를 분석하여 맞춤형 질문들을 생성하고 있습니다...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 완료 알림 */}
      {questions.length > 0 && progressPercentage === 100 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                모든 질문이 완료되었습니다!
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                답변 결과가 다음 단계 분석에 반영됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}