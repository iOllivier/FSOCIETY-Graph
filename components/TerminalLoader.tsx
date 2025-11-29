import React, { useEffect, useState } from 'react';

export const TerminalLoader: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);

  const logs = [
    "Initializing daemon...",
    "Connecting to e-corp servers...",
    "Bypassing firewalls...",
    "Decrypting character database...",
    "Accessing WhiteRose's archive...",
    "rendering_graph_v1.0.exe"
  ];

  useEffect(() => {
    let delay = 0;
    logs.forEach((log, index) => {
      delay += Math.random() * 500 + 200;
      setTimeout(() => {
        setLines(prev => [...prev, `> ${log}`]);
      }, delay);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-fsociety-bg text-fsociety-text font-mono p-8">
      <div className="w-full max-w-lg border border-fsociety-text/20 p-6 rounded bg-fsociety-panel shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-fsociety-red animate-pulse"></div>
        <h2 className="text-xl font-bold mb-4 text-fsociety-red tracking-widest uppercase">fsociety_boot_sequence</h2>
        <div className="space-y-2 h-64 overflow-y-auto font-mono text-sm">
          {lines.map((line, i) => (
            <div key={i} className="opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
              <span className="text-green-500 mr-2">$</span>
              {line}
            </div>
          ))}
          <div className="animate-pulse">_</div>
        </div>
      </div>
    </div>
  );
};