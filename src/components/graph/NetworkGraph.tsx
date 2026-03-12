import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { NODE_COLORS, NODE_RADIUS, EDGE_COLORS, strengthToOpacity } from '@/utils/node.utils'
import type { GraphNode, GraphLink } from '@/types'

// D3 mutates link objects in-place, replacing source/target strings with node
// objects. We keep internal clones so we never mutate React prop data.
type D3Node = GraphNode & d3.SimulationNodeDatum
type D3Link = {
  source: D3Node | string
  target: D3Node | string
  edge: GraphLink['edge']
}

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
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null)
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
    (link: D3Link) => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as D3Node).id
      const targetId = typeof link.target === 'string' ? link.target : (link.target as D3Node).id
      const baseOpacity = strengthToOpacity(link.edge.strength)
      if (!selectedNodeId && !hoveredNodeId) return baseOpacity
      const focusId = selectedNodeId ?? hoveredNodeId
      if (sourceId === focusId || targetId === focusId) return baseOpacity
      return 0.05
    },
    [selectedNodeId, hoveredNodeId]
  )

  useEffect(() => {
    if (!svgRef.current || width === 0 || height === 0) return

    // Stop any running simulation before rebuilding
    simulationRef.current?.stop()

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Deep-clone data so D3 can mutate freely without affecting React state
    const simNodes: D3Node[] = nodes.map((n) => ({ ...n }))
    const simLinks: D3Link[] = links.map((l) => ({
      source: typeof l.source === 'string' ? l.source : (l.source as GraphNode).id,
      target: typeof l.target === 'string' ? l.target : (l.target as GraphNode).id,
      edge: l.edge,
    }))

    // ── Defs ────────────────────────────────────────────────────────────────
    const defs = svg.append('defs')
    const filter = defs.append('filter').attr('id', 'glow')
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    const usedColors = new Set(simLinks.map((l) => EDGE_COLORS[l.edge.type]))
    usedColors.forEach((color) => {
      defs
        .append('marker')
        .attr('id', `arrow-${color.replace('#', '')}`)
        .attr('viewBox', '0 -4 10 8')
        .attr('refX', 28).attr('refY', 0)
        .attr('markerWidth', 5).attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L10,0L0,4')
        .attr('fill', color).attr('opacity', 0.7)
    })

    // ── Zoom ────────────────────────────────────────────────────────────────
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

    // ── Background grid ──────────────────────────────────────────────────────
    const gridSize = 50
    const gridG = g.append('g').attr('class', 'grid')
    for (let x = -width * 2; x < width * 4; x += gridSize) {
      gridG.append('line')
        .attr('x1', x).attr('y1', -height * 2)
        .attr('x2', x).attr('y2', height * 4)
        .attr('stroke', 'rgba(45,212,191,0.04)').attr('stroke-width', 1)
    }
    for (let y = -height * 2; y < height * 4; y += gridSize) {
      gridG.append('line')
        .attr('x1', -width * 2).attr('y1', y)
        .attr('x2', width * 4).attr('y2', y)
        .attr('stroke', 'rgba(45,212,191,0.04)').attr('stroke-width', 1)
    }

    // ── Links ───────────────────────────────────────────────────────────────
    const linkG = g.append('g').attr('class', 'links')
    const linkElements = linkG
      .selectAll<SVGLineElement, D3Link>('line')
      .data(simLinks, (d) => d.edge.id)
      .join('line')
      .attr('stroke', (d) => EDGE_COLORS[d.edge.type])
      .attr('stroke-opacity', (d) => getLinkOpacity(d))
      .attr('stroke-width', (d) =>
        d.edge.strength === 'strong' ? 2 : d.edge.strength === 'moderate' ? 1.5 : 1
      )
      .attr('stroke-dasharray', (d) => (d.edge.strength === 'weak' ? '4,4' : 'none'))
      .attr('marker-end', (d) => `url(#arrow-${EDGE_COLORS[d.edge.type].replace('#', '')})`)

    // ── Nodes ───────────────────────────────────────────────────────────────
    const nodeG = g.append('g').attr('class', 'nodes')
    const nodeElements = nodeG
      .selectAll<SVGGElement, D3Node>('g.node')
      .data(simNodes, (d) => d.id)
      .join('g')
      .attr('class', 'node')
      .style('cursor', connectMode ? 'crosshair' : 'pointer')

    nodeElements
      .append('circle')
      .attr('r', (d) => NODE_RADIUS[d.type] + 8)
      .attr('fill', 'none')
      .attr('stroke', (d) => NODE_COLORS[d.type])
      .attr('stroke-opacity', (d) => (d.id === selectedNodeId ? 0.4 : 0))
      .attr('stroke-width', 1.5)

    nodeElements
      .append('circle')
      .attr('r', (d) => NODE_RADIUS[d.type])
      .attr('fill', (d) => `${NODE_COLORS[d.type]}18`)
      .attr('stroke', (d) => NODE_COLORS[d.type])
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 2 : 1.5))
      .attr('filter', (d) =>
        d.id === selectedNodeId || d.id === hoveredNodeId ? 'url(#glow)' : 'none'
      )

    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d) => NODE_RADIUS[d.type] - 4)
      .text((d) => {
        const icons: Record<string, string> = {
          person: '👤', company: '🏢', opportunity: '💎', project: '⚡',
        }
        return icons[d.type] ?? '●'
      })
      .style('user-select', 'none')
      .style('pointer-events', 'none')

    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', (d) => NODE_RADIUS[d.type] + 14)
      .attr('font-size', 11)
      .attr('font-family', 'DM Mono, monospace')
      .attr('fill', (d) => (d.id === selectedNodeId ? NODE_COLORS[d.type] : '#94A3B8'))
      .text((d) => (d.label.length > 16 ? d.label.slice(0, 14) + '…' : d.label))
      .style('user-select', 'none')
      .style('pointer-events', 'none')

    // Drag
    const drag = d3
      .drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active) simulationRef.current?.alphaTarget(0.3).restart()
        d.fx = d.x; d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x; d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulationRef.current?.alphaTarget(0)
        d.fx = null; d.fy = null
      })

    nodeElements.call(drag)
    nodeElements
      .on('click', (_, d) => onNodeClick(d.id))
      .on('mouseover', (_, d) => onNodeHover(d.id))
      .on('mouseout', () => onNodeHover(null))

    // ── Simulation ──────────────────────────────────────────────────────────
    const simulation = d3
      .forceSimulation<D3Node, D3Link>(simNodes)
      .force(
        'link',
        d3.forceLink<D3Node, D3Link>(simLinks).id((d) => d.id).distance(130).strength(0.4)
      )
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<D3Node>().radius((d) => NODE_RADIUS[d.type] + 20))

    simulationRef.current = simulation

    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d) => ((d.source as D3Node)?.x) ?? 0)
        .attr('y1', (d) => ((d.source as D3Node)?.y) ?? 0)
        .attr('x2', (d) => ((d.target as D3Node)?.x) ?? 0)
        .attr('y2', (d) => ((d.target as D3Node)?.y) ?? 0)

      nodeElements.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => { simulation.stop() }
  }, [nodes, links, width, height, connectMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update opacity without restarting the simulation
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll<SVGGElement, D3Node>('g.node').attr('opacity', (d) => getNodeOpacity(d.id))
    svg.selectAll<SVGLineElement, D3Link>('line').attr('stroke-opacity', (d) => getLinkOpacity(d))
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
