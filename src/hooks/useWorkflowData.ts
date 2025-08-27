'use client'

import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useCallback } from 'react'
import type { RootState, AppDispatch } from '@/lib/redux/store'
import {
  setRFPData,
  setMarketResearchData,
  setPersonaData,
  setProposalData,
  setDevelopmentData,
  setOperationData,
  selectProjectData,
  selectRFPData,
  selectMarketResearchData,
  selectPersonaData,
  selectProposalData,
  selectDevelopmentData,
  selectOperationData,
  selectDataLinks,
  loadWorkflowData,
  saveWorkflowData,
} from '@/lib/redux/slices/workflowDataSlice'
import type {
  RFPData,
  MarketResearchData,
  PersonaData,
  ProposalData,
  DevelopmentData,
  OperationData,
} from '@/lib/redux/types'

export function useWorkflowData(projectId: string) {
  const dispatch = useDispatch<AppDispatch>()

  // Selectors
  const projectData = useSelector((state: RootState) =>
    selectProjectData(state, projectId)
  )
  const rfpData = useSelector((state: RootState) =>
    selectRFPData(state, projectId)
  )
  const marketResearchData = useSelector((state: RootState) =>
    selectMarketResearchData(state, projectId)
  )
  const personaData = useSelector((state: RootState) =>
    selectPersonaData(state, projectId)
  )
  const proposalData = useSelector((state: RootState) =>
    selectProposalData(state, projectId)
  )
  const developmentData = useSelector((state: RootState) =>
    selectDevelopmentData(state, projectId)
  )
  const operationData = useSelector((state: RootState) =>
    selectOperationData(state, projectId)
  )
  const dataLinks = useSelector((state: RootState) =>
    selectDataLinks(state, projectId)
  )

  const loading = useSelector((state: RootState) => state.workflowData.loading)
  const error = useSelector((state: RootState) => state.workflowData.error)

  // Load all workflow data for the project
  const loadData = useCallback(() => {
    dispatch(loadWorkflowData({ projectId }))
  }, [dispatch, projectId])

  // Save specific workflow data
  const saveRFPData = useCallback(
    (data: RFPData) => {
      dispatch(setRFPData({ projectId, data }))
      dispatch(saveWorkflowData({ projectId, workflowType: 'rfp', data }))
    },
    [dispatch, projectId]
  )

  const saveMarketResearchData = useCallback(
    (data: MarketResearchData) => {
      dispatch(setMarketResearchData({ projectId, data }))
      dispatch(
        saveWorkflowData({ projectId, workflowType: 'market_research', data })
      )
    },
    [dispatch, projectId]
  )

  const savePersonaData = useCallback(
    (data: PersonaData) => {
      dispatch(setPersonaData({ projectId, data }))
      dispatch(saveWorkflowData({ projectId, workflowType: 'persona', data }))
    },
    [dispatch, projectId]
  )

  const saveProposalData = useCallback(
    (data: ProposalData) => {
      dispatch(setProposalData({ projectId, data }))
      dispatch(saveWorkflowData({ projectId, workflowType: 'proposal', data }))
    },
    [dispatch, projectId]
  )

  const saveDevelopmentData = useCallback(
    (data: DevelopmentData) => {
      dispatch(setDevelopmentData({ projectId, data }))
      dispatch(
        saveWorkflowData({ projectId, workflowType: 'development', data })
      )
    },
    [dispatch, projectId]
  )

  const saveOperationData = useCallback(
    (data: OperationData) => {
      dispatch(setOperationData({ projectId, data }))
      dispatch(saveWorkflowData({ projectId, workflowType: 'operation', data }))
    },
    [dispatch, projectId]
  )

  // Load data on hook initialization
  useEffect(() => {
    if (!projectData) {
      loadData()
    }
  }, [projectData, loadData])

  return {
    // Data
    projectData,
    rfpData,
    marketResearchData,
    personaData,
    proposalData,
    developmentData,
    operationData,
    dataLinks,

    // State
    loading,
    error,

    // Actions
    loadData,
    saveRFPData,
    saveMarketResearchData,
    savePersonaData,
    saveProposalData,
    saveDevelopmentData,
    saveOperationData,

    // Utilities
    hasRFPData: !!rfpData,
    hasMarketResearchData: !!marketResearchData,
    hasPersonaData: !!personaData,
    hasProposalData: !!proposalData,
    hasDevelopmentData: !!developmentData,
    hasOperationData: !!operationData,

    // Data inheritance status
    canInheritToDevelopment: !!(rfpData && proposalData),
    canInheritToOperation: !!developmentData,
  }
}
