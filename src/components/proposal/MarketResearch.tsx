'use client'

import { useState, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface MarketResearchProps {
  projectCategory: string
  keywords: string[]
  onResearchComplete: (research: MarketResearchResult) => void
}

export interface MarketResearchResult {
  competitors: {
    name: string
    website: string
    strengths: string[]
    weaknesses: string[]
    marketShare?: string
    pricingModel: string
  }[]
  marketTrends: {
    trend: string
    impact: 'high' | 'medium' | 'low'
    description: string
  }[]
  technologyStack: {
    category: string
    technologies: string[]
    popularity: number
    adoptionRate: string
  }[]
  pricing: {
    averageRange: {
      min: number
      max: number
      currency: string
    }
    factorsAffectingPrice: string[]
    recommendedPricing: {
      strategy: string
      justification: string
    }
  }
  timeline: {
    phase: string
    duration: string
    description: string
  }[]
  recommendations: string[]
  sources: string[]
}

export default function MarketResearch({
  projectCategory,
  keywords,
  onResearchComplete,
}: MarketResearchProps) {
  const [isResearching, setIsResearching] = useState(false)
  const [researchProgress, setResearchProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [research, setResearch] = useState<MarketResearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const researchSteps = [
    '경쟁사 검색 중...',
    '시장 트렌드 분석 중...',
    '기술 스택 조사 중...',
    '가격 정보 수집 중...',
    '일정 벤치마킹 중...',
    '분석 결과 정리 중...',
  ]

  const startResearch = async () => {
    setIsResearching(true)
    setResearchProgress(0)
    setError(null)

    try {
      let stepIndex = 0
      const progressInterval = setInterval(() => {
        if (stepIndex < researchSteps.length) {
          setCurrentStep(researchSteps[stepIndex])
          setResearchProgress((stepIndex + 1) * (100 / researchSteps.length))
          stepIndex++
        }
      }, 1500)

      const response = await fetch('/api/proposal/market-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: projectCategory,
          keywords,
        }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('시장 조사에 실패했습니다.')
      }

      const researchResult: MarketResearchResult = await response.json()
      setResearch(researchResult)
      setResearchProgress(100)
      setCurrentStep('완료!')

      setTimeout(() => {
        onResearchComplete(researchResult)
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsResearching(false)
    }
  }

  const CompetitorCard = ({ competitor }: { competitor: MarketResearchResult['competitors'][0] }) => (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">{competitor.name}</h4>
        {competitor.website && (
          <a
            href={competitor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            <GlobeAltIcon className="w-4 h-4" />
          </a>
        )}
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-green-600 dark:text-green-400">강점:</span>
          <ul className="mt-1 space-y-1">
            {competitor.strengths.map((strength, index) => (
              <li key={index} className="text-gray-600 dark:text-gray-400 ml-2">
                • {strength}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <span className="font-medium text-red-600 dark:text-red-400">약점:</span>
          <ul className="mt-1 space-y-1">
            {competitor.weaknesses.map((weakness, index) => (
              <li key={index} className="text-gray-600 dark:text-gray-400 ml-2">
                • {weakness}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-600">
          <span className="font-medium text-gray-700 dark:text-gray-300">가격 모델:</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{competitor.pricingModel}</p>
        </div>
      </div>
    </div>
  )

  const TrendCard = ({ trend }: { trend: MarketResearchResult['marketTrends'][0] }) => (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white">{trend.trend}</h4>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            trend.impact === 'high'
              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              : trend.impact === 'medium'
              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
          }`}
        >
          {trend.impact} 영향
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{trend.description}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MagnifyingGlassIcon className="w-6 h-6 text-indigo-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            시장 조사 자동화
          </h3>
        </div>
        <button
          onClick={startResearch}
          disabled={isResearching}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isResearching ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="w-4 h-4" />
          )}
          <span>{isResearching ? '조사 중...' : '시장 조사 시작'}</span>
        </button>
      </div>

      {/* 조사 키워드 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">조사 범위</h4>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            {projectCategory}
          </span>
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* 진행 상황 */}
      {isResearching && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <ArrowPathIcon className="w-5 h-5 text-indigo-500 animate-spin" />
            <span className="font-medium text-indigo-800 dark:text-indigo-200">
              {currentStep}
            </span>
          </div>
          <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${researchProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200">오류 발생</h4>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 조사 결과 */}
      {research && (
        <div className="space-y-8">
          {/* 경쟁사 분석 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>경쟁사 분석</span>
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {research.competitors.map((competitor, index) => (
                <CompetitorCard key={index} competitor={competitor} />
              ))}
            </div>
          </div>

          {/* 시장 트렌드 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <ArrowTrendingUpIcon className="w-5 h-5" />
              <span>시장 트렌드</span>
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {research.marketTrends.map((trend, index) => (
                <TrendCard key={index} trend={trend} />
              ))}
            </div>
          </div>

          {/* 기술 스택 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">추천 기술 스택</h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {research.technologyStack.map((tech, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">{tech.category}</h5>
                  <div className="space-y-2">
                    {tech.technologies.map((technology, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded text-sm mr-2 mb-1"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    채택률: {tech.adoptionRate}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 가격 분석 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <CurrencyDollarIcon className="w-5 h-5" />
              <span>가격 분석</span>
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">시장 가격대</h5>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {research.pricing.averageRange.min.toLocaleString()} - {research.pricing.averageRange.max.toLocaleString()} {research.pricing.averageRange.currency}
                </p>
                <div className="space-y-2">
                  <h6 className="font-medium text-gray-700 dark:text-gray-300">가격 결정 요인:</h6>
                  <ul className="space-y-1">
                    {research.pricing.factorsAffectingPrice.map((factor, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        • {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">추천 가격 전략</h5>
                <p className="font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                  {research.pricing.recommendedPricing.strategy}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {research.pricing.recommendedPricing.justification}
                </p>
              </div>
            </div>
          </div>

          {/* 일정 분석 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <ClockIcon className="w-5 h-5" />
              <span>일정 벤치마킹</span>
            </h4>
            <div className="space-y-3">
              {research.timeline.map((phase, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-16 text-center">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {phase.duration}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">{phase.phase}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 권장사항 */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">권장사항</h4>
            <ul className="space-y-2">
              {research.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}