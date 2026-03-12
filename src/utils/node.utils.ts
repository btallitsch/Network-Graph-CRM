import type { NodeType, EdgeType } from '@/types'

export const NODE_COLORS: Record<NodeType, string> = {
  person: '#2DD4BF',      // teal
  company: '#22D3EE',     // cyan
  opportunity: '#FBBF24', // amber
  project: '#A78BFA',     // violet
}

export const NODE_GLOW: Record<NodeType, string> = {
  person: 'rgba(45, 212, 191, 0.4)',
  company: 'rgba(34, 211, 238, 0.4)',
  opportunity: 'rgba(251, 191, 36, 0.4)',
  project: 'rgba(167, 139, 250, 0.4)',
}

export const NODE_ICONS: Record<NodeType, string> = {
  person: '👤',
  company: '🏢',
  opportunity: '💎',
  project: '⚡',
}

export const EDGE_COLORS: Record<EdgeType, string> = {
  introduction: '#2DD4BF',
  collaboration: '#22D3EE',
  reports_to: '#94A3B8',
  influences: '#FBBF24',
  invested_in: '#34D399',
  works_at: '#60A5FA',
  part_of: '#A78BFA',
  competitor: '#F87171',
  partner: '#FB923C',
  custom: '#CBD5E1',
}

export const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  introduction: 'Introduction',
  collaboration: 'Collaboration',
  reports_to: 'Reports To',
  influences: 'Influences',
  invested_in: 'Invested In',
  works_at: 'Works At',
  part_of: 'Part Of',
  competitor: 'Competitor',
  partner: 'Partner',
  custom: 'Custom',
}

export const NODE_RADIUS: Record<NodeType, number> = {
  person: 22,
  company: 28,
  opportunity: 24,
  project: 22,
}

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value)

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
