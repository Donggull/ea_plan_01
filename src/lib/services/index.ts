// Service Layer Exports
// Main service classes for the planning platform

export { UserService, default as userService } from './userService'
export type { 
  CreateUserProfileData, 
  UpdateUserProfileData, 
  UserServiceResponse 
} from './userService'

export { ProjectService, default as projectService } from './projectService'
export type { 
  CreateProjectData, 
  UpdateProjectData, 
  ProjectListFilters, 
  ProjectServiceResponse, 
  ProjectWithStats 
} from './projectService'

export { ChatService, default as chatService } from './chatService'
export type { 
  CreateConversationData, 
  CreateMessageData, 
  UpdateConversationData, 
  ConversationListFilters, 
  ChatServiceResponse, 
  ConversationWithMessages, 
  ConversationSummary 
} from './chatService'

export { DocumentService, default as documentService } from './documentService'
export type { 
  CreateDocumentData, 
  UpdateDocumentData, 
  DocumentListFilters, 
  DocumentServiceResponse, 
  DocumentWithAnalysis 
} from './documentService'

export { ImageService, default as imageService } from './imageService'
export type { 
  CreateImageData, 
  UpdateImageData, 
  ImageGenerationRequest, 
  ImageListFilters, 
  ImageServiceResponse, 
  ImageWithStats, 
  ImageGenerationResult 
} from './imageService'

export { CustomBotService, default as customBotService } from './customBotService'
export type { 
  CreateCustomBotData, 
  UpdateCustomBotData, 
  CustomBotListFilters, 
  CustomBotServiceResponse, 
  CustomBotWithStats, 
  KnowledgeBaseDocument, 
  BotConversation 
} from './customBotService'

// Consolidated service interface for easy access
export const services = {
  user: UserService,
  project: ProjectService,
  chat: ChatService,
  document: DocumentService,
  image: ImageService,
  customBot: CustomBotService,
}

// Service response type utility
export type ServiceResponse<T = unknown> = {
  data: T | null
  error: string | null
  success: boolean
}

// Common service error handling utility
export const handleServiceError = (error: unknown): ServiceResponse => ({
  data: null,
  error: error instanceof Error ? error.message : 'Unknown error occurred',
  success: false
})

// Service health check utility
export const checkServiceHealth = async () => {
  const results = {
    database: false,
    storage: false,
    timestamp: new Date().toISOString()
  }

  try {
    // Test database connection
    await UserService.getCurrentUser()
    results.database = true // If no error thrown, database is accessible
  } catch (error) {
    console.error('Database health check failed:', error)
  }

  try {
    // Test storage connection (we'll implement this when we have actual storage operations)
    results.storage = true // For now, assume storage is healthy
  } catch (error) {
    console.error('Storage health check failed:', error)
  }

  return results
}