export type MigrationStrategy = 'rehost' | 'replatform' | 'refactor' | 'repurchase' | 'retire' | 'retain'

export interface Workload {
  id: string
  name: string
  description: string
  currentLocation: string
  targetLocation: string
  strategy: MigrationStrategy
  complexity: 'low' | 'medium' | 'high'
  priority: 'low' | 'medium' | 'high'
  estimatedCost: number
  estimatedDuration: number
  dependencies: string[]
  riskLevel: 'low' | 'medium' | 'high'
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  userId: string
  createdAt: string
  updatedAt: string
}

export interface DataCenter {
  id: string
  name: string
  location: string
  capacity: number
  currentUtilization: number
  type: 'source' | 'target'
  coordinates: { x: number; y: number }
  userId: string
  createdAt: string
}

export interface MigrationPlan {
  id: string
  name: string
  description: string
  workloadIds: string[]
  startDate: string
  endDate: string
  totalCost: number
  status: 'draft' | 'approved' | 'in-progress' | 'completed'
  userId: string
  createdAt: string
  updatedAt: string
}

export const migrationStrategies = {
  rehost: {
    name: 'Rehost (Lift & Shift)',
    description: 'Move applications to cloud without changes',
    icon: '🚀',
    complexity: 'low',
    timeframe: 'weeks',
    costSaving: 'medium'
  },
  replatform: {
    name: 'Replatform (Lift & Reshape)',
    description: 'Make minimal changes to optimize for cloud',
    icon: '🔧',
    complexity: 'medium',
    timeframe: 'months',
    costSaving: 'high'
  },
  refactor: {
    name: 'Refactor (Re-architect)',
    description: 'Redesign applications for cloud-native architecture',
    icon: '🏗️',
    complexity: 'high',
    timeframe: 'quarters',
    costSaving: 'very high'
  },
  repurchase: {
    name: 'Repurchase (Drop & Shop)',
    description: 'Replace with SaaS or cloud-native solutions',
    icon: '🛒',
    complexity: 'medium',
    timeframe: 'months',
    costSaving: 'high'
  },
  retire: {
    name: 'Retire',
    description: 'Decommission applications no longer needed',
    icon: '🗑️',
    complexity: 'low',
    timeframe: 'weeks',
    costSaving: 'very high'
  },
  retain: {
    name: 'Retain (Revisit)',
    description: 'Keep applications on-premises for now',
    icon: '⏸️',
    complexity: 'low',
    timeframe: 'immediate',
    costSaving: 'none'
  }
} as const