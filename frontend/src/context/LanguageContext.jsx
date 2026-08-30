import React, { createContext, useState } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'EN');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.cookie = `googtrans=/en/${lang.toLowerCase()}; path=/`;
    document.cookie = `googtrans=/en/${lang.toLowerCase()}; domain=localhost; path=/`;
    window.location.reload();
  };

  // We don't need the mock translation anymore, but keep the function signature so app doesn't break
  const t = (text) => {
    if (language === 'KN') {
      // Mock translation for demo purposes
      const dict = {
        'Login': 'ಲಾಗಿನ್',
        'Home': 'ಮುಖಪುಟ',
        'Predict': 'ಮುನ್ಸೂಚನೆ',
        'Warehouse': 'ಗೋದಾಮು',
        'Farmer': 'ರೈತ',
        'History': 'ಇತಿಹಾಸ'
      };
      return dict[text] || text;
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
