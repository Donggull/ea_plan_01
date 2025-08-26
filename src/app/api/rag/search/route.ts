import { NextRequest, NextResponse } from 'next/server'
import VectorSearch from '@/lib/services/vectorSearch'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      searchType = 'hybrid',
      projectId,
      documentIds,
      customBotId,
      limit = 10,
      threshold = 0.7,
      includeMetadata = true,
    } = await request.json()

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const searchOptions = {
      limit: Math.min(limit, 50), // Cap at 50 results
      threshold: Math.max(0.1, Math.min(threshold, 1.0)), // Clamp between 0.1 and 1.0
      projectId,
      documentIds,
      includeMetadata,
    }

    let results = []

    try {
      switch (searchType) {
        case 'semantic':
          results = await VectorSearch.semanticSearch(query, searchOptions)
          break

        case 'keyword':
          results = await VectorSearch.keywordSearch(query, searchOptions)
          break

        case 'hybrid':
          results = await VectorSearch.hybridSearch(query, {
            ...searchOptions,
            keywordWeight: 0.3,
            vectorWeight: 0.7,
            enableReranking: true,
          })
          break

        case 'knowledge_base':
          if (!customBotId) {
            return NextResponse.json(
              { error: 'customBotId is required for knowledge_base search' },
              { status: 400 }
            )
          }
          results = await VectorSearch.searchKnowledgeBase(
            query,
            customBotId,
            searchOptions
          )
          break

        case 'global':
          results = await VectorSearch.globalSearch(
            query,
            user.id,
            searchOptions
          )
          break

        default:
          return NextResponse.json(
            {
              error:
                'Invalid searchType. Must be one of: semantic, keyword, hybrid, knowledge_base, global',
            },
            { status: 400 }
          )
      }
    } catch (searchError) {
      console.error('Search execution error:', searchError)
      return NextResponse.json(
        {
          error: 'Search execution failed',
          details:
            searchError instanceof Error
              ? searchError.message
              : 'Unknown search error',
        },
        { status: 500 }
      )
    }

    // Log search activity
    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'rag_search',
        metadata: {
          query,
          searchType,
          results_count: results.length,
          projectId,
          customBotId,
        },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })
    } catch (logError) {
      console.warn('Failed to log search activity:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      query,
      searchType,
      results,
      metadata: {
        total_results: results.length,
        search_options: searchOptions,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('RAG search error:', error)
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
    const chunkId = searchParams.get('chunkId')

    if (!chunkId) {
      return NextResponse.json(
        { error: 'chunkId parameter is required' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find similar chunks
    const results = await VectorSearch.findSimilarChunks(chunkId, {
      limit: 10,
      threshold: 0.6,
      includeMetadata: true,
    })

    return NextResponse.json({
      success: true,
      chunkId,
      similar_chunks: results,
      metadata: {
        total_results: results.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Similar chunks search error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
