import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'
type ProjectInsert = Database['public']['Tables']['projects']['Insert']

export async function GET(request: NextRequest) {
  try {
    // 환경 변수 체크
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 503 }
      )
    }

    // Use service role for admin operations since we have a super admin user
    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // For demo purposes, use the super admin user ID
    const userId = 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d'

    const { searchParams } = new URL(request.url)
    const projectType = searchParams.get('project_type') || 'all'
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabase.from('projects').select('*')

    // Filter by ownership
    if (projectType === 'owned') {
      query = query.eq('owner_id', userId)
    } else if (projectType === 'public') {
      query = query.eq('is_public', true).eq('visibility_level', 'public')
    } else if (projectType === 'all') {
      query = query.or(
        `owner_id.eq.${userId},and(is_public.eq.true,visibility_level.eq.public)`
      )
    }

    // Apply additional filters
    if (category) {
      query = query.eq('category', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Order by updated_at descending
    query = query.order('updated_at', { ascending: false })

    const { data: projects, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to fetch projects: ${error.message}`, success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: projects || [],
      success: true,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 체크
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 503 }
      )
    }

    // Use service role for admin operations since we have a super admin user
    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // For demo purposes, use the super admin user ID
    const userId = 'afd2a12c-75a5-4914-812e-5eedc4fd3a3d'

    const body = await request.json()
    const {
      name,
      description,
      category,
      status,
      tags,
      metadata,
      is_public,
      visibility_level,
    } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required', success: false },
        { status: 400 }
      )
    }

    const insertData: ProjectInsert = {
      user_id: userId,
      owner_id: userId,
      name,
      description: description || null,
      category,
      status: status || 'active',
      tags: tags || [],
      metadata: metadata || {},
      is_public: is_public || false,
      visibility_level: visibility_level || 'private',
    }

    console.log('Creating project with data:', insertData)

    const { data: newProject, error: insertError } = await supabase
      .from('projects')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        {
          error: `Failed to create project: ${insertError.message}`,
          success: false,
        },
        { status: 500 }
      )
    }

    console.log('Project created successfully:', newProject)

    return NextResponse.json({
      data: newProject,
      success: true,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      },
      { status: 500 }
    )
  }
}
