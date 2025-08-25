'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  FunnelIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  BugAntIcon,
  StarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  FireIcon,
  TrophyIcon,
  LightBulbIcon,
  CogIcon,
} from '@heroicons/react/24/outline'

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom'
  category: 'performance' | 'status' | 'financial' | 'quality'
  sections: ReportSection[]
  isDefault: boolean
  createdAt: string
  lastUsed?: string
}

interface ReportSection {
  id: string
  title: string
  type: 'metrics' | 'chart' | 'table' | 'text' | 'list'
  configuration: Record<string, unknown>
  order: number
  isVisible: boolean
}

interface GeneratedReport {
  id: string
  title: string
  templateId: string
  templateName: string
  generatedAt: string
  period: {
    startDate: string
    endDate: string
  }
  status: 'generating' | 'completed' | 'failed'
  fileUrl?: string
  fileSize?: number
  sections: ReportSectionData[]
  summary: ReportSummary
}

interface ReportSectionData {
  sectionId: string
  title: string
  type: string
  data: Record<string, unknown>
  insights?: string[]
  warnings?: string[]
}

interface ReportSummary {
  keyMetrics: {
    metric: string
    value: number | string
    change: number
    trend: 'up' | 'down' | 'stable'
  }[]
  highlights: string[]
  concerns: string[]
  recommendations: string[]
}

interface ReportFilter {
  dateRange: 'last_week' | 'last_month' | 'last_quarter' | 'custom'
  startDate?: string
  endDate?: string
  teams: string[]
  projects: string[]
  categories: string[]
}

// Mock data
const mockTemplates: ReportTemplate[] = [
  {
    id: 'tpl-001',
    name: '주간 성과 리포트',
    description: '주간 팀 성과 및 프로젝트 진행 상황 요약',
    type: 'weekly',
    category: 'performance',
    sections: [
      {
        id: 'sec-001',
        title: '핵심 지표',
        type: 'metrics',
        configuration: {},
        order: 1,
        isVisible: true,
      },
      {
        id: 'sec-002',
        title: '팀별 성과',
        type: 'chart',
        configuration: {},
        order: 2,
        isVisible: true,
      },
      {
        id: 'sec-003',
        title: '프로젝트 현황',
        type: 'table',
        configuration: {},
        order: 3,
        isVisible: true,
      },
      {
        id: 'sec-004',
        title: '주요 이슈',
        type: 'list',
        configuration: {},
        order: 4,
        isVisible: true,
      },
    ],
    isDefault: true,
    createdAt: '2025-01-01T00:00:00Z',
    lastUsed: '2025-01-12T14:00:00Z',
  },
  {
    id: 'tpl-002',
    name: '월간 종합 리포트',
    description: '월간 전체 성과 및 재무 현황 분석',
    type: 'monthly',
    category: 'status',
    sections: [
      {
        id: 'sec-005',
        title: '월간 요약',
        type: 'text',
        configuration: {},
        order: 1,
        isVisible: true,
      },
      {
        id: 'sec-006',
        title: '재무 현황',
        type: 'chart',
        configuration: {},
        order: 2,
        isVisible: true,
      },
      {
        id: 'sec-007',
        title: '품질 지표',
        type: 'metrics',
        configuration: {},
        order: 3,
        isVisible: true,
      },
      {
        id: 'sec-008',
        title: '향후 계획',
        type: 'list',
        configuration: {},
        order: 4,
        isVisible: true,
      },
    ],
    isDefault: true,
    createdAt: '2025-01-01T00:00:00Z',
    lastUsed: '2025-01-10T10:00:00Z',
  },
  {
    id: 'tpl-003',
    name: '프로젝트 상태 리포트',
    description: '개별 프로젝트 진행 상황 및 위험 요소 분석',
    type: 'custom',
    category: 'status',
    sections: [
      {
        id: 'sec-009',
        title: '프로젝트 개요',
        type: 'text',
        configuration: {},
        order: 1,
        isVisible: true,
      },
      {
        id: 'sec-010',
        title: '일정 현황',
        type: 'chart',
        configuration: {},
        order: 2,
        isVisible: true,
      },
      {
        id: 'sec-011',
        title: '위험 요소',
        type: 'table',
        configuration: {},
        order: 3,
        isVisible: true,
      },
    ],
    isDefault: false,
    createdAt: '2025-01-05T00:00:00Z',
  },
]

