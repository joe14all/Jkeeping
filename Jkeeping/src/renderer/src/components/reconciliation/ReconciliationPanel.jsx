import React, { useState, useEffect } from 'react'
import { reconciliationService } from '../../services/reconciliationService'
import { transactionService } from '../../services/transactionService'
import { format } from 'date-fns'
import Button from '../ui/Button'
import styles from './ReconciliationPanel.module.css'

const ReconciliationPanel = ({ practiceId }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [unreconciled, setUnreconciled] = useState([])
  const [status, setStatus] = useState(null)
  const [bankBalance, setBankBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    loadData()
  }, [practiceId, month, year])

  const loadData = async () => {
    setLoading(true)
    try {
      const transactions = await reconciliationService.getUnreconciled(practiceId, month, year)
      const monthStatus = await reconciliationService.getMonthStatus(practiceId, month, year)
      setUnreconciled(transactions)
      setStatus(monthStatus)
    } catch (error) {
      console.error('Failed to load reconciliation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkReconciled = async () => {
    if (selectedIds.length === 0) return

    try {
      await reconciliationService.markReconciled(selectedIds)
      setSelectedIds([])
      loadData()
    } catch (error) {
      console.error('Failed to mark reconciled:', error)
    }
  }

  const handleCompleteReconciliation = async () => {
    if (!bankBalance) {
      alert('Please enter bank statement balance')
      return
    }

    try {
      await reconciliationService.createReconciliation(
        practiceId,
        month,
        year,
        parseFloat(bankBalance)
      )
      alert('Reconciliation completed!')
      loadData()
    } catch (error) {
      console.error('Failed to complete reconciliation:', error)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const bookBalance = unreconciled.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount)
  }, 0)

  const difference = bankBalance ? parseFloat(bankBalance) - bookBalance : 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Bank Reconciliation</h2>
        <div className={styles.controls}>
          <select
            className={styles.select}
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {status && (
        <div className={styles.statusBar}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Total Transactions</span>
            <span className={styles.statusValue}>{status.total}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Reconciled</span>
            <span className={`${styles.statusValue} ${styles.success}`}>{status.reconciled}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Unreconciled</span>
            <span className={`${styles.statusValue} ${styles.warning}`}>{status.unreconciled}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Progress</span>
            <span className={styles.statusValue}>{status.percentage.toFixed(0)}%</span>
          </div>
        </div>
      )}

      <div className={styles.balanceSection}>
        <div className={styles.balanceRow}>
          <span className={styles.balanceLabel}>Bank Statement Balance:</span>
          <input
            type="number"
            step="0.01"
            className={styles.balanceInput}
            value={bankBalance}
            onChange={(e) => setBankBalance(e.target.value)}
            placeholder="Enter bank balance"
          />
        </div>
        <div className={styles.balanceRow}>
          <span className={styles.balanceLabel}>Book Balance:</span>
          <span className={styles.balanceValue}>${bookBalance.toFixed(2)}</span>
        </div>
        <div className={styles.balanceRow}>
          <span className={styles.balanceLabel}>Difference:</span>
          <span className={`${styles.balanceValue} ${difference !== 0 ? styles.error : styles.success}`}>
            ${Math.abs(difference).toFixed(2)} {difference !== 0 && '⚠️'}
          </span>
        </div>
      </div>

      <div className={styles.transactionList}>
        <div className={styles.listHeader}>
          <h3>Unreconciled Transactions ({unreconciled.length})</h3>
          {selectedIds.length > 0 && (
            <Button size="sm" variant="primary" onClick={handleMarkReconciled}>
              Mark {selectedIds.length} as Reconciled
            </Button>
          )}
        </div>

        {loading ? (
          <div className={styles.loading}>Loading transactions...</div>
        ) : unreconciled.length === 0 ? (
          <div className={styles.empty}>All transactions reconciled for this period! ✓</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkCell}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === unreconciled.length}
                    onChange={() => {
                      if (selectedIds.length === unreconciled.length) {
                        setSelectedIds([])
                      } else {
                        setSelectedIds(unreconciled.map((t) => t.id))
                      }
                    }}
                  />
                </th>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {unreconciled.map((transaction) => (
                <tr key={transaction.id}>
                  <td className={styles.checkCell}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(transaction.id)}
                      onChange={() => toggleSelect(transaction.id)}
                    />
                  </td>
                  <td>{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                  <td>{transaction.description}</td>
                  <td className={transaction.type === 'income' ? styles.income : styles.expense}>
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[transaction.type]}`}>
                      {transaction.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.footer}>
        <Button variant="primary" onClick={handleCompleteReconciliation} disabled={!bankBalance || difference !== 0}>
          {difference === 0 ? 'Complete Reconciliation' : 'Balance Must Match to Complete'}
        </Button>
      </div>
    </div>
  )
}

export default ReconciliationPanel
