import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const isPublic = searchParams.get('public') === 'true'
    // Get authenticated user (fallback to default for testing)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d'
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('custom_bots')
      .select(`
        *,
        knowledge_base(count)
      `)

    if (isPublic) {
      query = query.eq('is_public', true)
      query = query.order('like_count', { ascending: false })
    } else {
      query = query.eq('user_id', userId)
      query = query.order('updated_at', { ascending: false })
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    query = query.limit(limit)

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch bots:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bots' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bots: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (fallback to default for testing)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d'

    const body = await request.json()
    const {
      name,
      description,
      avatar,
      tags,
      instructions,
      is_public = false
    } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('custom_bots')
      .insert({
        name,
        description,
        avatar,
        tags,
        instructions,
        is_public,
        user_id: userId,
        usage_count: 0,
        like_count: 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create bot:', error)
      return NextResponse.json(
        { error: 'Failed to create bot' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bot: data }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}