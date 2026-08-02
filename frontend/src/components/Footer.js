import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏥</span>
              </div>
              <span className="text-white font-bold text-lg">{t('common.appName')}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.aboutText')}
            </p>
            <div className="flex gap-3 mt-5">
              {['twitter', 'facebook', 'instagram'].map((s) => (
                <a key={s} href="#" aria-label={s}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-sm">
                    {s === 'twitter' ? '𝕏' : s === 'facebook' ? 'f' : '📸'}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/doctors', label: t('nav.doctors') },
                { to: '/appointments', label: t('nav.appointments') },
                { to: '/register', label: t('nav.register') },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary-600 group-hover:w-2 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">📧</span>
                {t('footer.email')}
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">📞</span>
                {t('footer.phone')}
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">🕐</span>
                {t('footer.available')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-sm">{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
