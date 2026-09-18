import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import {
  FileText, AlertTriangle, Briefcase, CreditCard, TrendingUp,
  MapPin, Plus, Brain, Map, BarChart2, ArrowRight, ArrowUpRight,
  Clock, CheckCircle, AlertCircle, Activity
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const complaintsOverTime = [
  { month: 'Mar', complaints: 28, cases: 12 },
  { month: 'Apr', complaints: 35, cases: 18 },
  { month: 'May', complaints: 42, cases: 22 },
  { month: 'Jun', complaints: 38, cases: 20 },
  { month: 'Jul', complaints: 51, cases: 28 },
  { month: 'Aug', complaints: 48, cases: 25 },
  { month: 'Sep', complaints: 32, cases: 15 },
];

const riskColors = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' };
const statusColors = { 'Registered': '#3b82f6', 'Under Investigation': '#f97316', 'Case Linked': '#8b5cf6', 'Closed': '#22c55e', 'Under Review': '#eab308' };

export default function Dashboard() {
  const { data } = useApp();
  const navigate = useNavigate();

  const totalComplaints = data.complaints.length;
  const highRisk = data.predictions.filter(p => p.riskScore >= 70).length;
  const activeCases = data.cases.filter(c => c.status === 'Active').length;
  const flaggedTxns = data.transactions.filter(t => t.flagged).length;

  const riskDist = ['Critical', 'High', 'Medium', 'Low'].map(r => ({
    name: r,
    value: data.predictions.filter(p => p.riskCategory === r).length || Math.floor(Math.random() * 5 + 1),
    color: riskColors[r],
  }));

  const topLocations = data.hotspots.slice(0, 5);

  const priorityColors = { Critical: 'text-red-600 bg-red-50', High: 'text-orange-600 bg-orange-50', Medium: 'text-yellow-600 bg-yellow-50', Low: 'text-green-600 bg-green-50' };
  const statusBadgeColors = { 'Registered': 'bg-blue-50 text-blue-700', 'Under Investigation': 'bg-orange-50 text-orange-700', 'Case Linked': 'bg-purple-50 text-purple-700', 'Closed': 'bg-green-50 text-green-700', 'Under Review': 'bg-yellow-50 text-yellow-700' };

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Welcome back, {data.currentUser.name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Complaints', value: totalComplaints, icon: FileText, color: 'blue', change: '+12%', sub: 'vs last month' },
          { label: 'High Risk', value: highRisk, icon: AlertTriangle, color: 'red', change: '+3', sub: 'this week' },
          { label: 'Active Cases', value: activeCases, icon: Briefcase, color: 'purple', change: '2 urgent', sub: 'need attention' },
          { label: 'Flagged Transactions', value: flaggedTxns, icon: CreditCard, color: 'orange', change: '₹12.7L', sub: 'total flagged' },
        ].map(({ label, value, icon: Icon, color, change, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${color}-50`}>
                <Icon className={`w-4 h-4 text-${color}-600`} />
              </div>
              <span className={`text-xs font-medium text-${color}-600 bg-${color}-50 px-2 py-0.5 rounded-full`}>{change}</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Complaints Over Time */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Complaints Over Time</h3>
              <p className="text-xs text-gray-500">Monthly complaint & case trend</p>
            </div>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={complaintsOverTime}>
              <defs>
                <linearGradient id="complaintGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="caseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={2} fill="url(#complaintGrad)" name="Complaints" />
              <Area type="monotone" dataKey="cases" stroke="#8b5cf6" strokeWidth={2} fill="url(#caseGrad)" name="Cases" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Risk Distribution</h3>
              <p className="text-xs text-gray-500">Prediction risk levels</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                {riskDist.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {riskDist.map(r => (
              <div key={r.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-xs text-gray-600">{r.name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Complaints */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Recent Complaints</h3>
            <button onClick={() => navigate('/complaints')} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['ID', 'Category', 'Location', 'Amount', 'Status', 'Priority'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.complaints.slice(0, 5).map(c => (
                  <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-3 py-2.5 font-mono text-blue-600 font-medium">{c.id}</td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[120px] truncate">{c.category}</td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[100px] truncate">{c.location}</td>
                    <td className="px-3 py-2.5 text-gray-900 font-medium">₹{c.amount.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeColors[c.status] || 'bg-gray-50 text-gray-600'}`}>{c.status}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityColors[c.priority] || 'bg-gray-50 text-gray-600'}`}>{c.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'New Complaint', icon: Plus, color: 'blue', path: '/complaints/create' },
                { label: 'Run Prediction', icon: Brain, color: 'purple', path: '/predictions/run' },
                { label: 'View Hotspots', icon: Map, color: 'orange', path: '/intelligence-map' },
                { label: 'Generate Report', icon: BarChart2, color: 'green', path: '/reports' },
              ].map(({ label, icon: Icon, color, path }) => (
                <button key={label} onClick={() => navigate(path)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-${color}-50 border-${color}-100 hover:bg-${color}-100 transition-colors`}>
                  <Icon className={`w-4 h-4 text-${color}-600`} />
                  <span className={`text-[10px] font-medium text-${color}-700 text-center leading-tight`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Top Hotspots */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Top Risk Locations</h3>
              <button onClick={() => navigate('/intelligence-map')} className="text-xs text-blue-600">View map</button>
            </div>
            <div className="space-y-2.5">
              {topLocations.slice(0, 4).map((h, i) => (
                <div key={h.id} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{h.location}</p>
                    <p className="text-[10px] text-gray-500">{h.incidents} incidents</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${h.risk === 'Critical' ? 'bg-red-50 text-red-600' : h.risk === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'}`}>{h.risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Investigations */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Active Investigations</h3>
          <button onClick={() => navigate('/cases')} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Case ID', 'Title', 'Officer', 'Priority', 'Status', 'Due Date'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.cases.slice(0, 3).map(c => (
                <tr key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-3 py-2.5 font-mono text-blue-600 font-medium">{c.id}</td>
                  <td className="px-3 py-2.5 text-gray-700 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-3 py-2.5 text-gray-600">{c.officer}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityColors[c.priority] || 'bg-gray-50 text-gray-600'}`}>{c.priority}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeColors[c.status] || 'bg-gray-50 text-gray-600'}`}>{c.status}</span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{c.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}