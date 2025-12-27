import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { reportService } from '../services/reportService';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import styles from './Reports.module.css';

/**
 * Reports Page
 * Aggregates financial data for S-Corp tax planning and dental practice optimization.
 */
const Reports = () => {
  const { fiscalYear } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const start = `${fiscalYear}-01-01`;
        const end = `${fiscalYear}-12-31`;
        
        const pl = await reportService.getPLSummary(start, end);
        const kpis = await reportService.getDentalKPIs(fiscalYear);
        const tax = await reportService.getTaxProjection(1); // Default to Q1 for now

        setData({ pl, kpis, tax });
      } catch (error) {
        console.error("Failed to generate reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [fiscalYear]);

  if (loading) return <div className={styles.loading}>Generating Financial Intelligence...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Financial Reports</h1>
          <p className={styles.subtitle}>S-Corp Tax Projections & Clinical Performance</p>
        </div>
        <Button variant="outline" icon="⤓">Export PDF</Button>
      </header>

      {/* High Level Summary */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>P&L Executive Summary</h3>
        <div className={styles.grid}>
          <StatCard 
            title="Total Revenue" 
            value={`$${data.pl.income.toLocaleString()}`} 
            trend={8} 
            subtitle="Gross Production" 
          />
          <StatCard 
            title="Total Expenses" 
            value={`$${data.pl.expenses.toLocaleString()}`} 
            trend={-2} 
            subtitle="Practice Overhead" 
          />
          <StatCard 
            title="Net Profit" 
            value={`$${data.pl.netProfit.toLocaleString()}`} 
            trend={15} 
            subtitle="Available for Distribution" 
          />
        </div>
      </section>

      {/* S-Corp Specifics */}
      <div className={styles.twoColumn}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>S-Corp Tax Estimator</h3>
          <div className={styles.reportCard}>
            <div className={styles.reportRow}>
              <span>Projected Annual Net</span>
              <span className={styles.amount}>${data.pl.netProfit.toLocaleString()}</span>
            </div>
            <div className={styles.reportRow}>
              <span>Estimated Tax Liability (25%)</span>
              <span className={styles.amount}>${(data.pl.netProfit * 0.25).toLocaleString()}</span>
            </div>
            <div className={styles.divider} />
            <div className={`${styles.reportRow} ${styles.total}`}>
              <span>Quarterly Voucher (EST)</span>
              <span className={styles.highlight}>${data.tax.estimatedVoucherAmount.toLocaleString()}</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Dental Practice KPIs</h3>
          <div className={styles.reportCard}>
            <div className={styles.reportRow}>
              <span>Lab Fee Ratio</span>
              <span className={data.kpis.isLabHealthy ? styles.good : styles.bad}>
                {data.kpis.labFeePercentage.toFixed(1)}%
              </span>
            </div>
            <div className={styles.reportRow}>
              <span>Supplies Ratio</span>
              <span>{data.kpis.supplyPercentage.toFixed(1)}%</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.reportRow}>
              <span>Practice Overhead</span>
              <span className={styles.bold}>{data.pl.overheadRatio.toFixed(1)}%</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;