import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { Loader2, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';

export default function CreateCase() {
  const { data, addCase } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', linkedComplaints: [], officer: '', assignedOfficers: [], priority: 'High', jurisdiction: '', dueDate: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const officers = data.users.filter(u => u.status === 'Active' && u.role !== 'ADMIN');

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Case title is required';
    if (form.linkedComplaints.length === 0) e.linkedComplaints = 'Select at least one complaint';
    if (!form.officer) e.officer = 'Assign a primary officer';
    if (!form.dueDate) e.dueDate = 'Set a due date';
    return e;
  };

  const toggleComplaint = (id) => {
    setForm(f => ({
      ...f,
      linkedComplaints: f.linkedComplaints.includes(id) ? f.linkedComplaints.filter(c => c !== id) : [...f.linkedComplaints, id],
    }));
    if (errors.linkedComplaints) setErrors(e => ({ ...e, linkedComplaints: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    const caseObj = addCase({
      ...form,
      officer: officers.find(o => o.id === form.officer)?.name || form.officer,
      officerId: form.officer,
      assignedOfficers: [officers.find(o => o.id === form.officer)?.name || form.officer],
      evidence: [],
      linkedTransactions: [],
      linkedPredictions: [],
    });
    setSuccess(caseObj);
    setSubmitting(false);
  };

  if (success) return (
    <div className="max-w-lg mx-auto mt-12 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Case Created!</h2>
      <p className="text-xs font-mono text-blue-600 font-semibold mb-6">{success.id}</p>
      <div className="flex justify-center gap-3">
        <button onClick={() => navigate(`/cases/${success.id}`)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">View Case</button>
        <button onClick={() => navigate('/cases')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Back to Cases</button>
      </div>
    </div>
  );

  const err = (k) => errors[k] && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[k]}</p>;
  const inputCls = (k) => `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[k] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Create Investigation Case</h1>
        <p className="text-xs text-gray-500 mt-0.5">Link complaints and assign officers to an investigation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Case Information</h3>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Case Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (errors.title) setErrors(e => ({ ...e, title: undefined })); }}
              placeholder="e.g. Organized Investment Fraud Ring - Karnataka"
              className={inputCls('title')} />
            {err('title')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className={inputCls('priority')}>
                {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Jurisdiction</label>
              <input value={form.jurisdiction} onChange={e => setForm(f => ({ ...f, jurisdiction: e.target.value }))} placeholder="State/district"
                className={inputCls('jurisdiction')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Primary Officer <span className="text-red-500">*</span></label>
              <select value={form.officer} onChange={e => { setForm(f => ({ ...f, officer: e.target.value })); if (errors.officer) setErrors(e => ({ ...e, officer: undefined })); }}
                className={inputCls('officer')}>
                <option value="">Select officer</option>
                {officers.map(o => <option key={o.id} value={o.id}>{o.name} ({o.role})</option>)}
              </select>
              {err('officer')}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Due Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.dueDate} onChange={e => { setForm(f => ({ ...f, dueDate: e.target.value })); if (errors.dueDate) setErrors(e => ({ ...e, dueDate: undefined })); }}
                min={new Date().toISOString().split('T')[0]}
                className={inputCls('dueDate')} />
              {err('dueDate')}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Objectives / Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
              placeholder="Describe investigation objectives, initial observations, or notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        {/* Link Complaints */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Link Complaints <span className="text-red-500">*</span></h3>
          {err('linkedComplaints')}
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {data.complaints.filter(c => !c.linkedCase || form.linkedComplaints.includes(c.id)).map(c => (
              <label key={c.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.linkedComplaints.includes(c.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="checkbox" checked={form.linkedComplaints.includes(c.id)} onChange={() => toggleComplaint(c.id)} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-600 font-medium">{c.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${c.priority === 'Critical' ? 'bg-red-50 text-red-600' : c.priority === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'}`}>{c.priority}</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-0.5 truncate">{c.category} — {c.location}</p>
                  <p className="text-[10px] text-gray-500">₹{c.amount.toLocaleString()} · {c.status}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <><Briefcase className="w-4 h-4" />Create Case</>}
          </button>
          <button type="button" onClick={() => navigate('/cases')} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}