import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type {
  RFPData,
  MarketResearchData,
  PersonaData,
  ProposalData,
  DevelopmentData,
  OperationData,
  WorkflowDataLink,
} from '../types'

// Async thunks for data operations
export const saveWorkflowData = createAsyncThunk(
  'workflowData/save',
  async ({
    projectId,
    workflowType,
    data,
  }: {
    projectId: string
    workflowType: string
    data: unknown
  }) => {
    // This would call Supabase API
    const response = await fetch('/api/workflow-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, workflowType, data }),
    })
    return response.json()
  }
)

export const loadWorkflowData = createAsyncThunk(
  'workflowData/load',
  async ({ projectId }: { projectId: string }) => {
    const response = await fetch(`/api/workflow-data/${projectId}`)
    return response.json()
  }
)

export const createDataLink = createAsyncThunk(
  'workflowData/createLink',
  async (
    linkData: Omit<WorkflowDataLink, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const response = await fetch('/api/workflow-data/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linkData),
    })
    return response.json()
  }
)

interface WorkflowDataState {
  // Data by project
  projectData: Record<
    string,
    {
      rfp?: RFPData
      marketResearch?: MarketResearchData
      persona?: PersonaData
      proposal?: ProposalData
      development?: DevelopmentData
      operation?: OperationData
    }
  >

  // Data relationships
  dataLinks: WorkflowDataLink[]

  // State management
  loading: {
    save: boolean
    load: boolean
    createLink: boolean
  }

  error: string | null

  // Data version tracking
  dataVersions: Record<
    string,
    {
      workflowType: string
      version: number
      timestamp: string
      changes: string[]
    }[]
  >
}

const initialState: WorkflowDataState = {
  projectData: {},
  dataLinks: [],
  loading: {
    save: false,
    load: false,
    createLink: false,
  },
  error: null,
  dataVersions: {},
}

