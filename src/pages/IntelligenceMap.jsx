import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Filter, TrendingUp, AlertTriangle, X, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const riskColors = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' };
const riskBg = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-500', Low: 'bg-green-500' };

export default function IntelligenceMap() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [filterRisk, setFilterRisk] = useState('');
  const [filterState, setFilterState] = useState('');
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [activeTab, setActiveTab] = useState('map');

  const states = [...new Set(data.hotspots.map(h => h.state))];
  const filtered = data.hotspots.filter(h => {
    return (!filterRisk || h.risk === filterRisk) && (!filterState || h.state === filterState);
  });

  // India map mockup using SVG positions (approximate relative positions)
  const mapNodes = [
    { id: 'HS-001', x: 22, y: 58, label: 'Mumbai' },
    { id: 'HS-002', x: 48, y: 28, label: 'Delhi' },
    { id: 'HS-003', x: 40, y: 64, label: 'Bengaluru' },
    { id: 'HS-004', x: 48, y: 58, label: 'Hyderabad' },
    { id: 'HS-005', x: 52, y: 68, label: 'Chennai' },
    { id: 'HS-006', x: 72, y: 44, label: 'Kolkata' },
    { id: 'HS-007', x: 24, y: 52, label: 'Pune' },
    { id: 'HS-008', x: 18, y: 42, label: 'Ahmedabad' },
  ];

  const stateChartData = states.map(s => ({
    state: s.length > 10 ? s.slice(0, 10) + '…' : s,
    incidents: data.hotspots.filter(h => h.state === s).reduce((a, h) => a + h.incidents, 0),
    amount: data.hotspots.filter(h => h.state === s).reduce((a, h) => a + h.amount, 0) / 100000,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Crime Intelligence Map</h1>
          <p className="text-xs text-gray-500 mt-0.5">Geographic hotspot analysis and prediction visualization</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('map')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>Map View</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>Analytics</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Risk Levels</option>
          {['Critical', 'High', 'Medium', 'Low'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterState} onChange={e => setFilterState(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filterRisk || filterState) && (
          <button onClick={() => { setFilterRisk(''); setFilterState(''); }} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {activeTab === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: '520px' }}>
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">India — Cybercrime Hotspot Map</p>
              <div className="flex items-center gap-3">
                {Object.entries(riskColors).map(([r, c]) => (
                  <div key={r} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                    <span className="text-[10px] text-gray-500">{r}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-full h-full bg-slate-50" style={{ height: 'calc(100% - 49px)' }}>
              {/* Stylized India outline SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)' }}>
                {/* Grid lines */}
                {[20, 40, 60, 80].map(v => (
                  <React.Fragment key={v}>
                    <line x1={v} y1={0} x2={v} y2={100} stroke="#e2e8f0" strokeWidth="0.3" />
                    <line x1={0} y1={v} x2={100} y2={v} stroke="#e2e8f0" strokeWidth="0.3" />
                  </React.Fragment>
                ))}

                {/* India rough outline */}
                <path d="M 25 15 L 65 10 L 75 20 L 80 35 L 75 45 L 80 55 L 70 70 L 58 78 L 50 90 L 42 78 L 35 70 L 28 60 L 20 50 L 15 35 Z"
                  fill="#e8edf5" stroke="#c7d2e8" strokeWidth="0.5" opacity="0.7" />

                {/* Connection lines between nearby hotspots */}
                {mapNodes.slice(0, 4).map((n, i) => {
                  const next = mapNodes[i + 1];
                  if (!next) return null;
                  const hs = data.hotspots.find(h => h.id === n.id);
                  const flagged = hs && (hs.risk === 'Critical' || hs.risk === 'High');
                  return (
                    <line key={i} x1={n.x} y1={n.y} x2={next.x} y2={next.y}
                      stroke={flagged ? '#f97316' : '#94a3b8'} strokeWidth="0.3" strokeDasharray="1 1" opacity="0.5" />
                  );
                })}

                {/* Hotspot nodes */}
                {mapNodes.map(node => {
                  const hs = data.hotspots.find(h => h.id === node.id);
                  if (!hs) return null;
                  if (filterRisk && hs.risk !== filterRisk) return null;
                  if (filterState && hs.state !== filterState) return null;
                  const color = riskColors[hs.risk];
                  const r = hs.risk === 'Critical' ? 4 : hs.risk === 'High' ? 3.5 : hs.risk === 'Medium' ? 3 : 2.5;
                  return (
                    <g key={node.id} onClick={() => setSelectedHotspot(hs)} style={{ cursor: 'pointer' }}>
                      <circle cx={node.x} cy={node.y} r={r + 2} fill={color} opacity="0.15" />
                      <circle cx={node.x} cy={node.y} r={r} fill={color} opacity="0.9"
                        stroke={selectedHotspot?.id === hs.id ? 'white' : 'transparent'} strokeWidth="1" />
                      <text x={node.x} y={node.y + r + 3.5} textAnchor="middle" fontSize={2.8} fill="#334155" fontWeight="500">{node.label}</text>
                      <text x={node.x} y={node.y + r + 6.5} textAnchor="middle" fontSize={2.2} fill="#64748b">{hs.incidents} incidents</text>
                    </g>
                  );
                })}
              </svg>

              <div className="absolute bottom-2 left-2 text-[9px] text-gray-400 bg-white/80 px-2 py-1 rounded">
                Click a hotspot to see details
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Selected Hotspot Details */}
            {selectedHotspot && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Location Details</h3>
                  <button onClick={() => setSelectedHotspot(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColors[selectedHotspot.risk] }} />
                  <p className="text-xs font-semibold text-gray-900">{selectedHotspot.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[9px] text-gray-500">RISK LEVEL</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: riskColors[selectedHotspot.risk] }}>{selectedHotspot.risk}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[9px] text-gray-500">INCIDENTS</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">{selectedHotspot.incidents}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[9px] text-gray-500">AMOUNT</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">₹{(selectedHotspot.amount / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[9px] text-gray-500">STATE</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">{selectedHotspot.state}</p>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-2 mb-3">
                  <p className="text-[9px] text-orange-700 font-medium">PEAK TIME PATTERN</p>
                  <p className="text-xs text-orange-800 mt-0.5">{selectedHotspot.timePattern}</p>
                </div>
                <button onClick={() => navigate(`/complaints?location=${encodeURIComponent(selectedHotspot.location)}`)}
                  className="w-full py-1.5 border border-blue-300 text-blue-600 rounded-lg text-xs hover:bg-blue-50 transition-colors">
                  View Complaints in Area
                </button>
              </div>
            )}

            {/* Hotspot Ranking */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Hotspot Ranking</h3>
              <div className="space-y-2">
                {filtered.sort((a, b) => b.incidents - a.incidents).slice(0, 6).map((h, i) => (
                  <div key={h.id} onClick={() => setSelectedHotspot(h)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedHotspot?.id === h.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{h.location}</p>
                      <p className="text-[10px] text-gray-500">{h.incidents} incidents · ₹{(h.amount / 100000).toFixed(1)}L</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${riskBg[h.risk]}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Analytics Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Incidents by State</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stateChartData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="state" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Disputed Amount by State (₹L)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stateChartData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="state" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Amount (₹L)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Geographic Intelligence Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Location', 'State', 'Risk Level', 'Incidents', 'Disputed Amount', 'Peak Pattern'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(h => (
                    <tr key={h.id} onClick={() => setSelectedHotspot(h)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{h.location}</td>
                      <td className="px-4 py-2.5 text-gray-600">{h.state}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: riskColors[h.risk] + '20', color: riskColors[h.risk] }}>{h.risk}</span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{h.incidents}</td>
                      <td className="px-4 py-2.5 text-gray-900">₹{(h.amount / 100000).toFixed(1)}L</td>
                      <td className="px-4 py-2.5 text-gray-500 max-w-[140px] truncate">{h.timePattern}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}