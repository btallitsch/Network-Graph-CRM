import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Network, Users, Building2, TrendingUp, Zap, ArrowRight, Star } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNodes } from '@/hooks/useNodes'
import { useEdges } from '@/hooks/useEdges'
import { findKeyInfluencers, findConnectedComponents } from '@/utils/graph.utils'
import { NODE_COLORS, NODE_ICONS, timeAgo, formatCurrency } from '@/utils/node.utils'
import { Button } from '@/components/ui/Button'
import { NodeTypeBadge } from '@/components/ui/Badge'
import type { NodeData } from '@/types'

export const DashboardPage = () => {
  const { user } = useAuthContext()
  const { nodes } = useNodes(user?.uid ?? null)
  const { edges } = useEdges(user?.uid ?? null)
  const navigate = useNavigate()

  const stats = useMemo(() => ({
    total: nodes.length,
    people: nodes.filter((n) => n.type === 'person').length,
    companies: nodes.filter((n) => n.type === 'company').length,
    opportunities: nodes.filter((n) => n.type === 'opportunity').length,
    projects: nodes.filter((n) => n.type === 'project').length,
    edges: edges.length,
    strong: edges.filter((e) => e.strength === 'strong').length,
    totalOpportunityValue: nodes
      .filter((n) => n.type === 'opportunity' && n.value)
      .reduce((sum, n) => sum + (n.value ?? 0), 0),
  }), [nodes, edges])

  const influencers = useMemo(
    () => findKeyInfluencers(nodes, edges, 5),
    [nodes, edges]
  )

  const components = useMemo(
    () => findConnectedComponents(nodes, edges),
    [nodes, edges]
  )

  const recentNodes = useMemo(
    () => [...nodes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [nodes]
  )

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className="h-full overflow-y-auto bg-void">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">{greeting}</p>
        <h1 className="text-2xl font-mono font-medium text-slate-100">
          {user?.displayName ?? 'Your'} Network
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-body">
          {nodes.length === 0
            ? 'Start building your professional network graph.'
            : `${nodes.length} nodes · ${edges.length} connections · ${components.filter((c) => c.length > 1).length} clusters`}
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users size={18} />} label="People" value={stats.people} color="#2DD4BF" />
          <StatCard icon={<Building2 size={18} />} label="Companies" value={stats.companies} color="#22D3EE" />
          <StatCard icon={<TrendingUp size={18} />} label="Opportunities" value={stats.opportunities} color="#FBBF24" sub={stats.totalOpportunityValue > 0 ? formatCurrency(stats.totalOpportunityValue) : undefined} />
          <StatCard icon={<Zap size={18} />} label="Projects" value={stats.projects} color="#A78BFA" />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-3 gap-4">
          <MiniStat label="Total Connections" value={stats.edges} />
          <MiniStat label="Strong Bonds" value={stats.strong} />
          <MiniStat label="Network Clusters" value={components.filter((c) => c.length > 1).length} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Key Influencers */}
          <div className="bg-panel border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Star size={12} className="text-amber-400" /> Key Influencers
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/graph')}>
                View Graph <ArrowRight size={12} />
              </Button>
            </div>
            {influencers.length === 0 ? (
              <EmptyState message="Add nodes and connect them to surface influencers." />
            ) : (
              <div className="space-y-2.5">
                {influencers.map((node, i) => (
                  <InfluencerRow key={node.id} node={node} rank={i + 1} connectionCount={edges.filter((e) => e.sourceId === node.id || e.targetId === node.id).length} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-panel border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Network size={12} className="text-teal-400" /> Recent Nodes
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
                All contacts <ArrowRight size={12} />
              </Button>
            </div>
            {recentNodes.length === 0 ? (
              <EmptyState message="No nodes yet. Add your first contact!" />
            ) : (
              <div className="space-y-2.5">
                {recentNodes.map((node) => (
                  <RecentNodeRow key={node.id} node={node} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA if empty */}
        {nodes.length === 0 && (
          <div className="border border-dashed border-border rounded-xl p-10 text-center">
            <Network size={32} className="text-teal-500/30 mx-auto mb-3" />
            <h3 className="text-sm font-mono text-slate-400 mb-2">Your network is empty</h3>
            <p className="text-xs text-slate-600 mb-4 font-body">
              Open the Network Graph to start adding people, companies, and opportunities.
            </p>
            <Button variant="primary" onClick={() => navigate('/graph')} icon={<Network size={14} />}>
              Open Network Graph
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, color, sub }: { icon: React.ReactNode; label: string; value: number; color: string; sub?: string }) => (
  <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-3" style={{ borderTopColor: color, borderTopWidth: 2 }}>
    <div className="flex items-center justify-between">
      <span style={{ color }} className="opacity-80">{icon}</span>
      <span className="text-2xl font-mono font-medium text-slate-100">{value}</span>
    </div>
    <div>
      <p className="text-xs font-mono text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

const MiniStat = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-surface border border-border rounded-lg px-4 py-3 flex items-center justify-between">
    <span className="text-xs font-mono text-slate-500">{label}</span>
    <span className="text-sm font-mono font-medium text-slate-200">{value}</span>
  </div>
)

const InfluencerRow = ({ node, rank, connectionCount }: { node: NodeData; rank: number; connectionCount: number }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs font-mono text-slate-700 w-4">#{rank}</span>
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
      style={{ backgroundColor: `${NODE_COLORS[node.type]}15` }}
    >
      {NODE_ICONS[node.type]}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-300 truncate">{node.label}</p>
      <p className="text-xs text-slate-600">{connectionCount} connections</p>
    </div>
    <NodeTypeBadge type={node.type} />
  </div>
)

const RecentNodeRow = ({ node }: { node: NodeData }) => (
  <div className="flex items-center gap-3">
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
      style={{ backgroundColor: `${NODE_COLORS[node.type]}15` }}
    >
      {NODE_ICONS[node.type]}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-300 truncate">{node.label}</p>
      <p className="text-xs text-slate-600">{timeAgo(node.createdAt)}</p>
    </div>
    <NodeTypeBadge type={node.type} />
  </div>
)

const EmptyState = ({ message }: { message: string }) => (
  <p className="text-xs text-slate-600 italic font-body py-4 text-center">{message}</p>
)
