import { useState, useMemo } from 'react'
import { Search, Plus, Trash2, Edit2, Link2 } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNodes } from '@/hooks/useNodes'
import { useEdges } from '@/hooks/useEdges'
import { AddNodeModal } from '@/components/panels/AddNodeModal'
import { NodeTypeBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { NODE_COLORS, NODE_ICONS, timeAgo } from '@/utils/node.utils'
import type { NodeData, NodeType } from '@/types'

const TYPE_FILTERS: { value: NodeType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'person', label: '👤 People' },
  { value: 'company', label: '🏢 Companies' },
  { value: 'opportunity', label: '💎 Opportunities' },
  { value: 'project', label: '⚡ Projects' },
]

export const ContactsPage = () => {
  const { user } = useAuthContext()
  const { nodes, addNode, editNode, removeNode } = useNodes(user?.uid ?? null)
  const { edges } = useEdges(user?.uid ?? null)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<NodeType | 'all'>('all')
  const [editingNode, setEditingNode] = useState<NodeData | null>(null)
  const [showModal, setShowModal] = useState(false)

  const filtered = useMemo(() => {
    return nodes.filter((n) => {
      if (typeFilter !== 'all' && n.type !== typeFilter) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        n.label.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        n.email?.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [nodes, search, typeFilter])

  const getConnectionCount = (nodeId: string) =>
    edges.filter((e) => e.sourceId === nodeId || e.targetId === nodeId).length

  const handleDelete = async (nodeId: string) => {
    if (window.confirm('Delete this node and all its connections?')) {
      await removeNode(nodeId)
    }
  }

  const handleSubmit = async (data: Omit<NodeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingNode) {
      await editNode(editingNode.id, data)
      setEditingNode(null)
    } else {
      await addNode(data)
    }
  }

  return (
    <div className="h-full flex flex-col bg-void">
      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-mono font-medium text-slate-100">Contacts</h1>
            <p className="text-xs text-slate-600 mt-0.5 font-body">{nodes.length} nodes in your network</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={13} />}
            onClick={() => { setEditingNode(null); setShowModal(true) }}
          >
            Add Node
          </Button>
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-slate-200 font-body placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/60 focus:border-teal-500/60 transition-colors"
            />
          </div>

          <div className="flex gap-1.5">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value as NodeType | 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  typeFilter === f.value
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                    : 'text-slate-500 border border-transparent hover:text-slate-300 hover:bg-muted'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-4xl opacity-20">🔍</p>
            <p className="text-sm font-mono text-slate-500">
              {nodes.length === 0 ? 'No nodes yet' : 'No matching nodes'}
            </p>
            {nodes.length === 0 && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={13} />}
                onClick={() => setShowModal(true)}
              >
                Add your first node
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-void z-10">
              <tr className="border-b border-border">
                <th className="text-left px-8 py-3 text-xs font-mono text-slate-600 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-slate-600 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-slate-600 uppercase tracking-wider">Details</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-slate-600 uppercase tracking-wider">Links</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-slate-600 uppercase tracking-wider">Added</th>
                <th className="px-8 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((node) => {
                const color = NODE_COLORS[node.type]
                const connections = getConnectionCount(node.id)
                return (
                  <tr
                    key={node.id}
                    className="border-b border-border/50 hover:bg-panel/50 transition-colors group"
                  >
                    <td className="px-8 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}
                        >
                          {NODE_ICONS[node.type]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{node.label}</p>
                          {node.description && (
                            <p className="text-xs text-slate-600 truncate max-w-xs">{node.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <NodeTypeBadge type={node.type} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-500">
                        {node.title ?? node.industry ?? node.stage ?? node.status ?? '—'}
                      </p>
                      {node.email && (
                        <a
                          href={`mailto:${node.email}`}
                          className="text-xs text-teal-500 hover:text-teal-400 transition-colors"
                        >
                          {node.email}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Link2 size={11} />
                        <span>{connections}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600">{timeAgo(node.createdAt)}</span>
                    </td>
                    <td className="px-8 py-3">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 size={12} />}
                          onClick={() => { setEditingNode(node); setShowModal(true) }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={12} />}
                          onClick={() => handleDelete(node.id)}
                          className="hover:text-red-400"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddNodeModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingNode(null) }}
        onSubmit={handleSubmit}
        editNode={editingNode}
      />
    </div>
  )
}
