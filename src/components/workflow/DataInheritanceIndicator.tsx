'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface DataInheritanceIndicatorProps {
  projectId: string
  currentWorkflow: 'proposal' | 'development' | 'operation'
  hasInheritedData: boolean
  canInherit: boolean
  onInherit?: () => void
}

export default function DataInheritanceIndicator({
  currentWorkflow,
  hasInheritedData,
  canInherit,
  onInherit,
}: DataInheritanceIndicatorProps) {
  const getWorkflowName = (workflow: string) => {
    switch (workflow) {
      case 'proposal':
        return '제안 진행'
      case 'development':
        return '구축 관리'
      case 'operation':
        return '운영 관리'
      default:
        return workflow
    }
  }

  const getSourceWorkflow = () => {
    switch (currentWorkflow) {
      case 'development':
        return 'proposal'
      case 'operation':
        return 'development'
      default:
        return null
    }
  }

  const sourceWorkflow = getSourceWorkflow()

  if (!sourceWorkflow) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getWorkflowName(sourceWorkflow)}
              </span>
              <ArrowRightIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {getWorkflowName(currentWorkflow)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {hasInheritedData ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                    데이터 연동됨
                  </span>
                </>
              ) : canInherit ? (
                <>
                  <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                    데이터 연동 가능
                  </span>
                </>
              ) : (
                <>
                  <ExclamationCircleIcon className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                    선행 작업 필요
                  </span>
                </>
              )}
            </div>
          </div>

          {canInherit && !hasInheritedData && onInherit && (
            <button
              onClick={onInherit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              데이터 연동
            </button>
          )}
        </div>

        {/* Description */}
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {hasInheritedData ? (
            <p>
              {getWorkflowName(sourceWorkflow)} 단계의 데이터가 현재
              워크플로우에 연동되어 있습니다. 이전 단계에서 작성된 요구사항과
              분석 결과를 기반으로 작업을 진행할 수 있습니다.
            </p>
          ) : canInherit ? (
            <p>
              {getWorkflowName(sourceWorkflow)} 단계의 데이터를 현재
              워크플로우로 연동할 수 있습니다. 연동하면 이전 단계에서 작성된
              데이터를 기반으로 더 효율적으로 작업할 수 있습니다.
            </p>
          ) : (
            <p>
              {getWorkflowName(sourceWorkflow)} 단계의 작업을 먼저 완료해주세요.
              선행 단계의 데이터가 있어야 현재 워크플로우로 데이터를 연동할 수
              있습니다.
            </p>
          )}
        </div>

        {/* Data inheritance benefits */}
        {canInherit && (
          <div className="mt-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              연동되는 데이터:
            </p>
            <div className="flex flex-wrap gap-2">
              {currentWorkflow === 'development' && (
                <>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                    RFP 요구사항
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-md">
                    시장 조사 결과
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-md">
                    페르소나 분석
                  </span>
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-md">
                    제안서 내용
                  </span>
                </>
              )}
              {currentWorkflow === 'operation' && (
                <>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                    사용자 스토리
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-md">
                    WBS 작업
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-md">
                    QA 계획
                  </span>
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-md">
                    기술 아키텍처
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
