import { X, Edit2, Trash2, Link2, Mail, Phone, Globe, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NodeTypeBadge, Badge } from '@/components/ui/Badge'
import { NODE_COLORS, NODE_ICONS, EDGE_TYPE_LABELS, formatCurrency, formatDate, timeAgo } from '@/utils/node.utils'
import type { NodeData, EdgeData } from '@/types'

interface NodeDetailPanelProps {
  node: NodeData | null
  edges: EdgeData[]
  allNodes: NodeData[]
  onClose: () => void
  onEdit: (node: NodeData) => void
  onDelete: (nodeId: string) => void
  onConnect: (nodeId: string) => void
  onSelectNode: (nodeId: string) => void
}

export const NodeDetailPanel = ({
  node,
  edges,
  allNodes,
  onClose,
  onEdit,
  onDelete,
  onConnect,
  onSelectNode,
}: NodeDetailPanelProps) => {
  if (!node) return null

  const color = NODE_COLORS[node.type]
  const connectedEdges = edges.filter(
    (e) => e.sourceId === node.id || e.targetId === node.id
  )

  const connectedNodes = connectedEdges.map((e) => {
    const otherId = e.sourceId === node.id ? e.targetId : e.sourceId
    const other = allNodes.find((n) => n.id === otherId)
    return { node: other, edge: e }
  }).filter((c) => c.node != null) as { node: NodeData; edge: EdgeData }[]

  return (
    <div className="w-80 flex-shrink-0 bg-panel border-l border-border flex flex-col animate-slide-in overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-border"
        style={{ borderTopColor: color, borderTopWidth: 2 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
            >
              {NODE_ICONS[node.type]}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-slate-100 truncate">{node.label}</h3>
              <NodeTypeBadge type={node.type} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-muted transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Description */}
        {node.description && (
          <p className="text-sm text-slate-400 leading-relaxed">{node.description}</p>
        )}

        {/* Key-value details */}
        <div className="space-y-2.5">
          {node.title && <DetailRow icon={<span className="text-xs">💼</span>} label="Title" value={node.title} />}
          {node.company && <DetailRow icon={<span className="text-xs">🏢</span>} label="Company" value={node.company} />}
          {node.industry && <DetailRow icon={<span className="text-xs">🏭</span>} label="Industry" value={node.industry} />}
          {node.value != null && (
            <DetailRow icon={<span className="text-xs">💰</span>} label="Value" value={formatCurrency(node.value)} />
          )}
          {node.stage && (
            <DetailRow icon={<span className="text-xs">📊</span>} label="Stage" value={node.stage.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} />
          )}
          {node.status && (
            <DetailRow icon={<span className="text-xs">🎯</span>} label="Status" value={node.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} />
          )}
          {node.email && (
            <DetailRow icon={<Mail size={12} />} label="Email" value={node.email} href={`mailto:${node.email}`} />
          )}
          {node.phone && (
            <DetailRow icon={<Phone size={12} />} label="Phone" value={node.phone} href={`tel:${node.phone}`} />
          )}
          {node.website && (
            <DetailRow icon={<Globe size={12} />} label="Website" value={node.website} href={node.website} />
          )}
        </div>

        {/* Tags */}
        {node.tags.length > 0 && (
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag size={10} /> Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {node.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Connections */}
        <div>
          <p className="text-xs font-mono text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Link2 size={10} /> Connections ({connectedNodes.length})
          </p>
          {connectedNodes.length === 0 ? (
            <p className="text-xs text-slate-600 italic">No connections yet.</p>
          ) : (
            <div className="space-y-2">
              {connectedNodes.map(({ node: other, edge }) => (
                <button
                  key={other.id}
                  onClick={() => onSelectNode(other.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface hover:bg-muted border border-border hover:border-teal-500/30 transition-all text-left group"
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                    style={{ backgroundColor: `${NODE_COLORS[other.type]}15` }}
                  >
                    {NODE_ICONS[other.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate group-hover:text-teal-400 transition-colors">
                      {other.label}
                    </p>
                    <p className="text-xs text-slate-600">{EDGE_TYPE_LABELS[edge.type]}</p>
                  </div>
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: edge.strength === 'strong' ? '#2DD4BF' : edge.strength === 'moderate' ? '#FBBF24' : '#475569',
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="pt-2 border-t border-border space-y-1">
          <p className="text-xs text-slate-600">Created {timeAgo(node.createdAt)}</p>
          <p className="text-xs text-slate-600">Updated {formatDate(node.updatedAt)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-border flex gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={<Link2 size={13} />}
          onClick={() => onConnect(node.id)}
          className="flex-1"
        >
          Connect
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Edit2 size={13} />}
          onClick={() => onEdit(node)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 size={13} />}
          onClick={() => onDelete(node.id)}
        />
      </div>
    </div>
  )
}

// ─── Sub-component ─────────────────────────────────────────────────────────────

const DetailRow = ({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) => (
  <div className="flex items-center gap-2.5">
    <span className="text-slate-600 flex-shrink-0">{icon}</span>
    <span className="text-xs text-slate-600 w-16 flex-shrink-0">{label}</span>
    {href ? (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-teal-400 hover:text-teal-300 truncate transition-colors"
      >
        {value}
      </a>
    ) : (
      <span className="text-xs text-slate-300 truncate">{value}</span>
    )}
  </div>
)
