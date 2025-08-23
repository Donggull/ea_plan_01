import { supabase } from '@/lib/supabase'

// MCP Tool Types
export type MCPToolType =
  | 'web_search'
  | 'file_system'
  | 'database'
  | 'image_generation'
  | 'custom'

export interface MCPTool {
  name: string
  type: MCPToolType
  description: string
  parameters: Record<string, unknown>
}

export interface MCPToolResult {
  success: boolean
  data?: unknown
  error?: string
  metadata?: {
    duration?: number
    tokensUsed?: number
    toolName?: string
  }
}

export interface MCPConfiguration {
  id: string
  name: string
  type: MCPToolType
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MCPUsageLog {
  id: string
  user_id: string
  conversation_id?: string
  tool_name: string
  tool_type: string
  input_data?: unknown
  output_data?: unknown
  duration_ms?: number
  tokens_used?: number
  success: boolean
  error_message?: string
  created_at: string
}

export class MCPService {
  // Get all active MCP configurations
  static async getConfigurations(): Promise<MCPConfiguration[]> {
    try {
      const { data, error } = await supabase
        .from('mcp_configurations')
        .select('*')
        .eq('is_active', true)
        .order('type')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching MCP configurations:', error)
      return []
    }
  }

  // Get configuration by type
  static async getConfigByType(
    type: MCPToolType
  ): Promise<MCPConfiguration | null> {
    try {
      const { data, error } = await supabase
        .from('mcp_configurations')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching MCP config by type:', error)
      return null
    }
  }

  // Update MCP configuration (admin only)
  static async updateConfiguration(
    id: string,
    updates: Partial<MCPConfiguration>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mcp_configurations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating MCP configuration:', error)
      return false
    }
  }

  // Log MCP tool usage
  static async logUsage(
    log: Omit<MCPUsageLog, 'id' | 'created_at'>
  ): Promise<void> {
    try {
      const { error } = await supabase.from('mcp_usage_logs').insert(log)

      if (error) throw error
    } catch (error) {
      console.error('Error logging MCP usage:', error)
    }
  }

  // Web Search Tool
  static async webSearch(
    query: string,
    options?: {
      maxResults?: number
      language?: string
    }
  ): Promise<MCPToolResult> {
    const startTime = Date.now()

    try {
      // For demo, return mock results
      // In production, integrate with actual search API
      const mockResults = [
        {
          title: `Search result for: ${query}`,
          url: 'https://example.com/result1',
          snippet:
            'This is a relevant search result snippet containing information about your query...',
          date: new Date().toISOString(),
        },
        {
          title: `Another result about ${query}`,
          url: 'https://example.com/result2',
          snippet:
            'Additional information and context about the search query...',
          date: new Date().toISOString(),
        },
      ]

      const duration = Date.now() - startTime

      // Log usage
      await this.logUsage({
        user_id: 'demo-user', // In production, get from auth
        tool_name: 'Web Search',
        tool_type: 'web_search',
        input_data: { query, options },
        output_data: { results: mockResults },
        duration_ms: duration,
        success: true,
      })

      return {
        success: true,
        data: mockResults,
        metadata: {
          duration,
          toolName: 'Web Search',
        },
      }
    } catch (error) {
      const duration = Date.now() - startTime

      await this.logUsage({
        user_id: 'demo-user',
        tool_name: 'Web Search',
        tool_type: 'web_search',
        input_data: { query, options },
        duration_ms: duration,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Web search failed',
        metadata: {
          duration,
          toolName: 'Web Search',
        },
      }
    }
  }

  // File System Tool
  static async fileOperation(
    operation: 'read' | 'write' | 'list',
    path: string,
    content?: string
  ): Promise<MCPToolResult> {
    const startTime = Date.now()

    try {
      let result: unknown

      switch (operation) {
        case 'list':
          // Mock file listing
          result = {
            files: [
              { name: 'document.md', type: 'file', size: 1024 },
              { name: 'images', type: 'directory', size: 0 },
            ],
          }
          break
        case 'read':
          // Mock file reading
          result = {
            content: `Content of file at ${path}`,
            encoding: 'utf-8',
          }
          break
        case 'write':
          // Mock file writing
          result = {
            success: true,
            path,
            bytesWritten: content?.length || 0,
          }
          break
      }

      const duration = Date.now() - startTime

      await this.logUsage({
        user_id: 'demo-user',
        tool_name: 'File System',
        tool_type: 'file_system',
        input_data: { operation, path, content },
        output_data: result,
        duration_ms: duration,
        success: true,
      })

      return {
        success: true,
        data: result,
        metadata: {
          duration,
          toolName: 'File System',
        },
      }
    } catch (error) {
      const duration = Date.now() - startTime

      return {
        success: false,
        error: error instanceof Error ? error.message : 'File operation failed',
        metadata: {
          duration,
          toolName: 'File System',
        },
      }
    }
  }

  // Database Query Tool
  static async databaseQuery(
    query: string,
    params?: unknown[]
  ): Promise<MCPToolResult> {
    const startTime = Date.now()

    try {
      // Only allow SELECT queries for safety
      if (!query.trim().toUpperCase().startsWith('SELECT')) {
        throw new Error('Only SELECT queries are allowed')
      }

      // For demo, return mock data
      const mockData = [
        { id: 1, name: 'Sample Project', status: 'active' },
        { id: 2, name: 'Another Project', status: 'completed' },
      ]

      const duration = Date.now() - startTime

      await this.logUsage({
        user_id: 'demo-user',
        tool_name: 'Database Query',
        tool_type: 'database',
        input_data: { query, params },
        output_data: { rows: mockData, rowCount: mockData.length },
        duration_ms: duration,
        success: true,
      })

      return {
        success: true,
        data: {
          rows: mockData,
          rowCount: mockData.length,
        },
        metadata: {
          duration,
          toolName: 'Database Query',
        },
      }
    } catch (error) {
      const duration = Date.now() - startTime

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed',
        metadata: {
          duration,
          toolName: 'Database Query',
        },
      }
    }
  }

