import { type ReactNode } from 'react'
import { clsx } from 'clsx'
import type { NodeType } from '@/types'
import { NODE_COLORS } from '@/utils/node.utils'

interface BadgeProps {
  children: ReactNode
  className?: string
}

export const Badge = ({ children, className }: BadgeProps) => (
  <span
    className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium',
      'bg-muted text-slate-400 border border-border',
      className
    )}
  >
    {children}
  </span>
)

interface NodeTypeBadgeProps {
  type: NodeType
}

const TYPE_LABELS: Record<NodeType, string> = {
  person: 'Person',
  company: 'Company',
  opportunity: 'Opportunity',
  project: 'Project',
}

export const NodeTypeBadge = ({ type }: NodeTypeBadgeProps) => {
  const color = NODE_COLORS[type]
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border"
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}10`,
      }}
    >
      {TYPE_LABELS[type]}
    </span>
  )
}
