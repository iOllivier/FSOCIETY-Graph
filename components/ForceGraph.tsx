import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphData, CharacterNode, PlotLink, NodeType } from '../types';

interface ForceGraphProps {
  data: GraphData;
  onNodeClick: (node: CharacterNode) => void;
  selectedNode: CharacterNode | null;
}

// Inline fallback for immediate client-side error handling (Dark Theme)
const CLIENT_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' style='background-color: %230a0a0a'%3E%3Cpath fill='%23333' d='M50 10c-25 0-40 15-40 35 0 25 10 45 40 45s40-20 40-45c0-20-15-35-40-35zm-12 25c4 0 6 3 6 6s-2 6-6 6-6-3-6-6 2-6 6-6zm24 0c4 0 6 3 6 6s-2 6-6 6-6-3-6-6 2-6 6-6zm-12 40c-10 0-15-5-18-10h36c-3 5-8 10-18 10z'/%3E%3C/svg%3E";

export const ForceGraph: React.FC<ForceGraphProps> = ({ data, onNodeClick, selectedNode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Helper to sanitize ID for CSS/SVG selectors
  const getSafeId = (id: string) => `node-${id.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getNodeColor = (group: NodeType) => {
    switch (group) {
      case NodeType.Protagonist: return '#ffffff'; // White
      case NodeType.Hacker: return '#10b981'; // Green
      case NodeType.Antagonist: return '#ef4444'; // Red
      case NodeType.Corporate: return '#3b82f6'; // Blue
      default: return '#9ca3af'; // Gray
    }
  };

  // D3 Initialization
  useEffect(() => {
    if (!dimensions.width || !dimensions.height || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Zoom setup
    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom);

    // Forces
    const simulation = d3.forceSimulation<CharacterNode>(data.nodes)
      .force("link", d3.forceLink<CharacterNode, PlotLink>(data.links)
        .id(d => d.id)
        .distance(180) 
      )
      .force("charge", d3.forceManyBody().strength(-1500))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collide", d3.forceCollide().radius(80)); 

    // Define ClipPaths in a <defs> block
    const defs = svg.append("defs");
    data.nodes.forEach(d => {
        defs.append("clipPath")
            .attr("id", `clip-${getSafeId(d.id)}`)
            .append("circle")
            .attr("r", 32);
    });

    // Render Links
    const link = g.append("g")
      .attr("stroke", "#333")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.strength) * 1.5)
      .attr("class", "transition-all duration-300");

    // Render Nodes (Groups)
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("class", "cursor-pointer")
      .style("opacity", d => selectedNode ? (selectedNode.id === d.id || isConnected(d, selectedNode) ? 1 : 0.2) : 1)
      .call(d3.drag<SVGGElement, CharacterNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      });

    // Helper to check connections
    function isConnected(a: CharacterNode, b: CharacterNode) {
        return data.links.some(l => 
            (l.source === a && l.target === b) || 
            (l.source === b && l.target === a)
        );
    }

    // Node Outer Ring (Group Color)
    node.append("circle")
      .attr("r", 38)
      .attr("fill", d => getNodeColor(d.group))
      .attr("stroke", d => selectedNode?.id === d.id ? "#d92525" : "none") 
      .attr("stroke-width", 3)
      .attr("opacity", 0.9);

    // Dark background circle behind image
    node.append("circle")
        .attr("r", 32)
        .attr("fill", "#0a0a0a");

    // Node Image
    node.append("image")
      .attr("href", d => d.imageUrl || CLIENT_FALLBACK)
      .attr("x", -32)
      .attr("y", -32)
      .attr("width", 64)
      .attr("height", 64)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("clip-path", d => `url(#clip-${getSafeId(d.id)})`)
      .on("error", function() {
          d3.select(this).attr("href", CLIENT_FALLBACK);
      });

    // Inner Border
    node.append("circle")
      .attr("r", 32)
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 1);

    // Node Labels Background
    node.append("rect")
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("x", -50)
      .attr("y", 45)
      .attr("width", 100)
      .attr("height", 20)
      .attr("fill", "rgba(0,0,0,0.8)");

    // Node Labels
    node.append("text")
      .text(d => d.name)
      .attr("x", 0)
      .attr("y", 59)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "11px")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .style("pointer-events", "none");

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as CharacterNode).x!)
        .attr("y1", d => (d.source as CharacterNode).y!)
        .attr("x2", d => (d.target as CharacterNode).x!)
        .attr("y2", d => (d.target as CharacterNode).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag Functions
    function dragstarted(event: any, d: CharacterNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: CharacterNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: CharacterNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, onNodeClick, selectedNode]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-fsociety-bg overflow-hidden">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ 
                 backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', 
                 backgroundSize: '24px 24px' 
             }}>
        </div>
        
        <svg ref={svgRef} className="w-full h-full block" />
        
        <div className="absolute bottom-4 left-4 text-xs text-fsociety-text/50 font-mono">
            Data visualization powered by Gemini
        </div>
    </div>
  );
};