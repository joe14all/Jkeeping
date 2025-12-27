import React, { useState } from 'react';
import { transactionService } from '../services/transactionService';
import Button from '../components/ui/Button';
import styles from './Transactions.module.css';

/**
 * Transactions Page
 * Allows the user to log clinical income and S-Corp expenses.
 * Uses the custom Button component for a consistent Apple-style UI.
 */
const Transactions = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    categoryId: 1,
    status: 'cleared'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await transactionService.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      // Success state (Replacing alert with a clear form)
      setFormData({ 
        ...formData, 
        description: '', 
        amount: '' 
      });
      console.log('Transaction logged successfully');
    } catch (err) {
      console.error('Submission failed:', err.message);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Transactions</h1>
          <p className={styles.subtitle}>Log your dental expenses and S-Corp income.</p>
        </div>
        <Button variant="outline" size="sm" icon="📂">Import CSV</Button>
      </header>

      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>Add New Entry</h3>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Date</label>
            <input 
              className={styles.input}
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Description</label>
            <input 
              className={styles.input}
              type="text" 
              placeholder="e.g., Glidewell Lab, Henry Schein" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Amount</label>
            <div className={styles.amountWrapper}>
              <span className={styles.currency}>$</span>
              <input 
                className={styles.input}
                type="number" 
                step="0.01"
                placeholder="0.00" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="submit" variant="primary" icon="＋">
              Add Transaction
            </Button>
          </div>
        </form>
      </div>
      
      {/* Table Placeholder for future updates */}
      <div className={styles.recentActivity}>
        <h3 className={styles.formTitle}>Recent Activity</h3>
        <div className={styles.emptyState}>
          Your recent transactions will appear here.
        </div>
      </div>
    </div>
  );
};

export default Transactions;