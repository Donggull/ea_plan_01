'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface WorkflowStep {
  id: string
  name: string
  status: 'completed' | 'in-progress' | 'pending' | 'blocked'
  progress?: number
}

interface WorkflowProgressIndicatorProps {
  steps: WorkflowStep[]
  currentStepId: string
  className?: string
}

export default function WorkflowProgressIndicator({
  steps,
  currentStepId,
  className = '',
}: WorkflowProgressIndicatorProps) {
  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      case 'blocked':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
    }
  }

  const getStatusColor = (
    status: WorkflowStep['status'],
    isCurrent: boolean
  ) => {
    if (isCurrent) {
      return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }

    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      case 'in-progress':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'blocked':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800'
    }
  }

  const getTextColor = (status: WorkflowStep['status'], isCurrent: boolean) => {
    if (isCurrent) {
      return 'text-blue-700 dark:text-blue-300'
    }

    switch (status) {
      case 'completed':
        return 'text-green-700 dark:text-green-300'
      case 'in-progress':
        return 'text-blue-700 dark:text-blue-300'
      case 'blocked':
        return 'text-red-700 dark:text-red-300'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const completedSteps = steps.filter(
    step => step.status === 'completed'
  ).length
  const totalSteps = steps.length
  const overallProgress = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            전체 진행률
          </h3>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {overallProgress}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>완료: {completedSteps}개</span>
          <span>총 {totalSteps}개 단계</span>
        </div>
      </div>

      {/* Step List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStepId
          const isCompleted = step.status === 'completed'

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${getStatusColor(
                step.status,
                isCurrent
              )}`}
            >
              <div className="flex-shrink-0">{getStatusIcon(step.status)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-medium truncate ${getTextColor(step.status, isCurrent)}`}
                  >
                    {step.name}
                  </p>

                  {isCurrent && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">
                      진행 중
                    </span>
                  )}
                </div>

                {/* Step Progress Bar */}
                {step.progress !== undefined && !isCompleted && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                      <motion.div
                        className="bg-blue-500 h-1 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${step.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {step.progress}% 완료
                    </span>
                  </div>
                )}
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[22px] mt-8 w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
