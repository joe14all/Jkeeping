import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { practiceService } from '../services/practiceService';
import Button from '../components/ui/Button';
import styles from './Settings.module.css';

/**
 * Settings Page
 * Manages practice configuration, S-Corp details, and app preferences.
 * Simplified for easy use by dentists.
 */
const Settings = () => {
  const { theme, toggleTheme, fiscalYear } = useApp();
  const [practices, setPractices] = useState([]);
  const [newPractice, setNewPractice] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    tin: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadPractices();
  }, []);

  const loadPractices = async () => {
    try {
      const data = await practiceService.getAll();
      setPractices(data);
    } catch (error) {
      console.error('Failed to load practices:', error);
    }
  };

  const handleAddPractice = async () => {
    try {
      await practiceService.create(newPractice);
      setNewPractice({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        tin: ''
      });
      setShowAddForm(false);
      loadPractices();
    } catch (error) {
      console.error('Failed to add practice:', error);
    }
  };

  const handleDeactivate = async (id) => {
    if (confirm('Are you sure you want to deactivate this practice?')) {
      try {
        await practiceService.deactivate(id);
        loadPractices();
      } catch (error) {
        console.error('Failed to deactivate practice:', error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>⚙️ Settings</h1>
          <p className={styles.subtitle}>Manage the dental practices you work with</p>
        </div>
      </header>

      {/* Helpful Tip */}
      <div className={styles.tipCard}>
        <div className={styles.tipIcon}>💡</div>
        <div className={styles.tipContent}>
          <h4>What are "Practices"?</h4>
          <p>
            These are the dental offices that pay you for your work. Add each office so you can 
            track which practice each payment comes from.
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Your Practices</h3>
        <div className={styles.card}>
          <div className={styles.practiceList}>
            {practices.map((practice) => (
              <div key={practice.id} className={styles.practiceItem}>
                <div className={styles.practiceInfo}>
                  <div className={styles.practiceName}>{practice.name}</div>
                  <div className={styles.practiceDetails}>
                    {practice.address && `${practice.address}, `}
                    {practice.city && `${practice.city}, `}
                    {practice.state} {practice.zip}
                  </div>
                  {practice.tin && <div className={styles.practiceTin}>TIN: {practice.tin}</div>}
                </div>
                <div className={styles.practiceActions}>
                  {practice.isActive ? (
                    <span className={styles.activeBadge}>Active</span>
                  ) : (
                    <span className={styles.inactiveBadge}>Inactive</span>
                  )}
                  {practice.isActive && (
                    <button
                      className={styles.deactivateBtn}
                      onClick={() => handleDeactivate(practice.id)}
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!showAddForm ? (
            <Button variant="primary" onClick={() => setShowAddForm(true)} icon="＋">
              Add New Practice
            </Button>
          ) : (
            <div className={styles.addForm}>
              <h4 className={styles.formTitle}>New Practice</h4>
              <div className={styles.formGrid}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Practice Name"
                  value={newPractice.name}
                  onChange={(e) => setNewPractice({ ...newPractice, name: e.target.value })}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Street Address"
                  value={newPractice.address}
                  onChange={(e) => setNewPractice({ ...newPractice, address: e.target.value })}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="City"
                  value={newPractice.city}
                  onChange={(e) => setNewPractice({ ...newPractice, city: e.target.value })}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="State"
                  value={newPractice.state}
                  onChange={(e) => setNewPractice({ ...newPractice, state: e.target.value })}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="ZIP Code"
                  value={newPractice.zip}
                  onChange={(e) => setNewPractice({ ...newPractice, zip: e.target.value })}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Tax ID (TIN)"
                  value={newPractice.tin}
                  onChange={(e) => setNewPractice({ ...newPractice, tin: e.target.value })}
                />
              </div>
              <div className={styles.formActions}>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddPractice}>
                  Save Practice
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

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