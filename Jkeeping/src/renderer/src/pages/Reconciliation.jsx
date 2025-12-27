import React from 'react';
import { useApp } from '../context/AppContext';
import ReconciliationPanel from '../components/reconciliation/ReconciliationPanel';
import PracticeSelector from '../components/practices/PracticeSelector';
import styles from './Reconciliation.module.css';

const Reconciliation = () => {
  const { activePracticeId, setActivePracticeId } = useApp();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Bank Reconciliation</h1>
          <p className={styles.subtitle}>Match your book records with bank statements</p>
        </div>
        <PracticeSelector value={activePracticeId} onChange={setActivePracticeId} />
      </header>

      <ReconciliationPanel practiceId={activePracticeId} />
    </div>
  );
};

export default Reconciliation;
