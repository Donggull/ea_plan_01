import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ProposalState {
  currentStep:
    | 'upload'
    | 'analysis'
    | 'research'
    | 'persona'
    | 'proposal'
    | 'cost'
    | 'complete'
  rfpFile: {
    name: string
    size: number
    type: string
    uploadedAt: string
  } | null
  analysisProgress: number
  researchProgress: number
  personaProgress: number
  proposalProgress: number
  costProgress: number
  isProcessing: boolean
  error: string | null
}

const initialState: ProposalState = {
  currentStep: 'upload',
  rfpFile: null,
  analysisProgress: 0,
  researchProgress: 0,
  personaProgress: 0,
  proposalProgress: 0,
  costProgress: 0,
  isProcessing: false,
  error: null,
}

const proposalSlice = createSlice({
  name: 'proposal',
  initialState,
  reducers: {
    setCurrentStep: (
      state,
      action: PayloadAction<ProposalState['currentStep']>
    ) => {
      state.currentStep = action.payload
    },

    setRFPFile: (state, action: PayloadAction<ProposalState['rfpFile']>) => {
      state.rfpFile = action.payload
    },

    updateAnalysisProgress: (state, action: PayloadAction<number>) => {
      state.analysisProgress = action.payload
    },

    updateResearchProgress: (state, action: PayloadAction<number>) => {
      state.researchProgress = action.payload
    },

    updatePersonaProgress: (state, action: PayloadAction<number>) => {
      state.personaProgress = action.payload
    },

    updateProposalProgress: (state, action: PayloadAction<number>) => {
      state.proposalProgress = action.payload
    },

    updateCostProgress: (state, action: PayloadAction<number>) => {
      state.costProgress = action.payload
    },

    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    resetProposal: () => {
      return { ...initialState }
    },
  },
})

export const {
  setCurrentStep,
  setRFPFile,
  updateAnalysisProgress,
  updateResearchProgress,
  updatePersonaProgress,
  updateProposalProgress,
  updateCostProgress,
  setProcessing,
  setError,
  resetProposal,
} = proposalSlice.actions

export default proposalSlice.reducer
