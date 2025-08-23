import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  projectsApi,
  CreateProjectInput,
  UpdateProjectInput,
} from '@/lib/api/projects'
import { Project } from '@/lib/stores/projectStore'

// Query keys
const QUERY_KEYS = {
  projects: ['projects'],
  project: (id: string) => ['project', id],
}

// Get all projects
export function useProjects() {
  return useQuery({
    queryKey: QUERY_KEYS.projects,
    queryFn: projectsApi.getProjects,
  })
}

// Get single project
export function useProject(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.project(id),
    queryFn: () => projectsApi.getProject(id),
    enabled: !!id,
  })
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectsApi.createProject(data),
    onSuccess: newProject => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects })

      // Optionally add the new project to the cache immediately
      queryClient.setQueryData<Project[]>(QUERY_KEYS.projects, old => {
        if (!old) return [newProject]
        return [...old, newProject]
      })
    },
  })
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
      projectsApi.updateProject(id, data),
    onSuccess: updatedProject => {
      // Update the project in the cache
      queryClient.setQueryData(
        QUERY_KEYS.project(updatedProject.id),
        updatedProject
      )

      // Update the project in the projects list
      queryClient.setQueryData<Project[]>(QUERY_KEYS.projects, old => {
        if (!old) return [updatedProject]
        return old.map(project =>
          project.id === updatedProject.id ? updatedProject : project
        )
      })

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects })
    },
  })
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: (_, deletedId) => {
      // Remove the project from the cache
      queryClient.setQueryData<Project[]>(QUERY_KEYS.projects, old => {
        if (!old) return []
        return old.filter(project => project.id !== deletedId)
      })

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.project(deletedId) })
    },
  })
}
