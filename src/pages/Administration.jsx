import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Users, Shield, Settings, Brain, Activity, Plus, Edit2, Ban, CheckCircle, X, Loader2, RotateCcw, Upload } from 'lucide-react';

const tabs = [
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'roles', label: 'Role & Permissions', icon: Shield },
  { id: 'config', label: 'System Config', icon: Settings },
  { id: 'models', label: 'Model Management', icon: Brain },
  { id: 'monitoring', label: 'System Monitoring', icon: Activity },
];

const rolePermissions = {
  ADMIN: { complaints: ['read', 'create', 'update', 'delete'], cases: ['read', 'create', 'update', 'delete'], predictions: ['read', 'run'], reports: ['read', 'generate', 'export'], users: ['read', 'create', 'update', 'deactivate'] },
  LEA_OFFICER: { complaints: ['read', 'create', 'update'], cases: ['read', 'create', 'update'], predictions: ['read', 'run'], reports: ['read', 'generate'], users: ['read'] },
  I4C_OFFICER: { complaints: ['read', 'create', 'update'], cases: ['read', 'update'], predictions: ['read', 'run'], reports: ['read', 'generate', 'export'], users: ['read'] },
  ANALYST: { complaints: ['read'], cases: ['read'], predictions: ['read', 'run'], reports: ['read'], users: [] },
};

