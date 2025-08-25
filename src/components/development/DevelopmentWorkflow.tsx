'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  LightBulbIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  BeakerIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline'
import CurrentAnalysis from './CurrentAnalysis'
import RequirementManager from './RequirementManager'
import FeatureDefinition from './FeatureDefinition'
import ScreenDesign from './ScreenDesign'
import WBSManager from './WBSManager'
import QAManager from './QAManager'
import ProjectDashboard from './ProjectDashboard'

interface DevelopmentWorkflowProps {
  projectId: string
  projectTitle: string
  projectCategory: string
}

const developmentSteps = [
  {
    id: 'analysis',
    label: '현황 분석',
    icon: ChartPieIcon,
    description: '현재 시스템 분석 및 문제점 도출',
    color: 'blue',
    component: CurrentAnalysis
  },
  {
    id: 'requirements',
    label: '요구사항 관리',
    icon: ClipboardDocumentListIcon,
    description: '기능 및 비기능 요구사항 정의',
    color: 'green',
    component: RequirementManager
  },
  {
    id: 'features',
    label: '기능 정의',
    icon: LightBulbIcon,
    description: '상세 기능 명세 및 API 설계',
    color: 'yellow',
    component: FeatureDefinition
  },
  {
    id: 'design',
    label: '화면 설계',
    icon: ComputerDesktopIcon,
    description: '와이어프레임 및 프로토타입 제작',
    color: 'purple',
    component: ScreenDesign
  },
  {
    id: 'wbs',
    label: 'WBS 관리',
    icon: ChartBarIcon,
    description: '작업 분해 구조 및 일정 관리',
    color: 'indigo',
    component: WBSManager
  },
  {
    id: 'qa',
    label: 'QA 관리',
    icon: BeakerIcon,
    description: '테스트 계획 및 품질 관리',
    color: 'red',
    component: QAManager
  },
  {
    id: 'insights',
    label: '종합 인사이트',
    icon: ChartBarSquareIcon,
    description: '프로젝트 대시보드 및 분석',
    color: 'gray',
    component: ProjectDashboard
  }
]

export default function DevelopmentWorkflow({ 
  projectId, 
  projectTitle, 
  projectCategory 
}: DevelopmentWorkflowProps) {
  const [activeStep, setActiveStep] = useState('analysis')

  const getStepStatus = (stepId: string) => {
    const stepIndex = developmentSteps.findIndex(step => step.id === stepId)
    const currentIndex = developmentSteps.findIndex(step => step.id === activeStep)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'upcoming'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      case 'upcoming': return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
      default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
    }
  }

  const ActiveComponent = developmentSteps.find(step => step.id === activeStep)?.component

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          구축 관리 워크플로우
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {projectTitle} - 프로젝트 실행 단계의 체계적 관리
        </p>
      </div>

      {/* Step Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {developmentSteps.map((step, index) => {
            const IconComponent = step.icon
            const status = getStepStatus(step.id)
            
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  activeStep === step.id
                    ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                    : ''
                } ${getStatusColor(status)}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <IconComponent className="w-6 h-6" />
                    {status === 'completed' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xs font-medium mb-1">{step.label}</h3>
                    <p className="text-xs opacity-75 leading-tight">{step.description}</p>
                  </div>
                  
                  <div className={`w-6 h-1 rounded-full ${
                    status === 'completed' ? 'bg-green-500' :
                    status === 'active' ? 'bg-blue-500' :
                    'bg-gray-300 dark:bg-gray-600'
                  }`} />
                </div>

                {/* Step number */}
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-current rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </button>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 relative">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${((developmentSteps.findIndex(s => s.id === activeStep) + 1) / developmentSteps.length) * 100}%`
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>시작</span>
            <span>{Math.round(((developmentSteps.findIndex(s => s.id === activeStep) + 1) / developmentSteps.length) * 100)}% 완료</span>
            <span>완료</span>
          </div>
        </div>
      </div>

      {/* Active Component */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        {ActiveComponent && <ActiveComponent projectId={projectId} />}
      </motion.div>
    </div>
  )
}