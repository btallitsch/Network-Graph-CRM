import { useState, useMemo, useCallback } from 'react'
import type { NodeData, EdgeData, GraphNode, GraphLink, NodeType } from '@/types'

export const useGraph = (nodes: NodeData[], edges: EdgeData[]) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTypes, setFilterTypes] = useState<NodeType[]>([])
  const [connectMode, setConnectMode] = useState(false)
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null)

  // Build filtered graph data for D3
  const graphData = useMemo(() => {
    let filteredNodes = nodes
    if (filterTypes.length > 0) {
      filteredNodes = nodes.filter((n) => filterTypes.includes(n.type))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filteredNodes = filteredNodes.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    const visibleIds = new Set(filteredNodes.map((n) => n.id))
    const filteredEdges = edges.filter(
      (e) => visibleIds.has(e.sourceId) && visibleIds.has(e.targetId)
    )

    const graphNodes: GraphNode[] = filteredNodes.map((n) => ({ ...n }))
    const graphLinks: GraphLink[] = filteredEdges.map((e) => ({
      source: e.sourceId,
      target: e.targetId,
      edge: e,
    }))

    return { nodes: graphNodes, links: graphLinks }
  }, [nodes, edges, filterTypes, searchQuery])

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  )

  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>()
    const ids = new Set<string>()
    edges.forEach((e) => {
      if (e.sourceId === selectedNodeId) ids.add(e.targetId)
      if (e.targetId === selectedNodeId) ids.add(e.sourceId)
    })
    return ids
  }, [selectedNodeId, edges])

  const toggleFilter = useCallback((type: NodeType) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  const startConnect = useCallback((sourceId: string) => {
    setConnectMode(true)
    setConnectSourceId(sourceId)
    setSelectedNodeId(null)
  }, [])

  const cancelConnect = useCallback(() => {
    setConnectMode(false)
    setConnectSourceId(null)
  }, [])

  const selectNode = useCallback(
    (nodeId: string | null) => {
      if (connectMode && nodeId && nodeId !== connectSourceId) {
        return { connectTo: nodeId, connectFrom: connectSourceId }
      }
      setSelectedNodeId(nodeId)
      return null
    },
    [connectMode, connectSourceId]
  )

  return {
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
    clearSelection: () => setSelectedNodeId(null),
  }
}
