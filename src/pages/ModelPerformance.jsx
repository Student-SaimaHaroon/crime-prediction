import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const confusionMatrix = [[412, 38], [24, 526]];

export default function ModelPerformance() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30d');

  const activeModel = data.models.find(m => m.status === 'Active');

  const comparisonData = data.models.map(m => ({
    name: m.version.replace('CrimePred ', 'v'),
    accuracy: m.accuracy,
    precision: m.precision,
    recall: m.recall,
    f1: m.f1Score,
  }));

  const radarData = activeModel ? [
    { metric: 'Accuracy', value: activeModel.accuracy },
    { metric: 'Precision', value: activeModel.precision },
    { metric: 'Recall', value: activeModel.recall },
    { metric: 'F1 Score', value: activeModel.f1Score },
    { metric: 'ROC-AUC', value: activeModel.rocAuc * 100 },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Model Performance</h1>
          <p className="text-xs text-gray-500">Active: {activeModel?.version}</p>
        </div>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {['7d', '30d', '90d', 'All'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Metrics Cards */}
      {activeModel && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Accuracy', value: `${activeModel.accuracy}%`, color: 'blue' },
            { label: 'Precision', value: `${activeModel.precision}%`, color: 'green' },
            { label: 'Recall', value: `${activeModel.recall}%`, color: 'purple' },
            { label: 'F1 Score', value: `${activeModel.f1Score}%`, color: 'orange' },
            { label: 'ROC-AUC', value: activeModel.rocAuc.toFixed(3), color: 'red' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-xl font-bold text-${color}-600 mt-1`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Model Version Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[85, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Accuracy" />
              <Bar dataKey="precision" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Precision" />
              <Bar dataKey="f1" fill="#22c55e" radius={[4, 4, 0, 0]} name="F1 Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Performance Radar — Active Model</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[85, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Model" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confusion Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Confusion Matrix</h3>
        <div className="flex justify-center">
          <div className="inline-block">
            <div className="text-xs text-gray-500 text-center mb-2">Predicted</div>
            <div className="flex">
              <div className="w-24 flex-shrink-0" />
              <div className="w-28 text-center text-xs font-medium text-gray-600 py-1">Negative</div>
              <div className="w-28 text-center text-xs font-medium text-gray-600 py-1">Positive</div>
            </div>
            {[['Negative', confusionMatrix[0]], ['Positive', confusionMatrix[1]]].map(([label, row], ri) => (
              <div key={label} className="flex items-center">
                <div className="w-24 text-xs font-medium text-gray-600 text-right pr-3">{ri === 0 ? 'Actual' : ''} {label}</div>
                {row.map((val, ci) => (
                  <div key={ci} className={`w-28 h-16 flex items-center justify-center border border-white ${
                    ri === ci ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                  }`}>
                    <div className="text-center">
                      <p className="text-lg font-bold">{val}</p>
                      <p className="text-[9px]">{ri === ci ? (ri === 0 ? 'TN' : 'TP') : (ri === 0 ? 'FP' : 'FN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">All Model Versions</h3>
          <button onClick={() => navigate('/administration')} className="text-xs text-blue-600 hover:underline">Manage models</button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Version', 'Status', 'Accuracy', 'F1', 'Training Date', 'Dataset'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.models.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-900 font-medium">{m.version}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${m.status === 'Active' ? 'bg-green-50 text-green-700' : m.status === 'Testing' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{m.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">{m.accuracy}%</td>
                <td className="px-4 py-3 text-gray-700">{m.f1Score}%</td>
                <td className="px-4 py-3 text-gray-500">{m.trainingDate}</td>
                <td className="px-4 py-3 text-gray-500">{m.dataset}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}