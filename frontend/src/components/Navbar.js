import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

function Navbar({ isLoggedIn, onLogout, onLanguageChange }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef(null);
  const moreRef = useRef(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMenuOpen(false); setMoreOpen(false); }, [location]);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative text-sm font-medium transition-colors duration-200 ${
      isActive(path) ? 'text-white' : 'text-primary-100 hover:text-white'
    }`;

  const activeUnderline = (path) =>
    isActive(path)
      ? 'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-white after:rounded-full'
      : '';

  const moreItems = [
    { to: '/health-assistant', label: '🤖 AI Assistant', show: true },
    { to: '/messages', label: '💬 Messages', show: isLoggedIn },
    { to: '/my-prescriptions', label: '📋 Prescriptions', show: isLoggedIn && user.role !== 'doctor' },
    { to: '/medicine', label: '💊 Medicine', show: isLoggedIn },
    { to: '/prescription-scan', label: '📄 Scan Rx', show: isLoggedIn },
    { to: '/pregnancy', label: '🤰 Pregnancy', show: true },
    { to: '/family', label: '👨‍👩‍👧‍👦 Family', show: isLoggedIn },
    { to: '/doctor-dashboard', label: '👨‍⚕️ Dr. Dashboard', show: isLoggedIn && user.role === 'doctor' },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-primary-700 shadow-lg shadow-primary-900/20' : 'bg-gradient-to-r from-primary-700 to-primary-600'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <span className="text-xl">🏥</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none block">{t('common.appName')}</span>
              <span className="text-primary-200 text-[10px] leading-none">{t('common.tagline')}</span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-5">

            {/* Only show full nav links when logged in */}
            {isLoggedIn && (
              <>
                <Link to="/" className={`${navLinkClass('/')} ${activeUnderline('/')}`}>{t('nav.home')}</Link>
                <Link to="/doctors" className={`${navLinkClass('/doctors')} ${activeUnderline('/doctors')}`}>{t('nav.doctors')}</Link>
                <Link to="/health-assistant" className={`${navLinkClass('/health-assistant')} ${activeUnderline('/health-assistant')}`}>🤖 AI</Link>
                <Link to="/appointments" className={`${navLinkClass('/appointments')} ${activeUnderline('/appointments')}`}>{t('nav.appointments')}</Link>

                {/* More Dropdown */}
                <div className="relative" ref={moreRef}>
                  <button onClick={() => setMoreOpen(!moreOpen)} className="text-sm font-medium text-primary-100 hover:text-white transition-colors flex items-center gap-1">
                    More
                    <svg className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {moreOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fade-in z-50">
                      {moreItems.filter(i => i.show).map(item => (
                        <Link key={item.to} to={item.to} className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                          isActive(item.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link to="/profile" className={`${navLinkClass('/profile')} ${activeUnderline('/profile')}`}>{t('nav.profile')}</Link>
              </>
            )}

            {/* Language Selector — always visible */}
            <div className={isLoggedIn ? 'border-l border-primary-500 pl-4' : ''}>
              <LanguageSelector onLanguageChange={onLanguageChange} />
            </div>

            {/* Auth buttons */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                    {user.firstName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="text-white text-sm font-medium">{user.firstName}</span>
                </div>
                <button onClick={onLogout} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              /* Not logged in: show ONLY Login button */
              <Link
                to="/login"
                className="bg-white text-primary-700 hover:bg-primary-50 text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {menuOpen && (
          <div ref={menuRef} className="md:hidden pb-4 border-t border-primary-500/50 mt-1 animate-fade-in">
            <div className="flex flex-col gap-1 pt-3">

              {isLoggedIn ? (
                <>
                  <Link to="/" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">🏠 {t('nav.home')}</Link>
                  <Link to="/doctors" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">👨‍⚕️ {t('nav.doctors')}</Link>
                  <Link to="/health-assistant" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">🤖 AI Assistant</Link>
                  <Link to="/pregnancy" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">🤰 Pregnancy Guide</Link>
                  <Link to="/appointments" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">📅 {t('nav.appointments')}</Link>
                  <Link to="/messages" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">💬 Messages</Link>
                  {user.role !== 'doctor' && (
                    <Link to="/my-prescriptions" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">📋 Prescriptions</Link>
                  )}
                  <Link to="/medicine" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">💊 Medicine</Link>
                  <Link to="/prescription-scan" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">📄 Scan Rx</Link>
                  <Link to="/family" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">👨‍👩‍👧‍👦 Family</Link>
                  {user.role === 'doctor' && (
                    <Link to="/doctor-dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">👨‍⚕️ Dashboard</Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">👤 {t('nav.profile')}</Link>
                </>
              ) : (
                /* Not logged in — only show these items */
                <>
                  <Link to="/" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">🏠 Home</Link>
                  <Link to="/pregnancy" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">🤰 Pregnancy Guide</Link>
                  <Link to="/health-assistant" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-medium">🤖 AI Assistant</Link>
                </>
              )}

              <div className="px-3 py-2">
                <LanguageSelector onLanguageChange={onLanguageChange} mobile />
              </div>

              <div className="border-t border-primary-500/50 mt-2 pt-3 px-3">
                {isLoggedIn ? (
                  <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    {t('nav.logout')} ({user.firstName})
                  </button>
                ) : (
                  <Link to="/login" className="block w-full text-center bg-white text-primary-700 hover:bg-primary-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
