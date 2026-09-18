import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Loader2, FileText, Download, Printer, CheckCircle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const reportTypes = ['Monthly Cybercrime Summary', 'High-Risk Prediction Report', 'Active Case Status Report', 'Financial Fraud Analysis', 'Geographic Hotspot Report', 'Investigation Activity Report'];
const exportFormats = ['PDF', 'Excel', 'CSV', 'JSON'];

export default function Reports() {
  const { data, generateReport } = useApp();
  const [form, setForm] = useState({ reportType: '', startDate: '2026-08-01', endDate: '2026-09-03', location: '', category: '', format: 'PDF' });
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('builder');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.reportType) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    const rpt = generateReport(form);
    setPreview(rpt);
    setActiveTab('preview');
    setGenerating(false);
  };

  const handlePrint = () => window.print();
  const handleExport = () => {
    if (!preview) return;
    const content = JSON.stringify({ report: preview, data: { complaints: data.complaints.length, cases: data.cases.length, predictions: data.predictions.length } }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `report_${preview.id}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const riskData = [
    { name: 'Critical', value: data.predictions.filter(p => p.riskCategory === 'Critical').length || 2, color: '#ef4444' },
    { name: 'High', value: data.predictions.filter(p => p.riskCategory === 'High').length || 8, color: '#f97316' },
    { name: 'Medium', value: 14, color: '#eab308' },
    { name: 'Low', value: 19, color: '#22c55e' },
  ];
  const categoryData = [
    { name: 'Financial Fraud', count: 18 },
    { name: 'UPI Fraud', count: 12 },
    { name: 'Investment Fraud', count: 8 },
    { name: 'Phishing', count: 7 },
    { name: 'SIM Swap', count: 5 },
    { name: 'Other', count: 6 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-500 mt-0.5">Generate and export investigation reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('builder')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeTab === 'builder' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>Report Builder</button>
          <button onClick={() => setActiveTab('preview')} disabled={!preview} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'}`}>Preview</button>
          <button onClick={() => setActiveTab('history')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>History</button>
        </div>
      </div>

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <form onSubmit={handleGenerate} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Report Configuration</h3>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Report Type <span className="text-red-500">*</span></label>
                <select value={form.reportType} onChange={e => setForm(f => ({ ...f, reportType: e.target.value }))}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select report type...</option>
                  {reportTypes.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Location Filter</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="All locations" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Export Format</label>
                  <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {exportFormats.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={generating || !form.reportType}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating Report...</> : <><BarChart2 className="w-4 h-4" />Generate Report</>}
              </button>
            </form>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Report Summary</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Complaints', value: data.complaints.length },
                  { label: 'Active Cases', value: data.cases.filter(c => c.status === 'Active').length },
                  { label: 'Predictions', value: data.predictions.length },
                  { label: 'Flagged Transactions', value: data.transactions.filter(t => t.flagged).length },
                  { label: 'Total Disputed', value: `₹${(data.complaints.reduce((a, c) => a + c.amount, 0) / 100000).toFixed(1)}L` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-blue-700">{label}</span>
                    <span className="text-xs font-bold text-blue-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && preview && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">{preview.reportType}</h2>
                <p className="text-xs text-gray-500">Period: {preview.startDate} to {preview.endDate} · Generated: {new Date(preview.generatedAt).toLocaleString()} · By: {preview.generatedBy}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-3.5 h-3.5" /> Export {preview.format}
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Total Complaints', value: data.complaints.length },
                { label: 'Active Cases', value: data.cases.filter(c => c.status === 'Active').length },
                { label: 'High Risk Predictions', value: data.predictions.filter(p => p.riskScore >= 70).length },
                { label: 'Flagged Transactions', value: data.transactions.filter(t => t.flagged).length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Complaints by Category</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={categoryData} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Risk Distribution</h4>
                <div className="flex items-center">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={riskData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                        {riskData.map(e => <Cell key={e.name} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5">
                    {riskData.map(r => (
                      <div key={r.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="text-xs text-gray-600">{r.name}: {r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Report History</h3>
          </div>
          {data.reports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No reports generated yet</p>
              <button onClick={() => setActiveTab('builder')} className="mt-3 text-blue-600 text-sm hover:underline">Generate a report</button>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Report ID', 'Type', 'Period', 'Generated By', 'Format', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-blue-600">{r.id}</td>
                    <td className="px-4 py-2.5 text-gray-700">{r.reportType}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.startDate} – {r.endDate}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.generatedBy}</td>
                    <td className="px-4 py-2.5"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-medium">{r.format}</span></td>
                    <td className="px-4 py-2.5 text-gray-500">{new Date(r.generatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}