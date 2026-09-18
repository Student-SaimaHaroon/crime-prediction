import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/AppContext';
import { Search, Filter } from 'lucide-react';

export default function AuditLog() {
  const { data } = useApp();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const actions = [...new Set(data.auditLogs.map(a => a.action))];

  const filtered = useMemo(() => {
    return data.auditLogs.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !search || a.user.toLowerCase().includes(q) || a.resource.toLowerCase().includes(q) || a.action.toLowerCase().includes(q);
      const matchAction = !filterAction || a.action === filterAction;
      return matchSearch && matchAction;
    });
  }, [data.auditLogs, search, filterAction]);

  const resultColors = { Success: 'bg-green-50 text-green-700', Failed: 'bg-red-50 text-red-700', Warning: 'bg-yellow-50 text-yellow-700' };
  const roleColors = { ADMIN: 'bg-purple-50 text-purple-700', LEA_OFFICER: 'bg-blue-50 text-blue-700', I4C_OFFICER: 'bg-cyan-50 text-cyan-700', ANALYST: 'bg-green-50 text-green-700' };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Audit Log</h1>
        <p className="text-xs text-gray-500 mt-0.5">Complete audit trail of platform actions</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, resource, action..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Event ID', 'User', 'Role', 'Action', 'Resource', 'Timestamp', 'Result'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-500">{a.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{a.user}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleColors[a.role] || 'bg-gray-100 text-gray-600'}`}>{a.role}</span></td>
                  <td className="px-4 py-3"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-mono">{a.action}</span></td>
                  <td className="px-4 py-3 text-gray-700">{a.resource}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${resultColors[a.result] || 'bg-gray-50 text-gray-600'}`}>{a.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}