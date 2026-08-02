import React, { useState, useEffect, useRef } from 'react';
import { getPregnancyWeek, getAllPregnancyWeeks, sendChatMessage } from '../services/authService';

// ── Quick pregnancy chat prompts ────────────────────────────────────────────
const QUICK_PROMPTS = [
  { emoji: '🤢', label: 'Morning sickness', msg: 'I am pregnant and feeling nauseous with morning sickness. What should I do?' },
  { emoji: '🥗', label: 'Diet tips', msg: 'What should I eat during pregnancy? Give me a pregnancy diet plan.' },
  { emoji: '😴', label: 'Sleep tips', msg: 'I have trouble sleeping during pregnancy. What are safe tips?' },
  { emoji: '🏃', label: 'Exercise', msg: 'What exercises are safe during pregnancy?' },
  { emoji: '💊', label: 'Vitamins', msg: 'What vitamins and supplements should I take during pregnancy?' },
  { emoji: '⚠️', label: 'Warning signs', msg: 'What are the warning signs during pregnancy that I should rush to the hospital?' },
  { emoji: '🍌', label: 'Cravings', msg: 'I have food cravings during pregnancy. What is safe to eat?' },
  { emoji: '🧘', label: 'Stress relief', msg: 'How can I reduce stress and anxiety during pregnancy?' },
];

// ── Pregnancy Chatbot Component ─────────────────────────────────────────────
function PregnancyChatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! 🤰 I\'m your **Pregnancy Advisor**.\n\nI\'m here to help with questions about:\n• 🥗 Pregnancy nutrition & diet\n• 🤢 Managing morning sickness\n• 💊 Vitamins & supplements\n• 🏃 Safe exercises\n• ⚠️ Warning signs to watch\n• 😴 Sleep & wellness tips\n\nHow can I help you today? Remember to always consult your doctor for medical advice.'
    }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef            = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      // Prepend pregnancy context so the backend routes it to pregnancy responses
      const pregnancyMsg = msg.toLowerCase().includes('pregnan')
        ? msg
        : `I am pregnant. ${msg}`;
      const res = await sendChatMessage(pregnancyMsg);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.reply,
        disclaimer: res.data.disclaimer,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I couldn\'t reach the server. Please check your connection and try again.',
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (text) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ');

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🤰</div>
        <div>
          <h3 className="text-white font-bold text-base">Pregnancy Advisor</h3>
          <p className="text-pink-100 text-xs">AI-powered pregnancy guidance</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-[10px] text-white font-medium">
          <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span> Online
        </span>
      </div>

      {/* Disclaimer */}
      <div className="px-4 pt-3">
        <div className="p-2.5 bg-pink-50 border border-pink-200 rounded-xl flex items-start gap-2">
          <span className="text-sm flex-shrink-0">⚕️</span>
          <p className="text-pink-700 text-[10px] leading-relaxed">
            <strong>Important:</strong> This chatbot provides general information only and is not a substitute for professional medical advice. Always consult your obstetrician.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[88%]">
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 bg-pink-100 rounded-md flex items-center justify-center text-xs">🤰</div>
                  <span className="text-[10px] font-semibold text-gray-500">Pregnancy Advisor</span>
                </div>
              )}
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-pink-500 text-white rounded-br-md'
                  : msg.isError
                  ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                  : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md'
              }`}>
                <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
              </div>
              {msg.disclaimer && (
                <p className="text-[9px] text-gray-400 mt-1 px-2">{msg.disclaimer}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p.msg)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 border border-pink-200 rounded-full text-xs font-medium text-pink-700 hover:bg-pink-100 transition-all whitespace-nowrap disabled:opacity-50"
            >
              <span>{p.emoji}</span> {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Ask anything about your pregnancy..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Pregnancy Module ────────────────────────────────────────────────────
function PregnancyModule() {
  const [weeks, setWeeks]             = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(4);
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('guide'); // 'guide' | 'chatbot'

  useEffect(() => {
    getAllPregnancyWeeks()
      .then(res => setWeeks(res.data.weeks || []))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchWeek(selectedWeek); }, [selectedWeek]);

  const fetchWeek = async (week) => {
    setLoading(true);
    try {
      const res = await getPregnancyWeek(week);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.round((selectedWeek / 40) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold mb-1">🤰 Pregnancy Guide</h1>
          <p className="text-pink-100 text-sm">Week-by-week information &amp; your personal pregnancy advisor</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Tab Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-pink-50'
            }`}
          >
            📅 Weekly Guide
          </button>
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'chatbot'
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-pink-50'
            }`}
          >
            🤰 Pregnancy Advisor
          </button>
        </div>

        {/* ── CHATBOT TAB ── */}
        {activeTab === 'chatbot' && <PregnancyChatbot />}

        {/* ── WEEKLY GUIDE TAB ── */}
        {activeTab === 'guide' && (
          <>
            {/* Disclaimer */}
            <div className="mb-6 p-3 bg-pink-50 border border-pink-200 rounded-xl flex items-start gap-2">
              <span className="text-lg">🤰</span>
              <p className="text-pink-800 text-xs leading-relaxed">
                <strong>Disclaimer:</strong> This is general educational information. Always follow your obstetrician's specific advice for your pregnancy.
              </p>
            </div>

            {/* Week Selector */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Select Week</h2>
                <span className="text-sm font-semibold text-pink-600">Week {selectedWeek} of 40</span>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-4">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium">
                  <span>1st Trimester</span>
                  <span>2nd Trimester</span>
                  <span>3rd Trimester</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="1"
                max="40"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                className="w-full accent-pink-500"
              />

              {/* Quick Week Buttons */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {weeks.map(w => (
                  <button
                    key={w.week}
                    onClick={() => setSelectedWeek(w.week)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedWeek === w.week
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-pink-50'
                    }`}
                  >
                    W{w.week}
                  </button>
                ))}
              </div>
            </div>

            {/* Week Content */}
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="skeleton h-6 w-1/3 mb-4" />
                    <div className="skeleton h-4 w-full mb-2" />
                    <div className="skeleton h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : data?.data ? (
              <div className="space-y-6 animate-fade-in">
                {/* Title Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-3xl">🍼</div>
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">{data.data.title}</h2>
                      <p className="text-sm text-gray-500">Baby size: <span className="font-semibold text-pink-600">{data.data.babySize}</span></p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{data.data.development}</p>
                </div>

                {/* Symptoms */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-sm">🩺</span>
                    Common Symptoms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {data.data.symptoms?.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-800">
                        <span className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm">💡</span>
                    Tips &amp; Advice
                  </h3>
                  <div className="space-y-2">
                    {data.data.tips?.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-green-50 rounded-xl text-sm text-green-800">
                        <span className="font-bold text-green-600">✓</span> {t}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diet */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">🥗</span>
                    Recommended Diet
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {data.data.diet?.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl text-sm text-orange-800">
                        <span>🍎</span> {d}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chatbot CTA */}
                <div className="bg-gradient-to-r from-pink-50 to-fuchsia-50 border border-pink-200 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🤰</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">Have questions about Week {selectedWeek}?</p>
                    <p className="text-xs text-gray-500 mt-0.5">Chat with our Pregnancy Advisor for personalized guidance</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('chatbot')}
                    className="px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-xl hover:bg-pink-600 transition-colors whitespace-nowrap"
                  >
                    Ask Now →
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default PregnancyModule;
