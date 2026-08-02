import React, { useState, useEffect } from 'react';
import { getMedicines, addMedicine, deleteMedicine, toggleMedicine } from '../services/authService';

const TIME_OPTIONS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM',
];

const FREQ_OPTIONS = ['daily', 'twice daily', 'thrice daily', 'weekly', 'as needed'];

function MedicineReminder() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', dosage: '', time: '08:00 AM', frequency: 'daily', notes: '' });

  useEffect(() => { fetchMedicines(); }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await getMedicines();
      setMedicines(res.data.medicines || []);
    } catch (err) {
      setError('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.time) {
      setError('Name, dosage, and time are required');
      return;
    }
    setFormLoading(true);
    setError('');
    try {
      const res = await addMedicine(form);
      setMedicines(prev => [...prev, res.data.medicine]);
      setForm({ name: '', dosage: '', time: '08:00 AM', frequency: 'daily', notes: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine reminder?')) return;
    try {
      await deleteMedicine(id);
      setMedicines(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleMedicine(id);
      setMedicines(prev => prev.map(m => m.id === id ? res.data.medicine : m));
    } catch (err) {
      setError('Failed to toggle');
    }
  };

  const getTimeIcon = (time) => {
    if (time.includes('AM') && parseInt(time) < 12) return '🌅';
    if (time.includes('PM') && parseInt(time) < 5) return '☀️';
    return '🌙';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-1">💊 Medicine Reminders</h1>
              <p className="text-pink-100 text-sm">Never miss a dose — track your medications</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-white text-pink-600 font-bold rounded-xl text-sm hover:bg-pink-50 transition-colors shadow-sm"
            >
              {showForm ? '✕ Close' : '+ Add Medicine'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Medicine Reminder</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Paracetamol" className="form-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
                  <input type="text" value={form.dosage} onChange={e => setForm({...form, dosage: e.target.value})}
                    placeholder="e.g. 500mg, 1 tablet" className="form-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <select value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="form-input">
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="form-input">
                    {FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="e.g. Take after food" className="form-input" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={formLoading} className="btn-primary disabled:opacity-50">
                  {formLoading ? 'Adding...' : '💊 Add Reminder'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost border border-gray-200">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Medicine List */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
              <div className="flex gap-4"><div className="skeleton w-14 h-14 rounded-2xl"/><div className="flex-1 space-y-2"><div className="skeleton h-4 w-1/3"/><div className="skeleton h-3 w-1/4"/></div></div>
            </div>
          ))}</div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">💊</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No medicines added</h3>
            <p className="text-gray-400 mb-6">Add your prescribed medicines to get timely reminders</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">+ Add Your First Medicine</button>
          </div>
        ) : (
          <div className="space-y-3">
            {medicines.map((med, idx) => (
              <div
                key={med.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all animate-fade-in-up ${
                  med.active ? 'border-gray-100 hover:shadow-md' : 'border-gray-200 opacity-60'
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                    med.active ? 'bg-pink-100' : 'bg-gray-100'
                  }`}>
                    {getTimeIcon(med.time)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{med.name}</h3>
                      {!med.active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Paused</span>}
                    </div>
                    <p className="text-sm text-gray-500">{med.dosage} • {med.time} • {med.frequency}</p>
                    {med.notes && <p className="text-xs text-gray-400 mt-1">📌 {med.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(med.id)} className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${
                      med.active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`} title={med.active ? 'Pause' : 'Resume'}>
                      {med.active ? '⏸' : '▶️'}
                    </button>
                    <button onClick={() => handleDelete(med.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-sm bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicineReminder;
