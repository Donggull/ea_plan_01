import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface OperationState {
  currentPhase: 'requirements' | 'planning' | 'schedule' | 'performance'

  // Phase completion status
  requirementsPhaseComplete: boolean
  planningPhaseComplete: boolean
  schedulePhaseComplete: boolean
  performancePhaseComplete: boolean

  // Progress tracking
  overallProgress: number
  phaseProgress: {
    requirements: number
    planning: number
    schedule: number
    performance: number
  }

  // Data from development workflow (inherited)
  inheritedDevelopmentData: boolean
  inheritedUserStories: boolean
  inheritedWBS: boolean
  inheritedQAPlans: boolean

  // Current work state
  isProcessing: boolean
  error: string | null

  // Requirements tracking
  totalRequirements: number
  approvedRequirements: number
  inProgressRequirements: number
  completedRequirements: number

  // Team capacity tracking
  totalTeamCapacity: number // hours
  allocatedCapacity: number
  utilizationPercentage: number

  // Sprint tracking
  currentSprintId: string | null
  totalSprints: number
  completedSprints: number

  // Performance metrics
  currentVelocity: number
  averageVelocity: number
  bugRate: number
  customerSatisfaction: number
  deliveryTime: number

  // Team metrics
  teamMetrics: {
    [teamId: string]: {
      utilization: number
      blockers: number
      satisfaction: number
    }
  }

  // Backlog management
  backlogSize: number
  prioritizedItems: number

  // Quality metrics
  defectDensity: number
  testCoverage: number
  codeQualityScore: number
}

const initialState: OperationState = {
  currentPhase: 'requirements',

  requirementsPhaseComplete: false,
  planningPhaseComplete: false,
  schedulePhaseComplete: false,
  performancePhaseComplete: false,

  overallProgress: 0,
  phaseProgress: {
    requirements: 0,
    planning: 0,
    schedule: 0,
    performance: 0,
  },

  inheritedDevelopmentData: false,
  inheritedUserStories: false,
  inheritedWBS: false,
  inheritedQAPlans: false,

  isProcessing: false,
  error: null,

  totalRequirements: 0,
  approvedRequirements: 0,
  inProgressRequirements: 0,
  completedRequirements: 0,

  totalTeamCapacity: 0,
  allocatedCapacity: 0,
  utilizationPercentage: 0,

  currentSprintId: null,
  totalSprints: 0,
  completedSprints: 0,

  currentVelocity: 0,
  averageVelocity: 0,
  bugRate: 0,
  customerSatisfaction: 0,
  deliveryTime: 0,

  teamMetrics: {},

  backlogSize: 0,
  prioritizedItems: 0,

  defectDensity: 0,
  testCoverage: 0,
  codeQualityScore: 0,
}

const operationSlice = createSlice({
  name: 'operation',
  initialState,
  reducers: {
    setCurrentPhase: (
      state,
      action: PayloadAction<OperationState['currentPhase']>
    ) => {
      state.currentPhase = action.payload
    },

    setPhaseComplete: (
      state,
      action: PayloadAction<{
        phase: 'requirements' | 'planning' | 'schedule' | 'performance'
        complete: boolean
      }>
    ) => {
      const { phase, complete } = action.payload
      switch (phase) {
        case 'requirements':
          state.requirementsPhaseComplete = complete
          break
        case 'planning':
          state.planningPhaseComplete = complete
          break
        case 'schedule':
          state.schedulePhaseComplete = complete
          break
        case 'performance':
          state.performancePhaseComplete = complete
          break
      }
    },

    updatePhaseProgress: (
      state,
      action: PayloadAction<{
        phase: keyof OperationState['phaseProgress']
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
        type: 'developmentData' | 'userStories' | 'wbs' | 'qaPlans'
        inherited: boolean
      }>
    ) => {
      const { type, inherited } = action.payload
      switch (type) {
        case 'developmentData':
          state.inheritedDevelopmentData = inherited
          break
        case 'userStories':
          state.inheritedUserStories = inherited
          break
        case 'wbs':
          state.inheritedWBS = inherited
          break
        case 'qaPlans':
          state.inheritedQAPlans = inherited
          break
      }
    },

    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    // Requirements management
    updateRequirements: (
      state,
      action: PayloadAction<{
        total: number
        approved: number
        inProgress: number
        completed: number
      }>
    ) => {
      const { total, approved, inProgress, completed } = action.payload
      state.totalRequirements = total
      state.approvedRequirements = approved
      state.inProgressRequirements = inProgress
      state.completedRequirements = completed
    },

    // Capacity management
    updateCapacity: (
      state,
      action: PayloadAction<{ total: number; allocated: number }>
    ) => {
      const { total, allocated } = action.payload
      state.totalTeamCapacity = total
      state.allocatedCapacity = allocated
      state.utilizationPercentage =
        total > 0 ? Math.round((allocated / total) * 100) : 0
    },

    // Sprint management
    updateSprint: (
      state,
      action: PayloadAction<{
        currentSprintId: string | null
        totalSprints: number
        completedSprints: number
      }>
    ) => {
      const { currentSprintId, totalSprints, completedSprints } = action.payload
      state.currentSprintId = currentSprintId
      state.totalSprints = totalSprints
      state.completedSprints = completedSprints
    },

    // Performance metrics
    updatePerformanceMetrics: (
      state,
      action: PayloadAction<{
        currentVelocity: number
        averageVelocity: number
        bugRate: number
        customerSatisfaction: number
        deliveryTime: number
      }>
    ) => {
      const {
        currentVelocity,
        averageVelocity,
        bugRate,
        customerSatisfaction,
        deliveryTime,
      } = action.payload
      state.currentVelocity = currentVelocity
      state.averageVelocity = averageVelocity
      state.bugRate = bugRate
      state.customerSatisfaction = customerSatisfaction
      state.deliveryTime = deliveryTime
    },

    // Team metrics
    updateTeamMetrics: (
      state,
      action: PayloadAction<{
        teamId: string
        utilization: number
        blockers: number
        satisfaction: number
      }>
    ) => {
      const { teamId, utilization, blockers, satisfaction } = action.payload
      state.teamMetrics[teamId] = {
        utilization,
        blockers,
        satisfaction,
      }
    },

    // Backlog management
    updateBacklog: (
      state,
      action: PayloadAction<{ size: number; prioritized: number }>
    ) => {
      const { size, prioritized } = action.payload
      state.backlogSize = size
      state.prioritizedItems = prioritized
    },

    // Quality metrics
    updateQualityMetrics: (
      state,
      action: PayloadAction<{
        defectDensity: number
        testCoverage: number
        codeQualityScore: number
      }>
    ) => {
      const { defectDensity, testCoverage, codeQualityScore } = action.payload
      state.defectDensity = defectDensity
      state.testCoverage = testCoverage
      state.codeQualityScore = codeQualityScore
    },

    resetOperation: () => {
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
  updateCapacity,
  updateSprint,
  updatePerformanceMetrics,
  updateTeamMetrics,
  updateBacklog,
  updateQualityMetrics,
  resetOperation,
} = operationSlice.actions

export default operationSlice.reducer
