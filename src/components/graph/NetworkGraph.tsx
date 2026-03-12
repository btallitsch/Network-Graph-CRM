import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { NODE_COLORS, NODE_RADIUS, EDGE_COLORS, strengthToOpacity } from '@/utils/node.utils'
import type { GraphNode, GraphLink } from '@/types'

interface NetworkGraphProps {
  nodes: GraphNode[]
  links: GraphLink[]
  selectedNodeId: string | null
  hoveredNodeId: string | null
  connectedNodeIds: Set<string>
  connectMode: boolean
  onNodeClick: (nodeId: string) => void
  onNodeHover: (nodeId: string | null) => void
  width: number
  height: number
}

export const NetworkGraph = ({
  nodes,
  links,
  selectedNodeId,
  hoveredNodeId,
  connectedNodeIds,
  connectMode,
  onNodeClick,
  onNodeHover,
  width,
  height,
}: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null)
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity)

  const getNodeOpacity = useCallback(
    (nodeId: string) => {
      if (!selectedNodeId && !hoveredNodeId) return 1
      const focusId = selectedNodeId ?? hoveredNodeId
      if (nodeId === focusId) return 1
      if (connectedNodeIds.has(nodeId)) return 0.85
      return 0.2
    },
    [selectedNodeId, hoveredNodeId, connectedNodeIds]
  )

  const getLinkOpacity = useCallback(
    (link: GraphLink) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id
      const baseOpacity = strengthToOpacity(link.edge.strength)
      if (!selectedNodeId && !hoveredNodeId) return baseOpacity
      const focusId = selectedNodeId ?? hoveredNodeId
      if (sourceId === focusId || targetId === focusId) return baseOpacity
      return 0.05
    },
    [selectedNodeId, hoveredNodeId]
  )

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // ─── Defs ────────────────────────────────────────────────────────────────
    const defs = svg.append('defs')

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow')
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Arrow markers
    const edgeColors = new Set(links.map((l) => EDGE_COLORS[l.edge.type]))
    edgeColors.forEach((color) => {
      defs
        .append('marker')
        .attr('id', `arrow-${color.replace('#', '')}`)
        .attr('viewBox', '0 -4 10 8')
        .attr('refX', 28)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L10,0L0,4')
        .attr('fill', color)
        .attr('opacity', 0.7)
    })

    // ─── Zoom ────────────────────────────────────────────────────────────────
    const g = svg.append('g')

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        transformRef.current = event.transform
        g.attr('transform', event.transform)
      })

    svg.call(zoom)
    svg.call(zoom.transform, transformRef.current)

    // ─── Grid ────────────────────────────────────────────────────────────────
    const gridSize = 50
    const gridG = g.append('g').attr('class', 'grid')
    for (let x = -width; x < width * 2; x += gridSize) {
      gridG
        .append('line')
        .attr('x1', x)
        .attr('y1', -height)
        .attr('x2', x)
        .attr('y2', height * 2)
        .attr('stroke', 'rgba(45, 212, 191, 0.04)')
        .attr('stroke-width', 1)
    }
    for (let y = -height; y < height * 2; y += gridSize) {
      gridG
        .append('line')
        .attr('x1', -width)
        .attr('y1', y)
        .attr('x2', width * 2)
        .attr('y2', y)
        .attr('stroke', 'rgba(45, 212, 191, 0.04)')
        .attr('stroke-width', 1)
    }

    // ─── Links ───────────────────────────────────────────────────────────────
    const linkG = g.append('g').attr('class', 'links')
    const linkElements = linkG
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links, (d) => d.edge.id)
      .join('line')
      .attr('stroke', (d) => EDGE_COLORS[d.edge.type])
      .attr('stroke-opacity', (d) => getLinkOpacity(d))
      .attr('stroke-width', (d) => (d.edge.strength === 'strong' ? 2 : d.edge.strength === 'moderate' ? 1.5 : 1))
      .attr('stroke-dasharray', (d) => (d.edge.strength === 'weak' ? '4,4' : 'none'))
      .attr('marker-end', (d) => `url(#arrow-${EDGE_COLORS[d.edge.type].replace('#', '')})`)

    // ─── Nodes ───────────────────────────────────────────────────────────────
    const nodeG = g.append('g').attr('class', 'nodes')
    const nodeElements = nodeG
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes, (d) => d.id)
      .join('g')
      .attr('class', 'node')
      .style('cursor', connectMode ? 'crosshair' : 'pointer')

    // Outer glow ring
    nodeElements
      .append('circle')
      .attr('r', (d) => NODE_RADIUS[d.type] + 8)
      .attr('fill', 'none')
      .attr('stroke', (d) => NODE_COLORS[d.type])
      .attr('stroke-opacity', (d) => (d.id === selectedNodeId ? 0.4 : 0))
      .attr('stroke-width', 1.5)
      .attr('class', 'ring')
      .style('animation', (d) => (d.id === selectedNodeId ? 'pulseRing 2s ease-in-out infinite' : 'none'))

    // Main circle
    nodeElements
      .append('circle')
      .attr('r', (d) => NODE_RADIUS[d.type])
      .attr('fill', (d) => `${NODE_COLORS[d.type]}18`)
      .attr('stroke', (d) => NODE_COLORS[d.type])
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 2 : 1.5))
      .attr('filter', (d) => (d.id === selectedNodeId || d.id === hoveredNodeId ? 'url(#glow)' : 'none'))

    // Icon text
    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d) => NODE_RADIUS[d.type] - 4)
      .text((d) => {
        const icons: Record<string, string> = { person: '👤', company: '🏢', opportunity: '💎', project: '⚡' }
        return icons[d.type] ?? '●'
      })
      .style('user-select', 'none')
      .style('pointer-events', 'none')

    // Label
    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', (d) => NODE_RADIUS[d.type] + 14)
      .attr('font-size', 11)
      .attr('font-family', 'DM Mono, monospace')
      .attr('fill', (d) => (d.id === selectedNodeId ? NODE_COLORS[d.type] : '#94A3B8'))
      .attr('class', 'node-label')
      .text((d) => (d.label.length > 16 ? d.label.slice(0, 14) + '…' : d.label))
      .style('user-select', 'none')
      .style('pointer-events', 'none')

    // Drag
    const drag = d3
      .drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulationRef.current?.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulationRef.current?.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    nodeElements.call(drag)

    // Events
    nodeElements
      .on('click', (_, d) => onNodeClick(d.id))
      .on('mouseover', (_, d) => onNodeHover(d.id))
      .on('mouseout', () => onNodeHover(null))

    // ─── Simulation ──────────────────────────────────────────────────────────
    const simulation = d3
      .forceSimulation<GraphNode, GraphLink>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(120)
          .strength(0.4)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius((d) => NODE_RADIUS[d.type] + 20))

    simulationRef.current = simulation

    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0)

      nodeElements.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      simulation.stop()
    }
  }, [nodes, links, width, height]) // Re-init on data change

  // Update opacity without re-running simulation
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg
      .selectAll<SVGGElement, GraphNode>('.node')
      .attr('opacity', (d) => getNodeOpacity(d.id))
    svg
      .selectAll<SVGLineElement, GraphLink>('line')
      .attr('stroke-opacity', (d) => getLinkOpacity(d))
  }, [selectedNodeId, hoveredNodeId, getNodeOpacity, getLinkOpacity])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="block"
      style={{ cursor: connectMode ? 'crosshair' : 'default' }}
    />
  )
}
