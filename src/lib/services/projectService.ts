import { supabase, createServerComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export interface CreateProjectData {
  name: string
  description?: string
  category: 'proposal' | 'development' | 'operation'
  status?: 'active' | 'completed' | 'archived' | 'paused'
  tags?: string[]
  metadata?: Record<string, unknown>
  is_public?: boolean
  visibility_level?: 'private' | 'shared' | 'public'
}

export interface UpdateProjectData {
  name?: string
  description?: string
  category?: 'proposal' | 'development' | 'operation'
  status?: 'active' | 'completed' | 'archived' | 'paused'
  tags?: string[]
  metadata?: Record<string, unknown>
  is_public?: boolean
  visibility_level?: 'private' | 'shared' | 'public'
}

export interface ProjectListFilters {
  category?: 'proposal' | 'development' | 'operation'
  status?: 'active' | 'completed' | 'archived' | 'paused'
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
  project_type?: 'owned' | 'shared' | 'member' | 'public' | 'all'
  visibility_level?: 'private' | 'shared' | 'public'
}

export interface ProjectServiceResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
}

export interface ProjectWithStats extends Project {
  conversationCount?: number
  documentCount?: number
  imageCount?: number
  lastActivity?: string
  userRole?: 'owner' | 'admin' | 'member' | 'viewer' | null
  isOwner?: boolean
  isMember?: boolean
}

export class ProjectService {
  static async createProject(
    projectData: CreateProjectData
  ): Promise<ProjectServiceResponse<Project>> {
    try {
      console.log('ProjectService.createProject called with:', projectData)

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        return {
          data: null,
          error: result.error || 'Failed to create project',
          success: false,
        }
      }

      console.log('Project created successfully:', result.data)

      return {
        data: result.data,
        error: null,
        success: true,
      }
    } catch (error) {
      console.error('ProjectService.createProject error:', error)
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async getProjectById(
    projectId: string
  ): Promise<ProjectServiceResponse<ProjectWithStats>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (projectError) {
        return {
          data: null,
          error: `Failed to fetch project: ${projectError.message}`,
          success: false,
        }
      }

      // Get additional stats
      const [conversationsRes, documentsRes, imagesRes, activityRes] =
        await Promise.all([
          supabase
            .from('conversations')
            .select('id', { count: 'exact' })
            .eq('project_id', projectId),
          supabase
            .from('documents')
            .select('id', { count: 'exact' })
            .eq('project_id', projectId),
          supabase
            .from('generated_images')
            .select('id', { count: 'exact' })
            .eq('project_id', projectId),
          supabase
            .from('activity_logs')
            .select('created_at')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
        ])

      const projectWithStats: ProjectWithStats = {
        ...project,
        conversationCount: conversationsRes.count || 0,
        documentCount: documentsRes.count || 0,
        imageCount: imagesRes.count || 0,
        lastActivity: activityRes.data?.created_at,
      }

      return {
        data: projectWithStats,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async updateProject(
    projectId: string,
    updates: UpdateProjectData
  ): Promise<ProjectServiceResponse<Project>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to update project',
          success: false,
        }
      }

