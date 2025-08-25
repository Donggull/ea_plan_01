'use client'

import { useState } from 'react'
import {
  CheckCircleIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline'
import RFPUpload from './RFPUpload'
import RFPAnalysis from './RFPAnalysis'
import MarketResearch from './MarketResearch'
import ProposalBuilder from './ProposalBuilder'
import CostCalculator from './CostCalculator'
import type { RFPAnalysisResult } from './RFPUpload'
import type { MarketResearchResult } from './MarketResearch'

interface ProposalWorkflowProps {
  projectId: string
  projectTitle: string
  projectCategory: string
}

type WorkflowStep = 'upload' | 'analysis' | 'research' | 'proposal' | 'cost' | 'complete'

export default function ProposalWorkflow({
  projectId,
  projectTitle,
  projectCategory,
}: ProposalWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload')
  const [rfpFile, setRfpFile] = useState<File | null>(null)
  const [rfpAnalysis, setRfpAnalysis] = useState<RFPAnalysisResult | null>(null)
  const [marketResearch, setMarketResearch] = useState<MarketResearchResult | null>(null)
  const [proposal, setProposal] = useState<any>(null)
  const [costBreakdown, setCostBreakdown] = useState<any>(null)

  const steps = [
    {
      id: 'upload',
      title: 'RFP 업로드',
      description: '제안 요청서 업로드 및 분석',
      icon: DocumentTextIcon,
      completed: rfpFile !== null,
    },
    {
      id: 'analysis',
      title: 'RFP 분석',
      description: '요구사항 추출 및 검토',
      icon: PencilIcon,
      completed: rfpAnalysis !== null,
    },
    {
      id: 'research',
      title: '시장 조사',
      description: '경쟁사 분석 및 기술 트렌드',
      icon: MagnifyingGlassIcon,
      completed: marketResearch !== null,
    },
    {
      id: 'proposal',
      title: '제안서 작성',
      description: 'AI 지원 제안서 생성',
      icon: DocumentTextIcon,
      completed: proposal !== null,
    },
    {
      id: 'cost',
      title: '비용 산정',
      description: 'WBS 기반 비용 계산',
      icon: CalculatorIcon,
      completed: costBreakdown !== null,
    },
  ]

  const handleRFPUpload = (file: File, analysis?: RFPAnalysisResult) => {
    setRfpFile(file)
    if (analysis) {
      setRfpAnalysis(analysis)
      setCurrentStep('research')
    } else {
      setCurrentStep('analysis')
    }
  }

  const handleAnalysisComplete = (analysis: RFPAnalysisResult) => {
    setRfpAnalysis(analysis)
    setCurrentStep('research')
  }

  const handleResearchComplete = (research: MarketResearchResult) => {
    setMarketResearch(research)
    setCurrentStep('proposal')
  }

  const handleProposalComplete = (proposalDoc: any) => {
    setProposal(proposalDoc)
    setCurrentStep('cost')
  }

  const handleCostCalculationComplete = (breakdown: any) => {
    setCostBreakdown(breakdown)
    // Auto-save to database or local storage here
  }

  const canProceedToStep = (stepId: WorkflowStep): boolean => {
    switch (stepId) {
      case 'upload':
        return true
      case 'analysis':
        return rfpFile !== null
      case 'research':
        return rfpAnalysis !== null
      case 'proposal':
        return marketResearch !== null
      case 'cost':
        return proposal !== null
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <RFPUpload
            onUpload={handleRFPUpload}
            projectId={projectId}
          />
        )
      
      case 'analysis':
        return rfpAnalysis ? (
          <RFPAnalysis
            analysis={rfpAnalysis}
            onSave={handleAnalysisComplete}
            onReanalyze={() => setCurrentStep('upload')}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">RFP 분석 중...</p>
          </div>
        )
      
      case 'research':
        return (
          <MarketResearch
            projectCategory={projectCategory}
            keywords={[projectTitle, ...(rfpAnalysis?.keyPoints || [])]}
            onResearchComplete={handleResearchComplete}
          />
        )
      
      case 'proposal':
        return (
          <ProposalBuilder
            projectTitle={projectTitle}
            rfpAnalysis={rfpAnalysis}
            marketResearch={marketResearch}
            onSave={handleProposalComplete}
          />
        )
      
      case 'cost':
        return (
          <CostCalculator
            onCalculationComplete={handleCostCalculationComplete}
            initialData={costBreakdown}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          제안 진행 워크플로우
        </h2>
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = step.completed
            const canAccess = canProceedToStep(step.id as WorkflowStep)

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => canAccess && setCurrentStep(step.id as WorkflowStep)}
                  className={`relative flex flex-col items-center p-4 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                      : isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 hover:bg-green-100 dark:hover:bg-green-900/30'
                      : canAccess
                      ? 'hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent'
                      : 'opacity-50 cursor-not-allowed border-2 border-transparent'
                  } ${canAccess ? 'cursor-pointer' : ''}`}
                  disabled={!canAccess}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    isCompleted
                      ? 'bg-green-500'
                      : isActive
                      ? 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  } mb-2`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6 text-white" />
                    ) : (
                      <StepIcon className={`w-6 h-6 ${
                        isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className={`text-sm font-medium ${
                      isActive
                        ? 'text-blue-700 dark:text-blue-300'
                        : isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                  </div>
                </button>

                {index < steps.length - 1 && (
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 mx-2" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        {renderStepContent()}
      </div>

      {/* Progress Summary */}
      {costBreakdown && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            제안 프로세스 완료 요약
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">프로젝트 정보</h4>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-500">프로젝트:</span> {projectTitle}</p>
                <p><span className="text-gray-500">클라이언트:</span> {rfpAnalysis?.client}</p>
                <p><span className="text-gray-500">마감일:</span> {rfpAnalysis?.deadline}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">비용 정보</h4>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-500">총 예상 시간:</span> {Math.round(costBreakdown.summary.totalHours)}시간</p>
                <p><span className="text-gray-500">기본 비용:</span> {costBreakdown.summary.totalBaseCost.toLocaleString()}원</p>
                <p><span className="text-gray-500 font-semibold">총 비용:</span> {costBreakdown.summary.grandTotal.toLocaleString()}원</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">완료 현황</h4>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-500">경쟁사 분석:</span> {marketResearch?.competitors.length || 0}개 업체</p>
                <p><span className="text-gray-500">제안서 섹션:</span> {proposal?.sections.length || 0}개 섹션</p>
                <p><span className="text-gray-500">작업 항목:</span> {costBreakdown.workItems.length}개</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}