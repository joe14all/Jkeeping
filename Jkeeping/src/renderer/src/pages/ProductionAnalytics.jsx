import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { productionService } from '../services/productionService';
import StatCard from '../components/ui/StatCard';
import PracticeSelector from '../components/practices/PracticeSelector';
import styles from './ProductionAnalytics.module.css';

const ProductionAnalytics = () => {
  const { activePracticeId, setActivePracticeId, fiscalYear } = useApp();
  const [summary, setSummary] = useState(null);
  const [aging, setAging] = useState(null);
  const [velocity, setVelocity] = useState(0);
  const [paymentBreakdown, setPaymentBreakdown] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [activePracticeId, fiscalYear]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const start = `${fiscalYear}-01-01`;
      const end = `${fiscalYear}-12-31`;

      const [summaryData, agingData, velocityData, paymentData] = await Promise.all([
        productionService.getSummary(activePracticeId, start, end),
        productionService.getAgingAR(activePracticeId),
        productionService.getCollectionVelocity(activePracticeId),
        productionService.getCollectionsByMethod(activePracticeId, start, end)
      ]);

      setSummary(summaryData);
      setAging(agingData);
      setVelocity(velocityData);
      setPaymentBreakdown(paymentData);
    } catch (error) {
      console.error('Failed to load production analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading analytics...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Production & Collections Analytics</h1>
          <p className={styles.subtitle}>Track what you earn vs. what you collect</p>
        </div>
        <PracticeSelector value={activePracticeId} onChange={setActivePracticeId} />
      </header>

      {/* Key Metrics */}
      <section className={styles.metricsGrid}>
        <StatCard
          title="Total Production"
          value={`$${summary?.production.toLocaleString() || 0}`}
          subtitle="Billed Services"
          trend={5.2}
        />
        <StatCard
          title="Total Collections"
          value={`$${summary?.collections.toLocaleString() || 0}`}
          subtitle="Money Received"
          trend={4.8}
        />
        <StatCard
          title="Collection %"
          value={`${summary?.collectionPercentage.toFixed(1)}%`}
          subtitle="Target: 98%+"
          trend={summary?.collectionPercentage >= 98 ? 2 : -1}
        />
        <StatCard
          title="Outstanding A/R"
          value={`$${summary?.outstandingAR.toLocaleString() || 0}`}
          subtitle="Uncollected Revenue"
        />
      </section>

      {/* Aging A/R */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Aging Accounts Receivable</h2>
        <div className={styles.agingGrid}>
          <div className={styles.agingCard}>
            <div className={styles.agingValue}>${aging?.current.toLocaleString() || 0}</div>
            <div className={styles.agingLabel}>Current (0-30 days)</div>
            <div className={styles.agingBar} style={{ width: '100%', background: '#10b981' }} />
          </div>
          <div className={styles.agingCard}>
            <div className={styles.agingValue}>${aging?.thirtyDays.toLocaleString() || 0}</div>
            <div className={styles.agingLabel}>31-60 days</div>
            <div className={styles.agingBar} style={{ width: '80%', background: '#f59e0b' }} />
          </div>
          <div className={styles.agingCard}>
            <div className={styles.agingValue}>${aging?.sixtyDays.toLocaleString() || 0}</div>
            <div className={styles.agingLabel}>61-90 days</div>
            <div className={styles.agingBar} style={{ width: '60%', background: '#f97316' }} />
          </div>
          <div className={styles.agingCard}>
            <div className={styles.agingValue}>${aging?.ninetyDaysPlus.toLocaleString() || 0}</div>
            <div className={styles.agingLabel}>90+ days</div>
            <div className={styles.agingBar} style={{ width: '40%', background: '#dc2626' }} />
          </div>
        </div>
      </section>

      {/* Collection Velocity */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Collection Performance</h2>
        <div className={styles.twoColumn}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>⏱️</div>
            <div className={styles.cardValue}>{velocity.toFixed(0)} days</div>
            <div className={styles.cardLabel}>Average Collection Time</div>
            <div className={styles.cardHint}>Industry benchmark: 30-45 days</div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Payment Method Breakdown</h3>
            <div className={styles.paymentList}>
              {Object.entries(paymentBreakdown).length === 0 ? (
                <p className={styles.emptyState}>No collection data available</p>
              ) : (
                Object.entries(paymentBreakdown).map(([method, amount]) => (
                  <div key={method} className={styles.paymentRow}>
                    <span className={styles.paymentMethod}>{method}</span>
                    <span className={styles.paymentAmount}>
                      ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Actionable Insights */}
      <section className={styles.insights}>
        <h2 className={styles.sectionTitle}>💡 Insights & Recommendations</h2>
        <div className={styles.insightsList}>
          {summary?.collectionPercentage < 95 && (
            <div className={styles.insight}>
              <span className={styles.insightIcon}>⚠️</span>
              <div>
                <strong>Low Collection Rate:</strong> Your collection percentage is below the 95%
                benchmark. Consider reviewing your billing and follow-up processes.
              </div>
            </div>
          )}
          {velocity > 45 && (
            <div className={styles.insight}>
              <span className={styles.insightIcon}>🐌</span>
              <div>
                <strong>Slow Collections:</strong> Average collection time exceeds 45 days.
                Implement more aggressive A/R follow-up procedures.
              </div>
            </div>
          )}
          {(aging?.ninetyDaysPlus || 0) > 5000 && (
            <div className={styles.insight}>
              <span className={styles.insightIcon}>🚨</span>
              <div>
                <strong>High Aged A/R:</strong> You have significant receivables over 90 days old.
                These may need to be written off or sent to collections.
              </div>
            </div>
          )}
          {summary?.collectionPercentage >= 98 && velocity <= 35 && (
            <div className={styles.insight}>
              <span className={styles.insightIcon}>✨</span>
              <div>
                <strong>Excellent Performance:</strong> Your collection rate and speed are both
                above industry benchmarks. Keep up the great work!
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductionAnalytics;
