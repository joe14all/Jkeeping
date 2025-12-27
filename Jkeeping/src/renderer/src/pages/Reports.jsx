import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { reportService } from '../services/reportService';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import PracticeSelector from '../components/practices/PracticeSelector';
import styles from './Reports.module.css';

/**
 * Reports Page
 * Aggregates financial data for S-Corp tax planning and dental practice optimization.
 */
const Reports = () => {
  const { fiscalYear, activePracticeId, setActivePracticeId } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const start = `${fiscalYear}-01-01`;
        const end = `${fiscalYear}-12-31`;
        
        const pl = await reportService.getPLSummary(start, end);
        const tax = await reportService.getTaxProjection(1); // Default to Q1 for now

        // Calculate contractor-specific metrics
        const recommendedSalary = Math.round(pl.netProfit * 0.5);
        const distributions = pl.netProfit - recommendedSalary;
        const selfEmploymentTax = pl.netProfit * 0.153; // 15.3% SE tax
        const scorpTax = (recommendedSalary * 0.0765) + (distributions * 0); // Only FICA on W-2
        const taxSavings = selfEmploymentTax - scorpTax;

        setData({ 
          pl, 
          tax, 
          compensation: {
            recommendedSalary,
            distributions,
            taxSavings
          }
        });
      } catch (error) {
        console.error("Failed to generate reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [fiscalYear, activePracticeId]);

  if (loading) return <div className={styles.loading}>Generating Financial Intelligence...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Financial Reports</h1>
          <p className={styles.subtitle}>S-Corp Tax Planning & Financial Summary</p>
        </div>
        <div className={styles.headerActions}>
          <PracticeSelector value={activePracticeId} onChange={setActivePracticeId} />
          <Button variant="outline" icon="⤓">Export PDF</Button>
        </div>
      </header>

      {/* High Level Summary */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Profit & Loss Summary</h3>
        <div className={styles.grid}>
          <StatCard 
            title="Total Revenue" 
            value={`$${data.pl.income.toLocaleString()}`} 
            trend={8} 
            subtitle="Payments from Practices" 
          />
          <StatCard 
            title="Business Expenses" 
            value={`$${data.pl.expenses.toLocaleString()}`} 
            trend={-2} 
            subtitle="Total Operating Costs" 
          />
          <StatCard 
            title="Net Profit" 
            value={`$${data.pl.netProfit.toLocaleString()}`} 
            trend={15} 
            subtitle="Available for Compensation" 
          />
        </div>
      </section>

      {/* S-Corp Specifics */}
      <div className={styles.twoColumn}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Compensation Strategy</h3>
          <div className={styles.reportCard}>
            <div className={styles.reportRow}>
              <span>Net Profit (Before Compensation)</span>
              <span className={styles.amount}>${data.pl.netProfit.toLocaleString()}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.reportRow}>
              <span>Recommended W-2 Salary (50%)</span>
              <span className={styles.amount}>${data.compensation.recommendedSalary.toLocaleString()}</span>
            </div>
            <div className={styles.reportRow}>
              <span>Distributions (Remaining)</span>
              <span className={styles.amount}>${data.compensation.distributions.toLocaleString()}</span>
            </div>
            <div className={styles.divider} />
            <div className={`${styles.reportRow} ${styles.total}`}>
              <span>Tax Savings vs Sole Prop</span>
              <span className={styles.highlight}>+${data.compensation.taxSavings.toLocaleString()}</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Quarterly Tax Estimate</h3>
          <div className={styles.reportCard}>
            <div className={styles.reportRow}>
              <span>Estimated Income Tax (22%)</span>
              <span className={styles.amount}>${Math.round(data.pl.netProfit * 0.22).toLocaleString()}</span>
            </div>
            <div className={styles.reportRow}>
              <span>FICA on W-2 Salary (7.65%)</span>
              <span className={styles.amount}>${Math.round(data.compensation.recommendedSalary * 0.0765).toLocaleString()}</span>
            </div>
            <div className={styles.divider} />
            <div className={`${styles.reportRow} ${styles.total}`}>
              <span>Quarterly Payment (EST)</span>
              <span className={styles.highlight}>${data.tax.estimatedVoucherAmount.toLocaleString()}</span>
            </div>
            <p className={styles.note}>Based on estimated 22% tax bracket. Consult your CPA for accurate projections.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;