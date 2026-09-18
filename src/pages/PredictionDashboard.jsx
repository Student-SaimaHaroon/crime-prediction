import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { Brain, Play, BarChart2, MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const riskColors = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' };
const confidenceData = [
  { range: '90-100%', count: 8 },
  { range: '80-90%', count: 14 },
  { range: '70-80%', count: 11 },
  { range: '60-70%', count: 7 },
  { range: '<60%', count: 3 },
];

export default function PredictionDashboard() {
  const { data } = useApp();
  const navigate = useNavigate();

  const riskDist = ['Critical', 'High', 'Medium', 'Low'].map(r => ({
    name: r,
    value: data.predictions.filter(p => p.riskCategory === r).length || Math.floor(Math.random() * 5 + 1),
    color: riskColors[r],
  }));

  const topLocations = data.hotspots.filter(h => ['High', 'Critical'].includes(h.risk)).slice(0, 5);
  const avgConfidence = data.predictions.length > 0 ? (data.predictions.reduce((a, p) => a + p.confidence, 0) / data.predictions.length).toFixed(1) : 93.5;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">AI Predictions</h1>
          <p className="text-xs text-gray-500 mt-0.5">Machine learning powered crime prediction analytics</p>
        </div>
        <button onClick={() => navigate('/predictions/run')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Play className="w-4 h-4" /> Run New Prediction
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Predictions', value: data.predictions.length + 41, color: 'purple', sub: 'all time' },
          { label: 'High Risk', value: data.predictions.filter(p => p.riskScore >= 70).length + 18, color: 'red', sub: 'active alerts' },
          { label: 'Avg Confidence', value: `${avgConfidence}%`, color: 'blue', sub: 'model accuracy' },
          { label: 'Model Version', value: 'v2.4.1', color: 'green', sub: 'active model' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Risk Distribution</h3>
          <p className="text-xs text-gray-500 mb-4">Predictions by risk level</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={riskDist} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {riskDist.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {riskDist.map(r => (
                <div key={r.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-xs text-gray-700">{r.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confidence Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Confidence Distribution</h3>
          <p className="text-xs text-gray-500 mb-4">Prediction confidence levels</p>
          <ResponsiveContainer width="100%" height={155}>
            <BarChart data={confidenceData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Predictions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Predictions + Top Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Predictions Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Recent Predictions</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Prediction ID', 'Location', 'Risk Score', 'Category', 'Confidence', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.predictions.map(p => (
                <tr key={p.id} onClick={() => navigate(`/predictions/${p.id}`)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-2.5 font-mono text-purple-600 font-medium">{p.id}</td>
                  <td className="px-4 py-2.5 text-gray-700">{p.predictedLocation}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${p.riskScore}%`, backgroundColor: riskColors[p.riskCategory] }} />
                      </div>
                      <span className="font-bold" style={{ color: riskColors[p.riskCategory] }}>{p.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: riskColors[p.riskCategory] + '20', color: riskColors[p.riskCategory] }}>{p.riskCategory}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{p.confidence}%</td>
                  <td className="px-4 py-2.5 text-gray-500">{new Date(p.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Top Risk Areas</h3>
            <button onClick={() => navigate('/intelligence-map')} className="text-xs text-purple-600 hover:underline">View map</button>
          </div>
          <div className="space-y-3">
            {topLocations.map((h, i) => (
              <div key={h.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{h.location}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex-1 bg-gray-100 rounded-full h-1">
                      <div className="h-1 rounded-full bg-purple-500" style={{ width: `${Math.min(100, (h.incidents / 25) * 100)}%` }} />
                    </div>
                    <span className="text-[9px] text-gray-500">{h.incidents}</span>
                  </div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${h.risk === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{h.risk}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/predictions/performance')} className="w-full mt-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
            Model Performance <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}