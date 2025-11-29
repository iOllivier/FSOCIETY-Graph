import React, { useEffect, useState } from 'react';
import { fetchMrRobotData } from './services/geminiService';
import { GraphData, CharacterNode } from './types';
import { ForceGraph } from './components/ForceGraph';
import { DetailPanel } from './components/DetailPanel';
import { TerminalLoader } from './components/TerminalLoader';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<CharacterNode | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const graphData = await fetchMrRobotData();
        setData(graphData);
      } catch (err: any) {
        setError(err.message || "Unknown error occurred while deciphering data.");
      } finally {
        // Minimum loading time for the cool terminal effect
        setTimeout(() => setLoading(false), 3000);
      }
    };

    initData();
  }, []);

  if (loading) {
    return <TerminalLoader />;
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-fsociety-bg text-red-500 font-mono p-4">
        <div className="border border-red-900 bg-black/80 p-8 rounded max-w-md text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">SYSTEM FAILURE</h1>
          <p className="text-sm opacity-80">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-white rounded transition-colors text-xs uppercase tracking-widest"
          >
            Reboot System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-fsociety-bg overflow-hidden flex flex-col">
      {/* Header Bar */}
      <header className="absolute top-0 left-0 w-full z-10 px-6 py-4 pointer-events-none flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tighter font-mono">
              fsociety<span className="text-fsociety-red">.dat</span>
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-1 opacity-70">
              RELATIONSHIP_MATRIX_V1
            </p>
        </div>
      </header>

      {/* Main Graph Area */}
      <main className="flex-1 relative">
        {data && (
          <ForceGraph 
            data={data} 
            onNodeClick={(node) => setSelectedNode(node)} 
            selectedNode={selectedNode}
          />
        )}
      </main>

      {/* Detail Panel (Slide Over) */}
      <DetailPanel 
        node={selectedNode} 
        links={data?.links || []} 
        onClose={() => setSelectedNode(null)} 
      />

      {/* Footer Status */}
      <footer className="absolute bottom-0 left-0 w-full px-6 py-2 bg-black/90 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-500 pointer-events-none">
        <div>STATUS: CONNECTED</div>
        <div className="flex space-x-4">
            <span>NODES: {data?.nodes.length}</span>
            <span>LINKS: {data?.links.length}</span>
            <span className="text-fsociety-red animate-pulse">ENCRYPTION: OFF</span>
        </div>
      </footer>
    </div>
  );
};

export default App;