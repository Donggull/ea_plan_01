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
  config_schema?: Record<string, unknown>
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
  // Enhanced fields
  approval_status?: 'pending' | 'approved' | 'rejected' | 'suspended'
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  version?: number
  last_tested_at?: string
  test_status?: 'untested' | 'testing' | 'passed' | 'failed'
  test_results?: Record<string, unknown>
  usage_count?: number
  priority?: number
  category_id?: string
  tags?: string[]
  documentation_url?: string
  support_url?: string
}

export interface MCPTool {
  id: string
  provider_id: string
  name: string
  display_name: string
  description?: string
  tool_type: 'function' | 'resource' | 'prompt'
  config?: Record<string, unknown>
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  provider?: MCPProvider
  // Enhanced fields
  approval_status?: 'pending' | 'approved' | 'rejected' | 'suspended'
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  version?: number
  required_permissions?: string[]
  usage_count?: number
  example_usage?: Record<string, unknown>
  category_id?: string
  tags?: string[]
  documentation_url?: string
}

export interface UserMCPSettings {
  id: string
  user_id: string
  project_id?: string
  enabled_tools: string[]
  default_settings?: Record<string, unknown>
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

  async createProvider(
    provider: Omit<MCPProvider, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MCPProvider> {
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

  async updateProvider(
    id: string,
    updates: Partial<MCPProvider>
  ): Promise<MCPProvider> {
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
    const { error } = await supabase.from('mcp_providers').delete().eq('id', id)

    if (error) {
      console.error('Error deleting MCP provider:', error)
      throw error
    }
  }

  // 활성화된 MCP 도구 조회 (Claude에서 사용할 수 있는 도구들)
  async getActiveMcpTools(): Promise<
    Array<{ id: string; name: string; icon: string; description: string }>
  > {
    const { data, error } = await supabase
      .from('mcp_tools')
      .select(
        `
        id,
        name,
        display_name,
        description,
        provider:mcp_providers!inner(
          id,
          icon,
          is_active
        )
      `
      )
      .eq('is_active', true)
      .eq('approval_status', 'approved')
      .eq('provider.is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Error fetching active MCP tools:', error)
      return []
    }

    return data.map(tool => ({
      id: tool.name,
      name: tool.display_name,
      icon: tool.provider?.icon || '🔧',
      description: tool.description || '',
    }))
  }

  // MCP 도구 관리
  async getTools(providerId?: string): Promise<MCPTool[]> {
    let query = supabase
      .from('mcp_tools')
      .select(
        `
        *,
        provider:mcp_providers(*)
      `
      )
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
      .select(
        `
        *,
        provider:mcp_providers!inner(*)
      `
      )
      .eq('is_active', true)
      .eq('provider.is_active', true)
      .eq('approval_status', 'approved')
      .eq('provider.approval_status', 'approved')
      .order('sort_order')
      .order('display_name')

    if (error) {
      console.error('Error fetching active MCP tools:', error)
      throw error
    }

    return data || []
  }

  async createTool(
    tool: Omit<MCPTool, 'id' | 'created_at' | 'updated_at' | 'provider'>
  ): Promise<MCPTool> {
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
    const { error } = await supabase.from('mcp_tools').delete().eq('id', id)

    if (error) {
      console.error('Error deleting MCP tool:', error)
      throw error
    }
  }

  // 사용자 MCP 설정 관리
  async getUserSettings(
    userId: string,
    projectId?: string
  ): Promise<UserMCPSettings | null> {
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
      defaultSettings?: Record<string, unknown>
    }
  ): Promise<UserMCPSettings> {
    const existingSettings = await this.getUserSettings(
      userId,
      settings.projectId
    )

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
  formatToolsForClaude(tools: MCPTool[]): Array<{
    type: string
    function: {
      name: string
      description: string
      parameters: Record<string, unknown>
    }
  }> {
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

  // 승인 관련 메소드
  async approveProvider(id: string, approverId: string): Promise<MCPProvider> {
    const { data, error } = await supabase
      .from('mcp_providers')
      .update({
        approval_status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error approving provider:', error)
      throw error
    }

    return data
  }

  async rejectProvider(
    id: string,
    approverId: string,
    reason: string
  ): Promise<MCPProvider> {
    const { data, error } = await supabase
      .from('mcp_providers')
      .update({
        approval_status: 'rejected',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error rejecting provider:', error)
      throw error
    }

    return data
  }

  async approveTool(id: string, approverId: string): Promise<MCPTool> {
    const { data, error } = await supabase
      .from('mcp_tools')
      .update({
        approval_status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error approving tool:', error)
      throw error
    }

    return data
  }

  async rejectTool(
    id: string,
    approverId: string,
    reason: string
  ): Promise<MCPTool> {
    const { data, error } = await supabase
      .from('mcp_tools')
      .update({
        approval_status: 'rejected',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error rejecting tool:', error)
      throw error
    }

    return data
  }

  // 카테고리 관리
  async getCategories(): Promise<
    Array<{
      id: string
      name: string
      display_name: string
      description?: string
      is_active: boolean
      sort_order: number
    }>
  > {
    const { data, error } = await supabase
      .from('mcp_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .order('display_name')

    if (error) {
      console.error('Error fetching categories:', error)
      throw error
    }

    return data || []
  }
}

// 사용량 로그 테이블 생성 (마이그레이션에서 처리할 수도 있음)
export const createUsageLogTable = async () => {
  const { error } = await supabase.rpc('create_mcp_usage_logs_table')
  if (error) {
    console.error('Error creating usage logs table:', error)
  }
}

// MCP 등록 예시 데이터
export const MCPRegistrationExamples = {
  providers: [
    {
      name: 'web_search',
      display_name: '웹 검색',
      description: '실시간 웹 검색을 통해 최신 정보를 제공합니다.',
      icon: '🔍',
      connection_type: 'http',
      endpoint_url: 'https://api.tavily.com',
      documentation_url: 'https://docs.tavily.com',
      support_url: 'https://support.tavily.com',
    },
    {
      name: 'file_system',
      display_name: '파일 시스템',
      description: '로컬 파일 시스템에 접근하여 파일을 읽고 쓸 수 있습니다.',
      icon: '📁',
      connection_type: 'stdio',
      documentation_url:
        'https://modelcontextprotocol.io/docs/tools/filesystem',
    },
    {
      name: 'database',
      display_name: '데이터베이스',
      description:
        'PostgreSQL, MySQL 등의 데이터베이스에 쿼리를 실행할 수 있습니다.',
      icon: '🗄️',
      connection_type: 'http',
      documentation_url: 'https://modelcontextprotocol.io/docs/tools/database',
    },
  ],
  tools: [
    {
      name: 'search_web',
      display_name: '웹 검색',
      description: '키워드로 웹을 검색하고 관련 결과를 반환합니다.',
      tool_type: 'function',
      example_usage: {
        query: 'Next.js 최신 업데이트',
        max_results: 5,
        include_content: true,
      },
      documentation_url: 'https://docs.tavily.com/search',
    },
    {
      name: 'read_file',
      display_name: '파일 읽기',
      description: '지정된 경로의 파일을 읽어 내용을 반환합니다.',
      tool_type: 'function',
      example_usage: {
        path: '/path/to/file.txt',
        encoding: 'utf-8',
      },
    },
    {
      name: 'execute_sql',
      display_name: 'SQL 실행',
      description: 'SQL 쿼리를 실행하고 결과를 반환합니다.',
      tool_type: 'function',
      example_usage: {
        query: 'SELECT * FROM users WHERE active = true',
        database: 'main',
      },
      required_permissions: ['database.read', 'database.write'],
    },
  ],
}

export const mcpManagementService = new MCPManagementService()
export default mcpManagementService
