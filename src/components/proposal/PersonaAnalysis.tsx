'use client'

import { useState, useCallback } from 'react'
import { useAI } from '@/lib/hooks/useAI'
import {
  UserIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'
import type { RFPAnalysisResult } from './RFPUpload'
import type { MarketResearchResult } from './MarketResearch'

export interface PersonaAnalysisResult {
  primaryPersona: {
    name: string
    age: string
    occupation: string
    demographics: string
    psychographics: string
    goals: string[]
    painPoints: string[]
    behaviors: string[]
    preferences: string[]
  }
  secondaryPersonas: Array<{
    name: string
    key_characteristics: string
    role: string
  }>
  userJourney: Array<{
    stage: string
    touchpoints: string[]
    emotions: string[]
    opportunities: string[]
  }>
  insights: {
    keyFindings: string[]
    recommendations: string[]
    designImplications: string[]
  }
  generatedAt: string
}

interface PersonaAnalysisProps {
  projectTitle: string
  rfpAnalysis: RFPAnalysisResult | null
  marketResearch: MarketResearchResult | null
  onAnalysisComplete: (result: PersonaAnalysisResult) => void
}

export default function PersonaAnalysis({
  projectTitle,
  rfpAnalysis,
  marketResearch,
  onAnalysisComplete,
}: PersonaAnalysisProps) {
  const [analysisResult, setAnalysisResult] = useState<PersonaAnalysisResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'personas' | 'journey' | 'insights'>('overview')
  
  const { sendMessage, isLoading } = useAI({
    onComplete: (response) => {
      try {
        const result = JSON.parse(response.content)
        const personaResult: PersonaAnalysisResult = {
          ...result,
          generatedAt: new Date().toISOString(),
        }
        setAnalysisResult(personaResult)
        setIsGenerating(false)
      } catch (error) {
        console.error('페르소나 분석 결과 파싱 오류:', error)
        setIsGenerating(false)
      }
    },
  })

  const generatePersonaAnalysis = useCallback(async () => {
    if (!rfpAnalysis || !marketResearch) {
      console.error('RFP 분석 또는 시장 조사 결과가 없습니다.')
      return
    }

    setIsGenerating(true)

    const prompt = `
다음 정보를 바탕으로 상세한 페르소나 분석을 수행해주세요:

# 프로젝트 정보
- 프로젝트명: ${projectTitle}
- 클라이언트: ${rfpAnalysis.client}
- 프로젝트 범위: ${rfpAnalysis.scope}

# RFP 분석 결과
- 핵심 요구사항: ${rfpAnalysis.keyPoints.join(', ')}
- 타겟 사용자: ${rfpAnalysis.targetAudience}
- 주요 기능: ${rfpAnalysis.features.join(', ')}
- 예상 예산: ${rfpAnalysis.estimatedBudget}

# 시장 조사 결과
- 주요 경쟁사: ${marketResearch.competitors.map(c => c.name).join(', ')}
- 시장 트렌드: ${marketResearch.trends.join(', ')}
- 기술 동향: ${marketResearch.technologies.join(', ')}

다음 JSON 형식으로 페르소나 분석 결과를 제공해주세요:

{
  "primaryPersona": {
    "name": "주 사용자 페르소나 이름",
    "age": "연령대",
    "occupation": "직업/역할",
    "demographics": "인구통계학적 특성",
    "psychographics": "심리적/라이프스타일 특성",
    "goals": ["목표1", "목표2", "목표3"],
    "painPoints": ["고충1", "고충2", "고충3"],
    "behaviors": ["행동패턴1", "행동패턴2", "행동패턴3"],
    "preferences": ["선호사항1", "선호사항2", "선호사항3"]
  },
  "secondaryPersonas": [
    {
      "name": "보조 페르소나 이름",
      "key_characteristics": "핵심 특성",
      "role": "역할"
    }
  ],
  "userJourney": [
    {
      "stage": "인지",
      "touchpoints": ["접점1", "접점2"],
      "emotions": ["감정1", "감정2"],
      "opportunities": ["기회1", "기회2"]
    },
    {
      "stage": "고려",
      "touchpoints": ["접점1", "접점2"],
      "emotions": ["감정1", "감정2"],
      "opportunities": ["기회1", "기회2"]
    },
    {
      "stage": "결정",
      "touchpoints": ["접점1", "접점2"],
      "emotions": ["감정1", "감정2"],
      "opportunities": ["기회1", "기회2"]
    },
    {
      "stage": "사용",
      "touchpoints": ["접점1", "접점2"],
      "emotions": ["감정1", "감정2"],
      "opportunities": ["기회1", "기회2"]
    },
    {
      "stage": "옹호",
      "touchpoints": ["접점1", "접점2"],
      "emotions": ["감정1", "감정2"],
      "opportunities": ["기회1", "기회2"]
    }
  ],
  "insights": {
    "keyFindings": ["핵심 발견사항1", "핵심 발견사항2", "핵심 발견사항3"],
    "recommendations": ["권장사항1", "권장사항2", "권장사항3"],
    "designImplications": ["디자인 시사점1", "디자인 시사점2", "디자인 시사점3"]
  }
}

한국어로 상세하고 실용적인 분석 결과를 제공해주세요.
`

    await sendMessage(prompt)
  }, [projectTitle, rfpAnalysis, marketResearch, sendMessage])

  const handleSaveAnalysis = () => {
    if (analysisResult) {
      onAnalysisComplete(analysisResult)
    }
  }

  const handleExportAnalysis = () => {
    if (!analysisResult) return

    const exportData = {
      project: projectTitle,
      analysis: analysisResult,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `persona-analysis-${projectTitle}-${new Date().getTime()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              페르소나 분석
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              타겟 사용자를 깊이 이해하고 사용자 여정을 분석합니다
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {!analysisResult && (
              <button
                onClick={generatePersonaAnalysis}
                disabled={isLoading || isGenerating || !rfpAnalysis || !marketResearch}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <UserIcon className="w-5 h-5" />
                <span>
                  {isLoading || isGenerating ? '분석 중...' : '페르소나 분석 시작'}
                </span>
              </button>
            )}
            
            {analysisResult && (
              <div className="flex space-x-3">
                <button
                  onClick={handleExportAnalysis}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>내보내기</span>
                </button>
                
                <button
                  onClick={handleSaveAnalysis}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  분석 완료 및 다음 단계
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 분석 결과 */}
      {analysisResult && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            {[
              { id: 'overview', label: '개요', icon: ChartBarIcon },
              { id: 'personas', label: '페르소나', icon: UserIcon },
              { id: 'journey', label: '사용자 여정', icon: HeartIcon },
              { id: 'insights', label: '인사이트', icon: LightBulbIcon },
            ].map((tab) => {
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'personas' | 'journey' | 'insights')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* 탭 콘텐츠 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                    주요 페르소나
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {analysisResult.primaryPersona.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {analysisResult.primaryPersona.age} • {analysisResult.primaryPersona.occupation}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {analysisResult.primaryPersona.demographics}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-green-600" />
                    분석 통계
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">페르소나 수</span>
                      <span className="font-semibold">
                        {1 + analysisResult.secondaryPersonas.length}개
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">사용자 여정 단계</span>
                      <span className="font-semibold">
                        {analysisResult.userJourney.length}단계
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">핵심 인사이트</span>
                      <span className="font-semibold">
                        {analysisResult.insights.keyFindings.length}개
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personas' && (
            <div className="space-y-8">
              {/* 주요 페르소나 */}
              <div className="border border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
                  주요 페르소나: {analysisResult.primaryPersona.name}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">기본 정보</h4>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
                        <p><span className="text-gray-500">연령:</span> {analysisResult.primaryPersona.age}</p>
                        <p><span className="text-gray-500">직업:</span> {analysisResult.primaryPersona.occupation}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          {analysisResult.primaryPersona.psychographics}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <HeartIcon className="w-4 h-4 mr-1 text-green-600" />
                        목표 및 동기
                      </h4>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <ul className="space-y-1">
                          {analysisResult.primaryPersona.goals.map((goal, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1 text-orange-600" />
                        고충사항
                      </h4>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <ul className="space-y-1">
                          {analysisResult.primaryPersona.painPoints.map((pain, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                              {pain}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">행동 패턴</h4>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <ul className="space-y-1">
                          {analysisResult.primaryPersona.behaviors.map((behavior, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                              {behavior}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 보조 페르소나 */}
              {analysisResult.secondaryPersonas.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    보조 페르소나
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.secondaryPersonas.map((persona, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {persona.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {persona.role}
                        </p>
                        <p className="text-sm text-gray-500">
                          {persona.key_characteristics}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'journey' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <HeartIcon className="w-6 h-6 mr-2 text-pink-600" />
                사용자 여정 지도
              </h3>

              <div className="space-y-6">
                {analysisResult.userJourney.map((stage, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {index + 1}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stage.stage}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">접점</h5>
                        <ul className="space-y-1">
                          {stage.touchpoints.map((touchpoint, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                              {touchpoint}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">감정</h5>
                        <ul className="space-y-1">
                          {stage.emotions.map((emotion, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2" />
                              {emotion}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">개선 기회</h5>
                        <ul className="space-y-1">
                          {stage.opportunities.map((opportunity, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 핵심 발견사항 */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-600" />
                    핵심 발견사항
                  </h3>
                  <ul className="space-y-3">
                    {analysisResult.insights.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 권장사항 */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-green-600" />
                    권장사항
                  </h3>
                  <ul className="space-y-3">
                    {analysisResult.insights.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 디자인 시사점 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
                    디자인 시사점
                  </h3>
                  <ul className="space-y-3">
                    {analysisResult.insights.designImplications.map((implication, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{implication}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 로딩 상태 */}
      {(isLoading || isGenerating) && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-12 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                페르소나 분석 진행 중
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                RFP와 시장조사 결과를 바탕으로 상세한 페르소나 분석을 수행하고 있습니다...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}