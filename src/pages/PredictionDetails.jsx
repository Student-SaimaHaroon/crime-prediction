import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { ArrowLeft, MapPin, Shield, Brain, ExternalLink } from 'lucide-react';

const riskColors = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' };

export default function PredictionDetails() {
  const { id } = useParams();
  const { data } = useApp();
  const navigate = useNavigate();

  const pred = data.predictions.find(p => p.id === id);
  const complaint = pred ? data.complaints.find(c => c.id === pred.complaintId) : null;
  const relatedCase = pred ? data.cases.find(c => c.id === pred.caseId) : null;

  if (!pred) return (
    <div className="text-center py-16">
      <p className="text-gray-500 text-sm">Prediction not found</p>
      <button onClick={() => navigate('/predictions')} className="mt-3 text-blue-600 text-sm hover:underline">Back to predictions</button>
    </div>
  );

  const color = riskColors[pred.riskCategory];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/predictions')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4 text-gray-500" /></button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900 font-mono">{pred.id}</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: color + '20', color }}>{pred.riskCategory}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{pred.modelVersion} · {new Date(pred.timestamp).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Main Risk Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500">RISK SCORE</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold" style={{ color }}>{pred.riskScore}</span>
                  <span className="text-gray-400">/100</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">CONFIDENCE</p>
                <p className="text-3xl font-bold text-gray-900">{pred.confidence}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
              <div className="h-3 rounded-full" style={{ width: `${pred.riskScore}%`, backgroundColor: color }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500">PREDICTED LOCATION</p>
                <p className="text-xs font-semibold text-gray-900 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{pred.predictedLocation}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500">MODEL VERSION</p>
                <p className="text-xs font-semibold text-gray-900 flex items-center gap-1 mt-0.5"><Brain className="w-3 h-3" />{pred.modelVersion}</p>
              </div>
            </div>
          </div>

          {/* Input Features */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Input Features Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(pred.inputFeatures || {}).map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[9px] text-gray-500 uppercase font-medium">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-xs font-medium text-gray-900 mt-0.5">{String(v)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Factor Importance */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Factor Importance</h3>
            <div className="space-y-3">
              {pred.contributingFactors?.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-700 w-52 flex-shrink-0">{f.factor}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all" style={{ width: `${f.weight}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-xs font-bold text-gray-900 w-8 text-right">{f.weight}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {pred.explanation && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" /> AI Explanation
              </h3>
              <p className="text-xs text-purple-800 leading-relaxed">{pred.explanation}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommended Actions</h3>
            <div className="space-y-2">
              {pred.recommendedActions?.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 text-white" style={{ backgroundColor: color }}>{i + 1}</span>
                  <p className="text-xs text-gray-700">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {complaint && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Complaint</h3>
              <p className="text-xs font-mono text-blue-600">{complaint.id}</p>
              <p className="text-xs text-gray-700 mt-1">{complaint.category}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{complaint.location}</p>
              <button onClick={() => navigate(`/complaints/${complaint.id}`)} className="w-full mt-3 py-1.5 border border-blue-300 text-blue-600 rounded-lg text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                View Complaint <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {relatedCase && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Case</h3>
              <p className="text-xs font-mono text-blue-600">{relatedCase.id}</p>
              <p className="text-xs text-gray-700 mt-1 line-clamp-2">{relatedCase.title}</p>
              <button onClick={() => navigate(`/cases/${relatedCase.id}`)} className="w-full mt-3 py-1.5 border border-blue-300 text-blue-600 rounded-lg text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                View Case <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}