import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface SearchResult {
  id: string
  chunk_text: string
  metadata: Record<string, unknown>
  similarity_score: number
  document_id?: string
  document_name?: string
  project_id?: string | null
  custom_bot_id?: string
}

export interface SearchOptions {
  limit?: number
  threshold?: number
  projectId?: string | null
  documentIds?: string[]
  customBotId?: string
  includeMetadata?: boolean
}

export interface HybridSearchOptions extends SearchOptions {
  keywordWeight?: number
  vectorWeight?: number
  enableReranking?: boolean
}

export class VectorSearch {
  private static readonly EMBEDDING_MODEL = 'text-embedding-ada-002'
  private static readonly DEFAULT_LIMIT = 10
  private static readonly DEFAULT_THRESHOLD = 0.7

  /**
   * Semantic search using vector embeddings
   */
  static async semanticSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      const {
        limit = this.DEFAULT_LIMIT,
        threshold = this.DEFAULT_THRESHOLD,
        projectId,
        documentIds,
        includeMetadata = true,
      } = options

      // Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query)

      // Build search query
      let searchQuery = supabase.rpc('search_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
      })

      // Apply filters if provided
      if (projectId) {
        searchQuery = searchQuery.eq('project_id', projectId)
      }

      if (documentIds && documentIds.length > 0) {
        searchQuery = searchQuery.in('document_id', documentIds)
      }

      const { data, error } = await searchQuery

      if (error) {
        console.error('Semantic search error:', error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      // Format results
      const results: SearchResult[] = data.map(
        (item: {
          id: string
          chunk_text: string
          metadata: Record<string, unknown>
          similarity: number
          document_id: string
          project_id: string | null
        }) => ({
          id: item.id,
          chunk_text: item.chunk_text,
          metadata: includeMetadata ? item.metadata : {},
          similarity_score: item.similarity,
          document_id: item.document_id,
          document_name:
            (item.metadata?.document_file_name as string) || 'Unknown',
          project_id: item.project_id,
        })
      )

      return this.rankResults(results, query)
    } catch (error) {
      console.error('Semantic search failed:', error)
      return []
    }
  }

  /**
   * Knowledge base search for custom bots
   */
  static async searchKnowledgeBase(
    query: string,
    customBotId: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      const {
        limit = this.DEFAULT_LIMIT,
        threshold = this.DEFAULT_THRESHOLD,
        includeMetadata = true,
      } = options

      // Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query)

      // Search knowledge base
      const { data, error } = await supabase.rpc('search_knowledge_base', {
        query_embedding: queryEmbedding,
        bot_id: customBotId,
        match_threshold: threshold,
        match_count: limit,
      })

      if (error) {
        console.error('Knowledge base search error:', error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      // Format results
      const results: SearchResult[] = data.map(
        (item: {
          id: string
          title: string
          content: string
          metadata: Record<string, unknown>
          similarity: number
          custom_bot_id: string
        }) => ({
          id: item.id,
          chunk_text: item.content,
          metadata: includeMetadata ? item.metadata : {},
          similarity_score: item.similarity,
          custom_bot_id: customBotId,
        })
      )

      return this.rankResults(results, query)
    } catch (error) {
      console.error('Knowledge base search failed:', error)
      return []
    }
  }

  /**
   * Hybrid search combining keyword and vector search
   */
  static async hybridSearch(
    query: string,
    options: HybridSearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      const {
        limit = this.DEFAULT_LIMIT,
        threshold = this.DEFAULT_THRESHOLD,
        keywordWeight = 0.3,
        vectorWeight = 0.7,
        enableReranking = true,
        projectId,
        documentIds,
      } = options

      // Perform vector search
      const vectorResults = await this.semanticSearch(query, {
        limit: limit * 2, // Get more results for better hybrid ranking
        threshold,
        projectId,
        documentIds,
      })

      // Perform keyword search
      const keywordResults = await this.keywordSearch(query, {
        limit: limit * 2,
        projectId,
        documentIds,
      })

      // Combine and re-rank results
      const hybridResults = this.combineSearchResults(
        vectorResults,
        keywordResults,
        vectorWeight,
        keywordWeight
      )

      // Apply final ranking if enabled
      const finalResults = enableReranking
        ? this.rankResults(hybridResults.slice(0, limit * 2), query)
        : hybridResults

      return finalResults.slice(0, limit)
    } catch (error) {
      console.error('Hybrid search failed:', error)
      return []
    }
  }

  /**
   * Keyword-based search using full-text search
   */
  static async keywordSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      const {
        limit = this.DEFAULT_LIMIT,
        projectId,
        documentIds,
        includeMetadata = true,
      } = options

      // Build full-text search query
      let searchQuery = supabase
        .from('document_chunks')
        .select(
          `
          id,
          chunk_text,
          metadata,
          document_id,
          project_id
        `
        )
        .textSearch('chunk_text', query, {
          type: 'websearch',
          config: 'english',
        })
        .limit(limit)

      // Apply filters
      if (projectId) {
        searchQuery = searchQuery.eq('project_id', projectId)
      }

      if (documentIds && documentIds.length > 0) {
        searchQuery = searchQuery.in('document_id', documentIds)
      }

      const { data, error } = await searchQuery

      if (error) {
        console.error('Keyword search error:', error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      // Format results with keyword similarity scoring
      const results: SearchResult[] = data.map(
        (item: {
          id: string
          chunk_text: string
          metadata: Record<string, unknown>
          document_id: string
          project_id: string | null
        }) => ({
          id: item.id,
          chunk_text: item.chunk_text,
          metadata: includeMetadata ? item.metadata : {},
          similarity_score: this.calculateKeywordSimilarity(
            query,
            item.chunk_text
          ),
          document_id: item.document_id,
          document_name:
            (item.metadata?.document_file_name as string) || 'Unknown',
          project_id: item.project_id,
        })
      )

      return results.sort((a, b) => b.similarity_score - a.similarity_score)
    } catch (error) {
      console.error('Keyword search failed:', error)
      return []
    }
  }

  /**
   * Multi-document search across user's entire document collection
   */
  static async globalSearch(
    query: string,
    userId: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      // Get user's documents
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('id, file_name, project_id')
        .eq('user_id', userId)

      if (docError || !documents) {
        console.error('Failed to fetch user documents:', docError)
        return []
      }

      const documentIds = documents.map(doc => doc.id)

      // Perform hybrid search across all documents
      const results = await this.hybridSearch(query, {
        ...options,
        documentIds,
      })

      // Enhance results with document information
      return results.map(result => {
        const doc = documents.find(d => d.id === result.document_id)
        return {
          ...result,
          document_name: doc?.file_name || 'Unknown',
          project_id: doc?.project_id || null,
        }
      })
    } catch (error) {
      console.error('Global search failed:', error)
      return []
    }
  }

  /**
   * Find similar chunks to a given chunk
   */
  static async findSimilarChunks(
    chunkId: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      const { limit = this.DEFAULT_LIMIT, threshold = this.DEFAULT_THRESHOLD } =
        options

      // Get the chunk and its embedding
      const { data: chunk, error: chunkError } = await supabase
        .from('document_chunks')
        .select('chunk_text, embedding, user_id, project_id')
        .eq('id', chunkId)
        .single()

      if (chunkError || !chunk || !chunk.embedding) {
        console.error('Failed to fetch chunk or embedding:', chunkError)
        return []
      }

      // Search for similar chunks
      const { data, error } = await supabase
        .rpc('search_document_chunks', {
          query_embedding: chunk.embedding,
          match_threshold: threshold,
          match_count: limit + 1, // +1 to exclude the original chunk
        })
        .neq('id', chunkId) // Exclude the original chunk

      if (error) {
        console.error('Similar chunks search error:', error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      return data.map(
        (item: {
          id: string
          chunk_text: string
          metadata: Record<string, unknown>
          similarity: number
          document_id: string
          project_id: string | null
        }) => ({
          id: item.id,
          chunk_text: item.chunk_text,
          metadata: item.metadata,
          similarity_score: item.similarity,
          document_id: item.document_id,
          document_name:
            (item.metadata?.document_file_name as string) || 'Unknown',
          project_id: item.project_id,
        })
      )
    } catch (error) {
      console.error('Find similar chunks failed:', error)
      return []
    }
  }

  // Private helper methods

  private static async generateQueryEmbedding(
    query: string
  ): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: this.EMBEDDING_MODEL,
        input: query,
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Failed to generate query embedding:', error)
      throw new Error('Query embedding generation failed')
    }
  }

  private static calculateKeywordSimilarity(
    query: string,
    text: string
  ): number {
    const queryWords = query.toLowerCase().split(/\s+/)
    const textWords = text.toLowerCase().split(/\s+/)
    const textSet = new Set(textWords)

    const matches = queryWords.filter(word => textSet.has(word)).length
    return matches / queryWords.length
  }

  private static combineSearchResults(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    vectorWeight: number,
    keywordWeight: number
  ): SearchResult[] {
    const resultMap = new Map<string, SearchResult>()

    // Add vector results
    vectorResults.forEach(result => {
      resultMap.set(result.id, {
        ...result,
        similarity_score: result.similarity_score * vectorWeight,
      })
    })

    // Add or combine keyword results
    keywordResults.forEach(result => {
      if (resultMap.has(result.id)) {
        const existing = resultMap.get(result.id)!
        existing.similarity_score += result.similarity_score * keywordWeight
      } else {
        resultMap.set(result.id, {
          ...result,
          similarity_score: result.similarity_score * keywordWeight,
        })
      }
    })

    return Array.from(resultMap.values()).sort(
      (a, b) => b.similarity_score - a.similarity_score
    )
  }

  private static rankResults(
    results: SearchResult[],
    query: string
  ): SearchResult[] {
    // Apply additional ranking factors
    return results
      .map(result => {
        let boost = 1.0

        // Boost results where query terms appear in exact order
        if (result.chunk_text.toLowerCase().includes(query.toLowerCase())) {
          boost *= 1.2
        }

        // Boost shorter, more focused chunks
        if (result.chunk_text.length < 500) {
          boost *= 1.1
        }

        // Boost results with high-quality metadata
        if (
          result.metadata.confidence_score &&
          typeof result.metadata.confidence_score === 'number' &&
          result.metadata.confidence_score > 0.8
        ) {
          boost *= 1.05
        }

        return {
          ...result,
          similarity_score: result.similarity_score * boost,
        }
      })
      .sort((a, b) => b.similarity_score - a.similarity_score)
  }
}

export default VectorSearch
