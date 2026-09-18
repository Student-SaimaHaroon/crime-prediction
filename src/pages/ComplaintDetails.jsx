import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import {
  ArrowLeft, Brain, Briefcase, FileText, Clock, CheckCircle, AlertCircle,
  MapPin, DollarSign, User, Calendar, Shield, ExternalLink, ChevronDown
} from 'lucide-react';

const statusColors = { 'Registered': 'bg-blue-50 text-blue-700 border-blue-200', 'Under Investigation': 'bg-orange-50 text-orange-700 border-orange-200', 'Case Linked': 'bg-purple-50 text-purple-700 border-purple-200', 'Closed': 'bg-green-50 text-green-700 border-green-200', 'Under Review': 'bg-yellow-50 text-yellow-700 border-yellow-200' };
const priorityColors = { Critical: 'bg-red-50 text-red-700', High: 'bg-orange-50 text-orange-700', Medium: 'bg-yellow-50 text-yellow-700', Low: 'bg-green-50 text-green-700' };

export default function ComplaintDetails() {
  const { id } = useParams();
  const { data, updateComplaint } = useApp();
  const navigate = useNavigate();
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const complaint = data.complaints.find(c => c.id === id);
  const linkedTxns = data.transactions.filter(t => complaint?.linkedTransactions?.includes(t.id));
  const prediction = complaint?.predictionId ? data.predictions.find(p => p.id === complaint.predictionId) : null;
  const linkedCase = complaint?.linkedCase ? data.cases.find(c => c.id === complaint.linkedCase) : null;

  if (!complaint) return (
    <div className="text-center py-16">
      <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 text-sm">Complaint not found</p>
      <button onClick={() => navigate('/complaints')} className="mt-3 text-blue-600 text-sm hover:underline">Back to complaints</button>
    </div>
  );

  const handleStatusUpdate = async () => {
    if (!statusUpdate || statusUpdate === complaint.status) return;
    setUpdatingStatus(true);
    await new Promise(r => setTimeout(r, 800));
    updateComplaint(id, {
      status: statusUpdate,
      statusHistory: [...complaint.statusHistory, { status: statusUpdate, user: data.currentUser.name, timestamp: new Date().toISOString(), notes: statusNote }],
    });
    setStatusUpdate('');
    setStatusNote('');
    setUpdatingStatus(false);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/complaints')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 font-mono">{complaint.id}</h1>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[complaint.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{complaint.status}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[complaint.priority] || 'bg-gray-50 text-gray-600'}`}>{complaint.priority}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{complaint.category} · Reported on {complaint.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/predictions/run')} className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors">
            <Brain className="w-3.5 h-3.5" /> Run Prediction
          </button>
          {!complaint.linkedCase && (
            <button onClick={() => navigate('/cases/create')} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
              <Briefcase className="w-3.5 h-3.5" /> Create Case
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Incident Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Incident Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div><p className="text-[10px] text-gray-500">Complainant</p><p className="text-xs font-medium text-gray-900">{complaint.complainant}</p></div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div><p className="text-[10px] text-gray-500">Location</p><p className="text-xs font-medium text-gray-900">{complaint.location}</p></div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div><p className="text-[10px] text-gray-500">Incident Date & Time</p><p className="text-xs font-medium text-gray-900">{complaint.incidentDate} {complaint.incidentTime || ''}</p></div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div><p className="text-[10px] text-gray-500">Disputed Amount</p><p className="text-xs font-bold text-red-600">₹{complaint.amount.toLocaleString()}</p></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1 font-medium">DESCRIPTION</p>
              <p className="text-xs text-gray-700 leading-relaxed">{complaint.description}</p>
            </div>
          </div>

          {/* Linked Transactions */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Linked Transactions ({linkedTxns.length})</h3>
              <button onClick={() => navigate('/transactions')} className="text-xs text-blue-600 hover:underline">View all</button>
            </div>
            {linkedTxns.length === 0 ? (
              <div className="p-6 text-center"><p className="text-xs text-gray-500">No transactions linked yet</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {linkedTxns.map(t => (
                  <div key={t.id} onClick={() => navigate(`/transactions/${t.id}`)} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="text-xs font-mono text-blue-600 font-medium">{t.id}</p>
                      <p className="text-[10px] text-gray-500">{t.sender} → {t.receiver}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">₹{t.amount.toLocaleString()}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${t.flagged ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {complaint.statusHistory.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    {i < complaint.statusHistory.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-semibold text-gray-900">{h.status}</p>
                    <p className="text-[10px] text-gray-500">{h.user} · {new Date(h.timestamp).toLocaleString()}</p>
                    {h.notes && <p className="text-[10px] text-gray-600 mt-1 bg-gray-50 px-2 py-1 rounded">{h.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Update */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h3>
            <select value={statusUpdate || complaint.status} onChange={e => setStatusUpdate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['Registered', 'Under Investigation', 'Case Linked', 'Under Review', 'Closed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <textarea value={statusNote} onChange={e => setStatusNote(e.target.value)} placeholder="Add a note..." rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <button onClick={handleStatusUpdate} disabled={updatingStatus || !statusUpdate || statusUpdate === complaint.status}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {updatingStatus ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : 'Update Status'}
            </button>
          </div>

          {/* Prediction Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Prediction</h3>
            {prediction ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Risk Score</span>
                  <span className={`text-xs font-bold ${prediction.riskScore >= 85 ? 'text-red-600' : prediction.riskScore >= 70 ? 'text-orange-600' : 'text-yellow-600'}`}>{prediction.riskScore}/100</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${prediction.riskScore >= 85 ? 'bg-red-500' : prediction.riskScore >= 70 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                    style={{ width: `${prediction.riskScore}%` }} />
                </div>
                <p className="text-[10px] text-gray-500">Category: <span className="font-semibold text-gray-700">{prediction.riskCategory}</span></p>
                <button onClick={() => navigate(`/predictions/${prediction.id}`)} className="w-full py-1.5 border border-blue-300 text-blue-600 rounded-lg text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                  View Details <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-center py-3">
                <Brain className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 mb-2">{complaint.predictionStatus}</p>
                <button onClick={() => navigate('/predictions/run')} className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors">Run Prediction</button>
              </div>
            )}
          </div>

          {/* Linked Case */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Case</h3>
            {linkedCase ? (
              <div className="space-y-2">
                <p className="text-xs font-mono text-blue-600 font-medium">{linkedCase.id}</p>
                <p className="text-xs text-gray-700">{linkedCase.title}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${linkedCase.priority === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{linkedCase.priority}</span>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{linkedCase.status}</span>
                </div>
                <button onClick={() => navigate(`/cases/${linkedCase.id}`)} className="w-full py-1.5 border border-blue-300 text-blue-600 rounded-lg text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                  View Case <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-center py-3">
                <Briefcase className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 mb-2">No case linked yet</p>
                <button onClick={() => navigate('/cases/create')} className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">Create Case</button>
              </div>
            )}
          </div>

          {/* Evidence */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Evidence ({complaint.evidence?.length || 0})</h3>
            {complaint.evidence?.length > 0 ? (
              <div className="space-y-2">
                {complaint.evidence.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 truncate">{e}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">No evidence attached</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}