import { Project } from '@/lib/stores/projectStore'

// API endpoints for project management
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export interface CreateProjectInput {
  name: string
  description: string
  category: 'proposal' | 'development' | 'operation'
  deadline: string
  team: string[]
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  status?: 'planning' | 'active' | 'completed' | 'archived'
  progress?: number
  deadline?: string
  team?: string[]
}

// Project API functions
export const projectsApi = {
  // Get all projects
  async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }

      return response.json()
    } catch (error) {
      console.error('Error fetching projects:', error)
      // Return empty array for now (will use local storage)
      return []
    }
  },

  // Get single project
  async getProject(id: string): Promise<Project | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch project')
      }

      return response.json()
    } catch (error) {
      console.error('Error fetching project:', error)
      return null
    }
  },

  // Create new project
  async createProject(data: CreateProjectInput): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      return response.json()
    } catch (error) {
      console.error('Error creating project:', error)
      // For now, create locally
      const newProject: Project = {
        id: `project-${Date.now()}`,
        ...data,
        status: 'planning',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatar:
          data.category === 'proposal'
            ? '🚀'
            : data.category === 'development'
              ? '💻'
              : '⚙️',
        color:
          data.category === 'proposal'
            ? 'from-slate-600 to-slate-700'
            : data.category === 'development'
              ? 'from-indigo-500 to-indigo-600'
              : 'from-emerald-500 to-emerald-600',
        bgColor:
          data.category === 'proposal'
            ? 'bg-gradient-to-br from-slate-50/80 to-gray-50/80 dark:from-slate-800/40 dark:to-gray-800/40'
            : data.category === 'development'
              ? 'bg-gradient-to-br from-indigo-50/80 to-indigo-100/60 dark:from-indigo-900/30 dark:to-indigo-800/30'
              : 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-800/30',
      }
      return newProject
    }
  },

  // Update project
  async updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      return response.json()
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },

  // Delete project
  async deleteProject(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  },
}
