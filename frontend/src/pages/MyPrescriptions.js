import React, { useState, useEffect } from 'react';
import { getMyPrescriptions } from '../services/authService';

function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => { fetchPrescriptions(); }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await getMyPrescriptions();
      setPrescriptions(res.data.prescriptions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/\*\*/g, '').replace(/[🔍🛡️🥗⚠️💡📋💊⏰🍽️📅⚕️☀️🌅🌙]/g, '').replace(/---/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'en-IN'; utterance.rate = 0.85;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  const formatSummary = (text) => {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>').replace(/• /g, '&bull; ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold mb-1">📋 My Prescriptions</h1>
          <p className="text-green-100 text-sm">View prescriptions from your doctors — simplified by AI</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {loading ? (
          <div className="space-y-4">{[1,2].map(i => <div key={i} className="bg-white rounded-2xl p-6 animate-pulse"><div className="skeleton h-5 w-1/3 mb-3"/><div className="skeleton h-4 w-full mb-2"/><div className="skeleton h-4 w-2/3"/></div>)}</div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-7xl block mb-4">📋</span>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No prescriptions yet</h3>
            <p className="text-gray-400">When a doctor prescribes medicine for you, it will appear here with simple instructions</p>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map((rx, idx) => (
              <div key={rx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center text-xl">📋</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{rx.diagnosis || 'Prescription'}</h3>
                        <p className="text-xs text-gray-400">Dr. {rx.doctorName} • {rx.specialization} • {new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => speaking ? stopSpeaking() : speak(rx.aiSummary || rx.content)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${speaking ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'}`}>
                        {speaking ? '⏹' : '🔊'}
                      </button>
                      <button onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm bg-gray-100 text-gray-600 hover:bg-gray-200">
                        {expanded === rx.id ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Summary - Always visible */}
                {rx.aiSummary && (
                  <div className="p-5 bg-green-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-xs">✨</span>
                      <span className="text-sm font-bold text-green-800">Simplified by AI</span>
                    </div>
                    <div className="text-sm text-green-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatSummary(rx.aiSummary) }} />
                  </div>
                )}

                {/* Original Prescription - Expandable */}
                {expanded === rx.id && (
                  <div className="p-5 border-t border-gray-100 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs">📄</span>
                      <span className="text-sm font-bold text-gray-700">Original Prescription</span>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed border border-gray-100">{rx.content}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPrescriptions;
