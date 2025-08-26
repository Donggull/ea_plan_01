import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import RAGService from '@/lib/services/ragService'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { message, context } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get bot information
    const { data: bot, error: botError } = await supabase
      .from('custom_bots')
      .select('*')
      .eq('id', params.id)
      .single()

    if (botError || !bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      )
    }

    // Use RAG service for custom bot query
    const ragResponse = await RAGService.queryCustomBot(
      bot.id,
      message,
      context || bot.instructions
    )

    // Update usage count
    await supabase
      .from('custom_bots')
      .update({
        usage_count: (bot.usage_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bot.id)

    return NextResponse.json({
      response: ragResponse.answer,
      sources: ragResponse.sources,
      confidence: ragResponse.confidence,
      model: ragResponse.model,
      context_used: ragResponse.contextUsed,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Return a user-friendly error message
    return NextResponse.json(
      { 
        error: 'Failed to process chat message', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}