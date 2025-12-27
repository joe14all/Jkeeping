import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { reportService } from '../services/reportService';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import PracticeSelector from '../components/practices/PracticeSelector';
import styles from './Dashboard.module.css';

/**
 * Dashboard Page
 * The primary landing view for Jkeeping.
 * Displays high-level dental practice metrics and S-Corp profitability.
 */
const Dashboard = () => {
  const { fiscalYear, activePracticeId, setActivePracticeId } = useApp();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const start = `${fiscalYear}-01-01`;
        const end = `${fiscalYear}-12-31`;
        
        // Fetch financial summaries
        const plData = await reportService.getPLSummary(start, end);
        
        // Calculate S-corp specific metrics
        const totalRevenue = plData.income;
        const totalExpenses = plData.expenses;
        const netProfit = plData.netProfit;
        
        // Recommended W-2 salary (50% of net profit as a guideline)
        const recommendedSalary = netProfit * 0.5;
        
        // Estimated distributions (remaining after reasonable salary)
        const estimatedDistributions = netProfit - recommendedSalary;
        
        // Tax savings vs sole prop
        const solePropTax = netProfit * 0.153; // All subject to SE tax
        const sCorpTax = recommendedSalary * 0.153; // Only salary subject to SE tax
        const taxSavings = solePropTax - sCorpTax;
        
        setMetrics({ 
          ...plData, 
          recommendedSalary,
          estimatedDistributions,
          taxSavings,
          totalRevenue,
          totalExpenses,
          netProfit
        });
      } catch (error) {
        console.error("Dashboard data failed to load:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fiscalYear, activePracticeId]);

  if (loading) return <div className={styles.loading}>Loading S-Corp Data...</div>;

  const hasData = metrics.totalRevenue > 0 || metrics.totalExpenses > 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>👋 Welcome to Your S-Corp Bookkeeping</h1>
          <p className={styles.subtitle}>Simple financial tracking for dental contractors • {fiscalYear} Fiscal Year</p>
        </div>
        <div className={styles.actions}>
          <PracticeSelector value={activePracticeId} onChange={setActivePracticeId} />
        </div>
      </header>

      {/* Getting Started Guide - Show when no data */}
      {!hasData && (
        <div className={styles.gettingStarted}>
          <div className={styles.welcomeCard}>
            <h2>🚀 Let's Get Started</h2>
            <p className={styles.welcomeText}>
              This app helps you track your income and expenses as an S-corp dental contractor.
              Here's how it works in 3 simple steps:
            </p>
            <div className={styles.stepsList}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>Record Payments from Practices</h3>
                  <p>When a dental practice pays you, log it as income. This tracks your revenue.</p>
                  <Button variant="primary" onClick={() => (window.location.hash = '/income')}>
                    Add Your First Payment
                  </Button>
                </div>
              </div>
              
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>Track Business Expenses</h3>
                  <p>Licenses, insurance, continuing education, travel - all business costs go here.</p>
                  <Button variant="outline" onClick={() => (window.location.hash = '/expenses')}>
                    Add Business Expense
                  </Button>
                </div>
              </div>
              
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>See Your Tax Savings</h3>
                  <p>The app automatically calculates your recommended W-2 salary and tax savings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard - Show when there's data */}
      {hasData && (
        <>

      {/* Top Metrics Row */}
      <section className={styles.statsGrid}>
        <StatCard 
          title="Total Revenue" 
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          subtitle="Payments from Practices" 
          trend={8.5}
        />
        <StatCard 
          title="Business Expenses" 
          value={`$${metrics.totalExpenses.toLocaleString()}`}
          subtitle="Operating Costs" 
          trend={-2.1}
        />
        <StatCard 
          title="Net Profit" 
          value={`$${metrics.netProfit.toLocaleString()}`}
          subtitle="Before Owner Compensation" 
          trend={12.5}
        />
        <StatCard 
          title="Tax Savings (vs Sole Prop)" 
          value={`$${metrics.taxSavings.toLocaleString()}`}
          subtitle="S-Corp Advantage" 
        />
      </section>

      {/* Compensation Strategy */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>💰 Owner Compensation Strategy</h3>
        <div className={styles.compensationGrid}>
          <div className={styles.compensationCard}>
            <div className={styles.compIcon}>💵</div>
            <div className={styles.compLabel}>Recommended W-2 Salary</div>
            <div className={styles.compValue}>${metrics.recommendedSalary.toLocaleString()}</div>
            <div className={styles.compNote}>50% of net profit (reasonable compensation)</div>
          </div>
          <div className={styles.compensationCard}>
            <div className={styles.compIcon}>💸</div>
            <div className={styles.compLabel}>Estimated Distributions</div>
            <div className={styles.compValue}>${metrics.estimatedDistributions.toLocaleString()}</div>
            <div className={styles.compNote}>Remaining profit (not subject to SE tax)</div>
          </div>
        </div>
      </section>

      {/* Secondary Content Row */}
      <div className={styles.contentGrid}>
        <div className={styles.mainCard}>
          <h3 className={styles.cardTitle}>Revenue Trend</h3>
          <div className={styles.chartPlaceholder}>
            <div className={styles.emptyState}>
              <p>Visual trend data will be generated as you log more payments from practices.</p>
            </div>
          </div>
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.miniCard}>
            <h4 className={styles.miniTitle}>Next Steps</h4>
            <ul className={styles.actionList}>
              <li>📝 Record practice payments as income</li>
              <li>💳 Track your business expenses</li>
              <li>💰 Set up monthly W-2 salary payments</li>
              <li>📊 Review quarterly tax estimates</li>
            </ul>
          </div>

          <div className={styles.miniCard}>
            <h4 className={styles.miniTitle}>Quick Stats</h4>
            <div className={styles.quickStat}>
              <span>Effective Tax Rate:</span>
              <strong>{((metrics.taxSavings / metrics.netProfit) * 100).toFixed(1)}%</strong>
            </div>
            <div className={styles.quickStat}>
              <span>Monthly Avg Revenue:</span>
              <strong>${(metrics.totalRevenue / 12).toLocaleString(undefined, {maximumFractionDigits: 0})}</strong>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Dashboard;