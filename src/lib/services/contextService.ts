export interface ProjectContext {
  project: {
    id: string
    name: string
    description: string
    category: string
    status: string
    metadata: Record<string, unknown>
    created_at: string
    updated_at: string
  }
  recentConversations: Array<{
    id: string
    title: string
    model_used: string
    created_at: string
    messages: Array<{
      role: 'user' | 'assistant'
      content: string
      created_at: string
    }>
  }>
  documents: Array<{
    id: string
    fileName: string
    fileType: string
    contentSummary: string
    metadata: Record<string, unknown>
    created_at: string
  }>
  contextInfo: {
    totalDocuments: number
    totalConversations: number
    projectAge: number
  }
}

export interface ContextPrompt {
  systemPrompt: string
  projectContext: string
  conversationHistory: string
  documentContext: string
}

export class ContextService {
  // Fetch project context
  static async getProjectContext(
    projectId: string,
    userId: string
  ): Promise<ProjectContext | null> {
    try {
      const response = await fetch(
        `/api/chat/context?projectId=${projectId}&userId=${userId}`
      )

      if (!response.ok) {
        console.error('Failed to fetch project context:', response.statusText)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Context fetch error:', error)
      return null
    }
  }

  // Update project context
  static async updateProjectContext(
    projectId: string,
    userId: string,
    contextType: 'project_info' | 'add_document',
    data: unknown
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/chat/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          userId,
          contextType,
          data,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Context update error:', error)
      return false
    }
  }

  // Generate context-aware prompt
  static generateContextPrompt(context: ProjectContext): ContextPrompt {
    const { project, recentConversations, documents, contextInfo } = context

    // System prompt with project awareness
    const systemPrompt = `You are an AI assistant helping with a ${project.category} project called "${project.name}".

Project Status: ${project.status}
Project Description: ${project.description}

You have access to the following context:
- ${contextInfo.totalDocuments} project documents
- ${contextInfo.totalConversations} previous conversations
- This project is ${contextInfo.projectAge} days old

Please provide responses that are relevant to this specific project and take into account the project's context, previous conversations, and available documents.`

    // Project context summary
    const projectContext = `**Current Project: ${project.name}**
Category: ${project.category}
Status: ${project.status}
Description: ${project.description}

${
  project.metadata && Object.keys(project.metadata).length > 0
    ? `Additional Project Info:\n${JSON.stringify(project.metadata, null, 2)}`
    : ''
}`

    // Recent conversation history
    const conversationHistory =
      recentConversations.length > 0
        ? `**Recent Conversation History:**\n${recentConversations
            .map(
              conv =>
                `Conversation: ${conv.title || 'Untitled'} (${conv.model_used})\n${
                  conv.messages
                    ?.map(msg => `${msg.role}: ${msg.content}`)
                    .join('\n') || 'No messages'
                }`
            )
            .join('\n\n')}`
        : 'No previous conversations in this project.'

    // Document context
    const documentContext =
      documents.length > 0
        ? `**Available Documents:**\n${documents
            .map(
              doc =>
                `${doc.fileName} (${doc.fileType}):\n${doc.contentSummary || 'No content preview'}`
            )
            .join('\n\n')}`
        : 'No documents uploaded to this project.'

    return {
      systemPrompt,
      projectContext,
      conversationHistory,
      documentContext,
    }
  }

  // Build complete context for AI models
  static async buildAIContext(
    projectId: string,
    userId: string,
    userMessage: string
  ): Promise<string> {
    const context = await this.getProjectContext(projectId, userId)

    if (!context) {
      return `User message: ${userMessage}`
    }

    const contextPrompt = this.generateContextPrompt(context)

    return `${contextPrompt.systemPrompt}

${contextPrompt.projectContext}

${contextPrompt.conversationHistory}

${contextPrompt.documentContext}

---

User message: ${userMessage}`
  }

  // Extract and save relevant information from AI responses
  static async extractAndSaveContext(
    projectId: string,
    userId: string,
    userMessage: string,
    aiResponse: string
  ): Promise<void> {
    try {
      // Look for structured information in the AI response
      const extractedInfo: Record<string, unknown> = {}

      // Extract project updates (basic pattern matching)
      if (
        aiResponse.includes('project status') ||
        aiResponse.includes('프로젝트 상태')
      ) {
        // Could implement more sophisticated extraction logic
        extractedInfo.lastStatusUpdate = new Date().toISOString()
        extractedInfo.lastUpdateSource = 'ai_conversation'
      }

      // Extract requirements or decisions
      if (
        userMessage.includes('요구사항') ||
        userMessage.includes('requirement')
      ) {
        extractedInfo.lastRequirementsDiscussion = new Date().toISOString()
      }

      // Save extracted context if any
      if (Object.keys(extractedInfo).length > 0) {
        await this.updateProjectContext(
          projectId,
          userId,
          'project_info',
          extractedInfo
        )
      }
    } catch (error) {
      console.error('Context extraction error:', error)
      // Don't throw - this is optional functionality
    }
  }

  // Get context summary for UI display
  static getContextSummary(context: ProjectContext): string {
    const { project, contextInfo } = context

    return `${project.name} (${project.category}) - ${contextInfo.totalDocuments} docs, ${contextInfo.totalConversations} conversations`
  }

  // Check if context is stale and needs refresh
  static isContextStale(context: ProjectContext, maxAgeMinutes = 30): boolean {
    const lastUpdate = new Date(context.project.updated_at)
    const now = new Date()
    const ageMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)

    return ageMinutes > maxAgeMinutes
  }
}
