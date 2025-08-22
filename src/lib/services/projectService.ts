import { supabase } from '@/lib/supabase'
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
}

export interface UpdateProjectData {
  name?: string
  description?: string
  category?: 'proposal' | 'development' | 'operation'
  status?: 'active' | 'completed' | 'archived' | 'paused'
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface ProjectListFilters {
  category?: 'proposal' | 'development' | 'operation'
  status?: 'active' | 'completed' | 'archived' | 'paused'
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
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
}

export class ProjectService {
  static async createProject(
    projectData: CreateProjectData
  ): Promise<ProjectServiceResponse<Project>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to create project',
          success: false,
        }
      }

      const insertData: ProjectInsert = {
        user_id: user.id,
        name: projectData.name,
        description: projectData.description,
        category: projectData.category,
        status: projectData.status || 'active',
        tags: projectData.tags || [],
        metadata: projectData.metadata || {},
      }

      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        return {
          data: null,
          error: `Failed to create project: ${insertError.message}`,
          success: false,
        }
      }

      // Log the activity
      await this.logProjectActivity(newProject.id, user.id, 'project_created', {
        project_name: projectData.name,
        category: projectData.category,
      })

      return {
        data: newProject,
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

      let query = supabase.from('projects').select('*').eq('user_id', user.id)

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        )
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        )
      }

      // Order by updated_at descending
      query = query.order('updated_at', { ascending: false })

      const { data: projects, error: projectsError } = await query

      if (projectsError) {
        return {
          data: null,
          error: `Failed to fetch projects: ${projectsError.message}`,
          success: false,
        }
      }

      // Enhance projects with stats
      const projectsWithStats: ProjectWithStats[] = await Promise.all(
        (projects || []).map(async project => {
          const [conversationsRes, documentsRes, imagesRes, activityRes] =
            await Promise.all([
              supabase
                .from('conversations')
                .select('id', { count: 'exact' })
                .eq('project_id', project.id),
              supabase
                .from('documents')
                .select('id', { count: 'exact' })
                .eq('project_id', project.id),
              supabase
                .from('generated_images')
                .select('id', { count: 'exact' })
                .eq('project_id', project.id),
              supabase
                .from('activity_logs')
                .select('created_at')
                .eq('project_id', project.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single(),
            ])

          return {
            ...project,
            conversationCount: conversationsRes.count || 0,
            documentCount: documentsRes.count || 0,
            imageCount: imagesRes.count || 0,
            lastActivity: activityRes.data?.created_at,
          }
        })
      )

      return {
        data: projectsWithStats,
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
