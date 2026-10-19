import { useEffect, useMemo, useRef, useState } from 'react'
import type { Researcher, Project } from '../types/index'

interface GraphNode {
  id: number
  name: string
  initials: string
  x: number
  y: number
  vx: number
  vy: number
  publications: number
  isOwn: boolean
  radius: number
}

interface GraphEdge {
  source: number
  target: number
}

interface Props {
  researchers: Researcher[]
  projects: Project[]
  onNodeClick: (researcherId: number) => void
}

function buildGraph(researchers: Researcher[], projects: Project[]) {
  const nodes: GraphNode[] = researchers.map((r, i) => ({
    id: r.id,
    name: r.name,
    initials: r.initials,
    x: 200 + Math.random() * 400,
    y: 150 + Math.random() * 200,
    vx: 0,
    vy: 0,
    publications: r.publications.length,
    isOwn: i < 5,
    radius: Math.min(28, 10 + r.publications.length * 2),
  }))

  const edgeSet = new Set<string>()
  const edges: GraphEdge[] = []

  for (const project of projects) {
    const members = project.members
    for (let a = 0; a < members.length; a++) {
      for (let b = a + 1; b < members.length; b++) {
        const key = `${Math.min(members[a], members[b])}-${Math.max(members[a], members[b])}`
        if (!edgeSet.has(key)) {
          edgeSet.add(key)
          edges.push({ source: members[a], target: members[b] })
        }
      }
    }
  }

  return { nodes, edges }
}

export default function NetworkGraph({ researchers, projects, onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [hoveredNode, setHoveredNode] = useState<number | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const tickRef = useRef(0)

  // Rebuild the graph whenever the underlying data arrives or changes
  const graph = useMemo(() => buildGraph(researchers, projects), [researchers, projects])
  const edges = graph.edges

  useEffect(() => {
    setNodes(graph.nodes)
  }, [graph])

  useEffect(() => {
    if (nodes.length === 0) return

    const W = svgRef.current?.clientWidth || 800
    const H = svgRef.current?.clientHeight || 520
    const cx = W / 2
    const cy = H / 2

    const simulate = () => {
      if (tickRef.current >= 200) return

      setNodes(prev => {
        const next = prev.map(n => ({ ...n }))
        const repulsionStrength = 3000
        const attractionStrength = 0.02
        const gravityStrength = 0.005

        // Repulsion
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const dx = next[j].x - next[i].x
            const dy = next[j].y - next[i].y
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
            const force = repulsionStrength / (dist * dist)
            const fx = (dx / dist) * force
            const fy = (dy / dist) * force
            next[i].vx -= fx
            next[i].vy -= fy
            next[j].vx += fx
            next[j].vy += fy
          }
        }

        // Attraction along edges
        const nodeById = new Map(next.map(n => [n.id, n]))
        for (const edge of edges) {
          const a = nodeById.get(edge.source)
          const b = nodeById.get(edge.target)
          if (!a || !b) continue
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
          const force = dist * attractionStrength
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          a.vx += fx
          a.vy += fy
          b.vx -= fx
          b.vy -= fy
        }

        // Center gravity
        for (const n of next) {
          n.vx += (cx - n.x) * gravityStrength
          n.vy += (cy - n.y) * gravityStrength
        }

        // Update positions + damping
        for (const n of next) {
          n.vx *= 0.9
          n.vy *= 0.9
          n.x += n.vx
          n.y += n.vy
          // Clamp to bounds
          n.x = Math.max(n.radius + 5, Math.min(W - n.radius - 5, n.x))
          n.y = Math.max(n.radius + 15, Math.min(H - n.radius - 15, n.y))
        }

        return next
      })

      tickRef.current++
      animFrameRef.current = requestAnimationFrame(simulate)
    }

    animFrameRef.current = requestAnimationFrame(simulate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length > 0])

  const connectedIds = hoveredNode !== null
    ? new Set(edges.flatMap(e => e.source === hoveredNode ? [e.target] : e.target === hoveredNode ? [e.source] : []))
    : new Set<number>()

  const nodeById = new Map(nodes.map(n => [n.id, n]))

  return (
    <svg
      ref={svgRef}
      className="w-full h-full graph-canvas"
    >
      <defs>
        <linearGradient id="nodeGradientOwn" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0052FF" />
          <stop offset="100%" stopColor="#4D7CFF" />
        </linearGradient>
      </defs>

      {/* Edges */}
      {edges.map((edge, i) => {
        const a = nodeById.get(edge.source)
        const b = nodeById.get(edge.target)
        if (!a || !b) return null
        const isHighlighted = hoveredNode !== null && (edge.source === hoveredNode || edge.target === hoveredNode)
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={isHighlighted ? '#0052FF' : '#E2E8F0'}
            strokeWidth={isHighlighted ? 2 : 1}
            opacity={hoveredNode !== null && !isHighlighted ? 0.2 : 1}
          />
        )
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const isHovered = hoveredNode === node.id
        const isConnected = connectedIds.has(node.id)
        const isDimmed = hoveredNode !== null && !isHovered && !isConnected
        return (
          <g
            key={node.id}
            transform={`translate(${node.x},${node.y})`}
            className={`graph-node${isDimmed ? ' graph-node--dimmed' : ''}`}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onNodeClick(node.id)}
          >
            {isHovered && (
              <circle
                r={node.radius + 5}
                fill="none"
                stroke="#0052FF"
                strokeWidth={2}
                opacity={0.4}
              />
            )}
            <circle
              r={node.radius}
              fill={node.isOwn ? 'url(#nodeGradientOwn)' : '#E2E8F0'}
              stroke={isHovered ? '#0052FF' : node.isOwn ? '#4D7CFF' : '#94A3B8'}
              strokeWidth={isHovered ? 2 : 1}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={node.radius > 16 ? 10 : 8}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="600"
              fill={node.isOwn ? 'white' : '#64748B'}
              className="graph-label"
            >
              {node.initials}
            </text>
            <text
              y={node.radius + 12}
              textAnchor="middle"
              fontSize={9}
              fontFamily="'JetBrains Mono', monospace"
              fill="#64748B"
              className="graph-label"
            >
              {node.name.split(' ').slice(-1)[0]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
