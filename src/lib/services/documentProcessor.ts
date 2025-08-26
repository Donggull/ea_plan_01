import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

export interface DocumentChunk {
  id: string
  document_id: string
  user_id: string
  project_id?: string | null
  chunk_text: string
  chunk_index: number
  metadata: Record<string, unknown>
  embedding?: number[]
  created_at: string
  updated_at: string
}

export interface ProcessingOptions {
  chunkSize?: number
  chunkOverlap?: number
  generateEmbeddings?: boolean
  extractMetadata?: boolean
}

export interface ProcessingResult {
  success: boolean
  error?: string
  chunksCount?: number
  chunks?: DocumentChunk[]
}

export class DocumentProcessor {
  private static readonly DEFAULT_CHUNK_SIZE = 1000
  private static readonly DEFAULT_CHUNK_OVERLAP = 200
  private static readonly EMBEDDING_MODEL = 'text-embedding-ada-002'

  /**
   * Process a document by chunking and generating embeddings
   */
  static async processDocument(
    documentId: string,
    content: string,
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> {
    try {
      const {
        chunkSize = this.DEFAULT_CHUNK_SIZE,
        chunkOverlap = this.DEFAULT_CHUNK_OVERLAP,
        generateEmbeddings = true,
        extractMetadata = true,
      } = options

      // Get document info
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('id, user_id, project_id, file_name, file_type')
        .eq('id', documentId)
        .single()

      if (docError || !document) {
        return {
          success: false,
          error: `Failed to fetch document: ${docError?.message}`,
        }
      }

      // Clean and preprocess content
      const cleanContent = this.cleanText(content)

      // Split content into chunks
      const textChunks = this.splitIntoChunks(
        cleanContent,
        chunkSize,
        chunkOverlap
      )

      // Extract metadata if requested
      const documentMetadata = extractMetadata
        ? await this.extractDocumentMetadata(cleanContent, document.file_name)
        : {}

      // Process chunks
      const chunks: DocumentChunk[] = []
      const batchSize = 10 // Process embeddings in batches to avoid rate limits

      for (let i = 0; i < textChunks.length; i += batchSize) {
        const batch = textChunks.slice(i, i + batchSize)
        const batchChunks = await this.processBatch(
          batch,
          i,
          document,
          documentMetadata,
          generateEmbeddings
        )
        chunks.push(...batchChunks)
      }

      // Store chunks in database
      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert(
          chunks.map(chunk => ({
            document_id: chunk.document_id,
            user_id: chunk.user_id,
            project_id: chunk.project_id,
            chunk_text: chunk.chunk_text,
            chunk_index: chunk.chunk_index,
            metadata: chunk.metadata,
            embedding: chunk.embedding,
          }))
        )

      if (insertError) {
        return {
          success: false,
          error: `Failed to store chunks: ${insertError.message}`,
        }
      }

      return {
        success: true,
        chunksCount: chunks.length,
        chunks,
      }
    } catch (error) {
      return {
        success: false,
        error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Process knowledge base content for custom bots
   */
  static async processKnowledgeBase(
    customBotId: string,
    userId: string,
    title: string,
    content: string
  ): Promise<ProcessingResult> {
    try {
      // Clean content
      const cleanContent = this.cleanText(content)

      // Generate embedding
      const embedding = await this.generateEmbedding(cleanContent)

      // Extract metadata
      const metadata = await this.extractDocumentMetadata(cleanContent, title)

      // Store in knowledge_base table
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          custom_bot_id: customBotId,
          user_id: userId,
          title,
          content: cleanContent,
          metadata,
          embedding,
        })
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: `Failed to store knowledge base: ${error.message}`,
        }
      }

      return {
        success: true,
        chunksCount: 1,
        chunks: [data as unknown as DocumentChunk],
      }
    } catch (error) {
      return {
        success: false,
        error: `Knowledge base processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Update embeddings for existing chunks
   */
  static async updateChunkEmbeddings(
    chunkIds: string[]
  ): Promise<ProcessingResult> {
    try {
      // Get chunks
      const { data: chunks, error: fetchError } = await supabase
        .from('document_chunks')
        .select('id, chunk_text')
        .in('id', chunkIds)

      if (fetchError) {
        return {
          success: false,
          error: `Failed to fetch chunks: ${fetchError.message}`,
        }
      }

      if (!chunks || chunks.length === 0) {
        return {
          success: false,
          error: 'No chunks found',
        }
      }

      // Generate embeddings for all chunks
      const embeddings = await this.generateEmbeddings(
        chunks.map(chunk => chunk.chunk_text)
      )

      // Update chunks with embeddings
      const updatePromises = chunks.map((chunk, index) =>
        supabase
          .from('document_chunks')
          .update({ embedding: embeddings[index] })
          .eq('id', chunk.id)
      )

      const results = await Promise.all(updatePromises)
      const errors = results.filter(result => result.error)

      if (errors.length > 0) {
        return {
          success: false,
          error: `Failed to update ${errors.length} chunks`,
        }
      }

      return {
        success: true,
        chunksCount: chunks.length,
      }
    } catch (error) {
      return {
        success: false,
        error: `Embedding update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Delete all chunks for a document
   */
  static async deleteDocumentChunks(
    documentId: string
  ): Promise<ProcessingResult> {
    try {
      const { error } = await supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId)

      if (error) {
        return {
          success: false,
          error: `Failed to delete chunks: ${error.message}`,
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: `Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  // Private helper methods

  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
      .trim()
  }

  private static splitIntoChunks(
    text: string,
    chunkSize: number,
    overlap: number
  ): string[] {
    const chunks: string[] = []
    let start = 0

    while (start < text.length) {
      let end = Math.min(start + chunkSize, text.length)

      // Try to find a natural break point (sentence end)
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('.', end)
        const lastNewline = text.lastIndexOf('\n', end)
        const breakPoint = Math.max(lastPeriod, lastNewline)

        if (breakPoint > start + chunkSize * 0.5) {
          end = breakPoint + 1
        }
      }

      const chunk = text.slice(start, end).trim()
      if (chunk.length > 0) {
        chunks.push(chunk)
      }

      start = Math.max(end - overlap, start + 1)
    }

    return chunks
  }

  private static async processBatch(
    textChunks: string[],
    startIndex: number,
    document: {
      id: string
      user_id: string
      project_id?: string | null
      file_name: string
      file_type: string
    },
    documentMetadata: Record<string, unknown>,
    generateEmbeddings: boolean
  ): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = []

    // Generate embeddings for the batch if requested
    const embeddings = generateEmbeddings
      ? await this.generateEmbeddings(textChunks)
      : new Array(textChunks.length).fill(null)

    for (let i = 0; i < textChunks.length; i++) {
      const chunkMetadata = {
        ...documentMetadata,
        chunk_length: textChunks[i].length,
        document_file_name: document.file_name,
        document_file_type: document.file_type,
      }

      chunks.push({
        id: '', // Will be generated by database
        document_id: document.id,
        user_id: document.user_id,
        project_id: document.project_id,
        chunk_text: textChunks[i],
        chunk_index: startIndex + i,
        metadata: chunkMetadata,
        embedding: embeddings[i],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    return chunks
  }

  private static async generateEmbeddings(
    texts: string[]
  ): Promise<number[][]> {
    try {
      // Check if OpenAI API key is available
      if (
        !process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY === 'dummy-key-for-build'
      ) {
        throw new Error('OpenAI API key is not configured')
      }
      const response = await openai.embeddings.create({
        model: this.EMBEDDING_MODEL,
        input: texts,
      })

      return response.data.map(item => item.embedding)
    } catch (error) {
      console.error('Failed to generate embeddings:', error)
      throw new Error('Embedding generation failed')
    }
  }

  private static async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbeddings([text])
    return embeddings[0]
  }

  private static async extractDocumentMetadata(
    content: string,
    fileName: string
  ): Promise<Record<string, unknown>> {
    const metadata: Record<string, unknown> = {
      file_name: fileName,
      content_length: content.length,
      word_count: content.split(/\s+/).length,
      extracted_at: new Date().toISOString(),
    }

    // Extract basic patterns
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
    const urlPattern = /https?:\/\/[^\s]+/g
    const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g

    const emails = content.match(emailPattern) || []
    const phones = content.match(phonePattern) || []
    const urls = content.match(urlPattern) || []
    const dates = content.match(datePattern) || []

    if (emails.length > 0) metadata.emails = emails
    if (phones.length > 0) metadata.phones = phones
    if (urls.length > 0) metadata.urls = urls
    if (dates.length > 0) metadata.dates = dates

    // Basic content analysis
    const lines = content.split('\n').filter(line => line.trim().length > 0)
    metadata.line_count = lines.length

    // Look for common document sections
    const sections = []
    const sectionPatterns = [
      /목차|table of contents/i,
      /요약|summary|abstract/i,
      /서론|introduction/i,
      /결론|conclusion/i,
      /참고문헌|references|bibliography/i,
      /부록|appendix/i,
    ]

    for (const pattern of sectionPatterns) {
      if (pattern.test(content)) {
        sections.push(pattern.source.split('|')[0])
      }
    }

    if (sections.length > 0) metadata.sections = sections

    return metadata
  }
}

export default DocumentProcessor
