import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { ArrowLeft, Flag, AlertTriangle, MapPin, Clock, CreditCard, Smartphone, Globe, Link2 } from 'lucide-react';

export default function TransactionDetails() {
  const { id } = useParams();
  const { data, flagTransaction } = useApp();
  const navigate = useNavigate();

  const txn = data.transactions.find(t => t.id === id);
  const linkedTxns = data.transactions.filter(t => txn?.linkedTransactions?.includes(t.id));
  const complaint = txn ? data.complaints.find(c => c.id === txn.complaintId) : null;

  if (!txn) return (
    <div className="text-center py-16">
      <p className="text-gray-500 text-sm">Transaction not found</p>
      <button onClick={() => navigate('/transactions')} className="mt-3 text-blue-600 text-sm hover:underline">Back to transactions</button>
    </div>
  );

  const statusColors = { Suspicious: 'bg-orange-50 text-orange-700 border-orange-200', Flagged: 'bg-red-50 text-red-700 border-red-200', Normal: 'bg-green-50 text-green-700 border-green-200' };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/transactions')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4 text-gray-500" /></button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 font-mono">{txn.id}</h1>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[txn.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{txn.status}</span>
              {txn.flagged && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium border border-red-200">🚩 Flagged</span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{txn.type} Transaction · {txn.date} {txn.time}</p>
          </div>
        </div>
        <button onClick={() => flagTransaction(txn.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${txn.flagged ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
          <Flag className="w-3.5 h-3.5" /> {txn.flagged ? 'Unflag' : 'Flag Transaction'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Transaction Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaction Summary</h3>
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1 text-center">
                <p className="text-[10px] text-gray-500 mb-1">FROM</p>
                <p className="text-xs font-semibold text-gray-900">{txn.sender}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <div className="w-12 h-px bg-gray-300" />
                  <span className="text-[10px] font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">₹{txn.amount.toLocaleString()}</span>
                  <div className="w-12 h-px bg-gray-300" />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">{txn.type}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-[10px] text-gray-500 mb-1">TO</p>
                <p className="text-xs font-semibold text-gray-900">{txn.receiver}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Clock, label: 'Date & Time', value: `${txn.date} ${txn.time}` },
                { icon: CreditCard, label: 'Transaction Type', value: txn.type },
                { icon: MapPin, label: 'Location', value: txn.location },
                { icon: Globe, label: 'Channel', value: txn.channel },
                { icon: Globe, label: 'IP Address', value: txn.ipAddress },
                { icon: Smartphone, label: 'Device', value: txn.device },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div><p className="text-[10px] text-gray-500">{label}</p><p className="text-xs font-medium text-gray-900">{value}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Transactions */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Linked Transactions ({linkedTxns.length})</h3>
            </div>
            {linkedTxns.length === 0 ? (
              <div className="p-6 text-center"><p className="text-xs text-gray-500">No linked transactions</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {linkedTxns.map(lt => (
                  <div key={lt.id} onClick={() => navigate(`/transactions/${lt.id}`)} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-3.5 h-3.5 text-gray-400" />
                      <div>
                        <p className="text-xs font-mono text-blue-600">{lt.id}</p>
                        <p className="text-[10px] text-gray-500">{lt.sender} → {lt.receiver}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">₹{lt.amount.toLocaleString()}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${lt.flagged ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>{lt.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Risk Indicators</h3>
            {txn.flagged ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-700">Transaction flagged as suspicious</p>
                </div>
                <div className="space-y-1.5">
                  {['High-value transfer', 'Cross-state routing', 'Unknown receiver account'].map(risk => (
                    <div key={risk} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /><p className="text-xs text-gray-700">{risk}</p></div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-3">No risk flags detected</p>
            )}
          </div>

          {complaint && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Complaint</h3>
              <p className="text-xs font-mono text-blue-600 font-medium mb-1">{complaint.id}</p>
              <p className="text-xs text-gray-700 mb-2">{complaint.category}</p>
              <button onClick={() => navigate(`/complaints/${complaint.id}`)} className="w-full py-1.5 border border-blue-300 text-blue-600 rounded-lg text-xs hover:bg-blue-50 transition-colors">View Complaint</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}