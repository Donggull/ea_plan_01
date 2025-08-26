import { NextRequest, NextResponse } from 'next/server'
import DocumentProcessor from '@/lib/services/documentProcessor'
import DocumentService from '@/lib/services/documentService'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string | null
    const generateEmbeddings = formData.get('generateEmbeddings') === 'true'
    const chunkSize = parseInt(formData.get('chunkSize') as string) || 1000
    const chunkOverlap = parseInt(formData.get('chunkOverlap') as string) || 200

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/haansofthwp',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Unsupported file type. Supported types: TXT, PDF, DOC, DOCX, HWP',
        },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 50MB' },
        { status: 400 }
      )
    }

    // Upload document first
    console.log('Uploading document to storage...')
    const uploadResult = await DocumentService.uploadDocument(
      file,
      projectId || undefined
    )

    if (!uploadResult.success || !uploadResult.data) {
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload document' },
        { status: 500 }
      )
    }

    const document = uploadResult.data

    // Extract text content based on file type
    let textContent = ''
    try {
      if (file.type === 'text/plain') {
        textContent = await file.text()
      } else if (file.type === 'application/pdf') {
        // For now, return a message that PDF processing needs to be implemented
        // In a real implementation, you would use pdf-parse or similar library
        textContent =
          'PDF content extraction not yet implemented. Please upload a text file for testing.'
      } else if (file.type.includes('word')) {
        // For now, return a message that Word processing needs to be implemented
        // In a real implementation, you would use mammoth or similar library
        textContent =
          'Word document extraction not yet implemented. Please upload a text file for testing.'
      } else {
        textContent = 'Unsupported file type for content extraction.'
      }
    } catch (error) {
      console.error('Content extraction error:', error)
      textContent = 'Failed to extract content from file.'
    }

    if (!textContent || textContent.length === 0) {
      return NextResponse.json(
        { error: 'No text content could be extracted from the file' },
        { status: 400 }
      )
    }

    // Process document with RAG pipeline
    console.log('Processing document with RAG pipeline...')
    const processingResult = await DocumentProcessor.processDocument(
      document.id,
      textContent,
      {
        chunkSize,
        chunkOverlap,
        generateEmbeddings,
        extractMetadata: true,
      }
    )

    if (!processingResult.success) {
      // Even if processing fails, we should clean up the uploaded document
      await DocumentService.deleteDocument(document.id)
      return NextResponse.json(
        { error: processingResult.error || 'Failed to process document' },
        { status: 500 }
      )
    }

    // Update document with extracted content
    await DocumentService.updateDocument(document.id, {
      extracted_content: textContent,
      metadata: {
        ...document.metadata,
        processed: true,
        chunks_count: processingResult.chunksCount,
        processing_options: {
          chunkSize,
          chunkOverlap,
          generateEmbeddings,
        },
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        file_name: document.file_name,
        file_type: document.file_type,
        file_size: document.file_size,
        project_id: document.project_id,
      },
      processing: {
        chunks_count: processingResult.chunksCount,
        content_length: textContent.length,
        embeddings_generated: generateEmbeddings,
      },
    })
  } catch (error) {
    console.error('RAG upload error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    // Get processed documents
    const documentsResult = projectId
      ? await DocumentService.getDocumentsByProject(projectId)
      : await DocumentService.listDocuments()

    if (!documentsResult.success) {
      return NextResponse.json(
        { error: documentsResult.error || 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    const processedDocuments = (documentsResult.data || []).filter(
      doc => doc.metadata?.processed === true
    )

    return NextResponse.json({
      success: true,
      documents: processedDocuments.map(doc => ({
        id: doc.id,
        file_name: doc.file_name,
        file_type: doc.file_type,
        file_size: doc.file_size,
        project_id: doc.project_id,
        chunks_count: doc.metadata?.chunks_count || 0,
        created_at: doc.created_at,
      })),
      total: processedDocuments.length,
    })
  } catch (error) {
    console.error('RAG documents fetch error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