const workflowDataSlice = createSlice({
  name: 'workflowData',
  initialState,
  reducers: {
    // Set workflow data
    setRFPData: (
      state,
      action: PayloadAction<{ projectId: string; data: RFPData }>
    ) => {
      const { projectId, data } = action.payload
      if (!state.projectData[projectId]) {
        state.projectData[projectId] = {}
      }
      state.projectData[projectId].rfp = data

      // Track version change
      if (!state.dataVersions[projectId]) {
        state.dataVersions[projectId] = []
      }
      state.dataVersions[projectId].push({
        workflowType: 'rfp',
        version: data.version,
        timestamp: new Date().toISOString(),
        changes: ['RFP data updated'],
      })
    },

    setMarketResearchData: (
      state,
      action: PayloadAction<{ projectId: string; data: MarketResearchData }>
    ) => {
      const { projectId, data } = action.payload
      if (!state.projectData[projectId]) {
        state.projectData[projectId] = {}
      }
      state.projectData[projectId].marketResearch = data

      if (!state.dataVersions[projectId]) {
        state.dataVersions[projectId] = []
      }
      state.dataVersions[projectId].push({
        workflowType: 'marketResearch',
        version: data.version,
        timestamp: new Date().toISOString(),
        changes: ['Market research data updated'],
      })
    },

    setPersonaData: (
      state,
      action: PayloadAction<{ projectId: string; data: PersonaData }>
    ) => {
      const { projectId, data } = action.payload
      if (!state.projectData[projectId]) {
        state.projectData[projectId] = {}
      }
      state.projectData[projectId].persona = data

      if (!state.dataVersions[projectId]) {
        state.dataVersions[projectId] = []
      }
      state.dataVersions[projectId].push({
        workflowType: 'persona',
        version: data.version,
        timestamp: new Date().toISOString(),
        changes: ['Persona data updated'],
      })
    },

    setProposalData: (
      state,
      action: PayloadAction<{ projectId: string; data: ProposalData }>
    ) => {
      const { projectId, data } = action.payload
      if (!state.projectData[projectId]) {
        state.projectData[projectId] = {}
      }
      state.projectData[projectId].proposal = data

      if (!state.dataVersions[projectId]) {
        state.dataVersions[projectId] = []
      }
      state.dataVersions[projectId].push({
        workflowType: 'proposal',
        version: data.version,
        timestamp: new Date().toISOString(),
        changes: ['Proposal data updated'],
      })
    },

    setDevelopmentData: (
      state,
      action: PayloadAction<{ projectId: string; data: DevelopmentData }>
    ) => {
      const { projectId, data } = action.payload
      if (!state.projectData[projectId]) {
        state.projectData[projectId] = {}
      }
      state.projectData[projectId].development = data

      if (!state.dataVersions[projectId]) {
        state.dataVersions[projectId] = []
      }
      state.dataVersions[projectId].push({
        workflowType: 'development',
        version: data.version,
        timestamp: new Date().toISOString(),
        changes: ['Development data updated'],
      })
    },

    setOperationData: (
      state,
      action: PayloadAction<{ projectId: string; data: OperationData }>
    ) => {
      const { projectId, data } = action.payload
      if (!state.projectData[projectId]) {
        state.projectData[projectId] = {}
      }
      state.projectData[projectId].operation = data

      if (!state.dataVersions[projectId]) {
        state.dataVersions[projectId] = []
      }
      state.dataVersions[projectId].push({
        workflowType: 'operation',
        version: data.version,
        timestamp: new Date().toISOString(),
        changes: ['Operation data updated'],
      })
    },

    // Data linking
    addDataLink: (state, action: PayloadAction<WorkflowDataLink>) => {
      state.dataLinks.push(action.payload)
    },

    removeDataLink: (state, action: PayloadAction<string>) => {
      state.dataLinks = state.dataLinks.filter(
        link => link.id !== action.payload
      )
    },

    // Clear project data
    clearProjectData: (state, action: PayloadAction<string>) => {
      const projectId = action.payload
      delete state.projectData[projectId]
      delete state.dataVersions[projectId]
      state.dataLinks = state.dataLinks.filter(
        link => link.projectId !== projectId
      )
    },

    // Error handling
    clearError: state => {
      state.error = null
    },
  },

  extraReducers: builder => {
    // Save workflow data
    builder
      .addCase(saveWorkflowData.pending, state => {
        state.loading.save = true
        state.error = null
      })
      .addCase(saveWorkflowData.fulfilled, state => {
        state.loading.save = false
      })
      .addCase(saveWorkflowData.rejected, (state, action) => {
        state.loading.save = false
        state.error = action.error.message || 'Failed to save workflow data'
      })

    // Load workflow data
    builder
      .addCase(loadWorkflowData.pending, state => {
        state.loading.load = true
        state.error = null
      })
      .addCase(loadWorkflowData.fulfilled, (state, action) => {
        state.loading.load = false
        if (action.payload.success) {
          state.projectData = action.payload.data
        }
      })
      .addCase(loadWorkflowData.rejected, (state, action) => {
        state.loading.load = false
        state.error = action.error.message || 'Failed to load workflow data'
      })

    // Create data link
    builder
      .addCase(createDataLink.pending, state => {
        state.loading.createLink = true
        state.error = null
      })
      .addCase(createDataLink.fulfilled, (state, action) => {
        state.loading.createLink = false
        if (action.payload.success) {
          state.dataLinks.push(action.payload.data)
        }
      })
      .addCase(createDataLink.rejected, (state, action) => {
        state.loading.createLink = false
        state.error = action.error.message || 'Failed to create data link'
      })
  },
})

export const {
  setRFPData,
  setMarketResearchData,
  setPersonaData,
  setProposalData,
  setDevelopmentData,
  setOperationData,
  addDataLink,
  removeDataLink,
  clearProjectData,
  clearError,
} = workflowDataSlice.actions

export default workflowDataSlice.reducer

// Selectors
export const selectProjectData = (
  state: { workflowData: WorkflowDataState },
  projectId: string
) => state.workflowData.projectData[projectId]

export const selectRFPData = (
  state: { workflowData: WorkflowDataState },
  projectId: string
) => state.workflowData.projectData[projectId]?.rfp

export const selectMarketResearchData = (
  state: { workflowData: WorkflowDataState },
  projectId: string
) => state.workflowData.projectData[projectId]?.marketResearch

export const selectPersonaData = (
  state: { workflowData: WorkflowDataState },
  projectId: string
) => state.workflowData.projectData[projectId]?.persona

export const selectProposalData = (
  state: { workflowData: WorkflowDataState },
  projectId: string
) => state.workflowData.projectData[projectId]?.proposal

export const selectDevelopmentData = (
  state: { workflowData: WorkflowDataState },
  projectId: string
) => state.workflowData.projectData[projectId]?.development

export const selectOperationData = (
  state: { workflowData: WorkflowDataState },
  projectId: string
) => state.workflowData.projectData[projectId]?.operation

export const selectDataLinks = (
  state: { workflowData: WorkflowDataState },
  projectId: string
) => state.workflowData.dataLinks.filter(link => link.projectId === projectId)

export const selectDataVersions = (
  state: { workflowData: WorkflowDataState },
  projectId: string
) => state.workflowData.dataVersions[projectId] || []
