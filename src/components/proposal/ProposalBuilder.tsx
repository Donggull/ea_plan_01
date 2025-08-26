'use client'

import { useState, useRef } from 'react'
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import type { PersonaAnalysisResult } from './PersonaAnalysis'

interface ProposalBuilderProps {
  projectTitle: string
  rfpAnalysis?: any
  marketResearch?: any
  personaAnalysis?: PersonaAnalysisResult | null
  onSave: (proposal: ProposalDocument) => void
}

interface ProposalSection {
  id: string
  type: 'text' | 'table' | 'image' | 'list'
  title: string
  content: string
  order: number
}

interface ProposalDocument {
  title: string
  sections: ProposalSection[]
  metadata: {
    createdAt: string
    lastModified: string
    version: string
  }
}

const defaultSections = [
  { title: '프로젝트 개요', type: 'text' as const },
  { title: '요구사항 분석', type: 'text' as const },
  { title: '제안 솔루션', type: 'text' as const },
  { title: '기술 스택', type: 'list' as const },
  { title: '프로젝트 일정', type: 'table' as const },
  { title: '예산 및 비용', type: 'table' as const },
  { title: '팀 구성', type: 'text' as const },
  { title: '위험 관리', type: 'text' as const },
  { title: '결론', type: 'text' as const },
]

export default function ProposalBuilder({
  projectTitle,
  rfpAnalysis,
  marketResearch,
  personaAnalysis,
  onSave,
}: ProposalBuilderProps) {
  const [sections, setSections] = useState<ProposalSection[]>(
    defaultSections.map((section, index) => ({
      id: `section-${index}`,
      title: section.title,
      type: section.type,
      content: '',
      order: index,
    }))
  )
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  
  const editorRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({})

  const generateContent = async (sectionId: string, sectionType: string, sectionTitle: string) => {
    setIsGenerating(sectionId)
    
    try {
      const response = await fetch('/api/proposal/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionType,
          sectionTitle,
          projectTitle,
          rfpAnalysis,
          marketResearch,
          personaAnalysis,
        }),
      })

      if (!response.ok) {
        throw new Error('콘텐츠 생성에 실패했습니다.')
      }

      const { content } = await response.json()
      
      setSections(prev =>
        prev.map(section =>
          section.id === sectionId
            ? { ...section, content }
            : section
        )
      )

    } catch (error) {
      console.error('Content generation error:', error)
    } finally {
      setIsGenerating(null)
    }
  }

  const updateSection = (id: string, field: keyof ProposalSection, value: any) => {
    setSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    )
  }

  const addSection = () => {
    const newSection: ProposalSection = {
      id: `section-${Date.now()}`,
      type: 'text',
      title: '새 섹션',
      content: '',
      order: sections.length,
    }
    setSections(prev => [...prev, newSection])
  }

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id))
  }

  const moveSection = (id: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const currentIndex = prev.findIndex(section => section.id === id)
      if (currentIndex === -1) return prev

      const newSections = [...prev]
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

      if (targetIndex >= 0 && targetIndex < newSections.length) {
        ;[newSections[currentIndex], newSections[targetIndex]] = 
        [newSections[targetIndex], newSections[currentIndex]]
        
        // Update order
        newSections.forEach((section, index) => {
          section.order = index
        })
      }

      return newSections
    })
  }

  const saveProposal = () => {
    const proposal: ProposalDocument = {
      title: projectTitle,
      sections,
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '1.0',
      },
    }
    onSave(proposal)
  }

  const exportProposal = () => {
    const proposalContent = sections
      .map(section => {
        return `# ${section.title}\n\n${section.content}\n\n`
      })
      .join('')

    const fullContent = `# ${projectTitle}\n\n${proposalContent}`
    
    const blob = new Blob([fullContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectTitle}_제안서.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SectionEditor = ({ section }: { section: ProposalSection }) => {
    if (previewMode) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {section.title}
          </h3>
          {section.type === 'table' && section.content ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                {section.content.split('\n').map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                    {row.split('|').filter(Boolean).map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm"
                      >
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </table>
            </div>
          ) : section.type === 'list' && section.content ? (
            <ul className="space-y-2">
              {section.content.split('\n').filter(Boolean).map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item.replace(/^[-•*]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              {section.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
            className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateContent(section.id, section.type, section.title)}
              disabled={isGenerating === section.id}
              className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="AI로 콘텐츠 생성"
            >
              {isGenerating === section.id ? (
                <ArrowUpIcon className="w-4 h-4 animate-spin" />
              ) : (
                <SparklesIcon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => moveSection(section.id, 'up')}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="위로 이동"
            >
              <ArrowUpIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveSection(section.id, 'down')}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="아래로 이동"
            >
              <ArrowDownIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeSection(section.id)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="섹션 삭제"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <select
            value={section.type}
            onChange={(e) => updateSection(section.id, 'type', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="text">텍스트</option>
            <option value="list">목록</option>
            <option value="table">표</option>
          </select>
        </div>

        <textarea
          ref={(el) => (editorRefs.current[section.id] = el)}
          value={section.content}
          onChange={(e) => updateSection(section.id, 'content', e.target.value)}
          className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder={
            section.type === 'table'
              ? '표 형식으로 입력하세요. 예:\n제목1|제목2|제목3\n내용1|내용2|내용3'
              : section.type === 'list'
              ? '목록 형식으로 입력하세요. 각 줄에 하나씩:'
              : `${section.title}에 대한 내용을 입력하거나 AI 생성 버튼을 클릭하세요.`
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-6 h-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            제안서 작성
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              previewMode
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <EyeIcon className="w-4 h-4" />
            <span>{previewMode ? '편집 모드' : '미리보기'}</span>
          </button>
          <button
            onClick={exportProposal}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>내보내기</span>
          </button>
          <button
            onClick={saveProposal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            저장하기
          </button>
        </div>
      </div>

      {/* 제안서 제목 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <input
          type="text"
          value={projectTitle}
          className="text-2xl font-bold bg-transparent border-none focus:outline-none w-full text-gray-900 dark:text-white"
          placeholder="제안서 제목을 입력하세요"
        />
      </div>

      {/* 섹션들 */}
      <div className="space-y-6">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <SectionEditor key={section.id} section={section} />
          ))}
      </div>

      {/* 섹션 추가 버튼 */}
      {!previewMode && (
        <button
          onClick={addSection}
          className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>새 섹션 추가</span>
        </button>
      )}

      {/* 도움말 */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-start space-x-3">
          <SparklesIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              AI 지원 콘텐츠 생성
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              각 섹션의 AI 버튼을 클릭하면 RFP 분석, 시장 조사, 페르소나 분석 결과를 바탕으로 콘텐츠가 자동 생성됩니다.
              생성된 내용은 수정할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}