const mockReports: GeneratedReport[] = [
  {
    id: 'rpt-001',
    title: '2025년 1월 2주차 성과 리포트',
    templateId: 'tpl-001',
    templateName: '주간 성과 리포트',
    generatedAt: '2025-01-12T14:00:00Z',
    period: {
      startDate: '2025-01-06',
      endDate: '2025-01-12',
    },
    status: 'completed',
    fileUrl: '/reports/weekly-2025-01-w2.pdf',
    fileSize: 1.2 * 1024 * 1024, // 1.2MB
    sections: [
      {
        sectionId: 'sec-001',
        title: '핵심 지표',
        type: 'metrics',
        data: {
          completionRate: 87.5,
          productivity: 92,
          qualityScore: 4.3,
          customerSatisfaction: 4.2,
        },
        insights: [
          '완료율이 전주 대비 5% 향상됨',
          '생산성 지표가 목표치를 초과 달성',
        ],
        warnings: ['고객 만족도가 소폭 하락 추세'],
      },
      {
        sectionId: 'sec-002',
        title: '팀별 성과',
        type: 'chart',
        data: {
          teams: [
            { name: '프론트엔드팀', score: 85, tasks: 34 },
            { name: '백엔드팀', score: 78, tasks: 28 },
            { name: '디자인팀', score: 92, tasks: 22 },
          ],
        },
      },
    ],
    summary: {
      keyMetrics: [
        { metric: 'Task Completion', value: '87.5%', change: 5.2, trend: 'up' },
        { metric: 'Team Productivity', value: 92, change: 3.1, trend: 'up' },
        { metric: 'Bug Resolution', value: '95%', change: -2.1, trend: 'down' },
        {
          metric: 'Customer Rating',
          value: '4.2/5.0',
          change: -0.1,
          trend: 'down',
        },
      ],
      highlights: [
        '프론트엔드팀이 목표 대비 110% 성과 달성',
        '신규 기능 3개 성공적 배포 완료',
        '코드 리뷰 효율성 20% 향상',
      ],
      concerns: [
        '백엔드 API 지연 이슈 지속',
        '테스트 커버리지가 목표치 미달',
        '고객 지원 응답 시간 증가',
      ],
      recommendations: [
        'API 성능 최적화를 위한 전담 태스크포스 구성',
        '테스트 자동화 도구 도입 검토',
        '고객 지원팀 리소스 추가 배정 고려',
      ],
    },
  },
  {
    id: 'rpt-002',
    title: '2025년 1월 월간 종합 리포트',
    templateId: 'tpl-002',
    templateName: '월간 종합 리포트',
    generatedAt: '2025-01-10T10:00:00Z',
    period: {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    },
    status: 'generating',
    sections: [],
    summary: {
      keyMetrics: [],
      highlights: [],
      concerns: [],
      recommendations: [],
    },
  },
]

