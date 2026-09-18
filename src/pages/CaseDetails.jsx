import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { ArrowLeft, Plus, Clock, CheckCircle, AlertCircle, ExternalLink, User, MapPin, Brain, FileText, Send } from 'lucide-react';

const priorityColors = { Critical: 'bg-red-50 text-red-700 border-red-200', High: 'bg-orange-50 text-orange-700 border-orange-200', Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200', Low: 'bg-green-50 text-green-700 border-green-200' };
const statusColors = { Active: 'bg-blue-50 text-blue-700 border-blue-200', 'Under Review': 'bg-yellow-50 text-yellow-700 border-yellow-200', Closed: 'bg-green-50 text-green-700 border-green-200' };
const eventColors = { 'Case Created': 'bg-blue-500', 'Officer Assigned': 'bg-purple-500', 'Evidence Collected': 'bg-orange-500', 'Technical Analysis': 'bg-cyan-500', 'FIU Alert': 'bg-red-500', 'Victim Coordination': 'bg-yellow-500', 'Telecom Request': 'bg-green-500', 'Note Added': 'bg-gray-500', 'Status Updated': 'bg-indigo-500' };

export default function CaseDetails() {
  const { id } = useParams();
  const { data, updateCase, addCaseEvent } = useApp();
  const navigate = useNavigate();
  const [newEvent, setNewEvent] = useState({ type: 'Note Added', description: '', result: '' });
  const [addingEvent, setAddingEvent] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');

  const caseObj = data.cases.find(c => c.id === id);
  const complaints = data.complaints.filter(c => caseObj?.linkedComplaints?.includes(c.id));
  const predictions = data.predictions.filter(p => caseObj?.linkedPredictions?.includes(p.id));

  if (!caseObj) return (
    <div className="text-center py-16">
      <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 text-sm">Case not found</p>
      <button onClick={() => navigate('/cases')} className="mt-3 text-blue-600 text-sm hover:underline">Back to cases</button>
    </div>
  );

  const handleAddEvent = async () => {
    if (!newEvent.description.trim()) return;
    setAddingEvent(true);
    await new Promise(r => setTimeout(r, 500));
    addCaseEvent(id, { ...newEvent, user: data.currentUser.name });
    setNewEvent({ type: 'Note Added', description: '', result: '' });
    setAddingEvent(false);
  };

  const handleStatusUpdate = () => {
    if (!statusUpdate || statusUpdate === caseObj.status) return;
    updateCase(id, { status: statusUpdate });
    addCaseEvent(id, { type: 'Status Updated', description: `Status changed to ${statusUpdate}`, result: 'Completed', user: data.currentUser.name });
    setStatusUpdate('');
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/cases')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4 text-gray-500" /></button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900 font-mono">{caseObj.id}</h1>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${priorityColors[caseObj.priority] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{caseObj.priority}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[caseObj.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{caseObj.status}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{caseObj.title}</p>
          </div>
        </div>
        <button onClick={() => navigate('/predictions/run')} className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0">
          <Brain className="w-3.5 h-3.5" /> Run Prediction
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Case Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Case Summary</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div><p className="text-[10px] text-gray-500">Primary Officer</p><p className="text-xs font-medium text-gray-900">{caseObj.officer}</p></div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div><p className="text-[10px] text-gray-500">Jurisdiction</p><p className="text-xs font-medium text-gray-900">{caseObj.jurisdiction || 'Not specified'}</p></div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div><p className="text-[10px] text-gray-500">Due Date</p><p className="text-xs font-medium text-gray-900">{caseObj.dueDate}</p></div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div><p className="text-[10px] text-gray-500">Last Updated</p><p className="text-xs font-medium text-gray-900">{caseObj.lastUpdated}</p></div>
              </div>
            </div>
            {caseObj.notes && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 font-medium mb-1">NOTES</p>
                <p className="text-xs text-gray-700 leading-relaxed">{caseObj.notes}</p>
              </div>
            )}
          </div>

          {/* Investigation Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Investigation Timeline</h3>
            <div className="space-y-4 mb-4">
              {(caseObj.timeline || []).map((ev, i) => (
                <div key={ev.id || i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (eventColors[ev.type] || '#94a3b8') + '20' }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: eventColors[ev.type] || '#94a3b8' }} />
                    </div>
                    {i < caseObj.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" style={{ minHeight: '16px' }} />}
                  </div>
                  <div className="pb-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-gray-900">{ev.type}</p>
                      {ev.result && <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${ev.result === 'Success' || ev.result === 'Completed' ? 'bg-green-50 text-green-600' : ev.result === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>{ev.result}</span>}
                    </div>
                    <p className="text-[10px] text-gray-500">{ev.user} · {new Date(ev.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-gray-700 mt-1 bg-gray-50 px-2 py-1 rounded">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Event Form */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Add Event / Note</p>
              <div className="flex gap-2 mb-2">
                <select value={newEvent.type} onChange={e => setNewEvent(n => ({ ...n, type: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.keys(eventColors).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={newEvent.result} onChange={e => setNewEvent(n => ({ ...n, result: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Result...</option>
                  {['Success', 'Completed', 'In Progress', 'Pending', 'Failed'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <textarea value={newEvent.description} onChange={e => setNewEvent(n => ({ ...n, description: e.target.value }))} rows={2}
                  placeholder="Describe the action or observation..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                <button onClick={handleAddEvent} disabled={addingEvent || !newEvent.description.trim()}
                  className="px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-xs transition-colors flex items-center gap-1">
                  {addingEvent ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Control */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h3>
            <select value={statusUpdate || caseObj.status} onChange={e => setStatusUpdate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['Active', 'Under Review', 'Closed', 'Resolved'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleStatusUpdate} disabled={!statusUpdate || statusUpdate === caseObj.status}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors">
              Update
            </button>
          </div>

          {/* Linked Complaints */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Complaints ({complaints.length})</h3>
            {complaints.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-xs font-mono text-blue-600">{c.id}</p>
                  <p className="text-[10px] text-gray-500 truncate">{c.category}</p>
                </div>
                <button onClick={() => navigate(`/complaints/${c.id}`)} className="p-1 text-gray-400 hover:text-blue-600"><ExternalLink className="w-3 h-3" /></button>
              </div>
            ))}
          </div>

          {/* Linked Predictions */}
          {predictions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Predictions</h3>
              {predictions.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-xs font-mono text-purple-600">{p.id}</p>
                    <p className="text-[10px] text-gray-500">Risk: {p.riskScore}/100 · {p.riskCategory}</p>
                  </div>
                  <button onClick={() => navigate(`/predictions/${p.id}`)} className="p-1 text-gray-400 hover:text-purple-600"><ExternalLink className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}

          {/* Evidence */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Evidence ({caseObj.evidence?.length || 0})</h3>
            {caseObj.evidence?.length > 0 ? caseObj.evidence.map((e, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-gray-700 truncate">{e}</span>
              </div>
            )) : <p className="text-xs text-gray-500">No evidence attached</p>}
          </div>
        </div>
      </div>
    </div>
  );
}