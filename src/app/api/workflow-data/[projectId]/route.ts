import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    projectId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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

    const { projectId } = params

    // Get all workflow data for the project
    const { data: workflowData, error } = await supabase
      .from('workflow_data')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('workflow_type')
      .order('version', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Group by workflow type and get latest version
    const groupedData: Record<
      string,
      {
        workflow_type: string
        version: number
        data: Record<string, unknown>
        status: string
        updated_at: string
      }
    > = {}

    workflowData?.forEach(item => {
      if (
        !groupedData[item.workflow_type] ||
        item.version > groupedData[item.workflow_type].version
      ) {
        groupedData[item.workflow_type] = item
      }
    })

    // Get data links
    const { data: dataLinks, error: linksError } = await supabase
      .from('workflow_data_links')
      .select('*')
      .eq('project_id', projectId)

    if (linksError) {
      console.warn('Failed to get data links:', linksError)
    }

    return NextResponse.json({
      success: true,
      data: {
        workflowData: groupedData,
        dataLinks: dataLinks || [],
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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

    const { projectId } = params

    // Delete all workflow data for the project
    const { error: workflowError } = await supabase
      .from('workflow_data')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', user.id)

    if (workflowError) {
      console.error('Failed to delete workflow data:', workflowError)
    }

    // Delete data links
    const { error: linksError } = await supabase
      .from('workflow_data_links')
      .delete()
      .eq('project_id', projectId)

    if (linksError) {
      console.error('Failed to delete data links:', linksError)
    }

    return NextResponse.json({
      success: true,
      message: 'Project workflow data deleted successfully',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
