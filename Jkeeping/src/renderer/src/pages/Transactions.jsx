import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { transactionService } from '../services/transactionService';
import Button from '../components/ui/Button';
import TransactionTable from '../components/transactions/TransactionTable';
import PracticeSelector from '../components/practices/PracticeSelector';
import CSVImport from '../components/csv/CSVImport';
import styles from './Transactions.module.css';

/**
 * Transactions Page
 * Allows the user to log clinical income and S-Corp expenses.
 * Uses the custom Button component for a consistent Apple-style UI.
 */
const Transactions = () => {
  const { activePracticeId, setActivePracticeId } = useApp();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    categoryId: 1,
    practiceId: activePracticeId || 1,
    type: 'income',
    status: 'cleared',
    reconciled: false,
    paymentMethod: 'check'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await transactionService.create({
        ...formData,
        amount: parseFloat(formData.amount),
        practiceId: activePracticeId || 1
      });
      
      // Success state - clear form and refresh table
      setFormData({ 
        ...formData, 
        description: '', 
        amount: '' 
      });
      setRefreshTrigger(prev => prev + 1);
      console.log('Transaction logged successfully');
    } catch (err) {
      console.error('Submission failed:', err.message);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>💸 Track Your Money</h1>
          <p className={styles.subtitle}>Log payments from practices and your business expenses</p>
        </div>
        <div className={styles.headerActions}>
          <PracticeSelector value={activePracticeId} onChange={setActivePracticeId} />
          <CSVImport practiceId={activePracticeId} onImportComplete={() => setRefreshTrigger(prev => prev + 1)} />
        </div>
      </header>

      <div className={styles.quickGuide}>
        <div className={styles.guideCard}>
          <div className={styles.guideIcon}>💰</div>
          <div className={styles.guideContent}>
            <h4>Payment from Practice</h4>
            <p>When a dental office pays you, select "Income" and enter the amount.</p>
          </div>
        </div>
        <div className={styles.guideCard}>
          <div className={styles.guideIcon}>💳</div>
          <div className={styles.guideContent}>
            <h4>Business Expense</h4>
            <p>Licenses, insurance, continuing ed, travel - select "Expense" and the category.</p>
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>➕ Add New Entry</h3>
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
            <label className={styles.label}>Type</label>
            <select 
              className={styles.input}
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value, categoryId: e.target.value === 'income' ? 1 : 2})}
            >
              <option value="income">💰 Payment from Practice (Income)</option>
              <option value="expense">💳 Business Expense</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              {formData.type === 'income' ? 'What did you get paid for?' : 'What did you spend money on?'}
            </label>
            <input 
              className={styles.input}
              type="text" 
              placeholder={formData.type === 'income' ? 'e.g., August clinical services' : 'e.g., Professional liability insurance'} 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Amount ($)</label>
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
      
      {/* Transaction Table */}
      <div className={styles.recentActivity}>
        <h3 className={styles.formTitle}>All Transactions</h3>
        <TransactionTable practiceId={activePracticeId} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Transactions;