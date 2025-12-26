import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  // Load preferences from LocalStorage
  useEffect(() => {
    const savedYear = localStorage.getItem('jkeeping_fiscal_year');
    const savedTheme = localStorage.getItem('jkeeping_theme');
    
    if (savedYear) setFiscalYear(parseInt(savedYear));
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('jkeeping_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    fiscalYear,
    setFiscalYear,
    theme,
    toggleTheme,
    setTheme
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);