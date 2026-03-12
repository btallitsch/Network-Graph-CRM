import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { NODE_COLORS, NODE_RADIUS, EDGE_COLORS, strengthToOpacity } from '@/utils/node.utils'
import type { GraphNode, GraphLink } from '@/types'

type D3Node = GraphNode & d3.SimulationNodeDatum
type D3Link = { source: D3Node | string; target: D3Node | string; edge: GraphLink['edge'] }

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

  // Store live D3 selections so the opacity effect never re-queries the DOM
  const nodeSelRef = useRef<d3.Selection<SVGGElement, D3Node, SVGGElement, unknown> | null>(null)
  const linkSelRef = useRef<d3.Selection<SVGLineElement, D3Link, SVGGElement, unknown> | null>(null)
  // Keep latest opacity callbacks accessible from inside D3 closures
  const selectedNodeIdRef = useRef(selectedNodeId)
  const hoveredNodeIdRef = useRef(hoveredNodeId)
  const connectedNodeIdsRef = useRef(connectedNodeIds)

  // Sync refs every render so stale closure values are never used
  selectedNodeIdRef.current = selectedNodeId
  hoveredNodeIdRef.current = hoveredNodeId
  connectedNodeIdsRef.current = connectedNodeIds

  const getNodeOpacity = useCallback((nodeId: string) => {
    const sel = selectedNodeIdRef.current
    const hov = hoveredNodeIdRef.current
    if (!sel && !hov) return 1
    const focus = sel ?? hov
    if (nodeId === focus) return 1
    if (connectedNodeIdsRef.current.has(nodeId)) return 0.85
    return 0.2
  }, [])

  // Link opacity uses pre-resolved node-object IDs, with a fallback for strings
  const getLinkOpacity = useCallback((d: D3Link) => {
    const sel = selectedNodeIdRef.current
    const hov = hoveredNodeIdRef.current
    const base = strengthToOpacity(d.edge.strength)
    if (!sel && !hov) return base
    const focus = sel ?? hov
    const srcId = typeof d.source === 'string' ? d.source : (d.source as D3Node)?.id ?? ''
    const tgtId = typeof d.target === 'string' ? d.target : (d.target as D3Node)?.id ?? ''
    return srcId === focus || tgtId === focus ? base : 0.05
  }, [])

  // ── Main graph build effect ──────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current || width === 0 || height === 0) return

    simulationRef.current?.stop()
    nodeSelRef.current = null
    linkSelRef.current = null

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Clone data — D3 forceLink mutates source/target in place
    const simNodes: D3Node[] = nodes.map((n) => ({ ...n }))
    const simLinks: D3Link[] = links.map((l) => ({
      source: typeof l.source === 'string' ? l.source : (l.source as GraphNode).id,
      target: typeof l.target === 'string' ? l.target : (l.target as GraphNode).id,
      edge: l.edge,
    }))

    // Defs
    const defs = svg.append('defs')
    const filter = defs.append('filter').attr('id', 'glow')
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
    const fm = filter.append('feMerge')
    fm.append('feMergeNode').attr('in', 'coloredBlur')
    fm.append('feMergeNode').attr('in', 'SourceGraphic')

    new Set(simLinks.map((l) => EDGE_COLORS[l.edge.type])).forEach((color) => {
      defs.append('marker')
        .attr('id', `arrow-${color.replace('#', '')}`)
        .attr('viewBox', '0 -4 10 8').attr('refX', 28).attr('refY', 0)
        .attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-4L10,0L0,4').attr('fill', color).attr('opacity', 0.7)
    })

    // Zoom
    const g = svg.append('g')
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (e) => { transformRef.current = e.transform; g.attr('transform', e.transform) })
    )
    svg.call(d3.zoom<SVGSVGElement, unknown>().transform, transformRef.current)

    // Grid
    const grid = g.append('g')
    for (let x = -width * 2; x < width * 4; x += 50)
      grid.append('line').attr('x1', x).attr('y1', -height * 2).attr('x2', x).attr('y2', height * 4)
        .attr('stroke', 'rgba(45,212,191,0.04)').attr('stroke-width', 1)
    for (let y = -height * 2; y < height * 4; y += 50)
      grid.append('line').attr('x1', -width * 2).attr('y1', y).attr('x2', width * 4).attr('y2', y)
        .attr('stroke', 'rgba(45,212,191,0.04)').attr('stroke-width', 1)

    // Links — store selection in ref
    const linkG = g.append<SVGGElement>('g').attr('class', 'links')
    const linkSel = linkG
      .selectAll<SVGLineElement, D3Link>('line')
      .data(simLinks, (d) => d.edge.id)
      .join('line')
      .attr('stroke', (d) => EDGE_COLORS[d.edge.type])
      .attr('stroke-opacity', (d) => getLinkOpacity(d))
      .attr('stroke-width', (d) => d.edge.strength === 'strong' ? 2 : d.edge.strength === 'moderate' ? 1.5 : 1)
      .attr('stroke-dasharray', (d) => d.edge.strength === 'weak' ? '4,4' : 'none')
      .attr('marker-end', (d) => `url(#arrow-${EDGE_COLORS[d.edge.type].replace('#', '')})`)
    linkSelRef.current = linkSel

    // Nodes — store selection in ref
    const nodeG = g.append<SVGGElement>('g').attr('class', 'nodes')
    const nodeSel = nodeG
      .selectAll<SVGGElement, D3Node>('g.node')
      .data(simNodes, (d) => d.id)
      .join('g').attr('class', 'node')
      .style('cursor', connectMode ? 'crosshair' : 'pointer')

    nodeSel.append('circle')
      .attr('r', (d) => NODE_RADIUS[d.type] + 8).attr('fill', 'none')
      .attr('stroke', (d) => NODE_COLORS[d.type])
      .attr('stroke-opacity', (d) => d.id === selectedNodeIdRef.current ? 0.4 : 0)
      .attr('stroke-width', 1.5)

    nodeSel.append('circle')
      .attr('r', (d) => NODE_RADIUS[d.type])
      .attr('fill', (d) => `${NODE_COLORS[d.type]}18`)
      .attr('stroke', (d) => NODE_COLORS[d.type])
      .attr('stroke-width', (d) => d.id === selectedNodeIdRef.current ? 2 : 1.5)

    nodeSel.append('text')
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('font-size', (d) => NODE_RADIUS[d.type] - 4)
      .text((d) => ({ person: '👤', company: '🏢', opportunity: '💎', project: '⚡' }[d.type] ?? '●'))
      .style('user-select', 'none').style('pointer-events', 'none')

    nodeSel.append('text')
      .attr('text-anchor', 'middle').attr('y', (d) => NODE_RADIUS[d.type] + 14)
      .attr('font-size', 11).attr('font-family', 'DM Mono, monospace')
      .attr('fill', '#94A3B8')
      .text((d) => d.label.length > 16 ? d.label.slice(0, 14) + '…' : d.label)
      .style('user-select', 'none').style('pointer-events', 'none')

    nodeSelRef.current = nodeSel

    // Drag
    nodeSel.call(
      d3.drag<SVGGElement, D3Node>()
        .on('start', (e, d) => { if (!e.active) simulationRef.current?.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end', (e, d) => { if (!e.active) simulationRef.current?.alphaTarget(0); d.fx = null; d.fy = null })
    )
    nodeSel
      .on('click', (_, d) => onNodeClick(d.id))
      .on('mouseover', (_, d) => onNodeHover(d.id))
      .on('mouseout', () => onNodeHover(null))

    // Simulation
    const sim = d3.forceSimulation<D3Node, D3Link>(simNodes)
      .force('link', d3.forceLink<D3Node, D3Link>(simLinks).id((d) => d.id).distance(130).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<D3Node>().radius((d) => NODE_RADIUS[d.type] + 20))

    simulationRef.current = sim

    sim.on('tick', () => {
      // Use the stored selection — never re-query the DOM
      const ls = linkSelRef.current
      const ns = nodeSelRef.current
      if (!ls || !ns) return

      ls.attr('x1', (d) => (d.source as D3Node)?.x ?? 0)
        .attr('y1', (d) => (d.source as D3Node)?.y ?? 0)
        .attr('x2', (d) => (d.target as D3Node)?.x ?? 0)
        .attr('y2', (d) => (d.target as D3Node)?.y ?? 0)

      ns.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      sim.stop()
      nodeSelRef.current = null
      linkSelRef.current = null
    }
  }, [nodes, links, width, height, connectMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Opacity-only update — uses refs, never touches the DOM directly ──────────
  useEffect(() => {
    nodeSelRef.current?.attr('opacity', (d) => getNodeOpacity(d.id))
    linkSelRef.current?.attr('stroke-opacity', (d) => getLinkOpacity(d))
  }, [selectedNodeId, hoveredNodeId, connectedNodeIds, getNodeOpacity, getLinkOpacity])

  return (
    <svg ref={svgRef} width={width} height={height} className="block"
      style={{ cursor: connectMode ? 'crosshair' : 'default' }} />
  )
}
