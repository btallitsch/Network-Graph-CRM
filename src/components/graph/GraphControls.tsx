import { Search, Plus, Link2, X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NODE_COLORS, NODE_ICONS } from '@/utils/node.utils'
import type { NodeType } from '@/types'
import { clsx } from 'clsx'

const NODE_TYPES: NodeType[] = ['person', 'company', 'opportunity', 'project']

interface GraphControlsProps {
  searchQuery: string
  filterTypes: NodeType[]
  connectMode: boolean
  nodeCount: number
  edgeCount: number
  onSearchChange: (q: string) => void
  onToggleFilter: (type: NodeType) => void
  onAddNode: () => void
  onAddEdge: () => void
  onCancelConnect: () => void
}

export const GraphControls = ({
  searchQuery,
  filterTypes,
  connectMode,
  nodeCount,
  edgeCount,
  onSearchChange,
  onToggleFilter,
  onAddNode,
  onAddEdge,
  onCancelConnect,
}: GraphControlsProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex items-start gap-3 pointer-events-none z-10">
      {/* Left: search + filters */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        {/* Search bar */}
        <div className="relative w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-panel/90 backdrop-blur-md border border-border rounded-lg text-sm text-slate-200 font-body placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/60 focus:border-teal-500/60 transition-colors"
          />
        </div>

        {/* Type filters */}
        <div className="flex gap-1.5">
          {NODE_TYPES.map((type) => {
            const active = filterTypes.includes(type)
            const color = NODE_COLORS[type]
            return (
              <button
                key={type}
                onClick={() => onToggleFilter(type)}
                className={clsx(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200 backdrop-blur-md',
                  active
                    ? 'text-slate-200'
                    : 'bg-panel/80 border-border text-slate-500 hover:text-slate-400 hover:border-slate-600'
                )}
                style={
                  active
                    ? { backgroundColor: `${color}18`, borderColor: `${color}50`, color }
                    : undefined
                }
              >
                {NODE_ICONS[type]}
                <span className="capitalize">{type}</span>
              </button>
            )
          })}
          {filterTypes.length > 0 && (
            <button
              onClick={() => filterTypes.forEach(onToggleFilter)}
              className="px-2 py-1.5 rounded-lg text-xs font-mono text-slate-500 hover:text-red-400 bg-panel/80 border border-border backdrop-blur-md transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Right: actions + stats */}
      <div className="ml-auto flex flex-col items-end gap-2 pointer-events-auto">
        {connectMode ? (
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-amber-400/10 border border-amber-400/30 rounded-lg text-xs font-mono text-amber-400 backdrop-blur-md animate-pulse">
              Click another node to connect →
            </div>
            <Button variant="danger" size="sm" icon={<X size={13} />} onClick={onCancelConnect}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Link2 size={13} />}
              onClick={onAddEdge}
              className="backdrop-blur-md bg-panel/90"
            >
              Connect
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={onAddNode}
            >
              Add Node
            </Button>
          </div>
        )}

        {/* Stats pill */}
        <div className="flex items-center gap-3 px-3 py-1.5 bg-panel/80 border border-border rounded-lg backdrop-blur-md">
          <span className="text-xs font-mono text-slate-500">
            <span className="text-teal-400 font-medium">{nodeCount}</span> nodes
          </span>
          <span className="w-px h-3 bg-border" />
          <span className="text-xs font-mono text-slate-500">
            <span className="text-slate-300 font-medium">{edgeCount}</span> edges
          </span>
        </div>
      </div>
    </div>
  )
}