      const updateData: ProjectUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        return {
          data: null,
          error: `Failed to update project: ${updateError.message}`,
          success: false,
        }
      }

      // Log the activity
      await this.logProjectActivity(projectId, user.id, 'project_updated', {
        updates,
      })

      return {
        data: updatedProject,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async deleteProject(
    projectId: string
  ): Promise<ProjectServiceResponse<boolean>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to delete project',
          success: false,
        }
      }

      // Get project details for logging before deletion
      const { data: project } = await supabase
        .from('projects')
        .select('name, category')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      // Log the deletion before actually deleting
      if (project) {
        await this.logProjectActivity(projectId, user.id, 'project_deleted', {
          project_name: project.name,
          category: project.category,
        })
      }

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id)

      if (deleteError) {
        return {
          data: null,
          error: `Failed to delete project: ${deleteError.message}`,
          success: false,
        }
      }

      return {
        data: true,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async listProjects(
    filters: ProjectListFilters = {}
  ): Promise<ProjectServiceResponse<ProjectWithStats[]>> {
    console.log('ProjectService.listProjects called with filters:', filters)

    try {
      // Build query parameters
      const params = new URLSearchParams()

      if (filters.project_type)
        params.append('project_type', filters.project_type)
      if (filters.category) params.append('category', filters.category)
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.visibility_level)
        params.append('visibility_level', filters.visibility_level)

      const response = await fetch(`/api/projects?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('API error:', result.error)
        return {
          data: null,
          error: result.error || 'Failed to fetch projects',
          success: false,
        }
      }

      // Add sample stats for demo and apply client-side filters that weren't handled server-side
      let projects = result.data || []

      // Apply tags filter (client-side)
      if (filters.tags && filters.tags.length > 0) {
        projects = projects.filter(
          (p: Project) =>
            p.tags && p.tags.some((tag: string) => filters.tags!.includes(tag))
        )
      }

      // Apply pagination (client-side)
      if (filters.offset || filters.limit) {
        const offset = filters.offset || 0
        const limit = filters.limit || 10
        projects = projects.slice(offset, offset + limit)
      }

      // Add sample stats for demo
      const projectsWithStats: ProjectWithStats[] = projects.map(
        (project: Project) => ({
          ...project,
          conversationCount: Math.floor(Math.random() * 10),
          documentCount: Math.floor(Math.random() * 5),
          imageCount: Math.floor(Math.random() * 3),
          lastActivity: project.updated_at,
          userRole: 'owner' as const,
          isOwner: true,
          isMember: false,
        })
      )

      console.log(
        'Projects with stats prepared:',
        projectsWithStats.length,
        'projects'
      )

      return {
        data: projectsWithStats,
        error: null,
        success: true,
      }
    } catch (error) {
      console.error('ProjectService.listProjects caught error:', error)
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async archiveProject(
    projectId: string
  ): Promise<ProjectServiceResponse<Project>> {
    return this.updateProject(projectId, { status: 'archived' })
  }

  static async restoreProject(
    projectId: string
  ): Promise<ProjectServiceResponse<Project>> {
    return this.updateProject(projectId, { status: 'active' })
  }

  static async pauseProject(
    projectId: string
  ): Promise<ProjectServiceResponse<Project>> {
    return this.updateProject(projectId, { status: 'paused' })
  }

  static async completeProject(
    projectId: string
  ): Promise<ProjectServiceResponse<Project>> {
    return this.updateProject(projectId, { status: 'completed' })
  }

  static async addProjectTag(
    projectId: string,
    tag: string
  ): Promise<ProjectServiceResponse<Project>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      // Get current project
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('tags')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: `Failed to fetch project: ${fetchError.message}`,
          success: false,
        }
      }

      const currentTags = project.tags || []
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag]
        return this.updateProject(projectId, { tags: updatedTags })
      }

      // Tag already exists, return current project
      const currentProjectResult = await this.getProjectById(projectId)
      return currentProjectResult
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async removeProjectTag(
    projectId: string,
    tag: string
  ): Promise<ProjectServiceResponse<Project>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false,
        }
      }

      // Get current project
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('tags')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: `Failed to fetch project: ${fetchError.message}`,
          success: false,
        }
      }

      const currentTags = project.tags || []
      const updatedTags = currentTags.filter((t: string) => t !== tag)

      return this.updateProject(projectId, { tags: updatedTags })
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async getProjectsByCategory(
    category: 'proposal' | 'development' | 'operation'
  ): Promise<ProjectServiceResponse<ProjectWithStats[]>> {
    return this.listProjects({ category })
  }

  static async getActiveProjects(): Promise<
    ProjectServiceResponse<ProjectWithStats[]>
  > {
    return this.listProjects({ status: 'active' })
  }

  static async getRecentProjects(
    limit: number = 5
  ): Promise<ProjectServiceResponse<ProjectWithStats[]>> {
    return this.listProjects({ limit })
  }

  static async searchProjects(
    searchTerm: string
  ): Promise<ProjectServiceResponse<ProjectWithStats[]>> {
    return this.listProjects({ search: searchTerm })
  }

  // Project sharing and member management methods
  static async addProjectMember(
    projectId: string,
    userId: string,
    role: 'admin' | 'member' | 'viewer' = 'member'
  ): Promise<
    ProjectServiceResponse<
      Database['public']['Tables']['project_members']['Row']
    >
  > {
    try {
      const defaultUserId = 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d'

      const { data, error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role,
          invited_by: defaultUserId,
        })
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: `Failed to add project member: ${error.message}`,
          success: false,
        }
      }

      return {
        data,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async removeProjectMember(
    projectId: string,
    userId: string
  ): Promise<ProjectServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) {
        return {
          data: null,
          error: `Failed to remove project member: ${error.message}`,
          success: false,
        }
      }

      return {
        data: true,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async getProjectMembers(
    projectId: string
  ): Promise<
    ProjectServiceResponse<
      Database['public']['Tables']['project_members']['Row'][]
    >
  > {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          data: null,
          error: `Failed to fetch project members: ${error.message}`,
          success: false,
        }
      }

      return {
        data: data || [],
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  static async updateProjectVisibility(
    projectId: string,
    isPublic: boolean,
    visibilityLevel: 'private' | 'shared' | 'public'
  ): Promise<ProjectServiceResponse<Project>> {
    try {
      const defaultUserId = 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d'

      const { data, error } = await supabase
        .from('projects')
        .update({
          is_public: isPublic,
          visibility_level: visibilityLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('owner_id', defaultUserId)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: `Failed to update project visibility: ${error.message}`,
          success: false,
        }
      }

      return {
        data,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      }
    }
  }

  // Helper methods for getting projects by access type
  static async getOwnedProjects(): Promise<
    ProjectServiceResponse<ProjectWithStats[]>
  > {
    return this.listProjects({ project_type: 'owned' })
  }

  static async getSharedProjects(): Promise<
    ProjectServiceResponse<ProjectWithStats[]>
  > {
    return this.listProjects({ project_type: 'member' })
  }

  static async getPublicProjects(): Promise<
    ProjectServiceResponse<ProjectWithStats[]>
  > {
    return this.listProjects({ project_type: 'public' })
  }

  private static async logProjectActivity(
    projectId: string,
    userId: string,
    action: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        project_id: projectId,
        action,
        metadata,
        ip_address: 'unknown', // Could be passed from client or detected server-side
        user_agent: 'unknown', // Could be passed from client
      })
    } catch (error) {
      console.error('Failed to log project activity:', error)
      // Don't throw error as this is not critical functionality
    }
  }
}

export default ProjectService
