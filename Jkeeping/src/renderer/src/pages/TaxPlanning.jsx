import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { taxPlanningService } from '../services/taxPlanningService';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import PracticeSelector from '../components/practices/PracticeSelector';
import styles from './TaxPlanning.module.css';

const TaxPlanning = () => {
  const { activePracticeId, setActivePracticeId, fiscalYear } = useApp();
  const [currentQuarter, setCurrentQuarter] = useState(Math.ceil(new Date().getMonth() / 3));
  const [quarterEstimate, setQuarterEstimate] = useState(null);
  const [safeHarbor, setSafeHarbor] = useState(null);
  const [compensation, setCompensation] = useState(null);
  const [qbi, setQbi] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaxData();
  }, [activePracticeId, fiscalYear, currentQuarter]);

  const loadTaxData = async () => {
    setLoading(true);
    try {
      const [quarterData, safeHarborData, compensationData, qbiData] = await Promise.all([
        taxPlanningService.getQuarterlyEstimate(fiscalYear, currentQuarter, activePracticeId),
        taxPlanningService.getSafeHarbor(fiscalYear),
        taxPlanningService.calculateReasonableCompensation(fiscalYear, activePracticeId),
        taxPlanningService.calculateQBIDeduction(fiscalYear, activePracticeId)
      ]);

      setQuarterEstimate(quarterData);
      setSafeHarbor(safeHarborData);
      setCompensation(compensationData);
      setQbi(qbiData);
      setCalendar(taxPlanningService.getTaxCalendar(fiscalYear));
    } catch (error) {
      console.error('Failed to load tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading tax planning data...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Tax Planning Dashboard</h1>
          <p className={styles.subtitle}>S-Corp compliance & optimization tools</p>
        </div>
        <PracticeSelector value={activePracticeId} onChange={setActivePracticeId} />
      </header>

      {/* Quarter Selector */}
      <div className={styles.quarterSelector}>
        <span className={styles.quarterLabel}>Select Quarter:</span>
        {[1, 2, 3, 4].map((q) => (
          <button
            key={q}
            className={`${styles.quarterBtn} ${currentQuarter === q ? styles.active : ''}`}
            onClick={() => setCurrentQuarter(q)}
          >
            Q{q}
          </button>
        ))}
      </div>

      {/* Quarterly Estimate */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Q{currentQuarter} {fiscalYear} Estimated Tax
        </h2>
        <div className={styles.estimateGrid}>
          <StatCard
            title="Net Profit (Q{currentQuarter})"
            value={`$${quarterEstimate?.netProfit.toLocaleString() || 0}`}
            subtitle="Taxable Income"
          />
          <StatCard
            title="Federal Tax"
            value={`$${quarterEstimate?.estimatedFederal.toLocaleString() || 0}`}
            subtitle="25% Estimate"
          />
          <StatCard
            title="Self-Employment Tax"
            value={`$${quarterEstimate?.estimatedSE.toLocaleString() || 0}`}
            subtitle="15.3% on W-2 portion"
          />
          <StatCard
            title="State Tax"
            value={`$${quarterEstimate?.estimatedState.toLocaleString() || 0}`}
            subtitle="5% Rate (adjust per state)"
          />
        </div>

        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Total Q{currentQuarter} Estimated Payment</div>
          <div className={styles.totalValue}>
            ${quarterEstimate?.totalEstimated.toLocaleString() || 0}
          </div>
          <div className={styles.totalDue}>Due: {quarterEstimate?.dueDate}</div>
          <Button variant="primary" icon="💳">
            Record Payment
          </Button>
        </div>
      </section>

      {/* Safe Harbor */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Safe Harbor Calculation</h2>
        <div className={styles.safeHarborCard}>
          <p className={styles.safeHarborText}>
            To avoid underpayment penalties, pay the lesser of:
          </p>
          <ul className={styles.safeHarborList}>
            <li>90% of current year's tax liability, OR</li>
            <li>
              {safeHarbor?.safeHarborMultiplier === 1.1 ? '110%' : '100%'} of prior year's tax
              (${safeHarbor?.priorYearTax.toLocaleString()})
            </li>
          </ul>
          <div className={styles.safeHarborResult}>
            <div className={styles.safeHarborLabel}>Safe Harbor Quarterly Payment:</div>
            <div className={styles.safeHarborAmount}>
              ${safeHarbor?.quarterlyPayment.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      {/* Reasonable Compensation */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>S-Corp Reasonable Compensation Calculator</h2>
        <div className={styles.compensationCard}>
          <p className={styles.compensationIntro}>
            The IRS requires S-Corp owners to pay themselves "reasonable compensation" via W-2
            wages. This typically ranges from 40-60% of net profit.
          </p>

          <div className={styles.compensationRanges}>
            <div className={styles.rangeItem}>
              <div className={styles.rangeLabel}>Conservative (60%)</div>
              <div className={styles.rangeValue}>
                ${compensation?.recommendedRange.high.toLocaleString()}
              </div>
            </div>
            <div className={`${styles.rangeItem} ${styles.recommended}`}>
              <div className={styles.rangeLabel}>Recommended (50%)</div>
              <div className={styles.rangeValue}>
                ${compensation?.recommendedRange.mid.toLocaleString()}
              </div>
              <div className={styles.badge}>Best Practice</div>
            </div>
            <div className={styles.rangeItem}>
              <div className={styles.rangeLabel}>Aggressive (40%)</div>
              <div className={styles.rangeValue}>
                ${compensation?.recommendedRange.low.toLocaleString()}
              </div>
            </div>
          </div>

          <div className={styles.savingsCard}>
            <div className={styles.savingsLabel}>Estimated Annual Tax Savings (vs. Sole Prop)</div>
            <div className={styles.savingsValue}>
              ${compensation?.estimatedSavings.toLocaleString()}
            </div>
            <p className={styles.savingsNote}>
              By distributing profits as dividends instead of all as salary, you avoid SE tax on
              the distribution portion.
            </p>
          </div>
        </div>
      </section>

      {/* QBI Deduction */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Qualified Business Income (QBI) Deduction</h2>
        <div className={styles.qbiCard}>
          <div className={styles.qbiRow}>
            <span>Qualified Business Income:</span>
            <span className={styles.qbiValue}>${qbi?.qualifiedBusinessIncome.toLocaleString()}</span>
          </div>
          <div className={styles.qbiRow}>
            <span>QBI Deduction (20%):</span>
            <span className={styles.qbiValue}>${qbi?.qbiDeduction.toLocaleString()}</span>
          </div>
          <div className={`${styles.qbiRow} ${styles.highlight}`}>
            <span>Estimated Tax Savings:</span>
            <span className={styles.qbiValue}>${qbi?.taxSavings.toLocaleString()}</span>
          </div>
          <p className={styles.qbiNote}>
            Section 199A allows eligible S-Corp owners to deduct 20% of qualified business income
            from their taxable income. Limitations may apply based on income level and business
            type.
          </p>
        </div>
      </section>

      {/* Tax Calendar */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📅 {fiscalYear} Tax Calendar</h2>
        <div className={styles.calendarGrid}>
          {calendar.map((event, i) => {
            const isPast = new Date(event.dueDate) < new Date();
            return (
              <div key={i} className={`${styles.calendarItem} ${isPast ? styles.past : ''}`}>
                <div className={styles.calendarDate}>{event.dueDate}</div>
                <div className={styles.calendarType}>{event.type}</div>
                <div className={styles.calendarForm}>{event.form}</div>
                {event.quarter && (
                  <div className={styles.calendarQuarter}>Q{event.quarter}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Resources */}
      <section className={styles.resources}>
        <h2 className={styles.sectionTitle}>💼 Tax Resources</h2>
        <div className={styles.resourceGrid}>
          <div className={styles.resourceCard}>
            <div className={styles.resourceIcon}>📋</div>
            <h3 className={styles.resourceTitle}>IRS Form 1120-S</h3>
            <p className={styles.resourceText}>S-Corporation Income Tax Return</p>
          </div>
          <div className={styles.resourceCard}>
            <div className={styles.resourceIcon}>💰</div>
            <h3 className={styles.resourceTitle}>Form 1040-ES</h3>
            <p className={styles.resourceText}>Estimated Tax Payment Vouchers</p>
          </div>
          <div className={styles.resourceCard}>
            <div className={styles.resourceIcon}>📊</div>
            <h3 className={styles.resourceTitle}>Schedule K-1</h3>
            <p className={styles.resourceText}>Shareholder's Share of Income</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TaxPlanning;
