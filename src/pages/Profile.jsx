import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Eye, EyeOff, CheckCircle, LogOut, Edit2, Save, X } from 'lucide-react';

export default function Profile() {
  const { data, updateData, logout, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: data.currentUser.name, email: data.currentUser.email, phone: data.currentUser.phone, department: data.currentUser.department });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    updateData(prev => ({ ...prev, currentUser: { ...prev.currentUser, ...form } }));
    setEditing(false);
    setSaving(false);
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.current !== 'Admin@123') { setPwError('Current password is incorrect'); return; }
    if (pwForm.new.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    if (pwForm.new !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    await new Promise(r => setTimeout(r, 800));
    setPwSuccess(true);
    setPwForm({ current: '', new: '', confirm: '' });
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const passwordStrength = (p) => {
    if (!p) return { score: 0, label: '', color: '' };
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const map = { 0: { label: '', color: '' }, 1: { label: 'Weak', color: 'bg-red-500' }, 2: { label: 'Fair', color: 'bg-yellow-500' }, 3: { label: 'Good', color: 'bg-blue-500' }, 4: { label: 'Strong', color: 'bg-green-500' } };
    return { score: s, ...map[s] };
  };

  const pwStrength = passwordStrength(pwForm.new);
  const unread = data.notifications.filter(n => !n.read);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 text-lg font-bold">{data.currentUser.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{data.currentUser.name}</h2>
              <p className="text-xs text-gray-500">{data.currentUser.role} · {data.currentUser.department}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-[10px] text-gray-500">Online</span>
                <span className="text-[10px] text-gray-400">· Last login: {new Date(data.currentUser.lastLogin).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
        {[{ id: 'profile', label: 'Profile', icon: User }, { id: 'security', label: 'Security', icon: Shield }, { id: 'notifications', label: `Notifications ${unread.length > 0 ? `(${unread.length})` : ''}`, icon: Bell }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${activeTab === id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                  {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{ label: 'Full Name', key: 'name' }, { label: 'Email', key: 'email' }, { label: 'Phone', key: 'phone' }, { label: 'Department', key: 'department' }].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
                {editing ? (
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">{data.currentUser[key] || '—'}</div>
                )}
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
              <div className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{data.currentUser.role}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Badge Number</label>
              <div className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900 font-mono">{data.currentUser.badge || 'CIU-2024-001'}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
          {pwSuccess && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-700">Password updated successfully!</p>
            </div>
          )}
          {pwError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-xs text-red-600">{pwError}</p></div>}
          <form onSubmit={handlePwChange} className="space-y-4 max-w-sm">
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password', key: 'new' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <input type={showPw[key] ? 'text' : 'password'} value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {key === 'new' && pwForm.new && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= pwStrength.score ? pwStrength.color : 'bg-gray-200'}`} />)}
                    </div>
                    {pwStrength.label && <p className="text-[10px] text-gray-500">Strength: <span className="font-medium">{pwStrength.label}</span></p>}
                    <div className="space-y-0.5">
                      {[
                        { label: '8+ characters', ok: pwForm.new.length >= 8 },
                        { label: 'Uppercase letter', ok: /[A-Z]/.test(pwForm.new) },
                        { label: 'Number', ok: /[0-9]/.test(pwForm.new) },
                        { label: 'Special character', ok: /[^A-Za-z0-9]/.test(pwForm.new) },
                      ].map(({ label, ok }) => (
                        <p key={label} className={`text-[10px] flex items-center gap-1 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                          <span>{ok ? '✓' : '○'}</span>{label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Update Password</button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">All Notifications</h3>
            <button onClick={markAllNotificationsRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
          </div>
          <div className="divide-y divide-gray-50">
            {data.notifications.map(n => {
              const severityColor = { critical: 'text-red-500', high: 'text-orange-500', medium: 'text-yellow-500', low: 'text-blue-500' };
              return (
                <div key={n.id} onClick={() => markNotificationRead(n.id)}
                  className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                      <span className={`text-[9px] font-medium ${severityColor[n.severity] || 'text-gray-400'}`}>● {n.severity}</span>
                    </div>
                    <p className="text-xs text-gray-600">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}