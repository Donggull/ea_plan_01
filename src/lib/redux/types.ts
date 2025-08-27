// Common types for workflow data management

export interface BaseWorkflowData {
  id: string
  projectId: string
  userId: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'in-progress' | 'completed' | 'archived'
  version: number
  metadata?: Record<string, unknown>
}

// RFP Analysis Data
export interface RFPData extends BaseWorkflowData {
  fileName: string
  fileSize: number
  fileType: string
  extractedText: string
  requirements: {
    functional: string[]
    nonFunctional: string[]
    technical: string[]
    business: string[]
  }
  stakeholders: {
    name: string
    role: string
    responsibilities: string[]
  }[]
  timeline: {
    phase: string
    startDate: string
    endDate: string
    deliverables: string[]
  }[]
  budget: {
    total?: number
    breakdown?: {
      category: string
      amount: number
      description: string
    }[]
  }
  riskFactors: string[]
  successCriteria: string[]
}

// Market Research Data
export interface MarketResearchData extends BaseWorkflowData {
  competitors: {
    name: string
    website: string
    strengths: string[]
    weaknesses: string[]
    marketShare?: number
    pricing?: {
      model: string
      range: string
    }
  }[]
  trendAnalysis: {
    technology: string[]
    market: string[]
    industry: string[]
  }
  swotAnalysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  targetMarket: {
    size: string
    growth: string
    segments: string[]
  }
}

// Persona Analysis Data
export interface PersonaData extends BaseWorkflowData {
  personas: {
    id: string
    name: string
    demographics: {
      age: string
      location: string
      occupation: string
      income: string
    }
    psychographics: {
      goals: string[]
      frustrations: string[]
      values: string[]
      behaviors: string[]
    }
    technicalProfile: {
      skillLevel: 'beginner' | 'intermediate' | 'expert'
      preferredDevices: string[]
      softwareUsage: string[]
    }
  }[]
  userJourneys: {
    personaId: string
    journey: {
      stage: string
      actions: string[]
      touchpoints: string[]
      emotions: string[]
      opportunities: string[]
    }[]
  }[]
}

// Proposal Data
export interface ProposalData extends BaseWorkflowData {
  sections: {
    id: string
    title: string
    content: string
    order: number
    approved: boolean
  }[]
  executiveSummary: string
  solutionOverview: string
  technicalApproach: string
  projectTimeline: {
    phase: string
    duration: string
    deliverables: string[]
    dependencies: string[]
  }[]
  teamStructure: {
    role: string
    count: number
    skills: string[]
    responsibility: string
  }[]
  costEstimate: {
    development: number
    design: number
    projectManagement: number
    testing: number
    deployment: number
    maintenance: number
    total: number
  }
}

// Development Workflow Data
export interface DevelopmentData extends BaseWorkflowData {
  requirements: {
    functional: {
      id: string
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
      status: 'pending' | 'approved' | 'in-progress' | 'completed'
      source: string // From RFP, stakeholder, etc.
    }[]
    nonFunctional: {
      id: string
      type: 'performance' | 'security' | 'usability' | 'reliability'
      description: string
      criteria: string
      source: string
    }[]
  }
  architecture: {
    frontend: {
      framework: string
      libraries: string[]
      structure: string
    }
    backend: {
      framework: string
      database: string
      apis: string[]
      services: string[]
    }
    infrastructure: {
      hosting: string
      deployment: string
      monitoring: string[]
    }
  }
  userStories: {
    id: string
    title: string
    description: string
    acceptanceCriteria: string[]
    priority: number
    estimation: number // story points
    status: 'backlog' | 'in-progress' | 'testing' | 'done'
  }[]
  wireframes: {
    id: string
    screenName: string
    description: string
    imageUrl?: string
    annotations: string[]
  }[]
  wbs: {
    id: string
    task: string
    parent?: string
    duration: number
    dependencies: string[]
    assignee?: string
    status: 'not-started' | 'in-progress' | 'completed'
    progress: number
  }[]
  qaPlans: {
    id: string
    testSuite: string
    testCases: {
      id: string
      description: string
      steps: string[]
      expectedResult: string
      status: 'not-started' | 'passed' | 'failed' | 'blocked'
    }[]
  }[]
}

// Operation Workflow Data
export interface OperationData extends BaseWorkflowData {
  requirements: {
    id: string
    title: string
    description: string
    requester: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    category: 'bug-fix' | 'enhancement' | 'new-feature' | 'maintenance'
    status:
      | 'submitted'
      | 'approved'
      | 'in-progress'
      | 'testing'
      | 'completed'
      | 'rejected'
    estimatedEffort: number // hours
    assignedTeam?: string[]
    dueDate?: string
    source: string // From development phase, client request, etc.
  }[]
  teamAssignments: {
    team: 'planning' | 'design' | 'frontend' | 'backend' | 'qa' | 'devops'
    members: {
      id: string
      name: string
      role: string
      capacity: number // hours per week
      currentLoad: number // percentage
    }[]
    currentSprint: {
      id: string
      startDate: string
      endDate: string
      goals: string[]
      tasks: {
        requirementId: string
        assigneeId: string
        estimatedHours: number
        actualHours?: number
        status: 'todo' | 'in-progress' | 'review' | 'done'
      }[]
    }
  }[]
  performanceMetrics: {
    period: string
    velocity: number // story points completed
    burndown: {
      date: string
      remaining: number
      ideal: number
    }[]
    qualityMetrics: {
      bugRate: number
      customerSatisfaction: number
      deliveryTime: number
    }
    teamMetrics: {
      teamId: string
      utilization: number
      blockers: string[]
    }[]
  }[]
}

// Workflow Data Linking
export interface WorkflowDataLink {
  id: string
  projectId: string
  sourceWorkflow: 'proposal' | 'development' | 'operation'
  targetWorkflow: 'proposal' | 'development' | 'operation'
  sourceDataId: string
  targetDataId: string
  linkType: 'derived' | 'referenced' | 'inherited'
  mappings: {
    sourceField: string
    targetField: string
    transformationType?: 'copy' | 'aggregate' | 'transform'
    transformationRule?: string
  }[]
  createdAt: string
  updatedAt: string
}
