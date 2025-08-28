'use client'

import { useState, useEffect } from 'react'
import {
  CurrencyDollarIcon,
  CalculatorIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface CostCalculatorProps {
  onCalculationComplete: (costBreakdown: CostBreakdown) => void
  initialData?: Partial<CostBreakdown>
}

interface WorkItem {
  id: string
  category: string
  task: string
  hours: number
  hourlyRate: number
  complexity: 'low' | 'medium' | 'high'
  riskFactor: number
}

interface CostBreakdown {
  workItems: WorkItem[]
  summary: {
    totalHours: number
    totalBaseCost: number
    riskAdjustment: number
    finalCost: number
    contingency: number
    grandTotal: number
  }
  phases: {
    name: string
    duration: number
    cost: number
    items: string[]
  }[]
  assumptions: string[]
  exclusions: string[]
  rateCard: {
    role: string
    hourlyRate: number
  }[]
}

const defaultRateCard = [
  { role: '프로젝트 매니저', hourlyRate: 80000 },
  { role: '시니어 개발자', hourlyRate: 70000 },
  { role: '주니어 개발자', hourlyRate: 50000 },
  { role: 'UI/UX 디자이너', hourlyRate: 60000 },
  { role: 'QA 엔지니어', hourlyRate: 55000 },
  { role: '데브옵스 엔지니어', hourlyRate: 75000 },
]

const taskCategories = [
  '기획/분석',
  '디자인',
  '프론트엔드 개발',
  '백엔드 개발',
  '데이터베이스',
  '테스팅',
  '배포/인프라',
  '문서화',
  '프로젝트 관리',
]

export default function CostCalculator({
  onCalculationComplete,
  initialData,
}: CostCalculatorProps) {
  const [workItems, setWorkItems] = useState<WorkItem[]>(initialData?.workItems || [])
  const [rateCard, setRateCard] = useState(initialData?.rateCard || defaultRateCard)
  const [contingencyRate, setContingencyRate] = useState(10)
  const [assumptions, setAssumptions] = useState<string[]>(initialData?.assumptions || [])
  const [exclusions, setExclusions] = useState<string[]>(initialData?.exclusions || [])
  const [newAssumption, setNewAssumption] = useState('')
  const [newExclusion, setNewExclusion] = useState('')
  
  const complexityMultipliers = {
    low: 1.0,
    medium: 1.3,
    high: 1.6,
  }

  const addWorkItem = () => {
    const newItem: WorkItem = {
      id: `item-${Date.now()}`,
      category: taskCategories[0],
      task: '',
      hours: 0,
      hourlyRate: defaultRateCard[1].hourlyRate,
      complexity: 'medium',
      riskFactor: 0,
    }
    setWorkItems(prev => [...prev, newItem])
  }

  const updateWorkItem = (id: string, field: keyof WorkItem, value: any) => {
    setWorkItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const removeWorkItem = (id: string) => {
    setWorkItems(prev => prev.filter(item => item.id !== id))
  }

  const updateRateCard = (role: string, rate: number) => {
    setRateCard(prev =>
      prev.map(item =>
        item.role === role ? { ...item, hourlyRate: rate } : item
      )
    )
  }

  const addAssumption = () => {
    if (newAssumption.trim()) {
      setAssumptions(prev => [...prev, newAssumption.trim()])
      setNewAssumption('')
    }
  }

  const addExclusion = () => {
    if (newExclusion.trim()) {
      setExclusions(prev => [...prev, newExclusion.trim()])
      setNewExclusion('')
    }
  }

  const removeAssumption = (index: number) => {
    setAssumptions(prev => prev.filter((_, i) => i !== index))
  }

  const removeExclusion = (index: number) => {
    setExclusions(prev => prev.filter((_, i) => i !== index))
  }

  const generateAIRecommendations = async () => {
    try {
      const response = await fetch('/api/proposal/generate-wbs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectType: 'web_development', // This could be passed as prop
          scope: 'full_stack_application',
        }),
      })

      if (response.ok) {
        const { workItems: recommendedItems } = await response.json()
        setWorkItems(recommendedItems)
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error)
    }
  }

  const calculateCosts = (): CostBreakdown => {
    const itemsWithCalculatedCosts = workItems.map(item => {
      const complexityAdjustedHours = item.hours * complexityMultipliers[item.complexity]
      const riskAdjustedHours = complexityAdjustedHours * (1 + item.riskFactor / 100)
      const cost = riskAdjustedHours * item.hourlyRate
      
      return {
        ...item,
        adjustedHours: riskAdjustedHours,
        cost,
      }
    })

    const totalHours = itemsWithCalculatedCosts.reduce((sum, item) => sum + item.adjustedHours, 0)
    const totalBaseCost = itemsWithCalculatedCosts.reduce((sum, item) => sum + item.cost, 0)
    const contingency = totalBaseCost * (contingencyRate / 100)
    const grandTotal = totalBaseCost + contingency

    // Group by category for phases
    const phaseGroups = taskCategories.map(category => {
      const categoryItems = itemsWithCalculatedCosts.filter(item => item.category === category)
      const totalCost = categoryItems.reduce((sum, item) => sum + item.cost, 0)
      const totalHours = categoryItems.reduce((sum, item) => sum + item.adjustedHours, 0)
      
      return {
        name: category,
        duration: Math.ceil(totalHours / 40), // Assuming 40 hours per week
        cost: totalCost,
        items: categoryItems.map(item => item.task).filter(Boolean),
      }
    }).filter(phase => phase.cost > 0)

    return {
      workItems,
      summary: {
        totalHours,
        totalBaseCost,
        riskAdjustment: 0,
        finalCost: totalBaseCost,
        contingency,
        grandTotal,
      },
      phases: phaseGroups,
      assumptions,
      exclusions,
      rateCard,
    }
  }

  useEffect(() => {
    const breakdown = calculateCosts()
    onCalculationComplete(breakdown)
  }, [workItems, contingencyRate, assumptions, exclusions, rateCard])

  const breakdown = calculateCosts()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalculatorIcon className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            비용 산정 및 WBS
          </h3>
        </div>
        <button
          onClick={generateAIRecommendations}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          AI 추천 받기
        </button>
      </div>

      {/* Rate Card */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">시간당 요금표</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rateCard.map((rate, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="font-medium text-gray-900 dark:text-white">{rate.role}</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={rate.hourlyRate}
                  onChange={(e) => updateRateCard(rate.role, Number(e.target.value))}
                  className="w-24 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-500">원/시간</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">작업 분해 구조 (WBS)</h4>
          <button
            onClick={addWorkItem}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>작업 추가</span>
          </button>
        </div>

        <div className="space-y-3">
          {workItems.map((item) => (
            <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-center">
                <select
                  value={item.category}
                  onChange={(e) => updateWorkItem(item.id, 'category', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  {taskCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={item.task}
                  onChange={(e) => updateWorkItem(item.id, 'task', e.target.value)}
                  className="lg:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="작업명"
                />

                <input
                  type="number"
                  value={item.hours}
                  onChange={(e) => updateWorkItem(item.id, 'hours', Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-right"
                  placeholder="시간"
                />

                <select
                  value={item.hourlyRate}
                  onChange={(e) => updateWorkItem(item.id, 'hourlyRate', Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  {rateCard.map((rate) => (
                    <option key={rate.role} value={rate.hourlyRate}>
                      {rate.role}
                    </option>
                  ))}
                </select>

                <select
                  value={item.complexity}
                  onChange={(e) => updateWorkItem(item.id, 'complexity', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>

                <input
                  type="number"
                  value={item.riskFactor}
                  onChange={(e) => updateWorkItem(item.id, 'riskFactor', Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-right"
                  placeholder="위험%"
                  min="0"
                  max="100"
                />

                <button
                  onClick={() => removeWorkItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <CurrencyDollarIcon className="w-5 h-5" />
            <span>비용 요약</span>
          </h4>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">총 예상 시간:</span>
              <span className="font-medium">{Math.round(breakdown.summary.totalHours)}시간</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">기본 비용:</span>
              <span className="font-medium">{breakdown.summary.totalBaseCost.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">예비비:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={contingencyRate}
                  onChange={(e) => setContingencyRate(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                  min="0"
                  max="50"
                />
                <span className="text-sm">%</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">예비비 금액:</span>
              <span className="font-medium">{breakdown.summary.contingency.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>총 프로젝트 비용:</span>
              <span className="text-green-600">{breakdown.summary.grandTotal.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5" />
            <span>단계별 분석</span>
          </h4>
          
          <div className="space-y-3">
            {breakdown.phases.map((phase, index) => (
              <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{phase.name}</span>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{phase.duration}주</span>
                    </span>
                    <span>{phase.cost.toLocaleString()}원</span>
                  </div>
                </div>
                {phase.items.length > 0 && (
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assumptions and Exclusions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assumptions */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">전제 조건</h4>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newAssumption}
                onChange={(e) => setNewAssumption(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="전제 조건 추가"
                onKeyPress={(e) => e.key === 'Enter' && addAssumption()}
              />
              <button
                onClick={addAssumption}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
            </div>
            <ul className="space-y-2">
              {assumptions.map((assumption, index) => (
                <li key={index} className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{assumption}</span>
                  <button
                    onClick={() => removeAssumption(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Exclusions */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">제외 사항</h4>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="제외 사항 추가"
                onKeyPress={(e) => e.key === 'Enter' && addExclusion()}
              />
              <button
                onClick={addExclusion}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
            </div>
            <ul className="space-y-2">
              {exclusions.map((exclusion, index) => (
                <li key={index} className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{exclusion}</span>
                  <button
                    onClick={() => removeExclusion(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
              비용 산정 주의사항
            </h4>
            <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
              이 비용 산정은 예상치이며, 실제 프로젝트에서는 요구사항 변경, 기술적 복잡성, 
              외부 요인 등으로 인해 비용이 달라질 수 있습니다. 충분한 예비비를 고려하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}