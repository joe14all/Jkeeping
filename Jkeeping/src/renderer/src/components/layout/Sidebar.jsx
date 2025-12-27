import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from './Sidebar.module.css';

/**
 * Sidebar Component
 * Provides navigation, fiscal year selection, and theme toggling.
 * Designed with a native macOS sidebar aesthetic.
 */
const Sidebar = () => {
  const { theme, toggleTheme, fiscalYear, setFiscalYear } = useApp();
  
  // Dynamic year generation: current year +/- 2 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>J</div>
        <span className={styles.appName}>keeping</span>
      </div>
      
      <div className={styles.section}>
        <label className={styles.label}>Fiscal Year</label>
        <div className={styles.selectWrapper}>
          <select 
            value={fiscalYear} 
            onChange={(e) => setFiscalYear(Number(e.target.value))}
            className={styles.select}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <nav className={styles.nav}>
        <label className={styles.label}>Navigation</label>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.active : styles.link}>
          <span className={styles.icon}>🏠</span> Home
        </NavLink>
        <NavLink to="/income" className={({ isActive }) => isActive ? styles.active : styles.link}>
          <span className={styles.icon}>💰</span> Income
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => isActive ? styles.active : styles.link}>
          <span className={styles.icon}>💳</span> Expenses
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => isActive ? styles.active : styles.link}>
          <span className={styles.icon}>📊</span> Reports
        </NavLink>
        <NavLink to="/tax-planning" className={({ isActive }) => isActive ? styles.active : styles.link}>
          <span className={styles.icon}>📋</span> Tax Planning
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? styles.active : styles.link}>
          <span className={styles.icon}>⚙️</span> Settings
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <button onClick={toggleTheme} className={styles.themeBtn}>
          {theme === 'light' ? (
            <><span className={styles.icon}>🌙</span> Dark Mode</>
          ) : (
            <><span className={styles.icon}>☀️</span> Light Mode</>
          )}
        </button>
        <div className={styles.version}>v1.0.0 Local</div>
      </div>
    </aside>
  );
};

export default Sidebar;