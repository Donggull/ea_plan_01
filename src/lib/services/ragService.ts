import OpenAI from 'openai'
import VectorSearch, { SearchResult, SearchOptions } from './vectorSearch'
// import DocumentProcessor from './documentProcessor' // Currently unused

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

export interface RAGQuery {
  query: string
  context?: string
  projectId?: string | null
  documentIds?: string[]
  customBotId?: string
  maxContextLength?: number
  temperature?: number
  model?: string
}

export interface RAGResponse {
  answer: string
  sources: SearchResult[]
  contextUsed: string
  confidence: number
  model: string
  tokensUsed?: number
}

export interface QueryExpansion {
  originalQuery: string
  expandedQueries: string[]
  keywords: string[]
  intent: string
}

export interface ContextWindow {
  content: string
  sources: SearchResult[]
  tokenCount: number
}

export class RAGService {
  private static readonly DEFAULT_MODEL = 'gpt-3.5-turbo'
  private static readonly MAX_CONTEXT_LENGTH = 4000
  private static readonly MAX_SOURCES = 5
  private static readonly MIN_CONFIDENCE = 0.6

  /**
   * Main RAG pipeline - retrieves relevant information and generates response
   */
  static async query(ragQuery: RAGQuery): Promise<RAGResponse> {
    try {
      // Check if OpenAI API key is available
      if (
        !process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY === 'dummy-key-for-build'
      ) {
        throw new Error('OpenAI API key is not configured')
      }

      const {
        query,
        context = '',
        projectId,
        documentIds,
        customBotId,
        maxContextLength = this.MAX_CONTEXT_LENGTH,
        temperature = 0.7,
        model = this.DEFAULT_MODEL,
      } = ragQuery

      // Step 1: Query understanding and expansion
      const _expandedQuery = await this.expandQuery(query)

      // Step 2: Retrieve relevant information
      const searchResults = customBotId
        ? await this.searchKnowledgeBase(query, customBotId)
        : await this.searchDocuments(query, { projectId, documentIds })

      if (searchResults.length === 0) {
        return this.generateFallbackResponse(query, model)
      }

      // Step 3: Create context window
      const contextWindow = this.createContextWindow(
        searchResults,
        maxContextLength,
        query
      )

      // Step 4: Generate response using RAG
      const completion = await this.generateRAGResponse(
        query,
        contextWindow.content,
        context,
        model,
        temperature
      )

      // Step 5: Calculate confidence score
      const confidence = this.calculateConfidence(
        query,
        contextWindow.sources,
        completion
      )

      return {
        answer:
          completion.choices[0]?.message?.content || 'No response generated',
        sources: contextWindow.sources,
        contextUsed: contextWindow.content,
        confidence,
        model,
        tokensUsed: (completion as { usage?: { total_tokens?: number } }).usage
          ?.total_tokens,
      }
    } catch (error) {
      console.error('RAG query failed:', error)
      throw new Error(
        `RAG processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Custom bot RAG query with knowledge base
   */
  static async queryCustomBot(
    botId: string,
    query: string,
    context?: string,
    options: Partial<RAGQuery> = {}
  ): Promise<RAGResponse> {
    return this.query({
      query,
      context,
      customBotId: botId,
      ...options,
    })
  }

  /**
   * Project-specific RAG query
   */
  static async queryProject(
    projectId: string,
    query: string,
    context?: string,
    options: Partial<RAGQuery> = {}
  ): Promise<RAGResponse> {
    return this.query({
      query,
      context,
      projectId,
      ...options,
    })
  }

  /**
   * Document-specific RAG query
   */
  static async queryDocuments(
    documentIds: string[],
    query: string,
    context?: string,
    options: Partial<RAGQuery> = {}
  ): Promise<RAGResponse> {
    return this.query({
      query,
      context,
      documentIds,
      ...options,
    })
  }

  /**
   * Conversational RAG with chat history
   */
  static async conversationalQuery(
    query: string,
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    options: Partial<RAGQuery> = {}
  ): Promise<RAGResponse> {
    // Build conversation context
    const conversationContext = chatHistory
      .slice(-5) // Keep last 5 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    // Enhance query with conversation context
    const contextualQuery = this.enhanceQueryWithContext(query, chatHistory)

    return this.query({
      query: contextualQuery,
      context: conversationContext,
      ...options,
    })
  }

  /**
   * Multi-turn conversation with context retention
   */
  static async multiTurnQuery(
    query: string,
    previousContext: string,
    options: Partial<RAGQuery> = {}
  ): Promise<RAGResponse> {
    // Combine current query with previous context
    const enhancedQuery = `${previousContext}\n\nNew question: ${query}`

    return this.query({
      query: enhancedQuery,
      context: previousContext,
      ...options,
    })
  }

  // Private helper methods

  private static async expandQuery(query: string): Promise<QueryExpansion> {
    try {
      // Check if OpenAI API key is available
      if (
        !process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY === 'dummy-key-for-build'
      ) {
        // Return fallback expansion without API call
        return {
          originalQuery: query,
          expandedQueries: [query],
          keywords: query.split(/\s+/).filter(word => word.length > 2),
          intent: 'general_inquiry',
        }
      }
      const systemPrompt = `You are a query expansion expert. Analyze the user's query and provide:
1. Alternative ways to phrase the same question
2. Key keywords that would help find relevant information
3. The underlying intent of the question

Return your response in this JSON format:
{
  "expandedQueries": ["alternative question 1", "alternative question 2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "intent": "description of what the user is trying to accomplish"
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.3,
        max_tokens: 300,
      })

      const responseContent = completion.choices[0]?.message?.content
      if (responseContent) {
        try {
          const parsed = JSON.parse(responseContent)
          return {
            originalQuery: query,
            expandedQueries: parsed.expandedQueries || [],
            keywords: parsed.keywords || [],
            intent: parsed.intent || 'general_inquiry',
          }
        } catch {
          // Fallback if JSON parsing fails
        }
      }
    } catch (error) {
      console.error('Query expansion failed:', error)
    }

    // Fallback expansion
    return {
      originalQuery: query,
      expandedQueries: [query],
      keywords: query.split(/\s+/).filter(word => word.length > 2),
      intent: 'general_inquiry',
    }
  }

  private static async searchKnowledgeBase(
    query: string,
    customBotId: string
  ): Promise<SearchResult[]> {
    const searchOptions: SearchOptions = {
      limit: this.MAX_SOURCES,
      threshold: this.MIN_CONFIDENCE,
    }

    return VectorSearch.searchKnowledgeBase(query, customBotId, searchOptions)
  }

  private static async searchDocuments(
    query: string,
    options: { projectId?: string | null; documentIds?: string[] }
  ): Promise<SearchResult[]> {
    const searchOptions: SearchOptions = {
      limit: this.MAX_SOURCES,
      threshold: this.MIN_CONFIDENCE,
      projectId: options.projectId,
      documentIds: options.documentIds,
    }

    return VectorSearch.hybridSearch(query, searchOptions)
  }

  private static createContextWindow(
    searchResults: SearchResult[],
    maxLength: number,
    _query: string
  ): ContextWindow {
    let totalLength = 0
    const selectedSources: SearchResult[] = []
    let contextContent = ''

    // Sort results by relevance and select best ones within token limit
    const sortedResults = searchResults.sort(
      (a, b) => b.similarity_score - a.similarity_score
    )

    for (const result of sortedResults) {
      const sourceText = `Source: ${result.document_name || 'Knowledge Base'}\n${result.chunk_text}\n\n`
      const estimatedTokens = Math.ceil(sourceText.length / 4) // Rough token estimation

      if (totalLength + estimatedTokens <= maxLength) {
        selectedSources.push(result)
        contextContent += sourceText
        totalLength += estimatedTokens
      } else {
        break
      }
    }

    return {
      content: contextContent,
      sources: selectedSources,
      tokenCount: totalLength,
    }
  }

  private static async generateRAGResponse(
    query: string,
    context: string,
    additionalContext: string,
    model: string,
    temperature: number
  ): Promise<{
    choices: Array<{ message?: { content?: string } }>
    usage?: { total_tokens?: number }
  }> {
    // Check if OpenAI API key is available
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === 'dummy-key-for-build'
    ) {
      throw new Error('OpenAI API key is not configured')
    }
    const systemPrompt = `You are a knowledgeable AI assistant. Use the provided context to answer the user's question accurately and comprehensively.

Guidelines:
1. Base your answer primarily on the provided context
2. If the context doesn't contain enough information, clearly state what's missing
3. Be concise but complete in your response
4. If you're unsure about something, express that uncertainty
5. Cite sources when possible by referring to the document names mentioned

Context Information:
${context}

${additionalContext ? `Additional Context:\n${additionalContext}\n` : ''}`

    return openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature,
      max_tokens: 1000,
    })
  }

  private static calculateConfidence(
    _query: string,
    sources: SearchResult[],
    completion: { choices: Array<{ message?: { content?: string } }> }
  ): number {
    let confidence = 0.5 // Base confidence

    // Factor 1: Source relevance scores
    if (sources.length > 0) {
      const avgSimilarity =
        sources.reduce((sum, s) => sum + s.similarity_score, 0) / sources.length
      confidence += avgSimilarity * 0.3
    }

    // Factor 2: Number of relevant sources
    const sourceBonus = Math.min(sources.length / this.MAX_SOURCES, 1) * 0.1
    confidence += sourceBonus

    // Factor 3: Response length and structure (basic heuristic)
    const responseText = completion.choices[0]?.message?.content || ''
    if (responseText.length > 100) {
      confidence += 0.1
    }

    // Factor 4: Presence of specific citations or references
    if (
      responseText.includes('based on') ||
      responseText.includes('according to')
    ) {
      confidence += 0.05
    }

    return Math.min(confidence, 1.0)
  }

  private static async generateFallbackResponse(
    _query: string,
    model: string
  ): Promise<RAGResponse> {
    // Check if OpenAI API key is available
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === 'dummy-key-for-build'
    ) {
      throw new Error('OpenAI API key is not configured')
    }
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            "You are a helpful AI assistant. The user's query couldn't be answered using available documents. Provide a general helpful response and suggest how they might find the information they're looking for.",
        },
        { role: 'user', content: _query },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return {
      answer:
        completion.choices[0]?.message?.content ||
        'I cannot provide a specific answer to your question based on the available information. Please try rephrasing your question or provide more context.',
      sources: [],
      contextUsed: '',
      confidence: 0.2,
      model,
      tokensUsed: (completion as { usage?: { total_tokens?: number } }).usage
        ?.total_tokens,
    }
  }

  private static enhanceQueryWithContext(
    query: string,
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): string {
    if (chatHistory.length === 0) return query

    // Look for references to previous conversation
    const hasReference =
      /\b(it|this|that|them|they|above|previous|earlier)\b/i.test(query)

    if (hasReference && chatHistory.length > 0) {
      const lastUserMessage = [...chatHistory]
        .reverse()
        .find(msg => msg.role === 'user')?.content
      const lastAssistantMessage = [...chatHistory]
        .reverse()
        .find(msg => msg.role === 'assistant')?.content

      if (lastUserMessage || lastAssistantMessage) {
        return `Previous context: ${lastUserMessage || ''} ${lastAssistantMessage || ''}\n\nCurrent question: ${query}`
      }
    }

    return query
  }
}

export default RAGService
