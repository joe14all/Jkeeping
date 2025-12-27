import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { reportService } from '../services/reportService';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import styles from './Dashboard.module.css';

/**
 * Dashboard Page
 * The primary landing view for Jkeeping.
 * Displays high-level dental practice metrics and S-Corp profitability.
 */
const Dashboard = () => {
  const { fiscalYear } = useApp();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const start = `${fiscalYear}-01-01`;
        const end = `${fiscalYear}-12-31`;
        
        // Fetch financial summaries and dental-specific KPIs
        const plData = await reportService.getPLSummary(start, end);
        const kpiData = await reportService.getDentalKPIs(fiscalYear);
        
        setMetrics({ ...plData, ...kpiData });
      } catch (error) {
        console.error("Dashboard data failed to load:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fiscalYear]);

  if (loading) return <div className={styles.loading}>Analyzing Practice Data...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.badge}>Live Analysis</span>
          <h1>Practice Overview</h1>
          <p className={styles.subtitle}>Insights for the {fiscalYear} Fiscal Year</p>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" size="sm" icon="📅">Schedule</Button>
          <Button variant="primary" size="sm" icon="＋">New Entry</Button>
        </div>
      </header>

      {/* Top Metrics Row */}
      <section className={styles.statsGrid}>
        <StatCard 
          title="Net Profit" 
          value={`$${metrics.netProfit.toLocaleString()}`} 
          trend={12.5} 
          subtitle="Annual Profit" 
        />
        <StatCard 
          title="Overhead Ratio" 
          value={`${metrics.overheadRatio.toFixed(1)}%`} 
          trend={-1.2} 
          subtitle="Operating Efficiency" 
        />
        <StatCard 
          title="Lab Ratio" 
          value={`${metrics.labFeePercentage.toFixed(1)}%`} 
          trend={metrics.isLabHealthy ? -0.5 : 2.1} 
          subtitle="Target < 10%" 
        />
        <StatCard 
          title="Supply Ratio" 
          value={`${metrics.supplyPercentage.toFixed(1)}%`} 
          trend={0.8} 
          subtitle="Target < 6%" 
        />
      </section>

      {/* Secondary Content Row */}
      <div className={styles.contentGrid}>
        <div className={styles.mainCard}>
          <h3 className={styles.cardTitle}>Profitability Trend</h3>
          <div className={styles.chartPlaceholder}>
            {/* Future implementation: Recharts or simple SVG graph */}
            <div className={styles.emptyState}>
              <p>Visual trend data will be generated as you log more transactions.</p>
            </div>
          </div>
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.miniCard}>
            <h4 className={styles.miniTitle}>S-Corp Tax Note</h4>
            <p className={styles.miniText}>
              Based on current profits, your estimated quarterly distribution is 
              <strong> ${(metrics.netProfit / 4).toLocaleString()}</strong>.
            </p>
            <Button variant="outline" size="sm" className={styles.fullWidth}>View Projections</Button>
          </div>
          
          <div className={styles.miniCard}>
            <h4 className={styles.miniTitle}>Clinical Efficiency</h4>
            <div className={styles.progressItem}>
              <div className={styles.progressLabel}>
                <span>Production Target</span>
                <span>75%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;