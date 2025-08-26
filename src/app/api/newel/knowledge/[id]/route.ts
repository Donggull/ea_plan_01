import { NextRequest, NextResponse } from 'next/server'
import KnowledgeBaseProcessor from '@/lib/services/knowledgeBaseProcessor'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, content, metadata } = body

    const success = await KnowledgeBaseProcessor.updateKnowledgeBaseItem(
      params.id,
      { title, content, metadata }
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update knowledge base item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Knowledge base update error:', error)
    return NextResponse.json(
      { error: 'Failed to update knowledge base item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await KnowledgeBaseProcessor.deleteKnowledgeBaseItem(params.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete knowledge base item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Knowledge base delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete knowledge base item' },
      { status: 500 }
    )
  }
}