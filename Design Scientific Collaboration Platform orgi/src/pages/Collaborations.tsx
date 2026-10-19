import { useState } from 'react'
import { Users, Building2, Network, ChevronRight, ArrowRight } from 'lucide-react'

const collaborationNodes = [
  { id: 'MIT', x: 400, y: 200, r: 36, color: '#2563EB', members: 142, papers: 487 },
  { id: 'Stanford', x: 620, y: 120, r: 30, color: '#7C3AED', members: 118, papers: 392 },
  { id: 'Oxford', x: 620, y: 300, r: 28, color: '#14B8A6', members: 97, papers: 341 },
  { id: 'ETH', x: 210, y: 110, r: 24, color: '#F59E0B', members: 83, papers: 278 },
  { id: 'Caltech', x: 200, y: 310, r: 22, color: '#EC4899', members: 71, papers: 234 },
  { id: 'Harvard', x: 490, y: 340, r: 20, color: '#10B981', members: 65, papers: 198 },
  { id: 'Yale', x: 340, y: 80, r: 18, color: '#6366F1', members: 54, papers: 167 },
  { id: 'CERN', x: 720, y: 220, r: 22, color: '#F97316', members: 89, papers: 312 },
]

const links = [
  { from: 'MIT', to: 'Stanford', strength: 89 },
  { from: 'MIT', to: 'Oxford', strength: 76 },
  { from: 'MIT', to: 'ETH', strength: 64 },
  { from: 'MIT', to: 'Caltech', strength: 71 },
  { from: 'MIT', to: 'Harvard', strength: 82 },
  { from: 'MIT', to: 'Yale', strength: 58 },
  { from: 'Stanford', to: 'Oxford', strength: 52 },
  { from: 'Stanford', to: 'CERN', strength: 45 },
  { from: 'Oxford', to: 'CERN', strength: 67 },
  { from: 'Oxford', to: 'ETH', strength: 41 },
  { from: 'Harvard', to: 'Yale', strength: 73 },
  { from: 'Caltech', to: 'ETH', strength: 38 },
]

const teams = [
  {
    name: 'Quantum Biology Task Force',
    members: ['Dr. Chen', 'Prof. Park', 'Dr. Williams', 'Prof. Liu'],
    institutions: ['MIT', 'Stanford', 'Caltech'],
    papers: 12, active: true, color: '#2563EB'
  },
  {
    name: 'Arctic Climate Consortium',
    members: ['Prof. Müller', 'Dr. Okafor', 'Dr. Santos', 'Prof. Jensen', 'Dr. Ivanova'],
    institutions: ['ETH', 'Cambridge', 'Oxford'],
    papers: 8, active: true, color: '#14B8A6'
  },
  {
    name: 'Neuromorphic AI Alliance',
    members: ['Dr. Tanaka', 'Prof. Cohen', 'Dr. Patel'],
    institutions: ['Caltech', 'MIT', 'Stanford'],
    papers: 15, active: false, color: '#7C3AED'
  },
]

const timeline = [
  { year: '2021', event: 'MIT–Stanford Quantum Research MOU signed', type: 'partnership' },
  { year: '2022', event: 'Arctic Climate Consortium founded with 12 institutions', type: 'formation' },
  { year: '2022', event: 'CERN–Oxford particle physics data-sharing agreement', type: 'agreement' },
  { year: '2023', event: 'Neuromorphic AI Alliance launched — 3 institutions', type: 'formation' },
  { year: '2023', event: 'Harvard–Yale joint MD/PhD program collaboration', type: 'partnership' },
  { year: '2024', event: 'Global Research Network Summit — 48 institutions', type: 'event' },
]

const typeColors: Record<string, string> = {
  partnership: '#2563EB',
  formation: '#14B8A6',
  agreement: '#7C3AED',
  event: '#F59E0B',
}

export default function Collaborations() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const getNode = (id: string) => collaborationNodes.find(n => n.id === id)!

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      {/* Network graph */}
      <div className="bg-slate-950 rounded-3xl overflow-hidden mb-6 relative" style={{ height: 440 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950" />
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <pattern id="cgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cgrid)" />
        </svg>

        <div className="absolute top-4 left-4 z-10">
          <h3 className="text-white font-bold text-sm mb-1">Collaboration Network</h3>
          <p className="text-blue-300 text-xs">{collaborationNodes.length} institutions · {links.length} active links</p>
        </div>

        <svg viewBox="0 0 800 420" className="w-full h-full relative z-10" preserveAspectRatio="xMidYMid meet">
          {/* Links */}
          {links.map(link => {
            const from = getNode(link.from)
            const to = getNode(link.to)
            const isHovered = hoveredNode === link.from || hoveredNode === link.to
            return (
              <line
                key={`${link.from}-${link.to}`}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={isHovered ? from.color : '#475569'}
                strokeWidth={isHovered ? 2 : 1}
                strokeOpacity={isHovered ? 0.7 : 0.3}
                className="transition-all duration-300"
              />
            )
          })}

          {/* Nodes */}
          {collaborationNodes.map(node => {
            const isHovered = hoveredNode === node.id
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={node.x} cy={node.y}
                  r={node.r * (isHovered ? 1.2 : 1)}
                  fill={node.color}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all duration-200"
                />
                <circle
                  cx={node.x} cy={node.y}
                  r={node.r * 1.6}
                  fill={node.color}
                  opacity={isHovered ? 0.15 : 0.07}
                  className="transition-all duration-200"
                />
                <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={node.r > 25 ? 11 : 10} fontFamily="Inter" fontWeight="600">
                  {node.id}
                </text>
                {isHovered && (
                  <foreignObject x={node.x + node.r + 4} y={node.y - 30} width={120} height={64}>
                    <div className="bg-card rounded-xl px-3 py-2 shadow-xl border border-border" style={{ fontSize: '11px' }}>
                      <p className="font-bold text-foreground">{node.id}</p>
                      <p className="text-muted-foreground">{node.members} researchers</p>
                      <p className="text-muted-foreground">{node.papers} papers</p>
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-slate-500" />
            <span className="text-xs text-slate-400">Collaboration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-400">Institution</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teams */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Research Teams</h3>
          </div>
          <div className="divide-y divide-border">
            {teams.map(team => (
              <div key={team.name} className="px-6 py-4 hover:bg-secondary/60 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: team.color }} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{team.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{team.institutions.join(' · ')}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${team.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary text-muted-foreground'}`}>
                    {team.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {team.members.slice(0, 3).map((m, i) => (
                      <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-card" style={{ backgroundColor: team.color, marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i }}>
                        {m.split(' ')[1]?.[0] || m[0]}
                      </div>
                    ))}
                    {team.members.length > 3 && (
                      <span className="text-xs text-muted-foreground ml-1">+{team.members.length - 3}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground/70">{team.papers} joint papers</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Partnership Timeline</h3>
          </div>
          <div className="p-6">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-5">
                {timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-card shadow-sm z-10" style={{ backgroundColor: typeColors[item.type] }} />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-xs font-bold text-muted-foreground/70 mb-1">{item.year}</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{item.event}</p>
                      <span className="text-xs capitalize font-medium mt-1 inline-block" style={{ color: typeColors[item.type] }}>{item.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
