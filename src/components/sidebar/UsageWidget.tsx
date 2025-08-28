'use client'

import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { ApiUsageTracker } from '@/services/apiUsageTracker'

interface UsageWidgetProps {
  projectId?: string
  className?: string
}

export default function UsageWidget({ projectId, className = '' }: UsageWidgetProps) {
  const [sessionUsage, setSessionUsage] = useState({
    byModel: new Map(),
    total: {
      tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
    }
  })
  const [monthlyUsage, setMonthlyUsage] = useState({
    currentMonth: {
      tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
    },
    previousMonth: {
      tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
    },
    trend: 'stable' as 'up' | 'down' | 'stable'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  const usageTracker = ApiUsageTracker.getInstance()

  useEffect(() => {
    loadUsageData()
    
    // 30초마다 업데이트
    const interval = setInterval(loadUsageData, 30000)
    
    return () => clearInterval(interval)
  }, [projectId])

  const loadUsageData = async () => {
    try {
      setIsLoading(true)
      
      // 세션 사용량 로드
      const sessionData = usageTracker.getSessionUsage()
      setSessionUsage(sessionData)
      
      // 월간 사용량 로드
      const monthlyData = await usageTracker.getUserMonthlyUsage()
      setMonthlyUsage(monthlyData)
    } catch (error) {
      console.error('Failed to load usage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCost = (cost: number): string => {
    if (cost < 0.01) return '< $0.01'
    return `$${cost.toFixed(3)}`
  }

  const formatTokens = (tokens: number): string => {
    if (tokens < 1000) return tokens.toString()
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`
    return `${(tokens / 1000000).toFixed(1)}M`
  }

  const getUsageColor = (cost: number): string => {
    if (cost < 1) return 'text-green-600 dark:text-green-400'
    if (cost < 5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getTrendIcon = () => {
    switch (monthlyUsage.trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  if (isLoading && sessionUsage.total.cost.totalCost === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              AI 사용량
            </span>
          </div>
          {sessionUsage.total.cost.totalCost > 0 && (
            <span className={`text-xs font-medium ${getUsageColor(sessionUsage.total.cost.totalCost)}`}>
              {formatCost(sessionUsage.total.cost.totalCost)}
            </span>
          )}
        </div>
        
        {/* 세션 요약 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>세션 토큰:</span>
            <span>{formatTokens(sessionUsage.total.tokens.totalTokens)}</span>
          </div>
          
          {monthlyUsage.currentMonth.cost.totalCost > 0 && (
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>이번 달:</span>
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <span>{formatCost(monthlyUsage.currentMonth.cost.totalCost)}</span>
              </div>
            </div>
          )}
        </div>
      </button>

      {/* 확장된 상세 정보 */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
          {/* 세션별 모델 사용량 */}
          {sessionUsage.byModel.size > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <ChartBarIcon className="h-3 w-3 mr-1" />
                세션 사용량
              </h4>
              <div className="space-y-1">
                {Array.from(sessionUsage.byModel.entries()).map(([model, usage]) => (
                  <div key={model} className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {model}:
                    </span>
                    <div className="text-right">
                      <div className={`font-medium ${getUsageColor((usage as any).cost.totalCost)}`}>
                        {formatCost((usage as any).cost.totalCost)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-xs">
                        {formatTokens((usage as any).tokens.totalTokens)} 토큰
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 월간 통계 */}
          {monthlyUsage.currentMonth.cost.totalCost > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                월간 통계
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">이번 달:</span>
                  <div className="text-right">
                    <div className={`font-medium ${getUsageColor(monthlyUsage.currentMonth.cost.totalCost)}`}>
                      {formatCost(monthlyUsage.currentMonth.cost.totalCost)}
                    </div>
                    <div className="text-gray-500 dark:text-gray-500 text-xs">
                      {formatTokens(monthlyUsage.currentMonth.tokens.totalTokens)} 토큰
                    </div>
                  </div>
                </div>
                
                {monthlyUsage.previousMonth.cost.totalCost > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">지난 달:</span>
                    <div className="text-right">
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        {formatCost(monthlyUsage.previousMonth.cost.totalCost)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-xs">
                        {formatTokens(monthlyUsage.previousMonth.tokens.totalTokens)} 토큰
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 트렌드 표시 */}
                {monthlyUsage.trend !== 'stable' && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">추세:</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon()}
                      <span className={
                        monthlyUsage.trend === 'up' 
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }>
                        {monthlyUsage.trend === 'up' ? '증가' : '감소'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 비용 경고 */}
          {sessionUsage.total.cost.totalCost > 5 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                    높은 사용량 감지
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    이번 세션에서 ${sessionUsage.total.cost.totalCost.toFixed(2)} 사용되었습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          {sessionUsage.total.cost.totalCost === 0 && (
            <div className="text-center py-2">
              <SparklesIcon className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI와 대화를 시작하면<br />사용량이 표시됩니다
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}