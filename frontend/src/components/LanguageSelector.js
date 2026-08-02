import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN', fullLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हि', fullLabel: 'हिंदी', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕ', fullLabel: 'ಕನ್ನಡ', flag: '🇮🇳' },
];

function LanguageSelector({ onLanguageChange, mobile = false }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.split('-')[0] || 'en';

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('selectedLanguage', code);
    if (onLanguageChange) onLanguageChange(code);
  };

  if (mobile) {
    return (
      <div className="flex gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              current === lang.code
                ? 'bg-white text-primary-700'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {lang.flag} {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          title={lang.fullLabel}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
            current === lang.code
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-primary-100 hover:text-white hover:bg-white/10'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSelector;
