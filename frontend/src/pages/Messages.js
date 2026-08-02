import React, { useState, useEffect, useRef } from 'react';
import { getConversations, getChatThread, sendDirectMessage, getAvailableDoctors } from '../services/authService';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [showDoctors, setShowDoctors] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const chatEndRef = useRef(null);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await getConversations();
      setConversations(res.data.conversations || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openChat = async (partnerId) => {
    try {
      const res = await getChatThread(partnerId);
      setPartner(res.data.partner);
      setMessages(res.data.messages || []);
      setActiveChat(partnerId);
      setShowDoctors(false);
    } catch (err) { console.error(err); }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeChat || sendLoading) return;
    setSendLoading(true);
    try {
      await sendDirectMessage(activeChat, input.trim());
      setMessages(prev => [...prev, { id: Date.now(), message: input.trim(), isMine: true, createdAt: new Date().toISOString() }]);
      setInput('');
    } catch (err) { console.error(err); }
    finally { setSendLoading(false); }
  };

  const loadDoctors = async () => {
    try {
      const res = await getAvailableDoctors();
      setDoctors(res.data.doctors || []);
      setShowDoctors(true);
      setActiveChat(null);
    } catch (err) { console.error(err); }
  };

  const startChatWithDoctor = (doctorUserId) => {
    openChat(doctorUserId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-1">💬 Messages</h1>
              <p className="text-blue-200 text-sm">{user.role === 'doctor' ? 'Patient messages' : 'Chat with doctors'}</p>
            </div>
            {user.role !== 'doctor' && (
              <button onClick={loadDoctors} className="px-5 py-2.5 bg-white text-blue-600 font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-sm">
                👨‍⚕️ Find Doctor
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Left: Conversations List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Conversations</h3>
              </div>

              {/* Doctor List */}
              {showDoctors && (
                <div className="p-3 bg-blue-50 border-b border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 mb-2">Available Doctors:</p>
                  {doctors.length === 0 ? (
                    <p className="text-xs text-blue-500">No doctors available yet</p>
                  ) : (
                    <div className="space-y-2">
                      {doctors.map(d => (
                        <button key={d.userId} onClick={() => startChatWithDoctor(d.userId)}
                          className="w-full flex items-center gap-2 p-2 bg-white rounded-xl text-left hover:bg-blue-50 transition-colors">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">👨‍⚕️</div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{d.name}</p>
                            <p className="text-[10px] text-gray-400">{d.specialization} • {d.experience}y exp</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="max-h-[50vh] overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="text-4xl block mb-2">💬</span>
                    <p className="text-xs text-gray-400">No conversations yet</p>
                    {user.role !== 'doctor' && <button onClick={loadDoctors} className="text-xs text-primary-600 font-semibold mt-2">Find a doctor →</button>}
                  </div>
                ) : (
                  conversations.map(conv => (
                    <button key={conv.partner.id} onClick={() => openChat(conv.partner.id)}
                      className={`w-full flex items-center gap-3 p-4 border-b border-gray-50 text-left transition-colors ${
                        activeChat === conv.partner.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                      }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                        conv.partner.role === 'doctor' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {conv.partner.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900 truncate">{conv.partner.name}</p>
                          {conv.unread > 0 && <span className="w-5 h-5 bg-primary-600 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{conv.unread}</span>}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Chat Area */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[70vh] flex flex-col">
              {!activeChat ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl block mb-3">💬</span>
                    <h3 className="text-lg font-bold text-gray-700">Select a conversation</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {user.role === 'doctor' ? 'Select a patient to view their messages' : 'Choose a doctor to start chatting'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                    <button onClick={() => setActiveChat(null)} className="md:hidden w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-sm">←</button>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                      partner?.role === 'doctor' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {partner?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{partner?.name}</p>
                      <p className="text-[10px] text-gray-400">{partner?.role === 'doctor' ? '👨‍⚕️ Doctor' : '🧑 Patient'} • {partner?.email}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.isMine
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}>
                          {msg.message}
                          <div className={`text-[10px] mt-1 ${msg.isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={user.role === 'doctor' ? 'Reply to patient...' : 'Type your message...'}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        disabled={sendLoading}
                      />
                      <button onClick={handleSend} disabled={sendLoading || !input.trim()} className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                        {sendLoading ? '...' : '→'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
