import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { Brain, Play, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const models = ['CrimePred v2.4.1 (Active)', 'CrimePred v2.5.0-beta', 'CrimePred v2.3.0'];

function generatePrediction(complaintId, location, model, txnSummary) {
  const score = Math.floor(60 + Math.random() * 38);
  const category = score >= 85 ? 'Critical' : score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low';
  const confidence = parseFloat((85 + Math.random() * 12).toFixed(1));
  const factors = [
    { factor: 'Unusual Transaction Amount', weight: Math.floor(25 + Math.random() * 15) },
    { factor: 'Repeated Transactions', weight: Math.floor(15 + Math.random() * 15) },
    { factor: 'High-Risk Location Pattern', weight: Math.floor(10 + Math.random() * 15) },
    { factor: 'Unusual Transaction Timing', weight: Math.floor(8 + Math.random() * 10) },
    { factor: 'Suspicious Transaction Pattern', weight: Math.floor(5 + Math.random() * 8) },
  ].sort((a, b) => b.weight - a.weight);

  return {
    complaintId,
    riskScore: score,
    riskCategory: category,
    confidence,
    predictedLocation: location || 'Delhi - Connaught Place',
    modelVersion: model.split(' (')[0],
    contributingFactors: factors,
    recommendedActions: [
      'Freeze associated accounts immediately',
      'Issue lookout notice for identified entities',
      'Coordinate with telecom providers for call records',
      'Contact IMEI tracking for device location',
    ],
    explanation: `The ML model analyzed transaction patterns across 47 features. The risk score of ${score}/100 indicates ${category.toLowerCase()} likelihood of organized cybercrime activity with ${confidence}% model confidence.`,
    inputFeatures: { transactionSummary: txnSummary, location, timeWindow: '7 days', model: model.split(' (')[0] },
  };
}

export default function RunPrediction() {
  const { data, addPrediction } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ complaintId: '', location: '', timeWindow: '7', model: models[0], txnSummary: '' });
  const [step, setStep] = useState('form'); // form | loading | result
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [progressMsg, setProgressMsg] = useState('');

  const locations = [...new Set(data.hotspots.map(h => h.location))];

  const handleRun = async (e) => {
    e.preventDefault();
    setStep('loading');
    setProgress(0);

    const messages = [
      'Extracting features from complaint data...',
      'Analyzing transaction patterns...',
      'Running ML model inference...',
      'Generating risk assessment...',
      'Compiling recommendation report...',
    ];

    for (let i = 0; i < messages.length; i++) {
      setProgressMsg(messages[i]);
      await new Promise(r => setTimeout(r, 700));
      setProgress((i + 1) * 20);
    }

    const pred = generatePrediction(form.complaintId, form.location, form.model, form.txnSummary);
    const saved = addPrediction(pred);
    setResult(saved);
    setStep('result');
  };

  const riskColor = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' };

  if (step === 'loading') return (
    <div className="max-w-lg mx-auto mt-12 text-center space-y-6">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
        <Brain className="w-8 h-8 text-purple-600 animate-pulse" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Running AI Prediction</h2>
        <p className="text-sm text-gray-500">{progressMsg}</p>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className="h-2.5 bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-gray-400">{progress}% complete</p>
    </div>
  );

  if (step === 'result' && result) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: riskColor[result.riskCategory] + '20' }}>
          {result.riskScore >= 70 ? <AlertTriangle className="w-5 h-5" style={{ color: riskColor[result.riskCategory] }} /> : <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Prediction Complete</h1>
          <p className="text-xs text-gray-500 font-mono">{result.id}</p>
        </div>
      </div>

      {/* Risk Score Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">RISK ASSESSMENT</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold" style={{ color: riskColor[result.riskCategory] }}>{result.riskScore}</span>
              <span className="text-gray-400 text-sm">/100</span>
              <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ backgroundColor: riskColor[result.riskCategory] + '20', color: riskColor[result.riskCategory] }}>{result.riskCategory} Risk</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">CONFIDENCE</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{result.confidence}%</p>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="h-3 rounded-full transition-all" style={{ width: `${result.riskScore}%`, backgroundColor: riskColor[result.riskCategory] }} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-500">PREDICTED LOCATION</p>
            <p className="text-xs font-semibold text-gray-900 mt-0.5">{result.predictedLocation}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-500">MODEL VERSION</p>
            <p className="text-xs font-semibold text-gray-900 mt-0.5">{result.modelVersion}</p>
          </div>
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Contributing Factors</h3>
        <div className="space-y-2.5">
          {result.contributingFactors.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-700 w-48 flex-shrink-0">{f.factor}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${f.weight}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-900 w-8 text-right">{f.weight}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">AI Explanation</h3>
        <p className="text-xs text-purple-800 leading-relaxed">{result.explanation}</p>
      </div>

      {/* Recommended Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommended Actions</h3>
        <div className="space-y-2">
          {result.recommendedActions.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-xs text-gray-700">{a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate(`/predictions/${result.id}`)} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">View Full Details</button>
        <button onClick={() => { setStep('form'); setResult(null); }} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">Run Another</button>
        <button onClick={() => navigate('/cases/create')} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Create Case</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Run AI Prediction</h1>
        <p className="text-xs text-gray-500 mt-0.5">Select a complaint or enter features to run the prediction model</p>
      </div>

      <form onSubmit={handleRun} className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Input Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Complaint (Optional)</label>
              <select value={form.complaintId} onChange={e => setForm(f => ({ ...f, complaintId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">-- Manual Input --</option>
                {data.complaints.map(c => <option key={c.id} value={c.id}>{c.id} - {c.category}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Target Location</label>
              <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select location...</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Time Window (days)</label>
              <select value={form.timeWindow} onChange={e => setForm(f => ({ ...f, timeWindow: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {['3', '7', '14', '30'].map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Model Selection</label>
              <select value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Transaction Summary (Optional)</label>
            <textarea value={form.txnSummary} onChange={e => setForm(f => ({ ...f, txnSummary: e.target.value }))} rows={3}
              placeholder="Brief description of transaction patterns, amounts, methods..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>
        </div>

        {/* Feature Preview */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">Feature Preview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { label: 'Complaint', value: form.complaintId || 'Manual' },
              { label: 'Location', value: form.location || 'Not set' },
              { label: 'Time Window', value: `${form.timeWindow} days` },
              { label: 'Model', value: form.model.split(' (')[0] },
              { label: 'Features', value: '47 extracted' },
              { label: 'Dataset', value: '48,231 cases' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/70 rounded-lg p-2">
                <p className="text-[9px] text-purple-600 font-medium">{label}</p>
                <p className="text-xs text-purple-900 font-medium truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            <Play className="w-4 h-4" /> Run Prediction
          </button>
          <button type="button" onClick={() => navigate('/predictions')} className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}