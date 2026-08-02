import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const STATS = [
  { value: '500+', labelKey: 'home.statDoctors', icon: '👨‍⚕️' },
  { value: '50K+', labelKey: 'home.statPatients', icon: '🧑‍🤝‍🧑' },
  { value: '20+', labelKey: 'home.statSpecializations', icon: '🩺' },
  { value: '4.9★', labelKey: 'home.statRating', icon: '⭐' },
];

const FEATURES = [
  {
    icon: '🏥',
    titleKey: 'home.feature1Title',
    descKey: 'home.feature1Desc',
    color: 'from-green-50 to-emerald-50 border-green-100',
    iconBg: 'bg-green-100',
  },
  {
    icon: '📅',
    titleKey: 'home.feature2Title',
    descKey: 'home.feature2Desc',
    color: 'from-blue-50 to-sky-50 border-blue-100',
    iconBg: 'bg-blue-100',
  },
  {
    icon: '💬',
    titleKey: 'home.feature3Title',
    descKey: 'home.feature3Desc',
    color: 'from-purple-50 to-violet-50 border-purple-100',
    iconBg: 'bg-purple-100',
  },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🔍', titleKey: 'home.step1Title', descKey: 'home.step1Desc' },
  { step: '02', icon: '📅', titleKey: 'home.step2Title', descKey: 'home.step2Desc' },
  { step: '03', icon: '✅', titleKey: 'home.step3Title', descKey: 'home.step3Desc' },
];

function Home() {
  const { t } = useTranslation();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="bg-white">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-900/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm animate-fade-in-up">
              <span className="pulse-dot"></span>
              <span>India's trusted healthcare platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight animate-fade-in-up delay-100">
              {t('home.title')}
            </h1>

            <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              {t('home.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link
                to="/doctors"
                className="group inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-base active:scale-95"
              >
                <span>🔍</span>
                {t('home.findDoctor')}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              {!isLoggedIn && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 text-base active:scale-95 backdrop-blur-sm"
                >
                  {t('home.getStarted')} →
                </Link>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10 text-sm text-primary-200 animate-fade-in-up delay-400">
              <span className="flex items-center gap-1.5">✓ Free to sign up</span>
              <span className="flex items-center gap-1.5">✓ Verified doctors</span>
              <span className="flex items-center gap-1.5">✓ Instant booking</span>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="white" />
          </svg>
        </div>
        <div className="h-14" />
      </section>

      {/* ── Stats Strip ── */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-300 group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="stat-number text-2xl md:text-3xl">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="section-title">{t('home.whyChoose')}</h2>
            <p className="section-subtitle">
              Everything you need for your healthcare journey, in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-8 bg-gradient-to-br ${f.color} hover:-translate-y-1 transition-all duration-300 hover:shadow-lg animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-14 h-14 ${f.iconBg} rounded-2xl flex items-center justify-center text-3xl mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t(f.titleKey)}</h3>
                <p className="text-gray-600 leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="section-title">{t('home.howItWorks')}</h2>
            <p className="section-subtitle">{t('home.howItWorksSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-primary-200 to-transparent" />

            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="text-center relative animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 bg-primary-50 border-2 border-primary-200 rounded-2xl flex flex-col items-center justify-center mx-auto">
                    <span className="text-2xl">{step.icon}</span>
                    <span className="text-xs font-bold text-primary-500 mt-0.5">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t(step.titleKey)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{t('home.readyToStart')}</h2>
          <p className="text-lg text-primary-100 mb-10 max-w-xl mx-auto">{t('home.connectWithProfessionals')}</p>

          {!isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register"
                className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-base active:scale-95"
              >
                🚀 {t('common.signup')} — {t('auth.patient')}
              </Link>
              <Link to="/login"
                className="border-2 border-white/50 hover:border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 text-base active:scale-95"
              >
                {t('common.login')}
              </Link>
            </div>
          ) : (
            <Link to="/doctors"
              className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-base active:scale-95"
            >
              🔍 {t('home.browseDoctor')}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