  // Image Generation Tool
  static async generateImage(
    prompt: string,
    options?: {
      model?: string
      size?: string
      count?: number
    }
  ): Promise<MCPToolResult> {
    const startTime = Date.now()

    try {
      // Mock image generation
      const mockImages = Array.from(
        { length: options?.count || 1 },
        (_, i) => ({
          url: `https://via.placeholder.com/512x512?text=Generated+Image+${i + 1}`,
          prompt,
          model: options?.model || 'flux-schnell',
          size: options?.size || '512x512',
        })
      )

      const duration = Date.now() - startTime

      await this.logUsage({
        user_id: 'demo-user',
        tool_name: 'Image Generation',
        tool_type: 'image_generation',
        input_data: { prompt, options },
        output_data: { images: mockImages },
        duration_ms: duration,
        success: true,
      })

      return {
        success: true,
        data: mockImages,
        metadata: {
          duration,
          toolName: 'Image Generation',
        },
      }
    } catch (error) {
      const duration = Date.now() - startTime

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Image generation failed',
        metadata: {
          duration,
          toolName: 'Image Generation',
        },
      }
    }
  }

  // Execute any MCP tool
  static async executeTool(
    toolType: MCPToolType,
    parameters: Record<string, unknown>
  ): Promise<MCPToolResult> {
    switch (toolType) {
      case 'web_search':
        return this.webSearch(
          parameters.query as string,
          parameters.options as { maxResults?: number; language?: string }
        )

      case 'file_system':
        return this.fileOperation(
          parameters.operation as 'read' | 'write' | 'list',
          parameters.path as string,
          parameters.content as string
        )

      case 'database':
        return this.databaseQuery(
          parameters.query as string,
          parameters.params as unknown[]
        )

      case 'image_generation':
        return this.generateImage(
          parameters.prompt as string,
          parameters.options as {
            model?: string
            size?: string
            count?: number
          }
        )

      default:
        return {
          success: false,
          error: `Unknown tool type: ${toolType}`,
        }
    }
  }

  // Get user's MCP usage stats
  static async getUserUsageStats(
    userId: string,
    days: number = 30
  ): Promise<{
    totalUsage: number
    byToolType: Record<string, number>
    successRate: number
    avgDuration: number
    totalTokens: number
  } | null> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('mcp_usage_logs')
        .select('tool_type, success, duration_ms, tokens_used, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())

      if (error) throw error

      // Calculate stats
      const stats = {
        totalUsage: data?.length || 0,
        byToolType: {} as Record<string, number>,
        successRate: 0,
        avgDuration: 0,
        totalTokens: 0,
      }

      if (data && data.length > 0) {
        let successCount = 0
        let totalDuration = 0
        let totalTokens = 0

        data.forEach(log => {
          stats.byToolType[log.tool_type] =
            (stats.byToolType[log.tool_type] || 0) + 1
          if (log.success) successCount++
          if (log.duration_ms) totalDuration += log.duration_ms
          if (log.tokens_used) totalTokens += log.tokens_used
        })

        stats.successRate = (successCount / data.length) * 100
        stats.avgDuration = totalDuration / data.length
        stats.totalTokens = totalTokens
      }

      return stats
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      return null
    }
  }
}
