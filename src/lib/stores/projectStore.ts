import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProjectCategory = 'proposal' | 'development' | 'operation'
export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'completed'
  | 'archived'
  | 'paused'
export type ViewMode = 'grid' | 'list'
export type SortBy = 'created' | 'updated' | 'name' | 'progress'

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  status: ProjectStatus
  progress: number
  team: string[]
  deadline: string
  avatar?: string
  color?: string
  bgColor?: string
  createdAt: string
  updatedAt: string
  documents?: Document[]
  tags?: string[]
  // Supabase fields
  conversationCount?: number
  documentCount?: number
  imageCount?: number
  lastActivity?: string
  created_at?: string
  updated_at?: string
  metadata?: Record<string, unknown>
}

export interface Document {
  id: string
  name: string
  type: string
  url: string
  uploadedAt: string
}

interface ProjectState {
  projects: Project[]
  selectedProject: Project | null
  viewMode: ViewMode
  sortBy: SortBy
  searchQuery: string
  selectedCategory: string

  // Actions
  addProject: (
    project: Partial<Project> & {
      name: string
      description: string
      category: ProjectCategory
      status: ProjectStatus
    }
  ) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  clearProjects: () => void
  setSelectedProject: (project: Project | null) => void
  setViewMode: (mode: ViewMode) => void
  setSortBy: (sortBy: SortBy) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  getFilteredProjects: () => Project[]
  getProjectById: (id: string) => Project | null
}

const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      selectedProject: null,
      viewMode: 'grid',
      sortBy: 'updated',
      searchQuery: '',
      selectedCategory: 'all',

      addProject: projectData => {
        const newProject: Project = {
          id: projectData.id || `project-${Date.now()}`,
          name: projectData.name,
          description: projectData.description,
          category: projectData.category,
          status: projectData.status,
          progress: projectData.progress || 0,
          team: projectData.team || [],
          deadline: projectData.deadline || '',
          avatar: projectData.avatar,
          color: projectData.color,
          bgColor: projectData.bgColor,
          createdAt: projectData.createdAt || new Date().toISOString(),
          updatedAt: projectData.updatedAt || new Date().toISOString(),
          documents: projectData.documents,
          tags: projectData.tags,
          conversationCount: projectData.conversationCount,
          documentCount: projectData.documentCount,
          imageCount: projectData.imageCount,
          lastActivity: projectData.lastActivity,
          created_at: projectData.created_at,
          updated_at: projectData.updated_at,
          metadata: projectData.metadata,
        }
        set(state => ({
          projects: [...state.projects, newProject],
        }))
      },

      updateProject: (id, updates) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          ),
        }))
      },

      deleteProject: id => {
        set(state => ({
          projects: state.projects.filter(project => project.id !== id),
          selectedProject:
            state.selectedProject?.id === id ? null : state.selectedProject,
        }))
      },

      clearProjects: () => {
        set({ projects: [] })
      },

      setSelectedProject: project => {
        set({ selectedProject: project })
      },

      setViewMode: mode => {
        set({ viewMode: mode })
      },

      setSortBy: sortBy => {
        set({ sortBy })
      },

      setSearchQuery: query => {
        set({ searchQuery: query })
      },

      setSelectedCategory: category => {
        set({ selectedCategory: category })
      },

      getFilteredProjects: () => {
        const state = get()
        let filtered = [...state.projects]

        // Category filter
        if (state.selectedCategory !== 'all') {
          filtered = filtered.filter(p => p.category === state.selectedCategory)
        }

        // Search filter
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter(
            p =>
              p.name.toLowerCase().includes(query) ||
              p.description.toLowerCase().includes(query) ||
              p.tags?.some(tag => tag.toLowerCase().includes(query))
          )
        }

        // Sorting
        filtered.sort((a, b) => {
          switch (state.sortBy) {
            case 'name':
              return a.name.localeCompare(b.name)
            case 'progress':
              return b.progress - a.progress
            case 'created':
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              )
            case 'updated':
            default:
              return (
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
              )
          }
        })

        return filtered
      },

      getProjectById: (id: string) => {
        const state = get()
        return state.projects.find(project => project.id === id) || null
      },
    }),
    {
      name: 'project-store',
    }
  )
)

export default useProjectStore
