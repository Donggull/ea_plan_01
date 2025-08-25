import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'File and project ID are required' },
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
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'rfp')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${projectId}_${Date.now()}_${file.name}`
    const filePath = join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    // For demo purposes, extract simple text content
    // In a real implementation, you would use libraries like pdf-parse, mammoth, etc.
    let textContent = ''
    
    if (file.type === 'text/plain') {
      textContent = buffer.toString('utf-8')
    } else {
      // For other file types, return a placeholder
      textContent = `RFP 문서가 업로드되었습니다.\n파일명: ${file.name}\n파일 크기: ${file.size} bytes\n\n실제 구현에서는 PDF, DOC, HWP 파싱 라이브러리를 사용하여 텍스트를 추출합니다.`
    }

    const fileUrl = `/uploads/rfp/${fileName}`

    return NextResponse.json({
      fileUrl,
      textContent,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}