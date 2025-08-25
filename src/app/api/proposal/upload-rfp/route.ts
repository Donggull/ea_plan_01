import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/proposal/upload-rfp - Starting file upload')

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    console.log('Received data:', {
      hasFile: !!file,
      projectId,
      fileInfo: file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        : null,
    })

    if (!file || !projectId) {
      console.error('Missing required fields:', {
        hasFile: !!file,
        hasProjectId: !!projectId,
      })
      return NextResponse.json(
        { error: 'File and project ID are required' },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      console.error('File size too large:', file.size)
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/haansofthwp',
      'text/plain',
    ]

    if (!allowedTypes.includes(file.type)) {
      console.error('Unsupported file type:', file.type)
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Supported types: ${allowedTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    console.log('Converting file to buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${projectId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = `rfp/${fileName}`

    console.log('Uploading file to Supabase Storage:', filePath)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        {
          error: 'Failed to upload file to storage',
          details: uploadError.message,
        },
        { status: 500 }
      )
    }

    console.log('File uploaded successfully to Supabase:', uploadData.path)

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    console.log('File public URL:', urlData.publicUrl)

    // For demo purposes, extract simple text content
    // In a real implementation, you would use libraries like pdf-parse, mammoth, etc.
    let textContent = ''

    console.log('Extracting text content for file type:', file.type)
    if (file.type === 'text/plain') {
      textContent = buffer.toString('utf-8')
      console.log('Text content extracted, length:', textContent.length)
    } else {
      // For other file types, return a placeholder
      textContent = `RFP 문서가 업로드되었습니다.\n파일명: ${file.name}\n파일 크기: ${file.size} bytes\n파일 타입: ${file.type}\n\n실제 구현에서는 PDF, DOC, HWP 파싱 라이브러리를 사용하여 텍스트를 추출합니다.\n\n테스트를 위해 다음 정보를 포함합니다:\n- 프로젝트 관련 키워드가 포함된 내용\n- React, Node.js, 데이터베이스 등 기술 스택\n- 사용자 관리, 관리자 시스템 등 기능 요구사항`
      console.log('Placeholder content generated')
    }

    const fileUrl = urlData.publicUrl
    console.log('Upload completed successfully, fileUrl:', fileUrl)

    const response = NextResponse.json({
      success: true,
      fileUrl,
      textContent,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storagePath: uploadData.path,
    })

    // Add CORS headers (though this should be handled by Next.js automatically for same-origin requests)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response
  } catch (error) {
    console.error('File upload error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    const errorResponse = NextResponse.json(
      {
        error: 'Failed to upload file',
        details:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )

    // Add CORS headers to error response as well
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return errorResponse
  }
}
