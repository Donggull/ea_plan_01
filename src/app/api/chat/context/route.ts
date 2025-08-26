import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Supabase 클라이언트 체크
    if (!supabase) {
      console.warn('Supabase client is not initialized')
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const userId = searchParams.get('userId')

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'projectId and userId are required' },
        { status: 400 }
      )
    }

    // Get project information
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(
        `
        id,
        name,
        description,
        category,
        status,
        metadata,
        created_at,
        updated_at
      `
      )
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectError) {
      console.error('Project fetch error:', projectError)
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Get recent conversations for this project
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(
        `
        id,
        title,
        model_used,
        created_at,
        messages (
          id,
          role,
          content,
          metadata,
          created_at
        )
      `
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (conversationsError) {
      console.error('Conversations fetch error:', conversationsError)
    }

    // Get project documents
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select(
        `
        id,
        file_name,
        file_type,
        processed_content,
        metadata,
        created_at
      `
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (documentsError) {
      console.error('Documents fetch error:', documentsError)
    }

    // Prepare context information
    const context = {
      project: {
        ...project,
        // Parse metadata if it's a string
        metadata:
          typeof project.metadata === 'string'
            ? JSON.parse(project.metadata)
            : project.metadata,
      },
      recentConversations:
        conversations?.map(conv => ({
          ...conv,
          // Only include the last 3 messages per conversation for context
          messages: conv.messages
            ?.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 3)
            .map(msg => ({
              role: msg.role,
              content:
                msg.content?.length > 200
                  ? msg.content.slice(0, 200) + '...'
                  : msg.content,
              created_at: msg.created_at,
            })),
        })) || [],
      documents:
        documents?.map(doc => ({
          id: doc.id,
          fileName: doc.file_name,
          fileType: doc.file_type,
          // Only include a summary of processed content
          contentSummary:
            doc.processed_content?.length > 500
              ? doc.processed_content.slice(0, 500) + '...'
              : doc.processed_content,
          metadata:
            typeof doc.metadata === 'string'
              ? JSON.parse(doc.metadata)
              : doc.metadata,
          created_at: doc.created_at,
        })) || [],
      contextInfo: {
        totalDocuments: documents?.length || 0,
        totalConversations: conversations?.length || 0,
        projectAge: Math.floor(
          (new Date().getTime() - new Date(project.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
    }

    return NextResponse.json(context)
  } catch (error) {
    console.error('Context fetch error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch context information' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Supabase 클라이언트 체크
    if (!supabase) {
      console.warn('Supabase client is not initialized')
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { projectId, userId, contextType, data } = body

    if (!projectId || !userId || !contextType || !data) {
      return NextResponse.json(
        { error: 'projectId, userId, contextType, and data are required' },
        { status: 400 }
      )
    }

    // Update project context based on type
    switch (contextType) {
      case 'project_info':
        // Update project metadata
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            metadata: data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId)
          .eq('user_id', userId)

        if (updateError) {
          console.error('Project update error:', updateError)
          return NextResponse.json(
            { error: 'Failed to update project context' },
            { status: 500 }
          )
        }
        break

      case 'add_document':
        // Add new document reference
        const { error: docError } = await supabase.from('documents').insert({
          project_id: projectId,
          file_name: data.fileName,
          file_type: data.fileType,
          processed_content: data.content,
          metadata: data.metadata || {},
        })

        if (docError) {
          console.error('Document insert error:', docError)
          return NextResponse.json(
            { error: 'Failed to add document to context' },
            { status: 500 }
          )
        }
        break

      default:
        return NextResponse.json(
          { error: `Unknown context type: ${contextType}` },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Context update error:', error)

    return NextResponse.json(
      { error: 'Failed to update context' },
      { status: 500 }
    )
  }
}
