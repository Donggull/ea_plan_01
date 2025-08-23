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

      // For demo mode, we'll use the regular client and rely on service role RLS policies
      const defaultUserId = 'c8b9c8d7-0c5a-4a0f-9f8c-6c5b9a3e4d2f' // Sample user ID

      const insertData: ProjectInsert = {
        user_id: defaultUserId,
        owner_id: defaultUserId,
        name: projectData.name,
        description: projectData.description,
        category: projectData.category,
        status: projectData.status || 'active',
        tags: projectData.tags || [],
        metadata: projectData.metadata || {},
        is_public: projectData.is_public || false,
        visibility_level: projectData.visibility_level || 'private',
      }

      console.log('Insert data prepared:', insertData)

      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert(insertData)
        .select()
        .single()

      console.log('Supabase insert result:', {
        data: newProject,
        error: insertError,
      })

      if (insertError) {
        return {
          data: null,
          error: `Failed to create project: ${insertError.message}`,
          success: false,
        }
      }

      // Log the activity (skip for demo mode)
      // await this.logProjectActivity(newProject.id, defaultUserId, 'project_created', {
      //   project_name: projectData.name,
      //   category: projectData.category,
      // })

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
    console.log('ProjectService.listProjects called with filters:', filters)

    try {
      // For demo mode, use default user ID
      const defaultUserId = 'c8b9c8d7-0c5a-4914-812e-5eedc4fd3a3d' // Sample user ID
      console.log('Using default user ID:', defaultUserId)

      const projectsWithAccess: (Project & {
        userRole?: string | null
        isOwner?: boolean
        isMember?: boolean
      })[] = []

      // Determine which projects to fetch based on project_type filter
      const projectType = filters.project_type || 'all'
      console.log('Project type to fetch:', projectType)

      if (projectType === 'owned' || projectType === 'all') {
        // Get projects owned by the user - simplified without joins
        try {
          const { data: ownedProjects, error: ownedError } = await supabase
            .from('projects')
            .select('*')
            .eq('owner_id', defaultUserId)
            .order('updated_at', { ascending: false })

          console.log('Owned projects query result:', {
            data: ownedProjects,
            error: ownedError,
          })

          if (!ownedError && ownedProjects) {
            const ownedWithRole = ownedProjects.map(project => ({
              ...project,
              userRole: 'owner' as const,
              isOwner: true,
              isMember: false,
            }))
            projectsWithAccess.push(...ownedWithRole)
          }
        } catch (err) {
          console.error('Error fetching owned projects:', err)
        }
      }

      if (projectType === 'member' || projectType === 'all') {
        // Skip member projects for demo mode to avoid complex joins
        console.log('Skipping member projects query for demo mode')
      }

      if (projectType === 'public' || projectType === 'all') {
        // Get public projects (excluding already included ones)
        try {
          const { data: publicProjects, error: publicError } = await supabase
            .from('projects')
            .select('*')
            .eq('is_public', true)
            .eq('visibility_level', 'public')
            .order('updated_at', { ascending: false })

          console.log('Public projects query result:', {
            data: publicProjects,
            error: publicError,
          })

          if (!publicError && publicProjects) {
            const existingIds = new Set(projectsWithAccess.map(p => p.id))
            const publicWithRole = publicProjects
              .filter(project => !existingIds.has(project.id))
              .map(project => ({
                ...project,
                userRole: null,
                isOwner: false,
                isMember: false,
              }))
            projectsWithAccess.push(...publicWithRole)
          }
        } catch (err) {
          console.error('Error fetching public projects:', err)
        }
      }

      // Apply additional filters
      let filteredProjects = projectsWithAccess

      if (filters.category) {
        filteredProjects = filteredProjects.filter(
          p => p.category === filters.category
        )
      }

      if (filters.status) {
        filteredProjects = filteredProjects.filter(
          p => p.status === filters.status
        )
      }

      if (filters.visibility_level) {
        filteredProjects = filteredProjects.filter(
          p => p.visibility_level === filters.visibility_level
        )
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredProjects = filteredProjects.filter(
          p =>
            p.tags && p.tags.some((tag: string) => filters.tags!.includes(tag))
        )
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredProjects = filteredProjects.filter(
          p =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower))
        )
      }

      // Sort by updated_at descending
      filteredProjects.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )

      // Apply pagination
      let paginatedProjects = filteredProjects
      if (filters.offset || filters.limit) {
        const offset = filters.offset || 0
        const limit = filters.limit || 10
        paginatedProjects = filteredProjects.slice(offset, offset + limit)
      }

      // Add sample stats for demo
      const projectsWithStats: ProjectWithStats[] = paginatedProjects.map(
        project => ({
          ...project,
          conversationCount: Math.floor(Math.random() * 10),
          documentCount: Math.floor(Math.random() * 5),
          imageCount: Math.floor(Math.random() * 3),
          lastActivity: project.updated_at,
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
      const defaultUserId = 'c8b9c8d7-0c5a-4914-812e-5eedc4fd3a3d'

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
      const defaultUserId = 'c8b9c8d7-0c5a-4914-812e-5eedc4fd3a3d'

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
