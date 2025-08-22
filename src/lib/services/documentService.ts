import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Document = Database['public']['Tables']['documents']['Row']
type DocumentInsert = Database['public']['Tables']['documents']['Insert']
type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export interface CreateDocumentData {
  project_id?: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  extracted_content?: string
  analysis_result?: Record<string, any>
  metadata?: Record<string, any>
}

export interface UpdateDocumentData {
  file_name?: string
  extracted_content?: string
  analysis_result?: Record<string, any>
  metadata?: Record<string, any>
}

export interface DocumentListFilters {
  project_id?: string
  file_type?: string
  search?: string
  limit?: number
  offset?: number
}

export interface DocumentServiceResponse<T = any> {
  data: T | null
  error: string | null
  success: boolean
}

export interface DocumentWithAnalysis extends Document {
  analysisStatus?: 'pending' | 'completed' | 'failed'
  keyInsights?: string[]
  extractedEntities?: Record<string, any>
}

export class DocumentService {
  static async uploadDocument(file: File, projectId?: string): Promise<DocumentServiceResponse<Document>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to upload document',
          success: false
        }
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `documents/${user.id}/${projectId || 'general'}/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        return {
          data: null,
          error: `Failed to upload file: ${uploadError.message}`,
          success: false
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Create document record
      const documentData: CreateDocumentData = {
        project_id: projectId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: urlData.publicUrl,
        metadata: {
          upload_date: new Date().toISOString(),
          original_name: file.name,
          storage_path: filePath
        }
      }

      const result = await this.createDocument(documentData)

      if (result.success && result.data) {
        // Trigger content extraction and analysis in the background
        this.extractContentAndAnalyze(result.data.id, file).catch(console.error)
      }

      return result
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async createDocument(documentData: CreateDocumentData): Promise<DocumentServiceResponse<Document>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to create document',
          success: false
        }
      }

      const insertData: DocumentInsert = {
        user_id: user.id,
        project_id: documentData.project_id,
        file_name: documentData.file_name,
        file_type: documentData.file_type,
        file_size: documentData.file_size,
        file_url: documentData.file_url,
        extracted_content: documentData.extracted_content,
        analysis_result: documentData.analysis_result,
        metadata: documentData.metadata || {}
      }

      const { data: newDocument, error: insertError } = await supabase
        .from('documents')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        return {
          data: null,
          error: `Failed to create document: ${insertError.message}`,
          success: false
        }
      }

      // Log the activity
      await this.logDocumentActivity(newDocument.id, user.id, 'document_created', {
        file_name: documentData.file_name,
        file_type: documentData.file_type,
        project_id: documentData.project_id
      })

      return {
        data: newDocument,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async getDocumentById(documentId: string): Promise<DocumentServiceResponse<DocumentWithAnalysis>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      const { data: document, error: documentError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single()

      if (documentError) {
        return {
          data: null,
          error: `Failed to fetch document: ${documentError.message}`,
          success: false
        }
      }

      // Enhance document with analysis status and insights
      const documentWithAnalysis: DocumentWithAnalysis = {
        ...document,
        analysisStatus: document.analysis_result ? 'completed' : 'pending',
        keyInsights: document.analysis_result?.key_insights || [],
        extractedEntities: document.analysis_result?.entities || {}
      }

      return {
        data: documentWithAnalysis,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async updateDocument(documentId: string, updates: UpdateDocumentData): Promise<DocumentServiceResponse<Document>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to update document',
          success: false
        }
      }

      const updateData: DocumentUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { data: updatedDocument, error: updateError } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        return {
          data: null,
          error: `Failed to update document: ${updateError.message}`,
          success: false
        }
      }

      // Log the activity
      await this.logDocumentActivity(documentId, user.id, 'document_updated', { updates })

      return {
        data: updatedDocument,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async deleteDocument(documentId: string): Promise<DocumentServiceResponse<boolean>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated to delete document',
          success: false
        }
      }

      // Get document details for cleanup and logging
      const { data: document } = await supabase
        .from('documents')
        .select('file_name, file_url, metadata')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single()

      if (document) {
        // Delete file from storage if storage path exists
        const storagePath = document.metadata?.storage_path
        if (storagePath) {
          await supabase.storage
            .from('documents')
            .remove([storagePath])
            .catch(console.error) // Don't fail the operation if storage cleanup fails
        }

        // Log the deletion before actually deleting
        await this.logDocumentActivity(documentId, user.id, 'document_deleted', {
          file_name: document.file_name
        })
      }

      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id)

      if (deleteError) {
        return {
          data: null,
          error: `Failed to delete document: ${deleteError.message}`,
          success: false
        }
      }

      return {
        data: true,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async listDocuments(filters: DocumentListFilters = {}): Promise<DocumentServiceResponse<DocumentWithAnalysis[]>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)

      // Apply filters
      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id)
      }

      if (filters.file_type) {
        query = query.eq('file_type', filters.file_type)
      }

      if (filters.search) {
        query = query.or(`file_name.ilike.%${filters.search}%,extracted_content.ilike.%${filters.search}%`)
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      // Order by created_at descending
      query = query.order('created_at', { ascending: false })

      const { data: documents, error: documentsError } = await query

      if (documentsError) {
        return {
          data: null,
          error: `Failed to fetch documents: ${documentsError.message}`,
          success: false
        }
      }

      // Enhance documents with analysis status
      const documentsWithAnalysis: DocumentWithAnalysis[] = (documents || []).map(document => ({
        ...document,
        analysisStatus: document.analysis_result ? 'completed' : 'pending',
        keyInsights: document.analysis_result?.key_insights || [],
        extractedEntities: document.analysis_result?.entities || {}
      }))

      return {
        data: documentsWithAnalysis,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  static async getDocumentsByProject(projectId: string): Promise<DocumentServiceResponse<DocumentWithAnalysis[]>> {
    return this.listDocuments({ project_id: projectId })
  }

  static async getDocumentsByType(fileType: string): Promise<DocumentServiceResponse<DocumentWithAnalysis[]>> {
    return this.listDocuments({ file_type: fileType })
  }

  static async searchDocuments(searchTerm: string): Promise<DocumentServiceResponse<DocumentWithAnalysis[]>> {
    return this.listDocuments({ search: searchTerm })
  }

  static async analyzeDocument(documentId: string, analysisType: string = 'general'): Promise<DocumentServiceResponse<any>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User must be authenticated',
          success: false
        }
      }

      const { data: document, error: documentError } = await supabase
        .from('documents')
        .select('extracted_content, file_name, file_type')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single()

      if (documentError) {
        return {
          data: null,
          error: `Failed to fetch document: ${documentError.message}`,
          success: false
        }
      }

      if (!document.extracted_content) {
        return {
          data: null,
          error: 'Document content has not been extracted yet',
          success: false
        }
      }

      // Here you would call your AI service to analyze the document
      // For now, we'll create a mock analysis result
      const analysisResult = {
        analysis_type: analysisType,
        key_insights: [
          'Document contains project requirements',
          'Timeline specifications found',
          'Budget constraints identified'
        ],
        entities: {
          dates: [],
          budget_items: [],
          requirements: []
        },
        summary: 'Document analysis completed',
        confidence_score: 0.85,
        processed_at: new Date().toISOString()
      }

      // Update document with analysis result
      const updateResult = await this.updateDocument(documentId, {
        analysis_result: analysisResult
      })

      if (!updateResult.success) {
        return updateResult
      }

      return {
        data: analysisResult,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      }
    }
  }

  private static async extractContentAndAnalyze(documentId: string, file: File): Promise<void> {
    try {
      let extractedContent = ''

      // Extract content based on file type
      if (file.type === 'text/plain') {
        extractedContent = await file.text()
      } else if (file.type === 'application/pdf') {
        // PDF extraction would require additional libraries
        extractedContent = 'PDF content extraction not implemented yet'
      } else if (file.type.includes('word')) {
        // Word document extraction would require additional libraries
        extractedContent = 'Word document extraction not implemented yet'
      }

      // Update document with extracted content
      if (extractedContent) {
        await this.updateDocument(documentId, {
          extracted_content: extractedContent
        })

        // Trigger analysis
        await this.analyzeDocument(documentId, 'automatic')
      }
    } catch (error) {
      console.error('Failed to extract content and analyze document:', error)
    }
  }

  private static async logDocumentActivity(
    documentId: string,
    userId: string,
    action: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          document_id: documentId,
          action,
          metadata,
          ip_address: 'unknown',
          user_agent: 'unknown'
        })
    } catch (error) {
      console.error('Failed to log document activity:', error)
    }
  }
}

export default DocumentService