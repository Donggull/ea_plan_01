'use client'

import { createClientComponentClient } from '@/lib/supabase'
import type {
  RFPData,
  MarketResearchData,
  PersonaData,
  ProposalData,
  DevelopmentData,
  OperationData,
  WorkflowDataLink,
} from '@/lib/redux/types'

export class WorkflowDataService {
  private static supabase = createClientComponentClient()

  // RFP Data Management
  static async saveRFPData(projectId: string, data: RFPData) {
    try {
      const { data: result, error } = await this.supabase
        .from('workflow_data')
        .upsert({
          project_id: projectId,
          workflow_type: 'rfp',
          data: data,
          version: data.version,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to save RFP data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async getRFPData(
    projectId: string
  ): Promise<{ success: boolean; data?: RFPData; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_data')
        .select('*')
        .eq('project_id', projectId)
        .eq('workflow_type', 'rfp')
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data: data?.data as RFPData }
    } catch (error) {
      console.error('Failed to get RFP data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Market Research Data Management
  static async saveMarketResearchData(
    projectId: string,
    data: MarketResearchData
  ) {
    try {
      const { data: result, error } = await this.supabase
        .from('workflow_data')
        .upsert({
          project_id: projectId,
          workflow_type: 'market_research',
          data: data,
          version: data.version,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to save market research data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async getMarketResearchData(
    projectId: string
  ): Promise<{ success: boolean; data?: MarketResearchData; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_data')
        .select('*')
        .eq('project_id', projectId)
        .eq('workflow_type', 'market_research')
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data: data?.data as MarketResearchData }
    } catch (error) {
      console.error('Failed to get market research data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Persona Data Management
  static async savePersonaData(projectId: string, data: PersonaData) {
    try {
      const { data: result, error } = await this.supabase
        .from('workflow_data')
        .upsert({
          project_id: projectId,
          workflow_type: 'persona',
          data: data,
          version: data.version,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to save persona data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async getPersonaData(
    projectId: string
  ): Promise<{ success: boolean; data?: PersonaData; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_data')
        .select('*')
        .eq('project_id', projectId)
        .eq('workflow_type', 'persona')
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data: data?.data as PersonaData }
    } catch (error) {
      console.error('Failed to get persona data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Proposal Data Management
  static async saveProposalData(projectId: string, data: ProposalData) {
    try {
      const { data: result, error } = await this.supabase
        .from('workflow_data')
        .upsert({
          project_id: projectId,
          workflow_type: 'proposal',
          data: data,
          version: data.version,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to save proposal data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async getProposalData(
    projectId: string
  ): Promise<{ success: boolean; data?: ProposalData; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_data')
        .select('*')
        .eq('project_id', projectId)
        .eq('workflow_type', 'proposal')
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data: data?.data as ProposalData }
    } catch (error) {
      console.error('Failed to get proposal data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Development Data Management
  static async saveDevelopmentData(projectId: string, data: DevelopmentData) {
    try {
      const { data: result, error } = await this.supabase
        .from('workflow_data')
        .upsert({
          project_id: projectId,
          workflow_type: 'development',
          data: data,
          version: data.version,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to save development data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async getDevelopmentData(
    projectId: string
  ): Promise<{ success: boolean; data?: DevelopmentData; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_data')
        .select('*')
        .eq('project_id', projectId)
        .eq('workflow_type', 'development')
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data: data?.data as DevelopmentData }
    } catch (error) {
      console.error('Failed to get development data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Operation Data Management
  static async saveOperationData(projectId: string, data: OperationData) {
    try {
      const { data: result, error } = await this.supabase
        .from('workflow_data')
        .upsert({
          project_id: projectId,
          workflow_type: 'operation',
          data: data,
          version: data.version,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to save operation data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async getOperationData(
    projectId: string
  ): Promise<{ success: boolean; data?: OperationData; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_data')
        .select('*')
        .eq('project_id', projectId)
        .eq('workflow_type', 'operation')
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data: data?.data as OperationData }
    } catch (error) {
      console.error('Failed to get operation data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Data Linking Management
  static async createDataLink(
    linkData: Omit<WorkflowDataLink, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    try {
      const { data, error } = await this.supabase
        .from('workflow_data_links')
        .insert({
          ...linkData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Failed to create data link:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async getDataLinks(projectId: string) {
    try {
      const { data, error } = await this.supabase
        .from('workflow_data_links')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data as WorkflowDataLink[] }
    } catch (error) {
      console.error('Failed to get data links:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Data Inheritance Utilities
  static async inheritProposalDataToDevelopment(projectId: string) {
    try {
      // Get proposal data
      const rfpResult = await this.getRFPData(projectId)
      const _marketResearchResult = await this.getMarketResearchData(projectId)
      const _personaResult = await this.getPersonaData(projectId)
      const proposalResult = await this.getProposalData(projectId)

      if (!rfpResult.success || !proposalResult.success) {
        throw new Error('Required proposal data not found')
      }

      // Create development data structure with inherited data
      const developmentData: DevelopmentData = {
        id: `dev_${projectId}_${Date.now()}`,
        projectId,
        userId: '', // Will be set from auth context
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        version: 1,

        // Inherit requirements from RFP
        requirements: {
          functional: rfpResult.data!.requirements.functional.map(
            (req, index) => ({
              id: `func_req_${index}`,
              title: req,
              description: req,
              priority: 'medium' as const,
              status: 'pending' as const,
              source: 'RFP Analysis',
            })
          ),
          nonFunctional: rfpResult.data!.requirements.nonFunctional.map(
            (req, index) => ({
              id: `nonfunc_req_${index}`,
              type: 'performance' as const,
              description: req,
              criteria: req,
              source: 'RFP Analysis',
            })
          ),
        },

        // Initialize architecture structure
        architecture: {
          frontend: { framework: '', libraries: [], structure: '' },
          backend: { framework: '', database: '', apis: [], services: [] },
          infrastructure: { hosting: '', deployment: '', monitoring: [] },
        },

        // Initialize empty arrays for user stories, wireframes, WBS, QA
        userStories: [],
        wireframes: [],
        wbs: [],
        qaPlans: [],
      }

      // Save development data
      const saveResult = await this.saveDevelopmentData(
        projectId,
        developmentData
      )
      if (!saveResult.success) throw new Error(saveResult.error)

      // Create data links
      await this.createDataLink({
        projectId,
        sourceWorkflow: 'proposal',
        targetWorkflow: 'development',
        sourceDataId: rfpResult.data!.id,
        targetDataId: developmentData.id,
        linkType: 'derived',
        mappings: [
          {
            sourceField: 'requirements.functional',
            targetField: 'requirements.functional',
          },
          {
            sourceField: 'requirements.nonFunctional',
            targetField: 'requirements.nonFunctional',
          },
        ],
      })

      return { success: true, data: developmentData }
    } catch (error) {
      console.error('Failed to inherit proposal data to development:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async inheritDevelopmentDataToOperation(projectId: string) {
    try {
      // Get development data
      const developmentResult = await this.getDevelopmentData(projectId)
      if (!developmentResult.success || !developmentResult.data) {
        throw new Error('Development data not found')
      }

      const devData = developmentResult.data

      // Create operation data structure with inherited data
      const operationData: OperationData = {
        id: `op_${projectId}_${Date.now()}`,
        projectId,
        userId: '', // Will be set from auth context
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        version: 1,

        // Inherit requirements from development
        requirements: devData.userStories.map((story, index) => ({
          id: `op_req_${index}`,
          title: story.title,
          description: story.description,
          requester: 'Development Team',
          priority:
            story.priority > 8
              ? 'high'
              : story.priority > 5
                ? 'medium'
                : ('low' as const),
          category: 'new-feature' as const,
          status: 'submitted' as const,
          estimatedEffort: story.estimation * 8, // Convert story points to hours
          source: 'Development Phase',
        })),

        // Initialize team structure
        teamAssignments: [
          {
            team: 'planning',
            members: [],
            currentSprint: {
              id: `sprint_1_${Date.now()}`,
              startDate: new Date().toISOString(),
              endDate: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
              ).toISOString(),
              goals: ['Implement initial features'],
              tasks: [],
            },
          },
          {
            team: 'design',
            members: [],
            currentSprint: {
              id: `sprint_1_${Date.now()}`,
              startDate: new Date().toISOString(),
              endDate: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
              ).toISOString(),
              goals: ['Create UI designs'],
              tasks: [],
            },
          },
          {
            team: 'frontend',
            members: [],
            currentSprint: {
              id: `sprint_1_${Date.now()}`,
              startDate: new Date().toISOString(),
              endDate: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
              ).toISOString(),
              goals: ['Implement frontend features'],
              tasks: [],
            },
          },
          {
            team: 'backend',
            members: [],
            currentSprint: {
              id: `sprint_1_${Date.now()}`,
              startDate: new Date().toISOString(),
              endDate: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
              ).toISOString(),
              goals: ['Implement backend APIs'],
              tasks: [],
            },
          },
          {
            team: 'qa',
            members: [],
            currentSprint: {
              id: `sprint_1_${Date.now()}`,
              startDate: new Date().toISOString(),
              endDate: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
              ).toISOString(),
              goals: ['Test implementations'],
              tasks: [],
            },
          },
        ],

        // Initialize performance metrics
        performanceMetrics: [],
      }

      // Save operation data
      const saveResult = await this.saveOperationData(projectId, operationData)
      if (!saveResult.success) throw new Error(saveResult.error)

      // Create data links
      await this.createDataLink({
        projectId,
        sourceWorkflow: 'development',
        targetWorkflow: 'operation',
        sourceDataId: devData.id,
        targetDataId: operationData.id,
        linkType: 'derived',
        mappings: [
          { sourceField: 'userStories', targetField: 'requirements' },
          { sourceField: 'wbs', targetField: 'teamAssignments' },
        ],
      })

      return { success: true, data: operationData }
    } catch (error) {
      console.error('Failed to inherit development data to operation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Get all workflow data for a project
  static async getAllWorkflowData(projectId: string) {
    try {
      const [
        rfp,
        marketResearch,
        persona,
        proposal,
        development,
        operation,
        links,
      ] = await Promise.all([
        this.getRFPData(projectId),
        this.getMarketResearchData(projectId),
        this.getPersonaData(projectId),
        this.getProposalData(projectId),
        this.getDevelopmentData(projectId),
        this.getOperationData(projectId),
        this.getDataLinks(projectId),
      ])

      return {
        success: true,
        data: {
          rfp: rfp.data,
          marketResearch: marketResearch.data,
          persona: persona.data,
          proposal: proposal.data,
          development: development.data,
          operation: operation.data,
          links: links.success ? links.data : [],
        },
      }
    } catch (error) {
      console.error('Failed to get all workflow data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
