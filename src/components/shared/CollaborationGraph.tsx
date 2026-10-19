import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { CoAuthorshipNode, CoAuthorshipLink } from '../../types';
import { Filter, User } from 'lucide-react';

interface CollaborationGraphProps {
  nodes: CoAuthorshipNode[];
  links: CoAuthorshipLink[];
  onSelectNode?: (node: CoAuthorshipNode) => void;
  height?: number;
}

const INST_COLORS: Record<number, string> = {
  1: '#2563eb', // MIT (Blue)
  2: '#7c3aed', // Stanford (Purple)
  3: '#14b8a6', // ETH (Teal)
  4: '#f59e0b', // Oxford (Amber)
  5: '#ec4899', // Max Planck (Pink)
  6: '#06b6d4', // CERN (Cyan)
};

export const CollaborationGraph: React.FC<CollaborationGraphProps> = ({
  nodes,
  links,
  onSelectNode,
  height = 550,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedInstGroup, setSelectedInstGroup] = useState<number | 'all'>('all');
  const [hoveredNode, setHoveredNode] = useState<CoAuthorshipNode | null>(null);

  // Filtered dataset
  const filteredGraph = useMemo(() => {
    if (selectedInstGroup === 'all') {
      return { nodes, links };
    }
    const filteredNodes = nodes.filter((n) => n.group === selectedInstGroup);
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = links.filter((l) => nodeIds.has(String(l.source)) && nodeIds.has(String(l.target)));
    return { nodes: filteredNodes, links: filteredLinks };
  }, [nodes, links, selectedInstGroup]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Cloned data objects to avoid mutating state directly
    const nodesData = filteredGraph.nodes.map((d) => ({ ...d }));
    const linksData = filteredGraph.links.map((d) => ({ ...d }));

    // Container Group for Zoom/Pan
    const g = svg.append('g').attr('class', 'graph-container');

    // Zoom Behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior as any);

    // Force Simulation Setup
    const simulation = d3
      .forceSimulation<any>(nodesData)
      .force(
        'link',
        d3
          .forceLink<any, any>(linksData)
          .id((d) => d.id)
          .distance(90)
      )
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(28));

    // Render Links (Edges)
    const link = g
      .append('g')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.4)
      .selectAll('line')
      .data(linksData)
      .join('line')
      .attr('stroke-width', (d) => Math.min(d.weight * 1.5, 6));

    // Drag behavior for nodes
    function drag(sim: d3.Simulation<any, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) sim.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag<any, any>().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    }

    // Render Nodes Group
    const nodeGroup = g
      .append('g')
      .selectAll('g')
      .data(nodesData)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(drag(simulation) as any)
      .on('click', (_, d) => {
        if (onSelectNode) onSelectNode(d);
      })
      .on('mouseenter', (_, d) => setHoveredNode(d))
      .on('mouseleave', () => setHoveredNode(null));

    // Node Circles
    nodeGroup
      .append('circle')
      .attr('r', (d) => Math.max(12, Math.min(d.hIndex * 0.45, 24)))
      .attr('fill', (d) => INST_COLORS[d.group] || '#3b82f6')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('class', 'transition-all hover:scale-110');

    // Node Labels
    nodeGroup
      .append('text')
      .text((d) => d.name.replace('Dr. ', '').replace('Prof. ', ''))
      .attr('x', 0)
      .attr('y', (d) => Math.max(12, Math.min(d.hIndex * 0.45, 24)) + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', 'currentColor')
      .attr('class', 'text-[11px] font-semibold tracking-tight text-foreground select-none pointer-events-none');

    // Simulation Ticks
    // After forceLink, `source`/`target` are resolved to node objects and the
    // simulation mutates x/y onto each node, so these fields exist at tick time.
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredGraph, height, onSelectNode]);

  return (
    <div ref={containerRef} className="relative w-full bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card/90 backdrop-blur-md p-2 rounded-xl border border-border shadow-md">
        <Filter className="w-4 h-4 text-muted-foreground ml-1" />
        <select
          value={selectedInstGroup}
          onChange={(e) => setSelectedInstGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="text-xs border border-border bg-background rounded-lg px-2 py-1 font-medium focus:outline-none"
        >
          <option value="all">All Institutions (Network)</option>
          <option value="1">MIT</option>
          <option value="2">Stanford University</option>
          <option value="3">ETH Zürich</option>
          <option value="4">University of Oxford</option>
          <option value="5">Max Planck Institute</option>
          <option value="6">CERN</option>
        </select>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-card/95 backdrop-blur-md px-3 py-2 rounded-xl border border-border text-[11px] font-medium shadow-xs">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" /> MIT</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" /> Stanford</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" /> ETH</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Oxford</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" /> Max Planck</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /> CERN</span>
      </div>

      {/* Hover Info Drawer */}
      {hoveredNode && (
        <div className="absolute top-4 right-4 z-10 bg-card/95 backdrop-blur-md border border-border p-3.5 rounded-xl shadow-lg w-64 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-foreground leading-tight">{hoveredNode.name}</p>
              <p className="text-[10px] text-muted-foreground">{hoveredNode.institution}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-border text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Pubs</p>
              <p className="font-bold text-foreground">{hoveredNode.publicationsCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Citations</p>
              <p className="font-bold text-foreground">{hoveredNode.citationsCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">h-Index</p>
              <p className="font-bold text-foreground">{hoveredNode.hIndex}</p>
            </div>
          </div>
        </div>
      )}

      <svg ref={svgRef} className="w-full" style={{ height }} />
    </div>
  );
};
