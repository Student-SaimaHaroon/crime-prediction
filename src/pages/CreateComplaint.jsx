import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { FileText, Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const categories = ['Online Financial Fraud', 'UPI Fraud', 'Investment Fraud', 'Social Media Fraud', 'SIM Swap Fraud', 'Email Phishing', 'Ransomware', 'Identity Theft', 'Data Breach', 'Cyber Stalking'];
const locations = ['Mumbai, Maharashtra', 'Delhi, NCT', 'Bengaluru, Karnataka', 'Hyderabad, Telangana', 'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Pune, Maharashtra', 'Ahmedabad, Gujarat', 'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh'];

export default function CreateComplaint() {
  const { addComplaint } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    complainant: '', phone: '', category: '', incidentDate: '', incidentTime: '', location: '', description: '', amount: '',
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.complainant.trim()) e.complainant = 'Complainant name is required';
    if (!form.category) e.category = 'Please select a category';
    if (!form.incidentDate) e.incidentDate = 'Incident date is required';
    if (!form.location) e.location = 'Please select a location';
    if (!form.description.trim() || form.description.length < 30) e.description = 'Description must be at least 30 characters';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Please enter a valid amount';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    const complaint = addComplaint({
      ...form,
      amount: Number(form.amount),
      evidence: files.map(f => f.name),
      priority: Number(form.amount) >= 500000 ? 'Critical' : Number(form.amount) >= 100000 ? 'High' : Number(form.amount) >= 50000 ? 'Medium' : 'Low',
    });
    setSuccess(complaint);
    setSubmitting(false);
  };

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: undefined })); };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Complaint Registered!</h2>
        <p className="text-sm text-gray-500 mb-1">Your complaint has been successfully registered.</p>
        <p className="text-xs font-mono text-blue-600 font-semibold mb-6">{success.id}</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => navigate(`/complaints/${success.id}`)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">View Complaint</button>
          <button onClick={() => navigate('/complaints')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">Back to List</button>
        </div>
      </div>
    );
  }

  const Field = ({ label, required, error, children }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
  const inputClass = (err) => `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${err ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-transparent'}`;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Register New Complaint</h1>
        <p className="text-xs text-gray-500 mt-0.5">Fill in the details to register a cybercrime complaint</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Complainant Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-600 text-white rounded flex items-center justify-center text-[10px] font-bold">1</span>
            Complainant Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Complainant Name" required error={errors.complainant}>
              <input value={form.complainant} onChange={e => setField('complainant', e.target.value)} placeholder="Full name" className={inputClass(errors.complainant)} />
            </Field>
            <Field label="Phone Number">
              <input value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputClass()} />
            </Field>
          </div>
        </div>

        {/* Incident Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-600 text-white rounded flex items-center justify-center text-[10px] font-bold">2</span>
            Incident Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Complaint Category" required error={errors.category}>
              <select value={form.category} onChange={e => setField('category', e.target.value)} className={inputClass(errors.category)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Incident Location" required error={errors.location}>
              <select value={form.location} onChange={e => setField('location', e.target.value)} className={inputClass(errors.location)}>
                <option value="">Select location</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Incident Date" required error={errors.incidentDate}>
              <input type="date" value={form.incidentDate} onChange={e => setField('incidentDate', e.target.value)} max={new Date().toISOString().split('T')[0]} className={inputClass(errors.incidentDate)} />
            </Field>
            <Field label="Incident Time">
              <input type="time" value={form.incidentTime} onChange={e => setField('incidentTime', e.target.value)} className={inputClass()} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description" required error={errors.description}>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={4} placeholder="Describe the incident in detail (minimum 30 characters)..."
                  className={inputClass(errors.description) + ' resize-none'} />
                <p className="text-[10px] text-gray-400 mt-1">{form.description.length} / 30 min characters</p>
              </Field>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-600 text-white rounded flex items-center justify-center text-[10px] font-bold">3</span>
            Financial Details
          </h3>
          <Field label="Disputed Amount (₹)" required error={errors.amount}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">₹</span>
              <input type="number" value={form.amount} onChange={e => setField('amount', e.target.value)} placeholder="0" min="1"
                className={inputClass(errors.amount) + ' pl-7'} />
            </div>
            {form.amount && Number(form.amount) > 0 && (
              <p className="text-xs text-gray-500 mt-1">Priority will be automatically set based on amount:
                <span className={`ml-1 font-medium ${Number(form.amount) >= 500000 ? 'text-red-600' : Number(form.amount) >= 100000 ? 'text-orange-600' : 'text-yellow-600'}`}>
                  {Number(form.amount) >= 500000 ? 'Critical' : Number(form.amount) >= 100000 ? 'High' : 'Medium'}
                </span>
              </p>
            )}
          </Field>
        </div>

        {/* Evidence */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-600 text-white rounded flex items-center justify-center text-[10px] font-bold">4</span>
            Evidence Upload
          </h3>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
            onClick={() => document.getElementById('evidence-upload').click()}
          >
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Click to upload evidence files</p>
            <p className="text-xs text-gray-400 mt-1">Screenshots, PDFs, call recordings (Max 10MB each)</p>
            <input id="evidence-upload" type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files))} />
          </div>
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <button type="button" onClick={() => navigate('/complaints')} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}