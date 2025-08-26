import { NextRequest, NextResponse } from 'next/server'
import KnowledgeBaseProcessor from '@/lib/services/knowledgeBaseProcessor'

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const botId = searchParams.get('botId')
    
    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const results = []
    
    for (const file of files) {
      const result = await KnowledgeBaseProcessor.processFileUpload(botId, file)
      results.push({
        file_name: file.name,
        ...result
      })
    }

    const totalProcessed = results.reduce((sum, r) => sum + r.processed_count, 0)
    const totalFailed = results.reduce((sum, r) => sum + r.failed_count, 0)
    const allErrors = results.flatMap(r => r.errors)

    return NextResponse.json({
      success: totalFailed === 0,
      processed_count: totalProcessed,
      failed_count: totalFailed,
      errors: allErrors,
      file_results: results
    })
  } catch (error) {
    console.error('Knowledge base upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process knowledge base upload' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const botId = searchParams.get('botId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      )
    }

    const knowledgeBase = await KnowledgeBaseProcessor.getKnowledgeBase(botId, limit)
    const stats = await KnowledgeBaseProcessor.getKnowledgeBaseStats(botId)

    return NextResponse.json({
      knowledge_base: knowledgeBase,
      stats
    })
  } catch (error) {
    console.error('Knowledge base fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
      { status: 500 }
    )
  }
}