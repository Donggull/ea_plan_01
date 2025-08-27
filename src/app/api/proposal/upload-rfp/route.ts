import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import mammoth from 'mammoth'

// Handle CORS preflight requests
export async function OPTIONS(_request: NextRequest) {
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 503 }
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

    // Extract text content using appropriate parsers
    let textContent = ''

    console.log('Extracting text content for file type:', file.type)

    try {
      if (file.type === 'text/plain') {
        textContent = buffer.toString('utf-8')
        console.log('Text content extracted, length:', textContent.length)
      } else if (file.type === 'application/pdf') {
        console.log('PDF document detected - using placeholder content')
        // PDF parsing requires complex libraries that may not work well in serverless
        // For production, consider using external services like AWS Textract or Google Document AI
        textContent = `PDF 파일이 업로드되었습니다: ${file.name}\n\nPDF 텍스트 추출을 위해서는 다음과 같은 서비스를 권장합니다:\n- AWS Textract\n- Google Document AI\n- Azure Document Intelligence\n\n현재는 테스트 목적으로 다음 내용을 사용합니다:\n\n프로젝트 요구사항:\n- 웹 애플리케이션 개발\n- 사용자 인증 시스템\n- 관리자 대시보드\n- 반응형 디자인\n- 데이터베이스 연동\n- API 개발\n- 보안 강화\n\n기술 스택:\n- React, Node.js, PostgreSQL\n- TypeScript, Tailwind CSS\n- 클라우드 배포 (AWS/Vercel)\n\n예상 기간: 8-12주\n예상 비용: 2000-3000만원`
        console.log('PDF placeholder content generated')
      } else if (
        file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        console.log('Parsing DOCX document...')
        try {
          const result = await mammoth.extractRawText({ buffer })
          textContent = result.value
          console.log('DOCX text extracted, length:', textContent.length)
        } catch (mammothError) {
          console.warn('DOCX parsing failed, using placeholder:', mammothError)
          textContent = `DOCX 파일이 업로드되었습니다: ${file.name}\n\nDOCX 파싱 중 오류가 발생했습니다.\n현재는 테스트 목적으로 다음 내용을 사용합니다:\n\n프로젝트 요구사항:\n- 웹 애플리케이션 개발\n- 사용자 인증 시스템\n- 관리자 대시보드\n- 반응형 디자인\n- 데이터베이스 연동\n\n기술 스택:\n- React, Node.js, PostgreSQL\n- TypeScript, Tailwind CSS`
        }
      } else if (file.type === 'application/msword') {
        console.log('Parsing DOC document...')
        // DOC files are more complex to parse, for now use placeholder
        textContent = `DOC 파일이 업로드되었습니다: ${file.name}\n\nDOC 파일 파싱을 위해서는 추가적인 라이브러리가 필요합니다.\n현재는 테스트 목적으로 다음 내용을 사용합니다:\n\n프로젝트 요구사항:\n- 웹 애플리케이션 개발\n- 사용자 인증 시스템\n- 관리자 대시보드\n- 반응형 디자인\n- 데이터베이스 연동\n\n기술 스택:\n- React, Node.js, PostgreSQL\n- TypeScript, Tailwind CSS`
        console.log('DOC placeholder content generated')
      } else if (file.type === 'application/haansofthwp') {
        console.log('HWP file detected - using placeholder content')
        textContent = `HWP 파일이 업로드되었습니다: ${file.name}\n\nHWP 파일 파싱을 위해서는 전용 라이브러리가 필요합니다.\n현재는 테스트 목적으로 다음 내용을 사용합니다:\n\n프로젝트 개요:\n- 웹 기반 관리 시스템 개발\n- 사용자 관리 기능\n- 데이터 시각화\n- 모바일 지원\n\n요구사항:\n- 보안성 강화\n- 높은 가용성\n- 확장 가능한 아키텍처`
        console.log('HWP placeholder content generated')
      } else {
        console.log('Unsupported file type, using generic placeholder')
        textContent = `파일이 업로드되었습니다: ${file.name}\n파일 타입: ${file.type}\n\n지원되는 형식으로 다시 업로드해주세요:\n- PDF (.pdf)\n- Microsoft Word (.docx)\n- 텍스트 파일 (.txt)`
      }

      // Validate extracted content
      if (!textContent || textContent.trim().length < 10) {
        console.warn('Extracted content too short, using fallback')
        textContent = `파일에서 텍스트를 추출할 수 없습니다.\n\n파일이 손상되었거나 텍스트가 포함되지 않았을 수 있습니다.\n다른 파일을 시도해보거나 텍스트 형식으로 다시 저장해주세요.\n\n파일 정보:\n- 이름: ${file.name}\n- 크기: ${(file.size / 1024 / 1024).toFixed(2)} MB\n- 타입: ${file.type}`
      }
    } catch (parseError) {
      console.error('Text extraction error:', parseError)
      textContent = `파일 파싱 중 오류가 발생했습니다.\n\n오류 내용: ${parseError instanceof Error ? parseError.message : '알 수 없는 오류'}\n\n다른 형식의 파일을 시도해보거나 파일이 손상되지 않았는지 확인해주세요.\n\n파일 정보:\n- 이름: ${file.name}\n- 크기: ${(file.size / 1024 / 1024).toFixed(2)} MB\n- 타입: ${file.type}`
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
