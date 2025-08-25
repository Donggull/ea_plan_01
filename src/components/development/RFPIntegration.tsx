'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

interface RFPRequirement {
  id: string
  title: string
  description: string
  requirement_type: 'functional' | 'non_functional' | 'business' | 'technical' | 'constraint'
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  acceptance_criteria: string[]
  business_value: number
  estimated_effort: number
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  status: 'identified' | 'analyzed' | 'approved' | 'in_progress' | 'completed' | 'rejected'
}

interface RFPDocument {
  id: string
  file_name: string
  extracted_content: string
  analysis_result: any
  created_at: string
}

interface RFPIntegrationProps {
  projectId: string
  onRequirementsImported?: (requirements: RFPRequirement[]) => void
}

export default function RFPIntegration({ projectId, onRequirementsImported }: RFPIntegrationProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload' | 'existing'>('manual')
  const [rfpDocuments, setRfpDocuments] = useState<RFPDocument[]>([])
  const [requirements, setRequirements] = useState<RFPRequirement[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<RFPDocument | null>(null)

  // Manual RFP input
  const [manualRFP, setManualRFP] = useState({
    title: '',
    description: '',
    objectives: '',
    scope: '',
    constraints: '',
    timeline: '',
    budget: '',
    technical_requirements: '',
    functional_requirements: '',
    non_functional_requirements: ''
  })

  // File upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const requirementTypes = [
    { value: 'functional', label: '기능 요구사항', color: 'blue' },
    { value: 'non_functional', label: '비기능 요구사항', color: 'green' },
    { value: 'business', label: '비즈니스 요구사항', color: 'purple' },
    { value: 'technical', label: '기술 요구사항', color: 'orange' },
    { value: 'constraint', label: '제약 사항', color: 'red' }
  ]

  const priorities = [
    { value: 'critical', label: '긴급', color: 'red' },
    { value: 'high', label: '높음', color: 'orange' },
    { value: 'medium', label: '보통', color: 'yellow' },
    { value: 'low', label: '낮음', color: 'gray' }
  ]

  useEffect(() => {
    loadExistingDocuments()
  }, [projectId])

  const loadExistingDocuments = async () => {
    // Supabase에서 기존 RFP 문서들을 가져오는 로직
    // 실제 구현에서는 API 호출
    try {
      // Mock data for now
      const mockDocuments: RFPDocument[] = [
        {
          id: '1',
          file_name: 'E-커머스_플랫폼_RFP.pdf',
          extracted_content: '차세대 온라인 쇼핑몰 플랫폼 구축을 위한 제안요청서...',
          analysis_result: {},
          created_at: new Date().toISOString()
        }
      ]
      setRfpDocuments(mockDocuments)
    } catch (error) {
      console.error('문서 로드 실패:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true)
    try {
      // 파일 업로드 및 AI 분석 로직
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      // Mock API call - 실제로는 백엔드 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock 분석 결과
      const mockRequirements: RFPRequirement[] = [
        {
          id: '1',
          title: '사용자 회원가입/로그인',
          description: '이메일, 소셜 로그인을 통한 회원가입 및 로그인 기능',
          requirement_type: 'functional',
          priority: 'high',
          category: '사용자 관리',
          acceptance_criteria: ['이메일 인증', '소셜 로그인 연동', 'JWT 토큰 기반 인증'],
          business_value: 8,
          estimated_effort: 13,
          risk_level: 'medium',
          status: 'identified'
        },
        {
          id: '2',
          title: '상품 관리 시스템',
          description: '관리자가 상품을 등록, 수정, 삭제할 수 있는 관리 시스템',
          requirement_type: 'functional',
          priority: 'high',
          category: '상품 관리',
          acceptance_criteria: ['상품 CRUD', '이미지 업로드', '카테고리 관리'],
          business_value: 9,
          estimated_effort: 21,
          risk_level: 'low',
          status: 'identified'
        }
      ]

      setRequirements(mockRequirements)
      if (onRequirementsImported) {
        onRequirementsImported(mockRequirements)
      }
    } catch (error) {
      console.error('파일 분석 실패:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleManualAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      // 수동 입력된 RFP 내용을 AI로 분석
      const rfpContent = `
        제목: ${manualRFP.title}
        설명: ${manualRFP.description}
        목표: ${manualRFP.objectives}
        범위: ${manualRFP.scope}
        제약사항: ${manualRFP.constraints}
        일정: ${manualRFP.timeline}
        예산: ${manualRFP.budget}
        기술 요구사항: ${manualRFP.technical_requirements}
        기능 요구사항: ${manualRFP.functional_requirements}
        비기능 요구사항: ${manualRFP.non_functional_requirements}
      `

      // 실제 API 호출
      const response = await fetch('/api/rfp/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          content: rfpContent,
          analysisType: 'manual'
        })
      })

      if (!response.ok) {
        throw new Error('RFP 분석 실패')
      }

      const result = await response.json()
      const analyzedRequirements = result.requirements

      setRequirements(analyzedRequirements)
      if (onRequirementsImported) {
        onRequirementsImported(analyzedRequirements)
      }
    } catch (error) {
      console.error('분석 실패:', error)
      alert('RFP 분석 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      setUploadedFile(file)
      handleFileUpload(file)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'text-red-800 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      high: 'text-orange-800 bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
      medium: 'text-yellow-800 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      low: 'text-gray-800 bg-gray-100 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getTypeColor = (type: string) => {
    const colors = {
      functional: 'text-blue-800 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      non_functional: 'text-green-800 bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
      business: 'text-purple-800 bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
      technical: 'text-orange-800 bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
      constraint: 'text-red-800 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    }
    return colors[type as keyof typeof colors] || colors.functional
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          RFP 연동 및 요구사항 분석
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          RFP 문서를 업로드하거나 직접 입력하여 AI 기반 요구사항 분석을 수행하세요
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'manual'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <DocumentTextIcon className="w-4 h-4 inline mr-2" />
          직접 입력
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CloudArrowUpIcon className="w-4 h-4 inline mr-2" />
          파일 업로드
        </button>
        <button
          onClick={() => setActiveTab('existing')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'existing'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ClipboardDocumentListIcon className="w-4 h-4 inline mr-2" />
          기존 문서
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        {/* Manual Input Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  프로젝트 제목 *
                </label>
                <input
                  type="text"
                  value={manualRFP.title}
                  onChange={(e) => setManualRFP({ ...manualRFP, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="프로젝트의 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  예상 일정
                </label>
                <input
                  type="text"
                  value={manualRFP.timeline}
                  onChange={(e) => setManualRFP({ ...manualRFP, timeline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="예: 3개월, 2024년 1월~3월"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                프로젝트 설명 *
              </label>
              <textarea
                value={manualRFP.description}
                onChange={(e) => setManualRFP({ ...manualRFP, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="프로젝트의 전반적인 설명을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  프로젝트 목표
                </label>
                <textarea
                  value={manualRFP.objectives}
                  onChange={(e) => setManualRFP({ ...manualRFP, objectives: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="달성하고자 하는 목표를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  프로젝트 범위
                </label>
                <textarea
                  value={manualRFP.scope}
                  onChange={(e) => setManualRFP({ ...manualRFP, scope: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="프로젝트 범위를 명시하세요"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  기능 요구사항
                </label>
                <textarea
                  value={manualRFP.functional_requirements}
                  onChange={(e) => setManualRFP({ ...manualRFP, functional_requirements: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="필요한 기능들을 나열하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  기술 요구사항
                </label>
                <textarea
                  value={manualRFP.technical_requirements}
                  onChange={(e) => setManualRFP({ ...manualRFP, technical_requirements: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="기술 스택, 인프라 요구사항 등"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  제약 사항
                </label>
                <textarea
                  value={manualRFP.constraints}
                  onChange={(e) => setManualRFP({ ...manualRFP, constraints: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="예산, 일정, 기술적 제약 등"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleManualAnalysis}
                disabled={isAnalyzing || !manualRFP.title || !manualRFP.description}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <SparklesIcon className="w-5 h-5" />
                <span>{isAnalyzing ? 'AI 분석 중...' : 'AI 요구사항 분석 시작'}</span>
              </button>
            </div>
          </div>
        )}

        {/* File Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                RFP 문서 업로드
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                PDF, DOC, DOCX, HWP 파일을 드래그하여 업로드하거나 클릭하여 선택하세요
              </p>
              
              <input
                type="file"
                accept=".pdf,.doc,.docx,.hwp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setUploadedFile(file)
                    handleFileUpload(file)
                  }
                }}
                className="hidden"
                id="rfp-upload"
              />
              <label
                htmlFor="rfp-upload"
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
              >
                파일 선택
              </label>
            </div>

            {uploadedFile && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  {isAnalyzing && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-sm text-blue-600 dark:text-blue-400">분석 중...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing Documents Tab */}
        {activeTab === 'existing' && (
          <div className="space-y-4">
            {rfpDocuments.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  업로드된 RFP 문서가 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  파일 업로드 탭에서 RFP 문서를 업로드해주세요
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rfpDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {doc.file_name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {doc.extracted_content.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <DocumentTextIcon className="w-6 h-6 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Analysis Results */}
      {requirements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              분석된 요구사항 ({requirements.length}개)
            </h3>
            
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                구축 관리로 가져오기
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                수정
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {req.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(req.requirement_type)}`}>
                        {requirementTypes.find(t => t.value === req.requirement_type)?.label}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(req.priority)}`}>
                        {priorities.find(p => p.value === req.priority)?.label}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {req.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">비즈니스 가치:</span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">{req.business_value}/10</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">예상 공수:</span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">{req.estimated_effort}SP</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">위험도:</span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">{req.risk_level}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">카테고리:</span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">{req.category}</span>
                  </div>
                </div>

                {req.acceptance_criteria.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">수용 기준:</span>
                    <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {req.acceptance_criteria.map((criteria, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}