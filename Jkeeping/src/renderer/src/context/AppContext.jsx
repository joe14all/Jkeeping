import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const [activePracticeId, setActivePracticeId] = useState(null);

  // Load preferences from LocalStorage
  useEffect(() => {
    const savedYear = localStorage.getItem('jkeeping_fiscal_year');
    const savedTheme = localStorage.getItem('jkeeping_theme');
    const savedPractice = localStorage.getItem('jkeeping_active_practice');
    
    if (savedYear) setFiscalYear(parseInt(savedYear));
    if (savedTheme) setTheme(savedTheme);
    if (savedPractice) setActivePracticeId(parseInt(savedPractice));
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('jkeeping_theme', theme);
  }, [theme]);

  // Save active practice
  useEffect(() => {
    if (activePracticeId !== null) {
      localStorage.setItem('jkeeping_active_practice', activePracticeId.toString());
    }
  }, [activePracticeId]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    fiscalYear,
    setFiscalYear,
    theme,
    toggleTheme,
    setTheme,
    activePracticeId,
    setActivePracticeId
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);