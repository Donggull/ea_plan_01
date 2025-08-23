'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  SparklesIcon,
  ChartBarIcon,
  CogIcon,
  ClockIcon,
  UsersIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  FolderOpenIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import useProjectStore, { Project } from '@/lib/stores/projectStore'

interface ProjectCardProps {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const router = useRouter()
  const { deleteProject, setSelectedProject } = useProjectStore()
  const [isDeleting, setIsDeleting] = useState(false)

  const getCategoryIcon = (category: string) => {
    const icons = {
      proposal: SparklesIcon,
      development: ChartBarIcon,
      operation: CogIcon,
    }
    return icons[category as keyof typeof icons] || SparklesIcon
  }

  const getCategoryBadge = (category: string) => {
    const badges = {
      proposal:
        'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 dark:from-slate-800/50 dark:to-slate-700/50 dark:text-slate-300',
      development:
        'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 dark:from-indigo-900/50 dark:to-indigo-800/50 dark:text-indigo-300',
      operation:
        'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 dark:from-emerald-900/50 dark:to-emerald-800/50 dark:text-emerald-300',
    }
    const labels = {
      proposal: '제안 진행',
      development: '구축 관리',
      operation: '운영 관리',
    }
    return {
      className: badges[category as keyof typeof badges] || badges.proposal,
      label: labels[category as keyof typeof labels] || '제안 진행',
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      completed:
        'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
      planning:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }
    const labels = {
      active: '진행 중',
      completed: '완료',
      planning: '계획 중',
      archived: '보관됨',
    }
    return {
      className: badges[status as keyof typeof badges] || badges.planning,
      label: labels[status as keyof typeof labels] || '계획 중',
    }
  }

  const handleOpen = () => {
    setSelectedProject(project)
    router.push(`/projects/${project.id}`)
  }

  const handleEdit = () => {
    setSelectedProject(project)
    // TODO: Open edit modal
  }

  const handleDuplicate = () => {
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...rest
    } = project
    const duplicatedProject = {
      ...rest,
      name: `${project.name} (복사본)`,
    }

    useProjectStore.getState().addProject(duplicatedProject)
  }

  const handleDelete = async () => {
    if (window.confirm(`"${project.name}" 프로젝트를 삭제하시겠습니까?`)) {
      setIsDeleting(true)
      await new Promise(resolve => setTimeout(resolve, 300))
      deleteProject(project.id)
      setIsDeleting(false)
    }
  }

  const CategoryIcon = getCategoryIcon(project.category)
  const categoryBadge = getCategoryBadge(project.category)
  const statusBadge = getStatusBadge(project.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDeleting ? 0 : 1, y: isDeleting ? -20 : 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={`${project.bgColor} backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group relative`}
    >
      {/* Action Menu */}
      <div className="absolute top-4 right-4">
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors opacity-0 group-hover:opacity-100">
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleOpen}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white`}
                    >
                      <FolderOpenIcon className="mr-2 h-4 w-4" />
                      열기
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleEdit}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white`}
                    >
                      <PencilIcon className="mr-2 h-4 w-4" />
                      편집
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleDuplicate}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white`}
                    >
                      <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
                      복제
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleDelete}
                      className={`${
                        active ? 'bg-red-100 dark:bg-red-900/30' : ''
                      } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400`}
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      삭제
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Card Content */}
      <div onClick={handleOpen} className="cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{project.avatar}</div>
            <div
              className={`w-10 h-10 bg-gradient-to-r ${project.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <CategoryIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
          {project.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-2">
          {project.description}
        </p>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryBadge.className}`}
        >
          {categoryBadge.label}
        </span>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>진행률</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
              className={`bg-gradient-to-r ${project.color} h-2.5 rounded-full`}
            />
          </div>
        </div>

        {/* Team and deadline */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UsersIcon className="w-4 h-4 text-gray-500" />
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map((member, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-full bg-gradient-to-r ${project.color} flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-gray-800`}
                >
                  {member.charAt(0)}
                </div>
              ))}
              {project.team.length > 3 && (
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                  +{project.team.length - 3}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-4 h-4" />
            <span className="text-xs">
              {new Date(project.deadline).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
