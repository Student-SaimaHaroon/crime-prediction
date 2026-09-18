import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { Plus, Search, Filter, Eye, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const PAGE_SIZE = 8;
const priorityColors = { Critical: 'bg-red-50 text-red-700', High: 'bg-orange-50 text-orange-700', Medium: 'bg-yellow-50 text-yellow-700', Low: 'bg-green-50 text-green-700' };
const statusColors = { Active: 'bg-blue-50 text-blue-700', 'Under Review': 'bg-yellow-50 text-yellow-700', Closed: 'bg-green-50 text-green-700', Resolved: 'bg-gray-50 text-gray-600' };

export default function CaseList() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', officer: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const officers = [...new Set(data.cases.map(c => c.officer))];
  const filtered = useMemo(() => {
    return data.cases.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !search || c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.officer.toLowerCase().includes(q);
      const matchStatus = !filters.status || c.status === filters.status;
      const matchPriority = !filters.priority || c.priority === filters.priority;
      const matchOfficer = !filters.officer || c.officer === filters.officer;
      return matchSearch && matchStatus && matchPriority && matchOfficer;
    });
  }, [data.cases, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Cases</h1>
          <p className="text-xs text-gray-500 mt-0.5">{filtered.length} cases</p>
        </div>
        <button onClick={() => navigate('/cases/create')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Case
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-blue-600 mt-0.5">{data.cases.filter(c => c.status === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Critical Priority</p>
          <p className="text-xl font-bold text-red-600 mt-0.5">{data.cases.filter(c => c.priority === 'Critical').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Due This Week</p>
          <p className="text-xl font-bold text-orange-600 mt-0.5">2</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by ID, title, officer..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              {['Active', 'Under Review', 'Closed', 'Resolved'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.priority} onChange={e => { setFilters(f => ({ ...f, priority: e.target.value })); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Priorities</option>
              {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filters.officer} onChange={e => { setFilters(f => ({ ...f, officer: e.target.value })); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Officers</option>
              {officers.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Case ID', 'Title', 'Priority', 'Officer', 'Status', 'Due Date', 'Last Updated', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No cases found</p>
                </td></tr>
              ) : paginated.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-blue-600 font-medium">{c.id}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityColors[c.priority] || 'bg-gray-50 text-gray-600'}`}>{c.priority}</span></td>
                  <td className="px-4 py-3 text-gray-600">{c.officer}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[c.status] || 'bg-gray-50 text-gray-600'}`}>{c.status}</span></td>
                  <td className="px-4 py-3 text-gray-500">{c.dueDate}</td>
                  <td className="px-4 py-3 text-gray-500">{c.lastUpdated}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/cases/${c.id}`)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}