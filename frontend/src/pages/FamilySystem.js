import React, { useState, useEffect } from 'react';
import { getFamilies, createFamily, addFamilyMember, deleteFamily, getFamilyMemberHealth } from '../services/authService';

function FamilySystem() {
  const [families, setFamilies]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [showCreate, setShowCreate]       = useState(false);
  const [showAddMember, setShowAddMember] = useState(null);   // familyId or null
  const [createName, setCreateName]       = useState('');
  const [memberForm, setMemberForm]       = useState({ identifier: '', relation: '', searchType: 'email' });
  const [formLoading, setFormLoading]     = useState(false);

  // Shared Health Modal States
  const [selectedMember, setSelectedMember]       = useState(null);
  const [memberHealthInfo, setMemberHealthInfo]   = useState(null);
  const [memberHealthLoading, setMemberHealthLoading] = useState(false);
  const [speaking, setSpeaking]                   = useState(false);
  const [activeHealthTab, setActiveHealthTab]     = useState('medicines'); // medicines, prescriptions, appointments

  useEffect(() => { 
    fetchFamilies(); 
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const res = await getFamilies();
      setFamilies(res.data.families || []);
    } catch {
      setError('Failed to load family groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setFormLoading(true);
    try {
      const res = await createFamily(createName.trim());
      setFamilies(prev => [...prev, res.data.family]);
      setCreateName('');
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberForm.identifier || !memberForm.relation) return;
    setFormLoading(true);
    setError('');
    try {
      // Send both fields — backend will decide which to use
      const payload = {
        groupId: showAddMember,
        relation: memberForm.relation,
        ...(memberForm.searchType === 'email'
          ? { email: memberForm.identifier }
          : { username: memberForm.identifier }),
      };
      await addFamilyMember(payload);
      setMemberForm({ identifier: '', relation: '', searchType: 'email' });
      setShowAddMember(null);
      fetchFamilies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setFormLoading(false);
    }
  };

  // BUG FIX: use Number() for consistent integer comparison
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this family group? All members will be removed.')) return;
    try {
      await deleteFamily(id);
      setFamilies(prev => prev.filter(f => Number(f._id) !== Number(id)));
    } catch {
      setError('Failed to delete group');
    }
  };

  const handleViewHealth = async (memberUser, relation) => {
    setSelectedMember({ ...memberUser, relation });
    setMemberHealthInfo(null);
    setMemberHealthLoading(true);
    setError('');
    setActiveHealthTab('medicines');
    try {
      const res = await getFamilyMemberHealth(memberUser.id);
      setMemberHealthInfo(res.data.healthInfo);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load member health information');
      setSelectedMember(null);
    } finally {
      setMemberHealthLoading(false);
    }
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

  const getRelationIcon = (relation) => {
    const r = (relation || '').toLowerCase();
    if (r === 'self') return '👤';
    if (r.includes('mother') || r.includes('mom')) return '👩';
    if (r.includes('father') || r.includes('dad')) return '👨';
    if (r.includes('wife') || r.includes('spouse')) return '💑';
    if (r.includes('husband')) return '💑';
    if (r.includes('son') || r.includes('daughter') || r.includes('child')) return '👶';
    if (r.includes('brother') || r.includes('sister') || r.includes('sibling')) return '👫';
    if (r.includes('grand')) return '👴';
    return '👥';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-purple-600 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-1">👨‍👩‍👧‍👦 Family Health</h1>
              <p className="text-violet-200 text-sm">Manage your family's health together</p>
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-5 py-2.5 bg-white text-violet-600 font-bold rounded-xl text-sm hover:bg-violet-50 transition-colors shadow-sm"
            >
              {showCreate ? '✕ Close' : '+ Create Group'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Create Group Form */}
        {showCreate && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Family Group</h2>
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                type="text"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                placeholder="e.g. Sharma Family"
                className="form-input flex-1"
                required
              />
              <button type="submit" disabled={formLoading} className="btn-primary disabled:opacity-50">
                {formLoading ? 'Creating...' : '✓ Create'}
              </button>
            </form>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMember && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowAddMember(null)}
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in shadow-2xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add Family Member</h2>
              <form onSubmit={handleAddMember} className="space-y-4">

                {/* Search Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search by</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMemberForm(f => ({ ...f, searchType: 'email', identifier: '' }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        memberForm.searchType === 'email'
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-violet-50'
                      }`}
                    >
                      📧 Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberForm(f => ({ ...f, searchType: 'username', identifier: '' }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        memberForm.searchType === 'username'
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-violet-50'
                      }`}
                    >
                      👤 Username
                    </button>
                  </div>
                </div>

                {/* Identifier Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {memberForm.searchType === 'email' ? 'Email Address *' : 'Full Name / Username *'}
                  </label>
                  <input
                    type={memberForm.searchType === 'email' ? 'email' : 'text'}
                    value={memberForm.identifier}
                    onChange={e => setMemberForm({ ...memberForm, identifier: e.target.value })}
                    placeholder={memberForm.searchType === 'email'
                      ? 'member@example.com'
                      : 'Enter full name as registered'}
                    className="form-input"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Member must have an Arogya Mitra account
                  </p>
                </div>

                {/* Relation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relation *</label>
                  <select
                    value={memberForm.relation}
                    onChange={e => setMemberForm({ ...memberForm, relation: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Select relation</option>
                    {['Spouse', 'Mother', 'Father', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandmother', 'Grandfather', 'Other'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={formLoading} className="flex-1 btn-primary disabled:opacity-50">
                    {formLoading ? 'Adding...' : '+ Add Member'}
                  </button>
                  <button type="button" onClick={() => setShowAddMember(null)} className="btn-ghost border border-gray-200">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Family Groups List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="skeleton h-6 w-1/3 mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map(j => (
                    <div key={j} className="skeleton h-16 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : families.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No family groups yet</h3>
            <p className="text-gray-400 mb-6">Create a family group to track everyone's health together</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">+ Create Your First Group</button>
          </div>
        ) : (
          <div className="space-y-6">
            {families.map((family, idx) => (
              <div
                key={family._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Group Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center text-xl">🏠</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{family.name}</h3>
                      <p className="text-xs text-gray-400">
                        {family.memberCount} member{family.memberCount !== 1 ? 's' : ''} · Created by {family.owner?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddMember(family._id)}
                      className="px-3 py-1.5 bg-violet-50 text-violet-600 text-xs font-bold rounded-lg hover:bg-violet-100 transition-colors"
                    >
                      + Add
                    </button>
                    <button
                      onClick={() => handleDelete(family._id)}
                      className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Members Grid */}
                <div className="p-5">
                  {family.members?.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No members yet. Add family members above.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {family.members?.map(member => (
                        <div 
                          key={member.id} 
                          onClick={() => handleViewHealth(member.user, member.relation)}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-violet-50 hover:border-violet-200 border border-transparent cursor-pointer transition-all duration-200 group shadow-sm"
                        >
                          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-lg group-hover:bg-white transition-colors">
                            {getRelationIcon(member.relation)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-violet-900">{member.user?.name}</p>
                            <p className="text-xs text-gray-400">
                              {member.relation}
                              {member.user?.age ? ` · ${member.user.age}y` : ''}
                              {member.user?.gender ? ` · ${member.user.gender}` : ''}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-1 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm animate-pulse">
                              🏥 Health
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Health Info Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={e => e.target === e.currentTarget && setSelectedMember(null)}
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-violet-700 to-purple-600 text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/10 shadow-sm">
                  {getRelationIcon(selectedMember.relation)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedMember.name}</h2>
                  <p className="text-xs text-violet-200">
                    Relation: {selectedMember.relation}
                    {selectedMember.age ? ` · ${selectedMember.age} years` : ''}
                    {selectedMember.gender ? ` · ${selectedMember.gender}` : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMember(null)} 
                className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {memberHealthLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin w-10 h-10 border-[3px] border-violet-600 border-t-transparent rounded-full mb-3" />
                  <p className="text-sm text-gray-500 font-semibold">Fetching shared health details...</p>
                </div>
              ) : !memberHealthInfo ? (
                <div className="text-center py-10">
                  <span className="text-5xl block mb-3">⚠️</span>
                  <p className="text-gray-500 font-semibold">No health records could be retrieved</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Contact details */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">📧 <span className="font-semibold text-gray-800">{selectedMember.email}</span></div>
                    {selectedMember.phone && <div className="flex items-center gap-1">📞 <span className="font-semibold text-gray-800">{selectedMember.phone}</span></div>}
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex border border-gray-100 bg-white rounded-xl p-1 shadow-sm">
                    {[
                      { id: 'medicines', label: '💊 Medicines', count: memberHealthInfo.medicines?.length || 0 },
                      { id: 'prescriptions', label: '📋 Prescriptions', count: memberHealthInfo.prescriptions?.length || 0 },
                      { id: 'appointments', label: '📅 Appointments', count: memberHealthInfo.appointments?.length || 0 }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveHealthTab(t.id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          activeHealthTab === t.id 
                            ? 'bg-violet-600 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                        }`}
                      >
                        <span>{t.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          activeHealthTab === t.id ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>{t.count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[250px]">
                    
                    {/* MEDICINES TAB */}
                    {activeHealthTab === 'medicines' && (
                      <div className="space-y-3 animate-fade-in">
                        {memberHealthInfo.medicines?.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <span className="text-4xl block mb-2">💊</span>
                            <p className="text-sm text-gray-400 font-medium">No active medicines logged</p>
                          </div>
                        ) : (
                          memberHealthInfo.medicines.map(med => (
                            <div key={med.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
                              <div className="space-y-1">
                                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                  <span className="text-lg">💊</span> {med.name}
                                </h4>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg font-bold">⏰ {med.time}</span>
                                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg font-bold">🥄 {med.dosage}</span>
                                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg font-bold">🔄 {med.frequency}</span>
                                </div>
                                {med.notes && <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-2 font-medium">{med.notes}</p>}
                              </div>
                              <span className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-xs">💚</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* PRESCRIPTIONS TAB */}
                    {activeHealthTab === 'prescriptions' && (
                      <div className="space-y-3 animate-fade-in">
                        {memberHealthInfo.prescriptions?.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <span className="text-4xl block mb-2">📋</span>
                            <p className="text-sm text-gray-400 font-medium">No prescriptions found</p>
                          </div>
                        ) : (
                          memberHealthInfo.prescriptions.map(rx => (
                            <div key={rx.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-gray-900 text-sm">{rx.diagnosis || 'Prescription'}</h4>
                                  <p className="text-[10px] text-gray-400">Dr. {rx.doctorName} • {rx.specialization} • {new Date(rx.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => speaking ? stopSpeaking() : speak(rx.aiSummary || rx.content)}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${
                                    speaking ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                                  }`}
                                >
                                  {speaking ? '⏹' : '🔊'}
                                </button>
                              </div>
                              
                              {rx.aiSummary && (
                                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/30 text-xs leading-relaxed">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] bg-green-100 px-2 py-0.5 rounded-md text-green-700 font-bold">✨ AI Simplified</span>
                                  </div>
                                  <div className="text-green-900 font-medium" dangerouslySetInnerHTML={{ __html: formatSummary(rx.aiSummary) }} />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* APPOINTMENTS TAB */}
                    {activeHealthTab === 'appointments' && (
                      <div className="space-y-3 animate-fade-in">
                        {memberHealthInfo.appointments?.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <span className="text-4xl block mb-2">📅</span>
                            <p className="text-sm text-gray-400 font-medium">No appointments logged</p>
                          </div>
                        ) : (
                          memberHealthInfo.appointments.map(apt => {
                            const isCompleted = apt.status === 'completed';
                            const isAccepted = apt.status === 'accepted';
                            const isRejected = apt.status === 'rejected';
                            return (
                              <div key={apt.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-950 text-xs truncate">Consultation with Dr. {apt.doctorName}</h4>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-[10px] text-gray-500 font-semibold truncate">{apt.specialization}</span>
                                  </div>
                                  <p className="text-xs text-gray-650 font-medium">{apt.reason}</p>
                                  <div className="flex gap-2 text-xs">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg font-bold">📅 {new Date(apt.date).toLocaleDateString('en-IN')}</span>
                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg font-bold">🕐 {apt.time}</span>
                                  </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap flex-shrink-0 ${
                                  isCompleted ? 'bg-purple-50 text-purple-700' :
                                  isAccepted ? 'bg-green-50 text-green-700' :
                                  isRejected ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {isCompleted ? '🏁 Completed' :
                                   isAccepted ? '✅ Accepted' :
                                   isRejected ? '❌ Rejected' : '🕐 Pending'}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default FamilySystem;
