import React, { useState, useEffect } from 'react';
import { CharacterNode, PlotLink } from '../types';
import { X, Shield, Users, Terminal, User } from 'lucide-react';

interface DetailPanelProps {
  node: CharacterNode | null;
  links: PlotLink[];
  onClose: () => void;
}

// Dark Theme Fallback
const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' style='background-color: %230a0a0a'%3E%3Cpath fill='%23333' d='M50 10c-25 0-40 15-40 35 0 25 10 45 40 45s40-20 40-45c0-20-15-35-40-35zm-12 25c4 0 6 3 6 6s-2 6-6 6-6-3-6-6 2-6 6-6zm24 0c4 0 6 3 6 6s-2 6-6 6-6-3-6-6 2-6 6-6zm-12 40c-10 0-15-5-18-10h36c-3 5-8 10-18 10z'/%3E%3C/svg%3E";

export const DetailPanel: React.FC<DetailPanelProps> = ({ node, links, onClose }) => {
  const [imgSrc, setImgSrc] = useState<string>('');

  // Update image source when node changes
  useEffect(() => {
    if (node) {
      setImgSrc(node.imageUrl || FALLBACK_IMG);
    }
  }, [node]);

  if (!node) return null;

  // Filter links connected to this node
  const relatedLinks = links.filter(l => {
    const sourceId = typeof l.source === 'object' ? (l.source as CharacterNode).id : l.source;
    const targetId = typeof l.target === 'object' ? (l.target as CharacterNode).id : l.target;
    return sourceId === node.id || targetId === node.id;
  });

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-fsociety-panel/95 border-l border-fsociety-text/20 backdrop-blur-sm shadow-2xl transform transition-transform duration-300 ease-in-out overflow-hidden z-20 flex flex-col">
      {/* Header */}
      <div className="relative h-64 w-full overflow-hidden bg-black shrink-0">
        {/* Image Backdrop */}
        <div className="absolute inset-0">
             <img 
               src={imgSrc} 
               alt={node.name} 
               onError={() => setImgSrc(FALLBACK_IMG)}
               className="w-full h-full object-cover opacity-80" 
             />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-fsociety-panel"></div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white bg-black/50 p-1 rounded hover:bg-red-900/50 transition-colors">
          <X size={24} />
        </button>

        <div className="absolute bottom-4 left-6 z-10">
            <h2 className="text-3xl font-bold text-white font-mono tracking-tighter drop-shadow-md">{node.name}</h2>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest bg-fsociety-red/80 text-white border border-fsociety-red/30 shadow-lg">
                {node.group}
            </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 font-sans">
        
        {/* Bio */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-fsociety-red font-mono text-sm uppercase">
            <User size={16} />
            <span>Profile</span>
          </div>
          <p className="text-gray-300 leading-relaxed text-sm border-l-2 border-fsociety-text/20 pl-4 italic">
            "{node.description}"
          </p>
          <div className="bg-black/50 p-3 rounded border border-gray-800 flex items-center space-x-3">
            <Terminal size={16} className="text-green-500" />
            <span className="text-xs font-mono text-gray-400">{node.role}</span>
          </div>
        </div>

        {/* Connections */}
        <div className="space-y-4">
            <div className="flex items-center space-x-2 text-fsociety-red font-mono text-sm uppercase">
                <Users size={16} />
                <span>Network Connections</span>
            </div>
            
            <div className="space-y-3">
                {relatedLinks.length === 0 ? (
                    <p className="text-gray-500 italic text-sm">No known connections encrypted.</p>
                ) : (
                    relatedLinks.map((link, idx) => {
                        const isSource = (typeof link.source === 'object' ? (link.source as CharacterNode).id : link.source) === node.id;
                        const otherNode = isSource ? link.target as CharacterNode : link.source as CharacterNode;
                        
                        return (
                            <div key={idx} className="group relative pl-4 border-l-2 border-gray-700 hover:border-fsociety-red transition-colors">
                                <div className="text-[10px] text-gray-500 font-mono mb-1 flex items-center gap-2">
                                    {isSource ? 'TRIGGERS ->' : '<- TRIGGERED BY'}
                                </div>
                                <h4 className="text-white font-semibold text-sm mb-1">{otherNode.name}</h4>
                                <p className="text-xs text-gray-400 leading-snug">
                                    {link.plotPoint}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      </div>
      
      {/* Footer Decoration */}
      <div className="p-4 border-t border-gray-900 bg-black text-center shrink-0">
         <div className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em]">
            Confidential // Level 5 Clearance
         </div>
      </div>
    </div>
  );
};
