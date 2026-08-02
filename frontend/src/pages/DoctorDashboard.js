import React, { useState, useEffect, useRef } from 'react';
import { getDoctorAppointments, updateAppointmentStatus, getDoctorPatients, getPatientDetail, createPrescription, sendDirectMessage, sendChatMessage } from '../services/authService';

const DOCTOR_PROMPTS = [
  { emoji: '📋', label: 'Summarize Symptoms', msg: 'Patient presents with fever 101F for 3 days with body ache' },
  { emoji: '🩺', label: 'Analyze Chest Pain', msg: 'Patient reports chest pain on exertion with shortness of breath' },
  { emoji: '💊', label: 'Review Diabetic History', msg: 'Diabetic patient HbA1c 8.5, on Metformin 500mg BD' },
  { emoji: '🧪', label: 'Analyze Low Hb', msg: 'Patient CBC shows low hemoglobin 9.2, MCV elevated' },
];

const STATUS_MAP = {
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Pending', icon: '🕐' },
  accepted: { bg: 'bg-green-50', text: 'text-green-700', label: 'Accepted', icon: '✅' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected', icon: '❌' },
  completed: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Completed', icon: '🏁' },
};

function DoctorDashboard() {
  const [tab, setTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Prescription form
  const [rxForm, setRxForm] = useState({ patientId: '', content: '', diagnosis: '' });
  const [rxLoading, setRxLoading] = useState(false);
  const [rxSuccess, setRxSuccess] = useState('');

  // Reply form
  const [replyTo, setReplyTo] = useState(null);
  const [replyMsg, setReplyMsg] = useState('');

  // Doctor AI Assistant Chat State
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      content: "👨‍⚕️ Welcome, Doctor!\n\nI'm your **clinical assistant**. I can help you:\n\n• 📋 **Summarize** patient symptoms\n• 🔍 **Highlight** key clinical findings\n• ⚠️ **Suggest** concern areas for investigation\n• 🚨 **Identify** red flags\n\nPaste or type patient details and I'll provide a structured clinical summary."
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiChatEndRef = useRef(null);

  useEffect(() => {
    if (tab === 'appointments') fetchAppointments();
    if (tab === 'patients') fetchPatients();
  }, [tab]);

  useEffect(() => {
    if (tab === 'ai_assistant') {
      aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, tab]);

  const fetchAppointments = async () => {
    setLoading(true); setError('');
    try { const r = await getDoctorAppointments(); setAppointments(r.data.appointments || []); setStats(r.data.stats || {}); }
    catch (e) { setError(e.response?.data?.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  const fetchPatients = async () => {
    setLoading(true); setError('');
    try { const r = await getDoctorPatients(); setPatients(r.data.patients || []); }
    catch (e) { setError(e.response?.data?.message || 'Failed to load patients'); }
    finally { setLoading(false); }
  };

  const openPatient = async (pid) => {
    setSelectedPatient(pid); setPatientDetail(null);
    try { const r = await getPatientDetail(pid); setPatientDetail(r.data); }
    catch (e) { setError('Failed to load patient details'); }
  };

  const handleStatus = async (id, status) => {
    setActionLoading(id);
    try { await updateAppointmentStatus(id, status); fetchAppointments(); }
    catch (e) { setError(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(null); }
  };

  const handlePrescription = async (e) => {
    e.preventDefault();
    if (!rxForm.patientId || !rxForm.content) return;
    setRxLoading(true); setRxSuccess('');
    try {
      await createPrescription(rxForm);
      setRxSuccess('✅ Prescription sent! Patient can now view simplified instructions.');
      setRxForm({ patientId: '', content: '', diagnosis: '' });
      setTimeout(() => setRxSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create prescription'); }
    finally { setRxLoading(false); }
  };

  const handleReply = async () => {
    if (!replyMsg.trim() || !replyTo) return;
    try { await sendDirectMessage(replyTo, replyMsg.trim()); setReplyMsg(''); setReplyTo(null); }
    catch (e) { setError('Failed to send reply'); }
  };

  const sendAiMessage = async (text) => {
    const msg = text || aiInput.trim();
    if (!msg || aiLoading) return;
    setAiMessages(prev => [...prev, { role: 'user', content: msg }]);
    setAiInput('');
    setAiLoading(true);
    try {
      const res = await sendChatMessage(msg);
      setAiMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, disclaimer: res.data.disclaimer }]);
    } catch (err) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', isError: true }]);
    } finally {
      setAiLoading(false);
    }
  };

  const formatAiContent = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ');
  };


  const statCards = [
    { label: 'Total', value: stats.total || 0, icon: '📊', color: 'bg-blue-500' },
    { label: 'Pending', value: stats.scheduled || 0, icon: '🕐', color: 'bg-amber-500' },
    { label: 'Accepted', value: stats.accepted || 0, icon: '✅', color: 'bg-green-500' },
    { label: 'Completed', value: stats.completed || 0, icon: '🏁', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold mb-1">👨‍⚕️ Doctor Dashboard</h1>
          <p className="text-indigo-200 text-sm">Manage patients, appointments & prescriptions</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error} <button onClick={() => setError('')} className="ml-2 text-red-400">✕</button></div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'appointments', label: '📅 Appointments' },
            { key: 'patients', label: '👥 Patients' },
            { key: 'prescribe', label: '📝 Write Prescription' },
            { key: 'ai_assistant', label: '🤖 AI Clinical Assistant' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                tab === t.key ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── APPOINTMENTS TAB ── */}
        {tab === 'appointments' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {statCards.map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{s.icon}</span>
                    <span className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>{s.value}</span>
                  </div>
                  <p className="text-gray-500 text-xs font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-5 animate-pulse"><div className="skeleton h-4 w-1/3 mb-2"/><div className="skeleton h-3 w-1/4"/></div>)}</div>
            : appointments.length === 0 ? <div className="text-center py-16"><span className="text-5xl block mb-3">📋</span><p className="text-gray-500">No appointments yet</p></div>
            : <div className="space-y-3">{appointments.map(apt => {
              const s = STATUS_MAP[apt.status] || STATUS_MAP.scheduled;
              return (
                <div key={apt._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-600">{apt.patientName?.charAt(0)}</div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{apt.patientName}</h3>
                        <p className="text-xs text-gray-400">{apt.patientAge ? `${apt.patientAge}y` : ''} {apt.patientGender || ''} {apt.patientPhone ? `• ${apt.patientPhone}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">📅 {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg">🕐 {apt.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 flex-1 hidden lg:block">{apt.reason}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.icon} {s.label}</span>
                    {apt.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatus(apt._id, 'accepted')} disabled={actionLoading === apt._id} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-xl disabled:opacity-50">✓ Accept</button>
                        <button onClick={() => handleStatus(apt._id, 'rejected')} disabled={actionLoading === apt._id} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200 disabled:opacity-50">✕ Reject</button>
                      </div>
                    )}
                    {apt.status === 'accepted' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatus(apt._id, 'completed')} disabled={actionLoading === apt._id} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl disabled:opacity-50">🏁 Complete</button>
                        <button onClick={() => { setTab('prescribe'); setRxForm(f => ({...f, patientId: apt.patientId})); }} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-200">📝 Prescribe</button>
                        <button onClick={() => setReplyTo(apt.patientId)} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl border border-blue-200">💬 Reply</button>
                      </div>
                    )}
                  </div>
                  {/* Quick Reply */}
                  {replyTo === apt.patientId && (
                    <div className="mt-3 flex gap-2 animate-fade-in">
                      <input type="text" value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder="Type reply..." className="form-input flex-1 text-sm" onKeyDown={e => e.key === 'Enter' && handleReply()} />
                      <button onClick={handleReply} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl">Send</button>
                      <button onClick={() => setReplyTo(null)} className="px-3 py-2 text-gray-400 text-sm">✕</button>
                    </div>
                  )}
                </div>
              );
            })}</div>}
          </>
        )}

        {/* ── PATIENTS TAB ── */}
        {tab === 'patients' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-sm">👥 My Patients ({patients.length})</h3></div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {loading ? <div className="p-4 space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl"/>)}</div>
                  : patients.length === 0 ? <div className="p-8 text-center"><span className="text-4xl">👥</span><p className="text-xs text-gray-400 mt-2">No patients yet</p></div>
                  : patients.map(p => (
                    <button key={p.id} onClick={() => openPatient(p.id)}
                      className={`w-full flex items-center gap-3 p-4 border-b border-gray-50 text-left transition-colors ${selectedPatient === p.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                      <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-600">{p.name?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.age ? `${p.age}y` : ''} {p.gender || ''} • {p.totalVisits} visit{p.totalVisits !== 1 ? 's' : ''}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              {!selectedPatient ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <span className="text-5xl block mb-3">👤</span>
                  <p className="text-gray-500">Select a patient to view their health history</p>
                </div>
              ) : !patientDetail ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-[3px] border-indigo-600 border-t-transparent rounded-full mx-auto"/>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* Patient Info */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600">{patientDetail.patient.name?.charAt(0)}</div>
                      <div>
                        <h2 className="text-lg font-extrabold text-gray-900">{patientDetail.patient.name}</h2>
                        <p className="text-sm text-gray-500">{patientDetail.patient.age ? `${patientDetail.patient.age} years` : ''} {patientDetail.patient.gender ? `• ${patientDetail.patient.gender}` : ''} • {patientDetail.patient.email}</p>
                      </div>
                      <button onClick={() => { setTab('prescribe'); setRxForm(f => ({...f, patientId: selectedPatient})); }}
                        className="ml-auto px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700">📝 Prescribe</button>
                    </div>
                  </div>

                  {/* Appointments History */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3">📅 Appointment History ({patientDetail.history.appointments.length})</h3>
                    {patientDetail.history.appointments.length === 0 ? <p className="text-sm text-gray-400">No appointments</p>
                    : <div className="space-y-2 max-h-48 overflow-y-auto">{patientDetail.history.appointments.map(a => (
                      <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_MAP[a.status]?.bg || 'bg-gray-100'} ${STATUS_MAP[a.status]?.text || 'text-gray-600'}`}>{a.status}</span>
                        <span className="text-gray-700 font-medium">{new Date(a.date).toLocaleDateString('en-IN')}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 flex-1 truncate">{a.reason}</span>
                      </div>
                    ))}</div>}
                  </div>

                  {/* Prescriptions */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3">💊 Prescriptions ({patientDetail.history.prescriptions.length})</h3>
                    {patientDetail.history.prescriptions.length === 0 ? <p className="text-sm text-gray-400">No prescriptions yet</p>
                    : <div className="space-y-2 max-h-48 overflow-y-auto">{patientDetail.history.prescriptions.map(p => (
                      <div key={p.id} className="p-3 bg-green-50 rounded-xl text-sm">
                        <div className="flex justify-between mb-1"><span className="font-bold text-green-800">{p.diagnosis || 'Prescription'}</span><span className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-IN')}</span></div>
                        <p className="text-green-700 text-xs whitespace-pre-line">{p.content.substring(0, 100)}...</p>
                      </div>
                    ))}</div>}
                  </div>

                  {/* Messages */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3">💬 Recent Messages ({patientDetail.history.messages.length})</h3>
                    {patientDetail.history.messages.length === 0 ? <p className="text-sm text-gray-400">No messages</p>
                    : <div className="space-y-2 max-h-40 overflow-y-auto">{patientDetail.history.messages.map(m => (
                      <div key={m.id} className={`p-2 rounded-xl text-xs ${m.isMine ? 'bg-indigo-50 text-indigo-700 text-right' : 'bg-gray-50 text-gray-700'}`}>
                        <span className="font-medium">{m.isMine ? 'You' : patientDetail.patient.name}:</span> {m.message}
                      </div>
                    ))}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PRESCRIBE TAB ── */}
        {tab === 'prescribe' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📝 Write Prescription</h2>
              {rxSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{rxSuccess}</div>}
              <form onSubmit={handlePrescription} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                  {patients.length > 0 ? (
                    <select value={rxForm.patientId} onChange={e => setRxForm({...rxForm, patientId: e.target.value})} className="form-input" required>
                      <option value="">Select patient</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name} {p.age ? `(${p.age}y)` : ''}</option>)}
                    </select>
                  ) : (
                    <input type="number" value={rxForm.patientId} onChange={e => setRxForm({...rxForm, patientId: e.target.value})} placeholder="Patient ID" className="form-input" required />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                  <input type="text" value={rxForm.diagnosis} onChange={e => setRxForm({...rxForm, diagnosis: e.target.value})} placeholder="e.g. Upper Respiratory Infection" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Content *</label>
                  <textarea value={rxForm.content} onChange={e => setRxForm({...rxForm, content: e.target.value})} rows="8"
                    placeholder={"Write prescription here, e.g.:\nTab. Paracetamol 500mg - BD - After food - 5 days\nTab. Azithromycin 500mg - OD - After food - 3 days\nSyrup Benadryl 5ml - TD - After food - 5 days\n\nAdvice:\n- Rest for 2 days\n- Drink warm water frequently\n- Follow up after 5 days"}
                    className="form-input font-mono text-sm" required />
                  <p className="text-xs text-gray-400 mt-1">✨ AI will automatically simplify this into easy-to-understand instructions for the patient</p>
                </div>
                <button type="submit" disabled={rxLoading} className="btn-primary w-full disabled:opacity-50">
                  {rxLoading ? 'Sending...' : '📤 Send Prescription to Patient'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── AI CLINICAL ASSISTANT TAB ── */}
        {tab === 'ai_assistant' && (
          <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
            {/* Disclaimer */}
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2">
              <span className="text-lg">🩺</span>
              <p className="text-indigo-800 text-xs leading-relaxed">
                <strong>Note:</strong> AI-assisted clinical summaries. Always apply clinical judgment. Do NOT rely on this for final diagnosis.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              
              {/* Messages Area */}
              <div className="h-[48vh] overflow-y-auto p-4 space-y-4">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%]">
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-xs">🩺</div>
                          <span className="text-xs font-semibold text-gray-500">Clinical Assistant</span>
                        </div>
                      )}
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-md'
                          : msg.isError ? 'bg-red-50 text-red-750 border border-red-200 rounded-bl-md'
                          : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-md'
                      }`}>
                        <div dangerouslySetInnerHTML={{ __html: formatAiContent(msg.content) }} />
                      </div>
                      {msg.disclaimer && <p className="text-[10px] text-gray-400 mt-1 px-2">{msg.disclaimer}</p>}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={aiChatEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {DOCTOR_PROMPTS.map((p, i) => (
                    <button key={i} type="button" onClick={() => sendAiMessage(p.msg)} disabled={aiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all whitespace-nowrap disabled:opacity-50 shadow-sm">
                      <span>{p.emoji}</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Box */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendAiMessage())}
                    placeholder="Enter patient symptoms or clinical history..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                    disabled={aiLoading} />
                  <button type="button" onClick={() => sendAiMessage()} disabled={aiLoading || !aiInput.trim()}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-md">
                    Send
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
