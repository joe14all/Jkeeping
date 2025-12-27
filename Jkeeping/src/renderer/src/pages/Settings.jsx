import React from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import styles from './Settings.module.css';

/**
 * Settings Page
 * Manages practice configuration, S-Corp details, and app preferences.
 */
const Settings = () => {
  const { theme, toggleTheme, fiscalYear } = useApp();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Settings</h1>
          <p className={styles.subtitle}>Configure your practice and S-Corp preferences.</p>
        </div>
      </header>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>App Appearance</h3>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Visual Theme</span>
              <p className={styles.settingDescription}>Switch between light and dark modes.</p>
            </div>
            <Button variant="secondary" onClick={toggleTheme}>
              Currently: {theme === 'light' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>S-Corp Configuration</h3>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Officer Compensation (W2)</span>
              <p className={styles.settingDescription}>Set your monthly base salary for tax projections.</p>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.currency}>$</span>
              <input type="number" className={styles.input} placeholder="5000" />
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Fiscal Year Locking</span>
              <p className={styles.settingDescription}>Current active year: {fiscalYear}</p>
            </div>
            <Button variant="outline" size="sm">Modify Lock</Button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Data Management</h3>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Export Local Database</span>
              <p className={styles.settingDescription}>Download a JSON backup of all Jkeeping data.</p>
            </div>
            <Button variant="outline" icon="💾">Export Backup</Button>
          </div>
          
          <div className={styles.divider} />

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel} style={{ color: '#FF3B30' }}>Reset All Data</span>
              <p className={styles.settingDescription}>Permanently delete all local records. This cannot be undone.</p>
            </div>
            <Button variant="secondary" className={styles.dangerBtn}>Purge Database</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;