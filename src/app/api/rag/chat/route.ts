import { NextRequest, NextResponse } from 'next/server'
import RAGService, { RAGQuery } from '@/lib/services/ragService'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      context,
      projectId,
      documentIds,
      customBotId,
      chatHistory,
      conversationId,
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      maxContextLength = 4000,
      stream: _stream = false,
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

    // Validate model parameter
    const allowedModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview']
    if (!allowedModels.includes(model)) {
      return NextResponse.json(
        { error: `Invalid model. Allowed models: ${allowedModels.join(', ')}` },
        { status: 400 }
      )
    }

    // Prepare RAG query
    const ragQuery: RAGQuery = {
      query,
      context,
      projectId,
      documentIds,
      customBotId,
      maxContextLength: Math.min(maxContextLength, 8000), // Cap at 8000 tokens
      temperature: Math.max(0.0, Math.min(temperature, 2.0)), // Clamp between 0 and 2
      model,
    }

    let ragResponse

    try {
      // Choose appropriate RAG method based on input
      if (chatHistory && Array.isArray(chatHistory)) {
        // Conversational RAG with chat history
        ragResponse = await RAGService.conversationalQuery(
          query,
          chatHistory,
          ragQuery
        )
      } else if (customBotId) {
        // Custom bot RAG query
        ragResponse = await RAGService.queryCustomBot(
          customBotId,
          query,
          context,
          ragQuery
        )
      } else if (projectId) {
        // Project-specific RAG query
        ragResponse = await RAGService.queryProject(
          projectId,
          query,
          context,
          ragQuery
        )
      } else if (documentIds && documentIds.length > 0) {
        // Document-specific RAG query
        ragResponse = await RAGService.queryDocuments(
          documentIds,
          query,
          context,
          ragQuery
        )
      } else {
        // General RAG query
        ragResponse = await RAGService.query(ragQuery)
      }
    } catch (ragError) {
      console.error('RAG query execution error:', ragError)
      return NextResponse.json(
        {
          error: 'RAG query failed',
          details:
            ragError instanceof Error ? ragError.message : 'Unknown RAG error',
        },
        { status: 500 }
      )
    }

    // Save conversation if conversation ID is provided
    if (conversationId) {
      try {
        // Add user message
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: query,
          metadata: {
            projectId,
            documentIds,
            customBotId,
          },
        })

        // Add assistant response
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: ragResponse.answer,
          metadata: {
            sources: ragResponse.sources.map(s => ({
              id: s.id,
              similarity_score: s.similarity_score,
              document_name: s.document_name,
            })),
            confidence: ragResponse.confidence,
            model: ragResponse.model,
            tokens_used: ragResponse.tokensUsed,
          },
        })

        // Update conversation
        await supabase
          .from('conversations')
          .update({
            updated_at: new Date().toISOString(),
            metadata: {
              last_model: model,
              total_messages:
                (
                  await supabase
                    .from('messages')
                    .select('id', { count: 'exact' })
                    .eq('conversation_id', conversationId)
                ).count || 0,
            },
          })
          .eq('id', conversationId)
      } catch (saveError) {
        console.warn('Failed to save conversation:', saveError)
        // Don't fail the request if saving fails
      }
    }

    // Log RAG activity
    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'rag_chat',
        metadata: {
          query: query.substring(0, 100), // Truncate for logging
          response_length: ragResponse.answer.length,
          sources_count: ragResponse.sources.length,
          confidence: ragResponse.confidence,
          model,
          tokens_used: ragResponse.tokensUsed,
          projectId,
          customBotId,
          conversationId,
        },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })
    } catch (logError) {
      console.warn('Failed to log RAG activity:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      query,
      answer: ragResponse.answer,
      sources: ragResponse.sources,
      metadata: {
        confidence: ragResponse.confidence,
        model: ragResponse.model,
        tokens_used: ragResponse.tokensUsed,
        context_length: ragResponse.contextUsed.length,
        sources_count: ragResponse.sources.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('RAG chat error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve conversation history with RAG context
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const includeContext = searchParams.get('includeContext') === 'true'

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId parameter is required' },
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

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Format response
    const response: Record<string, unknown> = {
      success: true,
      conversation,
      messages: messages || [],
      metadata: {
        total_messages: (messages || []).length,
        timestamp: new Date().toISOString(),
      },
    }

    // Include RAG context if requested
    if (includeContext) {
      const ragMessages = (messages || []).filter(
        msg => msg.role === 'assistant' && msg.metadata?.sources
      )

      response.rag_context = {
        total_rag_responses: ragMessages.length,
        average_confidence:
          ragMessages.reduce(
            (sum, msg) => sum + (msg.metadata?.confidence || 0),
            0
          ) / Math.max(ragMessages.length, 1),
        unique_sources: [
          ...new Set(
            ragMessages.flatMap(msg =>
              (msg.metadata?.sources || []).map((s: { id: string }) => s.id)
            )
          ),
        ].length,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('RAG conversation fetch error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
