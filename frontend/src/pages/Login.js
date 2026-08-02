import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

// Quick-fill test doctor accounts
const TEST_DOCTORS = [
  { label: 'Dr. Arjun',  email: 'arjun.sharma.doc@gmail.com', dept: 'Cardiology' },
  { label: 'Dr. Meena',  email: 'meena.patel.doc@gmail.com',  dept: 'Pediatrics' },
  { label: 'Dr. Vikram', email: 'vikram.nair.doc@gmail.com',  dept: 'Neurology' },
  { label: 'Dr. Sarah',  email: 'dr.sarah@arogya.com',        dept: 'Pediatrics' },
  { label: 'Dr. Priya',  email: 'dr.priya@arogya.com',        dept: 'Gynecology' },
  { label: 'Dr. Arun',   email: 'dr.arun@arogya.com',         dept: 'General' },
];

// Quick-fill test patient accounts (no password needed)
const TEST_PATIENTS = [
  { label: 'Rahul',  email: 'rahul.patient@test.com',  age: '28y · Male' },
  { label: 'Priya',  email: 'priya.patient@test.com',  age: '32y · Female' },
  { label: 'Amit',   email: 'amit.patient@test.com',   age: '45y · Male' },
];

function Login({ setIsLoggedIn }) {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const identifier = form.email.trim();
    if (!identifier) { setError('Please enter your email or username'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await loginUser({ email: identifier, password: form.password || undefined });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsLoggedIn(true);
      if (res.data.user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickFillDoctor = (acc) => {
    setForm({ email: acc.email, password: 'Doctor@123' });
    setError('');
  };

  const quickFillPatient = (acc) => {
    setForm({ email: acc.email, password: '' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-primary-200">
            🏥
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to Arogya Mitra</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">📧</span>
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="form-input pl-10"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-gray-400 font-normal text-xs">(leave blank for legacy accounts)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="form-input pl-10 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 rounded-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : '→ Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* ── Doctor Quick-fill ── */}
        <div className="mt-6 bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">👨‍⚕️</span>
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Test Doctor Accounts</p>
              <p className="text-[10px] text-amber-600">Password: <strong>Doctor@123</strong></p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TEST_DOCTORS.map(acc => (
              <button
                key={acc.label}
                type="button"
                onClick={() => quickFillDoctor(acc)}
                className="flex flex-col items-start px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all text-left group"
              >
                <span className="text-xs font-bold text-amber-900 group-hover:text-amber-700">{acc.label}</span>
                <span className="text-[10px] text-amber-600">{acc.dept}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-amber-500 mt-2 text-center">Click → auto-fills email + password</p>
        </div>

        {/* ── Patient Quick-fill ── */}
        <div className="mt-3 bg-white rounded-2xl border border-green-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🧑‍🦱</span>
            <div>
              <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Test Patient Accounts</p>
              <p className="text-[10px] text-green-600">No password needed — just click &amp; sign in</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TEST_PATIENTS.map(acc => (
              <button
                key={acc.label}
                type="button"
                onClick={() => quickFillPatient(acc)}
                className="flex flex-col items-start px-3 py-2 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 transition-all text-left group"
              >
                <span className="text-xs font-bold text-green-900 group-hover:text-green-700">{acc.label}</span>
                <span className="text-[10px] text-green-600">{acc.age}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-green-500 mt-2 text-center">Click → auto-fills email, leave password blank</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