function UserManagement() {
  const { data, addUser, updateUser } = useApp();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'LEA_OFFICER', department: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(null);

  const filtered = data.users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const openAdd = () => { setEditUser(null); setForm({ name: '', email: '', role: 'LEA_OFFICER', department: '', phone: '' }); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, role: u.role, department: u.department, phone: u.phone }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    if (editUser) { updateUser(editUser.id, form); } else { addUser(form); }
    setShowModal(false);
    setSaving(false);
  };

  const handleToggle = (u) => {
    setConfirmDisable(null);
    updateUser(u.id, { status: u.status === 'Active' ? 'Inactive' : 'Active' });
  };

  const roleColors = { ADMIN: 'bg-purple-50 text-purple-700', LEA_OFFICER: 'bg-blue-50 text-blue-700', I4C_OFFICER: 'bg-cyan-50 text-cyan-700', ANALYST: 'bg-green-50 text-green-700' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">User Management</h2>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add User
        </button>
      </div>
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Roles</option>
          {Object.keys(rolePermissions).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Name', 'Email', 'Role', 'Department', 'Status', 'Last Login', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${roleColors[u.role] || 'bg-gray-50 text-gray-600'}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{u.department}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${u.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.status}</span></td>
                <td className="px-4 py-3 text-gray-500">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setConfirmDisable(u)} className={`p-1 rounded ${u.status === 'Active' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}>
                      {u.status === 'Active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              {[
                { label: 'Full Name', key: 'name', type: 'text', required: true },
                { label: 'Email', key: 'email', type: 'email', required: true },
                { label: 'Department', key: 'department', type: 'text' },
                { label: 'Phone', key: 'phone', type: 'text' },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={required}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.keys(rolePermissions).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}{saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Disable Modal */}
      {confirmDisable && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">{confirmDisable.status === 'Active' ? 'Disable' : 'Enable'} User?</h3>
            <p className="text-xs text-gray-500 mb-4">Are you sure you want to {confirmDisable.status === 'Active' ? 'disable' : 'enable'} <span className="font-semibold">{confirmDisable.name}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDisable(null)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleToggle(confirmDisable)} className={`flex-1 py-2 rounded-lg text-sm font-medium text-white ${confirmDisable.status === 'Active' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModelManagement() {
  const { data, deployModel } = useApp();
  const [confirmDeploy, setConfirmDeploy] = useState(null);
  const [deploying, setDeploying] = useState(null);

  const handleDeploy = async () => {
    setDeploying(confirmDeploy);
    setConfirmDeploy(null);
    await new Promise(r => setTimeout(r, 1500));
    deployModel(deploying);
    setDeploying(null);
  };

  const statusColors = { Active: 'bg-green-50 text-green-700', Testing: 'bg-blue-50 text-blue-700', Archived: 'bg-gray-100 text-gray-500' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Model Management</h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          <Upload className="w-3.5 h-3.5" /> Upload Model
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {data.models.map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-gray-900 font-mono">{m.version}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>{m.status}</span>
                </div>
                <p className="text-xs text-gray-500">{m.description}</p>
                <p className="text-[10px] text-gray-400 mt-1">Trained: {m.trainingDate} · Dataset: {m.dataset}</p>
              </div>
              <div className="flex gap-2">
                {m.status !== 'Active' && (
                  <button onClick={() => setConfirmDeploy(m.id)} disabled={deploying === m.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">
                    {deploying === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}{deploying === m.id ? 'Deploying...' : 'Deploy'}
                  </button>
                )}
                {m.status === 'Active' && (
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-orange-300 text-orange-600 rounded-lg text-xs hover:bg-orange-50 transition-colors">
                    <RotateCcw className="w-3 h-3" /> Rollback
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {[['Accuracy', `${m.accuracy}%`], ['Precision', `${m.precision}%`], ['Recall', `${m.recall}%`], ['F1 Score', `${m.f1Score}%`]].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-gray-500">{l}</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {confirmDeploy && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Deploy Model?</h3>
            <p className="text-xs text-gray-500 mb-4">This will activate {data.models.find(m => m.id === confirmDeploy)?.version} and archive the current active model. All new predictions will use this model.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeploy(null)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeploy} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">Deploy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SystemMonitoring() {
  const services = [
    { name: 'API Gateway', status: 'Operational', latency: '42ms', uptime: '99.9%' },
    { name: 'AI Prediction Service', status: 'Operational', latency: '1.2s', uptime: '99.7%' },
    { name: 'Database Service', status: 'Operational', latency: '8ms', uptime: '100%' },
    { name: 'Authentication Service', status: 'Operational', latency: '15ms', uptime: '99.9%' },
    { name: 'GIS/Map Service', status: 'Degraded', latency: '850ms', uptime: '97.2%' },
    { name: 'Email/Notification', status: 'Operational', latency: '320ms', uptime: '99.5%' },
  ];
  const statusColor = { Operational: 'bg-green-100 text-green-700', Degraded: 'bg-yellow-100 text-yellow-700', Down: 'bg-red-100 text-red-700' };
  const dotColor = { Operational: 'bg-green-500', Degraded: 'bg-yellow-500', Down: 'bg-red-500' };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-900">System Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map(s => (
          <div key={s.name} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dotColor[s.status]} ${s.status === 'Operational' ? 'animate-pulse' : ''}`} />
                <p className="text-xs font-semibold text-gray-900">{s.name}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[s.status]}`}>{s.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-[9px] text-gray-500">LATENCY</p><p className="text-xs font-bold text-gray-900">{s.latency}</p></div>
              <div><p className="text-[9px] text-gray-500">UPTIME</p><p className="text-xs font-bold text-gray-900">{s.uptime}</p></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100"><h3 className="text-sm font-semibold text-gray-900">Recent System Events</h3></div>
        <div className="divide-y divide-gray-50">
          {[
            { time: '2026-09-03 05:30', type: 'INFO', msg: 'System startup completed successfully' },
            { time: '2026-09-03 04:00', type: 'WARN', msg: 'GIS service latency spike detected — monitoring' },
            { time: '2026-09-02 23:00', type: 'INFO', msg: 'Daily backup completed — 2.4GB archived' },
            { time: '2026-09-02 20:00', type: 'INFO', msg: 'Model v2.4.1 prediction batch run completed' },
            { time: '2026-09-02 12:00', type: 'INFO', msg: 'Security audit scan completed — no issues found' },
          ].map((ev, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-2.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium flex-shrink-0 ${ev.type === 'WARN' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>{ev.type}</span>
              <p className="text-xs text-gray-700 flex-1">{ev.msg}</p>
              <span className="text-[10px] text-gray-400 flex-shrink-0">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Administration() {
  const [activeTab, setActiveTab] = useState('users');
  const { data } = useApp();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Administration</h1>
        <p className="text-xs text-gray-500 mt-0.5">Platform management and configuration</p>
      </div>
      <div className="flex overflow-x-auto gap-1 bg-white border border-gray-200 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${activeTab === id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'models' && <ModelManagement />}
      {activeTab === 'monitoring' && <SystemMonitoring />}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100"><h3 className="text-sm font-semibold text-gray-900">Role & Permissions Matrix</h3></div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-semibold text-gray-600 whitespace-nowrap">Resource</th>
                  {Object.keys(rolePermissions).map(r => <th key={r} className="text-center py-2 px-3 font-semibold text-gray-600 whitespace-nowrap">{r}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {['complaints', 'cases', 'predictions', 'reports', 'users'].map(res => (
                  <tr key={res} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-900 capitalize">{res}</td>
                    {Object.keys(rolePermissions).map(role => (
                      <td key={role} className="py-2 px-3 text-center">
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {(rolePermissions[role][res] || []).map(p => (
                            <span key={p} className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">{p}</span>
                          ))}
                          {(rolePermissions[role][res] || []).length === 0 && <span className="text-[9px] text-gray-300">—</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'config' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Prediction Thresholds</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.systemConfig.predictionThresholds).map(([level, val]) => (
                <div key={level}>
                  <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">{level} (%)</label>
                  <input type="number" defaultValue={val} min={0} max={100}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Save Configuration</button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Configuration History</h3>
            <div className="space-y-2">
              {data.systemConfig.configHistory.map((h, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1">
                    <p className="text-xs text-gray-700">{h.change}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{h.user} · {new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}