import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Create workflow data links table if it doesn't exist
async function ensureWorkflowDataLinksTable(supabase: {
  from: (table: string) => {
    select: () => Promise<{ data: unknown; error: unknown }>
  }
}) {
  try {
    // Check if table exists
    const { error: checkError } = await supabase
      .from('workflow_data_links')
      .select('id')
      .limit(1)

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc(
        'create_workflow_data_links_table'
      )
      if (createError) {
        console.error(
          'Failed to create workflow_data_links table:',
          createError
        )
      }
    }
  } catch (error) {
    console.error('Error checking/creating workflow_data_links table:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Ensure table exists
    await ensureWorkflowDataLinksTable(supabase)

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      projectId,
      sourceWorkflow,
      targetWorkflow,
      sourceDataId,
      targetDataId,
      linkType,
      mappings,
    } = body

    if (
      !projectId ||
      !sourceWorkflow ||
      !targetWorkflow ||
      !sourceDataId ||
      !targetDataId ||
      !linkType
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create data link
    const { data: result, error } = await supabase
      .from('workflow_data_links')
      .insert({
        project_id: projectId,
        source_workflow: sourceWorkflow,
        target_workflow: targetWorkflow,
        source_data_id: sourceDataId,
        target_data_id: targetDataId,
        link_type: linkType,
        mappings: mappings || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Ensure table exists
    await ensureWorkflowDataLinksTable(supabase)

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Missing projectId' },
        { status: 400 }
      )
    }

    // Get data links for the project
    const { data, error } = await supabase
      .from('workflow_data_links')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
