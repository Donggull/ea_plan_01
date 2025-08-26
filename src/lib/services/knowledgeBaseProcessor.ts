import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

export interface KnowledgeBaseItem {
  id?: string
  custom_bot_id: string
  title: string
  content: string
  metadata?: Record<string, unknown>
}

export interface ProcessingResult {
  success: boolean
  processed_count: number
  failed_count: number
  errors: string[]
}

export class KnowledgeBaseProcessor {
  private static readonly CHUNK_SIZE = 1000
  private static readonly CHUNK_OVERLAP = 200
  private static readonly EMBEDDING_MODEL = 'text-embedding-ada-002'

  /**
   * Process and store knowledge base items with embeddings
   */
  static async processKnowledgeBase(
    customBotId: string,
    items: Omit<KnowledgeBaseItem, 'custom_bot_id'>[]
  ): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: true,
      processed_count: 0,
      failed_count: 0,
      errors: [],
    }

    try {
      // Check if OpenAI API key is available
      if (
        !process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY === 'dummy-key-for-build'
      ) {
        throw new Error('OpenAI API key is not configured')
      }

      for (const item of items) {
        try {
          await this.processAndStoreItem(customBotId, item)
          result.processed_count++
        } catch (error) {
          console.error(`Failed to process item: ${item.title}`, error)
          result.failed_count++
          result.errors.push(`${item.title}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          result.success = false
        }
      }

      return result
    } catch (error) {
      console.error('Knowledge base processing failed:', error)
      return {
        success: false,
        processed_count: 0,
        failed_count: items.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Process file upload and convert to knowledge base items
   */
  static async processFileUpload(
    customBotId: string,
    file: File
  ): Promise<ProcessingResult> {
    try {
      // Check if OpenAI API key is available
      if (
        !process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY === 'dummy-key-for-build'
      ) {
        throw new Error('OpenAI API key is not configured')
      }

      const fileContent = await this.extractFileContent(file)
      const chunks = this.chunkContent(fileContent, file.name)

      const items: Omit<KnowledgeBaseItem, 'custom_bot_id'>[] = chunks.map((chunk, index) => ({
        title: `${file.name} - Part ${index + 1}`,
        content: chunk,
        metadata: {
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          chunk_index: index,
          total_chunks: chunks.length,
        },
      }))

      return await this.processKnowledgeBase(customBotId, items)
    } catch (error) {
      console.error('File upload processing failed:', error)
      return {
        success: false,
        processed_count: 0,
        failed_count: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Update knowledge base item
   */
  static async updateKnowledgeBaseItem(
    itemId: string,
    updates: Partial<Pick<KnowledgeBaseItem, 'title' | 'content' | 'metadata'>>
  ): Promise<boolean> {
    try {
      // Check if OpenAI API key is available
      if (
        !process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY === 'dummy-key-for-build'
      ) {
        throw new Error('OpenAI API key is not configured')
      }

      const updateData: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      // If content is updated, regenerate embedding
      if (updates.content) {
        const embedding = await this.generateEmbedding(updates.content)
        updateData.embedding = embedding
      }

      const { error } = await supabase
        .from('knowledge_base')
        .update(updateData)
        .eq('id', itemId)

      if (error) {
        console.error('Failed to update knowledge base item:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Update knowledge base item failed:', error)
      return false
    }
  }

  /**
   * Delete knowledge base item
   */
  static async deleteKnowledgeBaseItem(itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', itemId)

      if (error) {
        console.error('Failed to delete knowledge base item:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Delete knowledge base item failed:', error)
      return false
    }
  }

  /**
   * Get knowledge base items for a bot
   */
  static async getKnowledgeBase(
    customBotId: string,
    limit?: number
  ): Promise<KnowledgeBaseItem[]> {
    try {
      let query = supabase
        .from('knowledge_base')
        .select('*')
        .eq('custom_bot_id', customBotId)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to get knowledge base:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Get knowledge base failed:', error)
      return []
    }
  }

  /**
   * Search knowledge base with semantic similarity
   */
  static async searchKnowledgeBase(
    customBotId: string,
    query: string,
    limit = 5,
    threshold = 0.7
  ): Promise<KnowledgeBaseItem[]> {
    try {
      // Check if OpenAI API key is available
      if (
        !process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY === 'dummy-key-for-build'
      ) {
        throw new Error('OpenAI API key is not configured')
      }

      const queryEmbedding = await this.generateEmbedding(query)

      const { data, error } = await supabase.rpc('search_knowledge_base', {
        query_embedding: queryEmbedding,
        bot_id: customBotId,
        match_threshold: threshold,
        match_count: limit,
      })

      if (error) {
        console.error('Knowledge base search failed:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Search knowledge base failed:', error)
      return []
    }
  }

  /**
   * Get knowledge base statistics
   */
  static async getKnowledgeBaseStats(customBotId: string): Promise<{
    total_items: number
    total_content_length: number
    file_types: Record<string, number>
  }> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('content, metadata')
        .eq('custom_bot_id', customBotId)

      if (error) {
        console.error('Failed to get knowledge base stats:', error)
        return {
          total_items: 0,
          total_content_length: 0,
          file_types: {},
        }
      }

      const stats = {
        total_items: data.length,
        total_content_length: data.reduce((sum, item) => sum + item.content.length, 0),
        file_types: {} as Record<string, number>,
      }

      data.forEach(item => {
        const fileType = item.metadata?.file_type as string
        if (fileType) {
          stats.file_types[fileType] = (stats.file_types[fileType] || 0) + 1
        }
      })

      return stats
    } catch (error) {
      console.error('Get knowledge base stats failed:', error)
      return {
        total_items: 0,
        total_content_length: 0,
        file_types: {},
      }
    }
  }

  // Private helper methods

  private static async processAndStoreItem(
    customBotId: string,
    item: Omit<KnowledgeBaseItem, 'custom_bot_id'>
  ): Promise<void> {
    // Generate embedding for the content
    const embedding = await this.generateEmbedding(item.content)

    const { error } = await supabase
      .from('knowledge_base')
      .insert({
        custom_bot_id: customBotId,
        title: item.title,
        content: item.content,
        embedding,
        metadata: item.metadata || {},
      })

    if (error) {
      throw new Error(`Failed to store knowledge base item: ${error.message}`)
    }
  }

  private static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: this.EMBEDDING_MODEL,
        input: text.replace(/\n/g, ' ').trim(),
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Failed to generate embedding:', error)
      throw new Error('Embedding generation failed')
    }
  }

  private static async extractFileContent(file: File): Promise<string> {
    try {
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        return await file.text()
      } else if (file.type === 'application/pdf') {
        // For PDF files, we would need a PDF parsing library
        // For now, return a placeholder
        return `PDF File: ${file.name}\nContent extraction would require PDF parsing library.`
      } else if (
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        // For DOC/DOCX files, we would need a document parsing library
        // For now, return a placeholder
        return `Document File: ${file.name}\nContent extraction would require document parsing library.`
      } else {
        // Try to read as text for other file types
        return await file.text()
      }
    } catch (error) {
      console.error('Failed to extract file content:', error)
      return `Failed to extract content from ${file.name}`
    }
  }

  private static chunkContent(content: string, _fileName: string): string[] {
    if (content.length <= this.CHUNK_SIZE) {
      return [content]
    }

    const chunks: string[] = []
    let startIndex = 0

    while (startIndex < content.length) {
      let endIndex = Math.min(startIndex + this.CHUNK_SIZE, content.length)
      
      // Try to break at a sentence or paragraph boundary
      if (endIndex < content.length) {
        const sentenceBreak = content.lastIndexOf('.', endIndex)
        const paragraphBreak = content.lastIndexOf('\n', endIndex)
        const spaceBreak = content.lastIndexOf(' ', endIndex)
        
        const breakPoint = Math.max(sentenceBreak, paragraphBreak, spaceBreak)
        if (breakPoint > startIndex + this.CHUNK_SIZE * 0.8) {
          endIndex = breakPoint + 1
        }
      }

      let chunk = content.slice(startIndex, endIndex).trim()
      
      // Add context if this is not the first chunk
      if (startIndex > 0) {
        const contextStart = Math.max(0, startIndex - this.CHUNK_OVERLAP)
        const context = content.slice(contextStart, startIndex).trim()
        if (context) {
          chunk = `...${context}\n\n${chunk}`
        }
      }

      chunks.push(chunk)
      startIndex = endIndex - this.CHUNK_OVERLAP
      
      if (startIndex >= content.length) break
    }

    return chunks.filter(chunk => chunk.length > 0)
  }
}

export default KnowledgeBaseProcessor