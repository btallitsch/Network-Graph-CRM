import type { NodeData, EdgeData, PathResult } from '@/types'

// ─── Adjacency List ─────────────────────────────────────────────────────────────

const buildAdjacency = (edges: EdgeData[]): Map<string, string[]> => {
  const adj = new Map<string, string[]>()
  edges.forEach((e) => {
    if (!adj.has(e.sourceId)) adj.set(e.sourceId, [])
    if (!adj.has(e.targetId)) adj.set(e.targetId, [])
    adj.get(e.sourceId)!.push(e.targetId)
    adj.get(e.targetId)!.push(e.sourceId)
  })
  return adj
}

// ─── BFS Shortest Path ─────────────────────────────────────────────────────────

export const findShortestPath = (
  startId: string,
  endId: string,
  nodes: NodeData[],
  edges: EdgeData[]
): PathResult | null => {
  if (startId === endId) return null

  const adj = buildAdjacency(edges)
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const edgeMap = new Map(edges.map((e) => [`${e.sourceId}-${e.targetId}`, e]))

  const getEdge = (a: string, b: string) =>
    edgeMap.get(`${a}-${b}`) ?? edgeMap.get(`${b}-${a}`) ?? null

  const visited = new Set<string>()
  const parent = new Map<string, string | null>()
  const queue: string[] = [startId]

  visited.add(startId)
  parent.set(startId, null)

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === endId) break

    const neighbors = adj.get(current) ?? []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        parent.set(neighbor, current)
        queue.push(neighbor)
      }
    }
  }

  if (!parent.has(endId)) return null

  // Reconstruct path
  const path: string[] = []
  let current: string | null = endId
  while (current !== null) {
    path.unshift(current)
    current = parent.get(current) ?? null
  }

  const pathNodes = path.map((id) => nodeMap.get(id)!).filter(Boolean)
  const pathEdges: EdgeData[] = []
  for (let i = 0; i < path.length - 1; i++) {
    const edge = getEdge(path[i], path[i + 1])
    if (edge) pathEdges.push(edge)
  }

  return {
    path,
    nodes: pathNodes,
    edges: pathEdges,
    length: path.length - 1,
  }
}

// ─── Degree Centrality ─────────────────────────────────────────────────────────

export const computeDegreeCentrality = (
  nodes: NodeData[],
  edges: EdgeData[]
): Map<string, number> => {
  const counts = new Map<string, number>(nodes.map((n) => [n.id, 0]))
  edges.forEach((e) => {
    counts.set(e.sourceId, (counts.get(e.sourceId) ?? 0) + 1)
    counts.set(e.targetId, (counts.get(e.targetId) ?? 0) + 1)
  })
  return counts
}

// ─── Connected Components ──────────────────────────────────────────────────────

export const findConnectedComponents = (
  nodes: NodeData[],
  edges: EdgeData[]
): string[][] => {
  const adj = buildAdjacency(edges)
  const visited = new Set<string>()
  const components: string[][] = []

  const bfs = (startId: string): string[] => {
    const component: string[] = []
    const queue = [startId]
    visited.add(startId)
    while (queue.length > 0) {
      const curr = queue.shift()!
      component.push(curr)
      for (const neighbor of adj.get(curr) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      }
    }
    return component
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      components.push(bfs(node.id))
    }
  }

  return components
}

// ─── Key Influencers ──────────────────────────────────────────────────────────

export const findKeyInfluencers = (
  nodes: NodeData[],
  edges: EdgeData[],
  limit = 5
): NodeData[] => {
  const centrality = computeDegreeCentrality(nodes, edges)
  return [...nodes]
    .sort((a, b) => (centrality.get(b.id) ?? 0) - (centrality.get(a.id) ?? 0))
    .slice(0, limit)
}

// ─── Relationship Strength Color ───────────────────────────────────────────────

export const strengthToOpacity = (strength: string): number => {
  if (strength === 'strong') return 0.9
  if (strength === 'moderate') return 0.55
  return 0.25
}
