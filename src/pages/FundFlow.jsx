import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { useNavigate } from 'react-router-dom';
import { ZoomIn, ZoomOut, RotateCcw, Info, AlertTriangle } from 'lucide-react';

export default function FundFlow() {
  const { data } = useApp();
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filter, setFilter] = useState('all');

  // Build graph nodes and edges from transactions
  const buildGraph = () => {
    const nodeMap = {};
    const edges = [];

    const txns = filter === 'flagged' ? data.transactions.filter(t => t.flagged) : data.transactions;

    txns.forEach((t, i) => {
      const senderKey = t.sender.split(' (')[0];
      const receiverKey = t.receiver.split(' (')[0];

      if (!nodeMap[senderKey]) nodeMap[senderKey] = { id: senderKey, type: 'account', transactions: [], totalOut: 0, totalIn: 0 };
      if (!nodeMap[receiverKey]) nodeMap[receiverKey] = { id: receiverKey, type: 'account', transactions: [], totalOut: 0, totalIn: 0 };

      nodeMap[senderKey].totalOut += t.amount;
      nodeMap[receiverKey].totalIn += t.amount;

      edges.push({ id: t.id, from: senderKey, to: receiverKey, amount: t.amount, type: t.type, flagged: t.flagged, status: t.status });
    });

    // Layout nodes in a tree-like structure
    const nodes = Object.values(nodeMap);
    const cols = Math.min(4, Math.ceil(Math.sqrt(nodes.length)));
    nodes.forEach((n, i) => {
      n.x = 120 + (i % cols) * 220;
      n.y = 80 + Math.floor(i / cols) * 160;
    });

    return { nodes, edges };
  };

  const { nodes, edges } = buildGraph();

  const getNodeById = (id) => nodes.find(n => n.id === id);

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'rect') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && dragStart) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => { setIsDragging(false); setDragStart(null); };

  const edgeColor = (e) => e.flagged ? '#ef4444' : e.status === 'Suspicious' ? '#f97316' : '#94a3b8';
  const nodeColor = (n) => {
    if (n.id.toLowerCase().includes('unknown') || n.id.toLowerCase().includes('mule') || n.id.toLowerCase().includes('overseas')) return '#fee2e2';
    if (n.id.toLowerCase().includes('crypto')) return '#fef3c7';
    return '#eff6ff';
  };
  const nodeStroke = (n) => {
    if (n.id.toLowerCase().includes('unknown') || n.id.toLowerCase().includes('mule')) return '#ef4444';
    if (n.id.toLowerCase().includes('crypto')) return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Fund Flow Visualization</h1>
          <p className="text-xs text-gray-500 mt-0.5">Interactive money trail visualization</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Transactions</option>
            <option value="flagged">Flagged Only</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-200 rounded-xl p-3">
        <p className="text-xs font-semibold text-gray-600 mr-1">Legend:</p>
        {[
          { color: '#eff6ff', stroke: '#3b82f6', label: 'Known Account' },
          { color: '#fee2e2', stroke: '#ef4444', label: 'Suspicious/Unknown' },
          { color: '#fef3c7', stroke: '#f59e0b', label: 'Crypto/Exchange' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color, border: `2px solid ${l.stroke}` }} />
            <span className="text-xs text-gray-600">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-red-400" /><span className="text-xs text-gray-600">Flagged</span></div>
        <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-orange-400" /><span className="text-xs text-gray-600">Suspicious</span></div>
        <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-slate-300" /><span className="text-xs text-gray-600">Normal</span></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: '520px' }}>
        {/* Controls */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-100">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"><ZoomIn className="w-4 h-4 text-gray-600" /></button>
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"><ZoomOut className="w-4 h-4 text-gray-600" /></button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"><RotateCcw className="w-4 h-4 text-gray-600" /></button>
          <span className="text-xs text-gray-500">{Math.round(zoom * 100)}% · Drag to pan · Click node for details</span>
        </div>

        <div className="flex h-full" style={{ height: 'calc(100% - 49px)' }}>
          {/* SVG */}
          <svg
            ref={svgRef}
            className={`flex-1 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ background: '#fafafa' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
              </marker>
              <marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
              </marker>
              <marker id="arrowhead-orange" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#f97316" />
              </marker>
            </defs>
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Background rect for pan */}
              <rect x="-10000" y="-10000" width="20000" height="20000" fill="transparent" />

              {/* Edges */}
              {edges.map(e => {
                const from = getNodeById(e.from);
                const to = getNodeById(e.to);
                if (!from || !to) return null;
                const markerId = e.flagged ? 'arrowhead-red' : e.status === 'Suspicious' ? 'arrowhead-orange' : 'arrowhead';
                // Curved path
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2 - 30;
                return (
                  <g key={e.id}>
                    <path d={`M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`}
                      stroke={edgeColor(e)} strokeWidth={e.flagged ? 2.5 : 1.5} fill="none"
                      strokeDasharray={e.flagged ? '0' : '0'}
                      markerEnd={`url(#${markerId})`}
                      opacity={0.8}
                    />
                    <text x={mx} y={my - 6} textAnchor="middle" fontSize={9} fill={edgeColor(e)} fontWeight="600">
                      ₹{(e.amount / 1000).toFixed(0)}K
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(n => (
                <g key={n.id} onClick={() => setSelectedNode(n)} style={{ cursor: 'pointer' }}>
                  <ellipse cx={n.x} cy={n.y} rx={70} ry={28}
                    fill={nodeColor(n)} stroke={selectedNode?.id === n.id ? '#1d4ed8' : nodeStroke(n)}
                    strokeWidth={selectedNode?.id === n.id ? 2.5 : 1.5}
                  />
                  <text x={n.x} y={n.y - 3} textAnchor="middle" fontSize={9} fontWeight="600" fill="#1e293b">
                    {n.id.length > 16 ? n.id.slice(0, 16) + '…' : n.id}
                  </text>
                  <text x={n.x} y={n.y + 10} textAnchor="middle" fontSize={8} fill="#64748b">
                    ↑₹{(n.totalIn / 1000).toFixed(0)}K ↓₹{(n.totalOut / 1000).toFixed(0)}K
                  </text>
                </g>
              ))}
            </g>
          </svg>

          {/* Node detail panel */}
          {selectedNode && (
            <div className="w-64 border-l border-gray-200 p-4 bg-white overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Account Details</h4>
                <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-500">ENTITY</p>
                  <p className="text-xs font-medium text-gray-900">{selectedNode.id}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[9px] text-gray-500">TOTAL IN</p>
                    <p className="text-xs font-bold text-green-600">₹{selectedNode.totalIn.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[9px] text-gray-500">TOTAL OUT</p>
                    <p className="text-xs font-bold text-red-600">₹{selectedNode.totalOut.toLocaleString()}</p>
                  </div>
                </div>
                {(selectedNode.id.toLowerCase().includes('unknown') || selectedNode.id.toLowerCase().includes('mule')) && (
                  <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-700">High-risk entity - flagged for suspicious activity</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-gray-500 mb-1">RELATED TRANSACTIONS</p>
                  {edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map(e => (
                    <div key={e.id} onClick={() => navigate(`/transactions/${e.id}`)} className="flex items-center justify-between py-1.5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded">
                      <span className="text-[10px] font-mono text-blue-600">{e.id}</span>
                      <span className="text-[10px] font-medium">₹{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}