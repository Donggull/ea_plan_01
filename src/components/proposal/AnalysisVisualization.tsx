'use client'

import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2'
import {
  ChartBarIcon,
  CloudIcon,
  ClockIcon,
  CogIcon,
} from '@heroicons/react/24/outline'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
)

interface AnalysisMetrics {
  complexity: 'low' | 'medium' | 'high' | 'very_high'
  confidence: number
  estimatedEffort: {
    hours: number
    uncertainty: number
  }
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  technologyStack: {
    category: string
    technologies: string[]
    confidence: number
  }[]
  keywordAnalysis: {
    functional: { keyword: string; frequency: number; importance: number }[]
    technical: { keyword: string; frequency: number; importance: number }[]
    business: { keyword: string; frequency: number; importance: number }[]
  }
  timeEstimation: {
    phases: {
      name: string
      duration: number
      description: string
    }[]
    totalWeeks: number
    confidenceLevel: number
  }
  domainClassification: {
    category: string
    confidence: number
    indicators: string[]
  }
  requirementCategories: {
    functional: number
    technical: number
    business: number
    design: number
    security: number
  }
}

interface AnalysisVisualizationProps {
  analysisData: AnalysisMetrics
  projectName?: string
}

export default function AnalysisVisualization({
  analysisData,
  projectName = '프로젝트',
}: AnalysisVisualizationProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'keywords' | 'complexity' | 'timeline'
  >('overview')

  // 요구사항 분류별 차트 데이터
  const requirementChartData = {
    labels: [
      '기능 요구사항',
      '기술 요구사항',
      '비즈니스 요구사항',
      '디자인 요구사항',
      '보안 요구사항',
    ],
    datasets: [
      {
        label: '요구사항 수',
        data: [
          analysisData.requirementCategories.functional,
          analysisData.requirementCategories.technical,
          analysisData.requirementCategories.business,
          analysisData.requirementCategories.design,
          analysisData.requirementCategories.security,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  // 복잡도 지표 레이더 차트 데이터
  const complexityRadarData = {
    labels: [
      '기술 복잡도',
      '비즈니스 복잡도',
      '규모',
      '위험도',
      '시간 압박',
      '리소스 요구도',
    ],
    datasets: [
      {
        label: '복잡도 지표',
        data: [
          (analysisData.technologyStack.reduce(
            (acc, tech) => acc + tech.confidence,
            0
          ) /
            analysisData.technologyStack.length) *
            5,
          (analysisData.keywordAnalysis.business.reduce(
            (acc, kw) => acc + kw.importance,
            0
          ) /
            analysisData.keywordAnalysis.business.length) *
            5,
          analysisData.estimatedEffort.hours / 200, // 시간 기준 규모
          analysisData.riskLevel === 'critical'
            ? 5
            : analysisData.riskLevel === 'high'
              ? 4
              : analysisData.riskLevel === 'medium'
                ? 3
                : 2,
          analysisData.timeEstimation.totalWeeks > 20
            ? 5
            : analysisData.timeEstimation.totalWeeks > 15
              ? 4
              : 3,
          Math.ceil(analysisData.estimatedEffort.hours / 40), // 인력 수 기준
        ],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  }

  // 타임라인 차트 데이터
  const timelineData = {
    labels: analysisData.timeEstimation.phases.map(phase => phase.name),
    datasets: [
      {
        label: '예상 기간 (주)',
        data: analysisData.timeEstimation.phases.map(phase => phase.duration),
        fill: false,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        tension: 0.1,
      },
    ],
  }

  // 기술 스택 분포 도넛 차트
  const techStackData = {
    labels: analysisData.technologyStack.map(tech => tech.category),
    datasets: [
      {
        data: analysisData.technologyStack.map(tech => tech.confidence * 100),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${projectName} 분석 결과`,
      },
    },
  }

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      r: {
        angleLines: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 5,
      },
    },
  }

  // 키워드 클라우드 컴포넌트 (간소화된 버전)
  const KeywordCloud = ({
    keywords,
    title,
    color,
  }: {
    keywords: { keyword: string; frequency: number; importance: number }[]
    title: string
    color: string
  }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {keywords.slice(0, 15).map((kw, index) => (
          <span
            key={index}
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}
            style={{
              fontSize: `${Math.max(0.75, kw.importance / 5)}rem`,
            }}
          >
            {kw.keyword}
            <span className="ml-1 text-xs opacity-75">({kw.frequency})</span>
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-6">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: '개요', icon: ChartBarIcon },
            { id: 'keywords', label: '키워드 분석', icon: CloudIcon },
            { id: 'complexity', label: '복잡도 분석', icon: CogIcon },
            { id: 'timeline', label: '일정 분석', icon: ClockIcon },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as
                      | 'overview'
                      | 'keywords'
                      | 'complexity'
                      | 'timeline'
                  )
                }
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 요구사항 분류 차트 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              요구사항 분류
            </h3>
            <Bar data={requirementChartData} options={chartOptions} />
          </div>

          {/* 기술 스택 분포 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              기술 스택 분포
            </h3>
            <Doughnut data={techStackData} options={chartOptions} />
          </div>

          {/* 프로젝트 핵심 지표 */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              프로젝트 핵심 지표
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analysisData.complexity.toUpperCase()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  복잡도
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analysisData.estimatedEffort.hours}h
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  예상 시간
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {analysisData.timeEstimation.totalWeeks}주
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  예상 기간
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {analysisData.riskLevel.toUpperCase()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  위험도
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'keywords' && (
        <div className="space-y-6">
          <KeywordCloud
            keywords={analysisData.keywordAnalysis.functional}
            title="기능 키워드"
            color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          />
          <KeywordCloud
            keywords={analysisData.keywordAnalysis.technical}
            title="기술 키워드"
            color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          />
          <KeywordCloud
            keywords={analysisData.keywordAnalysis.business}
            title="비즈니스 키워드"
            color="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          />
        </div>
      )}

      {activeTab === 'complexity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 복잡도 레이더 차트 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              복잡도 분석
            </h3>
            <Radar data={complexityRadarData} options={radarOptions} />
          </div>

          {/* 위험 요소 및 고려사항 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              위험 요소 분석
            </h3>
            <div className="space-y-4">
              <div
                className={`p-3 rounded-lg ${
                  analysisData.riskLevel === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : analysisData.riskLevel === 'high'
                      ? 'bg-orange-50 dark:bg-orange-900/20'
                      : analysisData.riskLevel === 'medium'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20'
                        : 'bg-green-50 dark:bg-green-900/20'
                }`}
              >
                <div className="text-sm font-medium">
                  전체 위험도: {analysisData.riskLevel.toUpperCase()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  불확실성: {analysisData.estimatedEffort.uncertainty}%
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  도메인 분류
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {analysisData.domainClassification.category} (
                  {analysisData.domainClassification.confidence}% 신뢰도)
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {analysisData.domainClassification.indicators.map(
                    (indicator, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                      >
                        {indicator}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* 프로젝트 타임라인 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              프로젝트 단계별 일정
            </h3>
            <Line data={timelineData} options={chartOptions} />
          </div>

          {/* 단계별 상세 정보 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              단계별 상세 일정
            </h3>
            <div className="space-y-4">
              {analysisData.timeEstimation.phases.map((phase, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {phase.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {phase.description}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {phase.duration}주
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                총 예상 기간: {analysisData.timeEstimation.totalWeeks}주
                (신뢰도: {analysisData.timeEstimation.confidenceLevel}%)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
