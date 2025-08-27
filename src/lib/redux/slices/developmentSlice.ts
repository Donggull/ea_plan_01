import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface DevelopmentState {
  currentPhase:
    | 'analysis'
    | 'requirements'
    | 'features'
    | 'design'
    | 'wbs'
    | 'qa'
    | 'insights'

  // Phase completion status
  analysisComplete: boolean
  requirementsComplete: boolean
  featuresComplete: boolean
  designComplete: boolean
  wbsComplete: boolean
  qaComplete: boolean
  insightsComplete: boolean

  // Progress tracking
  overallProgress: number
  phaseProgress: {
    analysis: number
    requirements: number
    features: number
    design: number
    wbs: number
    qa: number
    insights: number
  }

  // Data from proposal workflow (inherited)
  inheritedRFPData: boolean
  inheritedMarketResearch: boolean
  inheritedPersonaData: boolean

  // Current work state
  isProcessing: boolean
  error: string | null

  // Requirements tracking
  totalRequirements: number
  completedRequirements: number

  // User stories tracking
  totalUserStories: number
  completedUserStories: number

  // WBS tracking
  totalTasks: number
  completedTasks: number

  // QA tracking
  totalTestCases: number
  passedTestCases: number
  failedTestCases: number
}

const initialState: DevelopmentState = {
  currentPhase: 'analysis',

  analysisComplete: false,
  requirementsComplete: false,
  featuresComplete: false,
  designComplete: false,
  wbsComplete: false,
  qaComplete: false,
  insightsComplete: false,

  overallProgress: 0,
  phaseProgress: {
    analysis: 0,
    requirements: 0,
    features: 0,
    design: 0,
    wbs: 0,
    qa: 0,
    insights: 0,
  },

  inheritedRFPData: false,
  inheritedMarketResearch: false,
  inheritedPersonaData: false,

  isProcessing: false,
  error: null,

  totalRequirements: 0,
  completedRequirements: 0,

  totalUserStories: 0,
  completedUserStories: 0,

  totalTasks: 0,
  completedTasks: 0,

  totalTestCases: 0,
  passedTestCases: 0,
  failedTestCases: 0,
}

const developmentSlice = createSlice({
  name: 'development',
  initialState,
  reducers: {
    setCurrentPhase: (
      state,
      action: PayloadAction<DevelopmentState['currentPhase']>
    ) => {
      state.currentPhase = action.payload
    },

    setPhaseComplete: (
      state,
      action: PayloadAction<{ phase: string; complete: boolean }>
    ) => {
      const { phase, complete } = action.payload
      if (phase.endsWith('Complete') && phase in state) {
        ;(state as Record<string, unknown>)[phase] = complete
      }
    },

    updatePhaseProgress: (
      state,
      action: PayloadAction<{
        phase: keyof DevelopmentState['phaseProgress']
        progress: number
      }>
    ) => {
      const { phase, progress } = action.payload
      state.phaseProgress[phase] = progress

      // Calculate overall progress
      const phases = Object.values(state.phaseProgress)
      state.overallProgress = Math.round(
        phases.reduce((sum, p) => sum + p, 0) / phases.length
      )
    },

    setInheritedData: (
      state,
      action: PayloadAction<{
        type: 'rfp' | 'marketResearch' | 'persona'
        inherited: boolean
      }>
    ) => {
      const { type, inherited } = action.payload
      switch (type) {
        case 'rfp':
          state.inheritedRFPData = inherited
          break
        case 'marketResearch':
          state.inheritedMarketResearch = inherited
          break
        case 'persona':
          state.inheritedPersonaData = inherited
          break
      }
    },

    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    // Requirements tracking
    updateRequirements: (
      state,
      action: PayloadAction<{ total: number; completed: number }>
    ) => {
      const { total, completed } = action.payload
      state.totalRequirements = total
      state.completedRequirements = completed
    },

    // User stories tracking
    updateUserStories: (
      state,
      action: PayloadAction<{ total: number; completed: number }>
    ) => {
      const { total, completed } = action.payload
      state.totalUserStories = total
      state.completedUserStories = completed
    },

    // WBS tracking
    updateTasks: (
      state,
      action: PayloadAction<{ total: number; completed: number }>
    ) => {
      const { total, completed } = action.payload
      state.totalTasks = total
      state.completedTasks = completed
    },

    // QA tracking
    updateTestCases: (
      state,
      action: PayloadAction<{ total: number; passed: number; failed: number }>
    ) => {
      const { total, passed, failed } = action.payload
      state.totalTestCases = total
      state.passedTestCases = passed
      state.failedTestCases = failed
    },

    resetDevelopment: () => {
      return { ...initialState }
    },
  },
})

export const {
  setCurrentPhase,
  setPhaseComplete,
  updatePhaseProgress,
  setInheritedData,
  setProcessing,
  setError,
  updateRequirements,
  updateUserStories,
  updateTasks,
  updateTestCases,
  resetDevelopment,
} = developmentSlice.actions

export default developmentSlice.reducer
