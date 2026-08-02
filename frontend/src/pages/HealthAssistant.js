import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../services/authService';

const PATIENT_PROMPTS = [
  { emoji: '🤒', label: 'Fever', msg: 'I have a fever, what should I do?' },
  { emoji: '🤕', label: 'Headache', msg: 'I have a headache that won\'t go away' },
  { emoji: '🥗', label: 'Diet Tips', msg: 'Give me healthy diet suggestions' },
  { emoji: '😰', label: 'Stress', msg: 'I\'m feeling very stressed and anxious' },
  { emoji: '🤧', label: 'Cold', msg: 'I have cold and cough symptoms' },
  { emoji: '🤰', label: 'Pregnancy', msg: 'I am pregnant, give me health tips' },
];

const DOCTOR_PROMPTS = [
  { emoji: '📋', label: 'Summarize', msg: 'Patient presents with fever 101F for 3 days with body ache' },
  { emoji: '🩺', label: 'Symptoms', msg: 'Patient reports chest pain on exertion with shortness of breath' },
  { emoji: '💊', label: 'Follow-up', msg: 'Diabetic patient HbA1c 8.5, on Metformin 500mg BD' },
  { emoji: '🧪', label: 'Lab Review', msg: 'Patient CBC shows low hemoglobin 9.2, MCV elevated' },
];

function HealthAssistant() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const isDoctor = user.role === 'doctor';

  const [messages, setMessages] = useState([
    { role: 'assistant', content: isDoctor
      ? '👨‍⚕️ Welcome, Doctor!\n\nI\'m your **clinical assistant**. I can help you:\n\n• 📋 **Summarize** patient symptoms\n• 🔍 **Highlight** key clinical findings\n• ⚠️ **Suggest** concern areas for investigation\n\nPaste or type patient details and I\'ll provide a structured clinical summary.'
      : 'Hello! 👋 I\'m **Arogya Mitra**, your AI health assistant.\n\nI can help you with:\n• 🩺 General health advice\n• 🥗 Diet & nutrition tips\n• 🤰 Pregnancy guidance\n• ⚠️ When to see a doctor\n\nHow can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await sendChatMessage(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, disclaimer: res.data.disclaimer, mode: res.data.mode }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', isError: true }]);
    } finally { setLoading(false); }
  };

  const formatContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ');
  };

  const prompts = isDoctor ? DOCTOR_PROMPTS : PATIENT_PROMPTS;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${isDoctor ? 'bg-gradient-to-r from-indigo-700 to-indigo-600' : 'bg-gradient-to-r from-emerald-700 to-teal-600'} text-white py-8`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">{isDoctor ? '🩺' : '🤖'}</div>
            <div>
              <h1 className="text-3xl font-extrabold">{isDoctor ? 'Doctor AI Assistant' : 'AI Health Assistant'}</h1>
              <p className={`${isDoctor ? 'text-indigo-100' : 'text-emerald-100'} text-sm`}>
                {isDoctor ? 'Clinical summary & symptom analysis tool' : 'Powered by Arogya Mitra • Get instant health guidance'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Disclaimer */}
        <div className={`mb-4 p-3 ${isDoctor ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-200'} border rounded-xl flex items-start gap-2`}>
          <span className="text-lg">{isDoctor ? '🩺' : '⚕️'}</span>
          <p className={`${isDoctor ? 'text-indigo-800' : 'text-amber-800'} text-xs leading-relaxed`}>
            {isDoctor
              ? <><strong>Note:</strong> AI-assisted clinical summaries. Always apply clinical judgment. Do NOT rely on this for final diagnosis.</>
              : <><strong>Disclaimer:</strong> This AI provides general health information only. It does not diagnose or prescribe. Always consult a healthcare professional.</>
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Messages */}
          <div className="h-[50vh] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`w-6 h-6 ${isDoctor ? 'bg-indigo-100' : 'bg-emerald-100'} rounded-lg flex items-center justify-center text-xs`}>
                        {isDoctor ? '🩺' : '🤖'}
                      </div>
                      <span className="text-xs font-semibold text-gray-500">{isDoctor ? 'Clinical Assistant' : 'Arogya Mitra'}</span>
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? `${isDoctor ? 'bg-indigo-600' : 'bg-primary-600'} text-white rounded-br-md`
                      : msg.isError ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                      : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-md'
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                  </div>
                  {msg.disclaimer && <p className="text-[10px] text-gray-400 mt-1 px-2">{msg.disclaimer}</p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div>
                  <div className={`bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md`}>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {prompts.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p.msg)} disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-300 transition-all whitespace-nowrap disabled:opacity-50">
                  <span>{p.emoji}</span> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input + Ask Doctor */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder={isDoctor ? 'Enter patient symptoms or clinical info...' : 'Describe your symptoms or ask a health question...'}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                disabled={loading} />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                className={`px-5 py-3 ${isDoctor ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-primary-600 hover:bg-primary-700'} text-white font-semibold rounded-xl transition-all disabled:opacity-50`}>
                Send
              </button>
            </div>
            {/* Ask Doctor button for patients */}
            {!isDoctor && localStorage.getItem('token') && (
              <button onClick={() => navigate('/messages')}
                className="mt-3 w-full py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-xl text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                👨‍⚕️ Ask a Real Doctor — Send message directly
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthAssistant;
