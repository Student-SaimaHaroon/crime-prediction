import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { Search, Filter, Eye, Flag, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 8;
const statusColors = { Suspicious: 'bg-orange-50 text-orange-700', Flagged: 'bg-red-50 text-red-700', Normal: 'bg-green-50 text-green-700' };

export default function TransactionList() {
  const { data, flagTransaction } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', status: '', location: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const types = [...new Set(data.transactions.map(t => t.type))];
  const statuses = [...new Set(data.transactions.map(t => t.status))];

  const filtered = useMemo(() => {
    return data.transactions.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !search || t.id.toLowerCase().includes(q) || t.sender.toLowerCase().includes(q) || t.receiver.toLowerCase().includes(q) || t.complaintId.toLowerCase().includes(q);
      const matchType = !filters.type || t.type === filters.type;
      const matchStatus = !filters.status || t.status === filters.status;
      const matchLocation = !filters.location || t.location.toLowerCase().includes(filters.location.toLowerCase());
      return matchSearch && matchType && matchStatus && matchLocation;
    });
  }, [data.transactions, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Transactions</h1>
          <p className="text-xs text-gray-500 mt-0.5">{filtered.length} transactions</p>
        </div>
        <button onClick={() => navigate('/transactions/fund-flow')} className="px-4 py-2 border border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">
          Fund Flow View
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total Transactions</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{data.transactions.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Flagged</p>
          <p className="text-xl font-bold text-red-600 mt-0.5">{data.transactions.filter(t => t.flagged).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total Disputed</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">₹{(data.transactions.reduce((a, t) => a + t.amount, 0) / 100000).toFixed(1)}L</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by ID, sender, receiver, complaint ID..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            <select value={filters.type} onChange={e => { setFilters(f => ({ ...f, type: e.target.value })); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={filters.location} onChange={e => { setFilters(f => ({ ...f, location: e.target.value })); setPage(1); }} placeholder="Filter by location"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Transaction ID', 'Complaint ID', 'Sender', 'Receiver', 'Amount', 'Type', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No transactions found</p>
                </td></tr>
              ) : paginated.map(t => (
                <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${t.flagged ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3 font-mono text-blue-600 font-medium">{t.id}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/complaints/${t.complaintId}`)} className="text-blue-600 hover:underline font-mono">{t.complaintId}</button>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-[120px] truncate">{t.sender}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[120px] truncate">{t.receiver}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">₹{t.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-medium">{t.type}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[t.status] || 'bg-gray-50 text-gray-600'}`}>{t.status}</span></td>
                  <td className="px-4 py-3 text-gray-500">{t.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/transactions/${t.id}`)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => flagTransaction(t.id)} className={`p-1 rounded ${t.flagged ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`} title={t.flagged ? 'Unflag' : 'Flag'}>
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
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