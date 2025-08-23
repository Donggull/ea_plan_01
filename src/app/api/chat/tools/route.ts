import { NextRequest, NextResponse } from 'next/server'
import { MCPService } from '@/lib/services/mcpService'
import type { MCPToolType } from '@/lib/services/mcpService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolType, parameters, userId } = body

    // Validate required fields
    if (!toolType || !parameters) {
      return NextResponse.json(
        { error: 'toolType and parameters are required' },
        { status: 400 }
      )
    }

    // Validate tool type
    const validToolTypes: MCPToolType[] = [
      'web_search',
      'file_system',
      'database',
      'image_generation',
      'custom',
    ]

    if (!validToolTypes.includes(toolType as MCPToolType)) {
      return NextResponse.json(
        { error: `Invalid tool type: ${toolType}` },
        { status: 400 }
      )
    }

    // Execute the tool
    const result = await MCPService.executeTool(
      toolType as MCPToolType,
      parameters
    )

    // Log usage if userId is provided
    if (userId) {
      await MCPService.logUsage({
        user_id: userId,
        tool_name: toolType,
        tool_type: toolType,
        input_data: parameters,
        output_data: result.data,
        duration_ms: result.metadata?.duration || 0,
        success: result.success,
        error_message: result.error,
      })
    }

    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error('Tool execution error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Tool execution failed',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get user's tool usage statistics
    const stats = await MCPService.getUserUsageStats(userId, days)

    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to fetch usage statistics' },
        { status: 500 }
      )
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Usage stats error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    )
  }
}
