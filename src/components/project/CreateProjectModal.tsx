'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  SparklesIcon,
  ChartBarIcon,
  CogIcon,
  CalendarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import useProjectStore, { ProjectCategory } from '@/lib/stores/projectStore'
import { ProjectService } from '@/lib/services/projectService'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const addProject = useProjectStore(state => state.addProject)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'proposal' as ProjectCategory,
    deadline: '',
    team: [] as string[],
    teamInput: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categoryOptions = [
    {
      value: 'proposal',
      label: '제안 진행',
      icon: SparklesIcon,
      description: 'RFP 분석, 시장 조사, 제안서 작성',
      color: 'from-slate-600 to-slate-700',
    },
    {
      value: 'development',
      label: '구축 관리',
      icon: ChartBarIcon,
      description: '요구사항 정리, 기능 정의, 화면 설계',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      value: 'operation',
      label: '운영 관리',
      icon: CogIcon,
      description: '요건 관리, 업무 분배, 일정 관리',
      color: 'from-emerald-500 to-emerald-600',
    },
  ]

  const avatarOptions = {
    proposal: '🚀',
    development: '💻',
    operation: '⚙️',
  }

  const colorOptions = {
    proposal: 'from-slate-600 to-slate-700',
    development: 'from-indigo-500 to-indigo-600',
    operation: 'from-emerald-500 to-emerald-600',
  }

  const bgColorOptions = {
    proposal:
      'bg-gradient-to-br from-slate-50/80 to-gray-50/80 dark:from-slate-800/40 dark:to-gray-800/40',
    development:
      'bg-gradient-to-br from-indigo-50/80 to-indigo-100/60 dark:from-indigo-900/30 dark:to-indigo-800/30',
    operation:
      'bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-800/30',
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '프로젝트 이름을 입력해주세요'
    }

    if (!formData.description.trim()) {
      newErrors.description = '프로젝트 설명을 입력해주세요'
    }

    if (!formData.deadline) {
      newErrors.deadline = '마감일을 선택해주세요'
    }

    if (formData.team.length === 0) {
      newErrors.team = '최소 1명 이상의 팀원을 추가해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddTeamMember = () => {
    if (formData.teamInput.trim()) {
      setFormData({
        ...formData,
        team: [...formData.team, formData.teamInput.trim()],
        teamInput: '',
      })
      setErrors({ ...errors, team: '' })
    }
  }

  const handleRemoveTeamMember = (index: number) => {
    setFormData({
      ...formData,
      team: formData.team.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create project in Supabase
      const result = await ProjectService.createProject({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        status: 'active',
        metadata: {
          team: formData.team,
          deadline: formData.deadline,
          avatar: avatarOptions[formData.category],
          color: colorOptions[formData.category],
          bgColor: bgColorOptions[formData.category],
        },
      })

      if (result.success && result.data) {
        // Add to local store for immediate UI update
        addProject({
          id: result.data.id,
          name: result.data.name,
          description: result.data.description || '',
          category: result.data.category as ProjectCategory,
          status: 'active',
          progress: 0,
          team: formData.team,
          deadline: formData.deadline,
          avatar: avatarOptions[formData.category],
          color: colorOptions[formData.category],
          bgColor: bgColorOptions[formData.category],
          createdAt: result.data.created_at || new Date().toISOString(),
          updatedAt: result.data.updated_at || new Date().toISOString(),
          created_at: result.data.created_at,
          updated_at: result.data.updated_at,
          metadata: result.data.metadata,
        })

        // Reset form
        setFormData({
          name: '',
          description: '',
          category: 'proposal',
          deadline: '',
          team: [],
          teamInput: '',
        })
        setErrors({})
        onClose()
      } else {
        setErrors({ general: result.error || 'Failed to create project' })
      }
    } catch (error) {
      console.error('Create project error:', error)
      setErrors({ general: 'Unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-6"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    새 프로젝트 생성
                  </h3>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </Dialog.Title>

                {errors.general && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {errors.general}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      프로젝트 이름 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.name
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-700 focus:ring-slate-500'
                      } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                      placeholder="프로젝트 이름을 입력하세요"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      프로젝트 설명 *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.description
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-700 focus:ring-slate-500'
                      } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                      placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      카테고리 *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {categoryOptions.map(option => {
                        const Icon = option.icon
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                category: option.value as ProjectCategory,
                              })
                            }
                            className={`relative p-4 rounded-xl border-2 transition-all ${
                              formData.category === option.value
                                ? 'border-slate-500 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900'
                                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center mb-2`}
                              >
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {option.label}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {option.description}
                              </p>
                            </div>
                            {formData.category === option.value && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        마감일 *
                      </div>
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={e =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.deadline
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-700 focus:ring-slate-500'
                      } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                    />
                    {errors.deadline && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.deadline}
                      </p>
                    )}
                  </div>

                  {/* Team Members */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" />팀 멤버 *
                      </div>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={formData.teamInput}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            teamInput: e.target.value,
                          })
                        }
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTeamMember()
                          }
                        }}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                        placeholder="팀원 이름을 입력하고 Enter 또는 추가 버튼을 클릭"
                      />
                      <button
                        type="button"
                        onClick={handleAddTeamMember}
                        className="px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
                      >
                        추가
                      </button>
                    </div>
                    {formData.team.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.team.map((member, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm"
                          >
                            {member}
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamMember(index)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {errors.team && (
                      <p className="mt-1 text-sm text-red-500">{errors.team}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      <span>
                        {isSubmitting ? '생성 중...' : '프로젝트 생성'}
                      </span>
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
