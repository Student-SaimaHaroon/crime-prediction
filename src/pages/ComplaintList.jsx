import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { Plus, Search, Download, Filter, Eye, Trash2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 8;

const statusColors = { 'Registered': 'bg-blue-50 text-blue-700', 'Under Investigation': 'bg-orange-50 text-orange-700', 'Case Linked': 'bg-purple-50 text-purple-700', 'Closed': 'bg-green-50 text-green-700', 'Under Review': 'bg-yellow-50 text-yellow-700' };
const priorityColors = { Critical: 'bg-red-50 text-red-700', High: 'bg-orange-50 text-orange-700', Medium: 'bg-yellow-50 text-yellow-700', Low: 'bg-green-50 text-green-700' };

export default function ComplaintList() {
  const { data, deleteComplaint } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '', priority: '', location: '' });
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [...new Set(data.complaints.map(c => c.category))];
  const statuses = [...new Set(data.complaints.map(c => c.status))];

  const filtered = useMemo(() => {
    return data.complaints.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !search || c.id.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.complainant?.toLowerCase().includes(q);
      const matchCategory = !filters.category || c.category === filters.category;
      const matchStatus = !filters.status || c.status === filters.status;
      const matchPriority = !filters.priority || c.priority === filters.priority;
      const matchLocation = !filters.location || c.location.toLowerCase().includes(filters.location.toLowerCase());
      return matchSearch && matchCategory && matchStatus && matchPriority && matchLocation;
    });
  }, [data.complaints, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const headers = ['Complaint ID', 'Category', 'Location', 'Amount', 'Status', 'Priority', 'Date', 'Complainant'];
    const rows = filtered.map(c => [c.id, c.category, c.location, c.amount, c.status, c.priority, c.date, c.complainant]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'complaints.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const confirmDelete = (c) => setDeleteModal(c);
  const doDelete = () => { deleteComplaint(deleteModal.id); setDeleteModal(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Complaints</h1>
          <p className="text-xs text-gray-500 mt-0.5">{filtered.length} complaints found</p>
        </div>
        <button onClick={() => navigate('/complaints/create')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Complaint
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by ID, category, location, complainant..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
            <select value={filters.category} onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.priority} onChange={e => { setFilters(f => ({ ...f, priority: e.target.value })); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Priorities</option>
              {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
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
                {['Complaint ID', 'Category', 'Location', 'Amount', 'Status', 'Priority', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No complaints found</p>
                  <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                </td></tr>
              ) : paginated.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-blue-600 font-medium">{c.id}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate">{c.category}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{c.location}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">₹{c.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[c.status] || 'bg-gray-50 text-gray-600'}`}>{c.status}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityColors[c.priority] || 'bg-gray-50 text-gray-600'}`}>{c.priority}</span></td>
                  <td className="px-4 py-3 text-gray-500">{c.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/complaints/${c.id}`)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => confirmDelete(c)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page - 2 + i;
              if (pg < 1 || pg > totalPages) return null;
              return <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 text-xs rounded border transition-colors ${pg === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{pg}</button>;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 text-center mb-1">Delete Complaint?</h3>
            <p className="text-xs text-gray-500 text-center mb-5">Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteModal.id}</span>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={doDelete} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}