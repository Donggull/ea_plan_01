import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('custom_bots')
      .select(`
        *,
        knowledge_base(count)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Failed to fetch bot:', error)
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ bot: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      avatar,
      tags,
      instructions,
      is_public
    } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (avatar !== undefined) updateData.avatar = avatar
    if (tags !== undefined) updateData.tags = tags
    if (instructions !== undefined) updateData.instructions = instructions
    if (is_public !== undefined) updateData.is_public = is_public

    const { data, error } = await supabase
      .from('custom_bots')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update bot:', error)
      return NextResponse.json(
        { error: 'Failed to update bot' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bot: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('custom_bots')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Failed to delete bot:', error)
      return NextResponse.json(
        { error: 'Failed to delete bot' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}