// ─── Node Types ────────────────────────────────────────────────────────────────

export type NodeType = 'person' | 'company' | 'opportunity' | 'project'

export type RelationshipStrength = 'weak' | 'moderate' | 'strong'

export interface NodeData {
  id: string
  type: NodeType
  label: string
  description?: string
  email?: string
  phone?: string
  website?: string
  tags: string[]
  imageUrl?: string
  // Person-specific
  title?: string
  company?: string
  // Company-specific
  industry?: string
  size?: string
  // Opportunity-specific
  value?: number
  stage?: OpportunityStage
  // Project-specific
  status?: ProjectStatus
  deadline?: string
  // Meta
  userId: string
  createdAt: string
  updatedAt: string
  // Graph position (persisted)
  x?: number
  y?: number
}

export type OpportunityStage =
  | 'prospect'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'

// ─── Edge Types ────────────────────────────────────────────────────────────────

export type EdgeType =
  | 'introduction'
  | 'collaboration'
  | 'reports_to'
  | 'influences'
  | 'invested_in'
  | 'works_at'
  | 'part_of'
  | 'competitor'
  | 'partner'
  | 'custom'

export interface EdgeData {
  id: string
  sourceId: string
  targetId: string
  type: EdgeType
  label?: string
  strength: RelationshipStrength
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

// ─── Graph Types ───────────────────────────────────────────────────────────────

export interface GraphNode extends NodeData {
  // D3 simulation fields
  fx?: number | null
  fy?: number | null
  vx?: number
  vy?: number
  index?: number
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  edge: EdgeData
}

export interface GraphState {
  nodes: GraphNode[]
  links: GraphLink[]
  selectedNodeId: string | null
  hoveredNodeId: string | null
  searchQuery: string
  filterTypes: NodeType[]
}

// ─── Auth Types ────────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalNodes: number
  totalEdges: number
  people: number
  companies: number
  opportunities: number
  projects: number
  strongConnections: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'node_added' | 'edge_added' | 'node_updated'
  label: string
  timestamp: string
  nodeType?: NodeType
}

// ─── Path Finding ──────────────────────────────────────────────────────────────

export interface PathResult {
  path: string[]
  nodes: NodeData[]
  edges: EdgeData[]
  length: number
}