export default function OperationReport({ projectId }: { projectId: string }) {
  const [templates, setTemplates] = useState<ReportTemplate[]>(mockTemplates)
  const [reports, setReports] = useState<GeneratedReport[]>(mockReports)
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null)
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(
    null
  )
  const [viewMode, setViewMode] = useState<'templates' | 'reports' | 'preview'>(
    'reports'
  )
  const [filter, setFilter] = useState<ReportFilter>({
    dateRange: 'last_month',
    teams: [],
    projects: [],
    categories: [],
  })
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  // Generate report
  const generateReport = (
    templateId: string,
    customPeriod?: { startDate: string; endDate: string }
  ) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    const newReport: GeneratedReport = {
      id: `rpt-${Date.now()}`,
      title: `${template.name} - ${new Date().toLocaleDateString()}`,
      templateId: template.id,
      templateName: template.name,
      generatedAt: new Date().toISOString(),
      period: customPeriod || {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      status: 'generating',
      sections: [],
      summary: {
        keyMetrics: [],
        highlights: [],
        concerns: [],
        recommendations: [],
      },
    }

    setReports(prev => [newReport, ...prev])

    // Simulate report generation
    setTimeout(() => {
      setReports(prev =>
        prev.map(r =>
          r.id === newReport.id
            ? {
                ...r,
                status: 'completed',
                fileUrl: `/reports/${newReport.id}.pdf`,
                fileSize: Math.random() * 2000000,
              }
            : r
        )
      )
    }, 3000)

    setShowGenerateModal(false)
  }

  // Delete report
  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId))
    if (selectedReport?.id === reportId) {
      setSelectedReport(null)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get trend icon and color
  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return (
        <ArrowTrendingUpIcon
          className={`w-4 h-4 ${change > 0 ? 'text-green-500' : 'text-red-500'}`}
        />
      )
    } else if (trend === 'down') {
      return (
        <ArrowTrendingDownIcon
          className={`w-4 h-4 ${change < 0 ? 'text-red-500' : 'text-green-500'}`}
        />
      )
    }
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />
  }

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Report Templates
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {templates.length} templates available
          </p>
        </div>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {template.description}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    template.type === 'weekly'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : template.type === 'monthly'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : template.type === 'quarterly'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}
                >
                  {template.type}
                </span>
                {template.isDefault && (
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span>{template.sections.length} sections</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{template.category}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {template.lastUsed ? (
                    <span>
                      Last used:{' '}
                      {new Date(template.lastUsed).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>Never used</span>
                  )}
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    generateReport(template.id)
                  }}
                  className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-sm"
                >
                  Generate
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generated Reports
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {reports.filter(r => r.status === 'completed').length} completed,{' '}
            {reports.filter(r => r.status === 'generating').length} in progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters:
            </span>
          </div>
          <select
            value={filter.dateRange}
            onChange={e =>
              setFilter(prev => ({
                ...prev,
                dateRange: e.target.value as
                  | 'last_week'
                  | 'last_month'
                  | 'last_quarter'
                  | 'custom',
              }))
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map(report => (
          <motion.div
            key={report.id}
            whileHover={{ scale: 1.01 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {report.title}
                </h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Template: {report.templateName}</span>
                  <span>
                    {report.period.startDate} → {report.period.endDate}
                  </span>
                  <span>
                    Generated:{' '}
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    report.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : report.status === 'generating'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {report.status}
                </span>
                {report.status === 'generating' && (
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                )}
              </div>
            </div>

            {report.status === 'completed' && (
              <>
                {/* Key Metrics Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {report.summary.keyMetrics.map((metric, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {typeof metric.value === 'number'
                            ? metric.value.toLocaleString()
                            : metric.value}
                        </span>
                        {getTrendIcon(metric.trend, metric.change)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {metric.metric}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          metric.change > 0
                            ? 'text-green-600 dark:text-green-400'
                            : metric.change < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {metric.change > 0 ? '+' : ''}
                        {metric.change}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrophyIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h5 className="font-medium text-green-900 dark:text-green-100">
                        Highlights
                      </h5>
                    </div>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      {report.summary.highlights
                        .slice(0, 3)
                        .map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <h5 className="font-medium text-red-900 dark:text-red-100">
                        Concerns
                      </h5>
                    </div>
                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                      {report.summary.concerns
                        .slice(0, 3)
                        .map((concern, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            {concern}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <LightBulbIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h5 className="font-medium text-blue-900 dark:text-blue-100">
                        Recommendations
                      </h5>
                    </div>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      {report.summary.recommendations
                        .slice(0, 3)
                        .map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {report.fileSize && (
                  <span>File size: {formatFileSize(report.fileSize)}</span>
                )}
              </div>
              <div className="flex gap-2">
                {report.status === 'completed' && (
                  <>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-sm flex items-center gap-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View
                    </button>
                    <button className="px-3 py-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-sm flex items-center gap-1">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </button>
                    <button className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm flex items-center gap-1">
                      <ShareIcon className="w-4 h-4" />
                      Share
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteReport(report.id)}
                  className="px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-sm flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderReportPreview = () => {
    if (!selectedReport || selectedReport.status !== 'completed') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Select a completed report to preview
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        {/* Report Header */}
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {selectedReport.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Period: {selectedReport.period.startDate} to{' '}
            {selectedReport.period.endDate}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generated on {new Date(selectedReport.generatedAt).toLocaleString()}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Executive Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {selectedReport.summary.keyMetrics.map((metric, index) => (
              <div
                key={index}
                className="text-center bg-white dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {typeof metric.value === 'number'
                      ? metric.value.toLocaleString()
                      : metric.value}
                  </span>
                  {getTrendIcon(metric.trend, metric.change)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {metric.metric}
                </div>
                <div
                  className={`text-sm font-medium ${
                    metric.change > 0
                      ? 'text-green-600 dark:text-green-400'
                      : metric.change < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}% vs previous period
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                <TrophyIcon className="w-4 h-4" />
                Key Achievements
              </h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                {selectedReport.summary.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Areas of Concern
              </h4>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-2">
                {selectedReport.summary.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {concern}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <LightBulbIcon className="w-4 h-4" />
                Recommendations
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                {selectedReport.summary.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <LightBulbIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Report Sections */}
        {selectedReport.sections.map(section => (
          <div
            key={section.sectionId}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {section.title}
            </h3>

            {section.type === 'metrics' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(section.data).map(([key, value]) => (
                  <div
                    key={key}
                    className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {typeof value === 'number'
                        ? value.toLocaleString()
                        : String(value)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'chart' && (
              <div className="space-y-4">
                {section.data.teams && (
                  <div className="space-y-3">
                    {(
                      section.data.teams as Array<{
                        name: string
                        score: number
                        tasks: number
                      }>
                    ).map((team, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                            {team.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {team.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {team.tasks} tasks completed
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {team.score}
                          </span>
                          <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${team.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {section.insights && section.insights.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Insights
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  {section.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            운영 리포트
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            주간/월간 리포트 생성 및 관리
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedReport && viewMode === 'preview' && (
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                <PrinterIcon className="w-4 h-4" />
                Print
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            {
              key: 'reports',
              label: 'Reports',
              icon: DocumentTextIcon,
              count: reports.length,
            },
            { key: 'templates', label: 'Templates', icon: CogIcon },
            { key: 'preview', label: 'Preview', icon: EyeIcon },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() =>
                setViewMode(tab.key as 'templates' | 'reports' | 'preview')
              }
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm relative ${
                viewMode === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.count && (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'templates' && renderTemplatesTab()}
          {viewMode === 'reports' && renderReportsTab()}
          {viewMode === 'preview' && renderReportPreview()}
        </motion.div>
      </AnimatePresence>

      {/* Generate Report Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Generate New Report
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Template
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => generateReport(templates[0].id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
