'use client'

import { supabase } from '@/lib/supabase'

export interface MCPProvider {
  id: string
  name: string
  display_name: string
  description?: string
  icon: string
  endpoint_url?: string
  connection_type: 'http' | 'websocket' | 'stdio'
  config_schema?: any
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface MCPTool {
  id: string
  provider_id: string
  name: string
  display_name: string
  description?: string
  tool_type: 'function' | 'resource' | 'prompt'
  config?: any
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  provider?: MCPProvider
}

export interface UserMCPSettings {
  id: string
  user_id: string
  project_id?: string
  enabled_tools: string[]
  default_settings?: any
  created_at: string
  updated_at: string
}

class MCPManagementService {
  // MCP 제공자 관리
  async getProviders(): Promise<MCPProvider[]> {
    const { data, error } = await supabase
      .from('mcp_providers')
      .select('*')
      .order('display_name')

    if (error) {
      console.error('Error fetching MCP providers:', error)
      throw error
    }

    return data || []
  }

  async createProvider(provider: Omit<MCPProvider, 'id' | 'created_at' | 'updated_at'>): Promise<MCPProvider> {
    const { data, error } = await supabase
      .from('mcp_providers')
      .insert({
        ...provider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating MCP provider:', error)
      throw error
    }

    return data
  }

  async updateProvider(id: string, updates: Partial<MCPProvider>): Promise<MCPProvider> {
    const { data, error } = await supabase
      .from('mcp_providers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating MCP provider:', error)
      throw error
    }

    return data
  }

  async deleteProvider(id: string): Promise<void> {
    const { error } = await supabase
      .from('mcp_providers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting MCP provider:', error)
      throw error
    }
  }

  // MCP 도구 관리
  async getTools(providerId?: string): Promise<MCPTool[]> {
    let query = supabase
      .from('mcp_tools')
      .select(`
        *,
        provider:mcp_providers(*)
      `)
      .order('sort_order')
      .order('display_name')

    if (providerId) {
      query = query.eq('provider_id', providerId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching MCP tools:', error)
      throw error
    }

    return data || []
  }

  async getActiveTools(): Promise<MCPTool[]> {
    const { data, error } = await supabase
      .from('mcp_tools')
      .select(`
        *,
        provider:mcp_providers!inner(*)
      `)
      .eq('is_active', true)
      .eq('provider.is_active', true)
      .order('sort_order')
      .order('display_name')

    if (error) {
      console.error('Error fetching active MCP tools:', error)
      throw error
    }

    return data || []
  }

  async createTool(tool: Omit<MCPTool, 'id' | 'created_at' | 'updated_at' | 'provider'>): Promise<MCPTool> {
    const { data, error } = await supabase
      .from('mcp_tools')
      .insert({
        ...tool,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating MCP tool:', error)
      throw error
    }

    return data
  }

  async updateTool(id: string, updates: Partial<MCPTool>): Promise<MCPTool> {
    const { data, error } = await supabase
      .from('mcp_tools')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating MCP tool:', error)
      throw error
    }

    return data
  }

  async deleteTool(id: string): Promise<void> {
    const { error } = await supabase
      .from('mcp_tools')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting MCP tool:', error)
      throw error
    }
  }

  // 사용자 MCP 설정 관리
  async getUserSettings(userId: string, projectId?: string): Promise<UserMCPSettings | null> {
    let query = supabase
      .from('user_mcp_settings')
      .select('*')
      .eq('user_id', userId)

    if (projectId) {
      query = query.eq('project_id', projectId)
    } else {
      query = query.is('project_id', null)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user MCP settings:', error)
      throw error
    }

    return data
  }

  async updateUserSettings(
    userId: string,
    settings: {
      projectId?: string
      enabledTools: string[]
      defaultSettings?: any
    }
  ): Promise<UserMCPSettings> {
    const existingSettings = await this.getUserSettings(userId, settings.projectId)

    if (existingSettings) {
      const { data, error } = await supabase
        .from('user_mcp_settings')
        .update({
          enabled_tools: settings.enabledTools,
          default_settings: settings.defaultSettings || {},
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user MCP settings:', error)
        throw error
      }

      return data
    } else {
      const { data, error } = await supabase
        .from('user_mcp_settings')
        .insert({
          user_id: userId,
          project_id: settings.projectId || null,
          enabled_tools: settings.enabledTools,
          default_settings: settings.defaultSettings || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user MCP settings:', error)
        throw error
      }

      return data
    }
  }

  // Claude API와의 MCP 도구 연동을 위한 도구 정보 포맷팅
  formatToolsForClaude(tools: MCPTool[]): any[] {
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description || tool.display_name,
        parameters: tool.config || {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    }))
  }

  // 도구 실행 로그 저장 (사용량 추적용)
  async logToolUsage(
    userId: string,
    toolId: string,
    success: boolean,
    duration: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        tool_id: toolId,
        success,
        duration_ms: duration,
        error_message: errorMessage,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Error logging tool usage:', error)
      }
    } catch (error) {
      console.error('Error in logToolUsage:', error)
    }
  }
}

// 사용량 로그 테이블 생성 (마이그레이션에서 처리할 수도 있음)
export const createUsageLogTable = async () => {
  const { error } = await supabase.rpc('create_mcp_usage_logs_table')
  if (error) {
    console.error('Error creating usage logs table:', error)
  }
}

export const mcpManagementService = new MCPManagementService()
export default mcpManagementService