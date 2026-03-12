import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNodes } from '@/hooks/useNodes'
import { useEdges } from '@/hooks/useEdges'
import { useGraph } from '@/hooks/useGraph'
import { NetworkGraph } from '@/components/graph/NetworkGraph'
import { GraphControls } from '@/components/graph/GraphControls'
import { NodeDetailPanel } from '@/components/panels/NodeDetailPanel'
import { AddNodeModal } from '@/components/panels/AddNodeModal'
import { AddEdgeModal } from '@/components/panels/AddEdgeModal'
import type { NodeData } from '@/types'

export const GraphPage = () => {
  const { user } = useAuthContext()
  const { nodes, addNode, editNode, removeNode } = useNodes(user?.uid ?? null)
  const { edges, addEdge } = useEdges(user?.uid ?? null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  const {
    graphData,
    selectedNode,
    selectedNodeId,
    hoveredNodeId,
    connectedNodeIds,
    searchQuery,
    filterTypes,
    connectMode,
    connectSourceId,
    setHoveredNodeId,
    setSearchQuery,
    toggleFilter,
    selectNode,
    startConnect,
    cancelConnect,
    clearSelection,
  } = useGraph(nodes, edges)

  const [showAddNode, setShowAddNode] = useState(false)
  const [showAddEdge, setShowAddEdge] = useState(false)
  const [editingNode, setEditingNode] = useState<NodeData | null>(null)
  const [connectTarget, setConnectTarget] = useState<string | null>(null)

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const result = selectNode(nodeId)
      if (result?.connectFrom && result?.connectTo) {
        setConnectTarget(result.connectTo)
        setShowAddEdge(true)
        cancelConnect()
      }
    },
    [selectNode, cancelConnect]
  )

  const handleAddNode = async (data: Omit<NodeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingNode) {
      await editNode(editingNode.id, data)
      setEditingNode(null)
    } else {
      await addNode(data)
    }
  }

  const handleDeleteNode = async (nodeId: string) => {
    const confirmed = window.confirm('Delete this node and all its connections?')
    if (confirmed) {
      clearSelection()
      await removeNode(nodeId)
    }
  }

  const handleStartConnect = (nodeId: string) => {
    clearSelection()
    startConnect(nodeId)
  }

  return (
    <div className="h-full flex overflow-hidden bg-void">
      {/* Graph canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-20">🕸️</div>
              <p className="text-sm font-mono text-slate-600">Your network is empty</p>
              <p className="text-xs text-slate-700 mt-1">Click "Add Node" to get started</p>
            </div>
          </div>
        )}

        <NetworkGraph
          nodes={graphData.nodes}
          links={graphData.links}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          connectedNodeIds={connectedNodeIds}
          connectMode={connectMode}
          onNodeClick={handleNodeClick}
          onNodeHover={setHoveredNodeId}
          width={dimensions.width}
          height={dimensions.height}
        />

        <GraphControls
          searchQuery={searchQuery}
          filterTypes={filterTypes}
          connectMode={connectMode}
          nodeCount={graphData.nodes.length}
          edgeCount={graphData.links.length}
          onSearchChange={setSearchQuery}
          onToggleFilter={toggleFilter}
          onAddNode={() => { setEditingNode(null); setShowAddNode(true) }}
          onAddEdge={() => { setConnectTarget(null); setShowAddEdge(true) }}
          onCancelConnect={cancelConnect}
        />
      </div>

      {/* Side panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          edges={edges}
          allNodes={nodes}
          onClose={clearSelection}
          onEdit={(node) => { setEditingNode(node); setShowAddNode(true) }}
          onDelete={handleDeleteNode}
          onConnect={handleStartConnect}
          onSelectNode={(id) => selectNode(id)}
        />
      )}

      {/* Modals */}
      <AddNodeModal
        open={showAddNode}
        onClose={() => { setShowAddNode(false); setEditingNode(null) }}
        onSubmit={handleAddNode}
        editNode={editingNode}
      />

      <AddEdgeModal
        open={showAddEdge}
        onClose={() => { setShowAddEdge(false); setConnectTarget(null) }}
        onSubmit={addEdge}
        nodes={nodes}
        preSelectedSource={connectSourceId}
        preSelectedTarget={connectTarget}
      />
    </div>
  )
}
