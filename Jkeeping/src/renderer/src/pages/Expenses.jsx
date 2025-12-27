import { useState, useEffect } from 'react'
import { transactionService } from '../services/transactionService'
import { db } from '../db'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import styles from './Expenses.module.css'

/**
 * Expenses Page
 * Track S-Corp business expenses
 */
const Expenses = () => {
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    categoryId: 2,
    type: 'expense',
    status: 'cleared',
    reconciled: false,
    paymentMethod: 'credit'
  })

  const loadCategories = async () => {
    try {
      const allCategories = await db.categories.toArray()
      const expenseCategories = allCategories.filter((c) => c.type === 'expense')
      setCategories(expenseCategories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadExpenseTransactions = async () => {
    try {
      const allTransactions = await transactionService.getAll()
      const expensesOnly = allTransactions
        .filter((t) => t.type === 'expense')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      setTransactions(expensesOnly.slice(0, 10)) // Show last 10
    } catch (error) {
      console.error('Failed to load transactions:', error)
    }
  }

  useEffect(() => {
    loadCategories()
    loadExpenseTransactions()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const transaction = {
        date: formData.date,
        description: formData.description,
        amount: parseFloat(formData.amount),
        practiceId: 1, // Default practice for expenses
        categoryId: Number(formData.categoryId),
        type: 'expense',
        status: 'cleared',
        reconciled: false,
        paymentMethod: formData.paymentMethod
      }

      await transactionService.create(transaction)
      
      // Reset form and close modal
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        categoryId: 2,
        type: 'expense',
        status: 'cleared',
        reconciled: false,
        paymentMethod: 'credit'
      })
      setShowExpenseModal(false)
      await loadExpenseTransactions()
    } catch (err) {
      console.error('Submission failed:', err)
      alert('Failed to record expense. Please try again.')
    }
  }

  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0)

  // Group categories by common types
  const groupedCategories = {
    professional: categories.filter(
      (c) =>
        c.name.includes('License') ||
        c.name.includes('Insurance') ||
        c.name.includes('Professional')
    ),
    education: categories.filter(
      (c) => c.name.includes('Education') || c.name.includes('Memberships')
    ),
    business: categories.filter(
      (c) =>
        c.name.includes('Office') || c.name.includes('Equipment') || c.name.includes('Marketing')
    ),
    services: categories.filter(
      (c) =>
        c.name.includes('Accounting') || c.name.includes('Legal') || c.name.includes('Consulting')
    ),
    travel: categories.filter((c) => c.name.includes('Travel') || c.name.includes('Meals'))
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>💳 Business Expenses</h1>
          <p className={styles.subtitle}>Track all your S-Corp business costs</p>
        </div>
        <div className={styles.totalBadge}>
          Total This Year: <strong>${totalExpenses.toLocaleString()}</strong>
        </div>
      </header>

      <div className={styles.guideCard}>
        <div className={styles.guideIcon}>💡</div>
        <div className={styles.guideContent}>
          <h3>What Can I Deduct as a Business Expense?</h3>
          <p>
            Any cost related to running your dental contracting business! This includes professional
            licenses, malpractice insurance, continuing education, professional memberships,
            business travel, office supplies, accounting fees, and more. Keep receipts for
            everything you track here.
          </p>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <Button variant="primary" size="lg" onClick={() => setShowExpenseModal(true)}>
          💳 Record Expense
        </Button>
      </div>

      <div className={styles.twoColumn}>
        {/* Expense Categories Guide */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>📋 Common Expense Categories</h3>
          <div className={styles.categoryGuide}>
            <div className={styles.categorySection}>
              <h4>👨‍⚕️ Professional</h4>
              <ul>
                <li>State dental license renewals</li>
                <li>Malpractice insurance</li>
                <li>Professional liability coverage</li>
              </ul>
            </div>

            <div className={styles.categorySection}>
              <h4>📚 Education & Development</h4>
              <ul>
                <li>Continuing education courses</li>
                <li>Professional conferences</li>
                <li>Dental association memberships</li>
              </ul>
            </div>

            <div className={styles.categorySection}>
              <h4>🏢 Office & Equipment</h4>
              <ul>
                <li>Office supplies</li>
                <li>Computer & software</li>
                <li>Equipment purchases</li>
              </ul>
            </div>

            <div className={styles.categorySection}>
              <h4>✈️ Travel</h4>
              <ul>
                <li>Business mileage</li>
                <li>Flights to conferences</li>
                <li>Business meals (50% deductible)</li>
              </ul>
            </div>

            <div className={styles.categorySection}>
              <h4>💼 Professional Services</h4>
              <ul>
                <li>Accounting & bookkeeping</li>
                <li>Legal fees</li>
                <li>Business consulting</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>📊 Expense Summary</h3>
          <div className={styles.statsCard}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Total Expenses This Year</div>
              <div className={styles.statValue}>${totalExpenses.toLocaleString()}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Number of Expenses</div>
              <div className={styles.statValue}>{transactions.length}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Tax Deductible</div>
              <div className={styles.statValue}>${totalExpenses.toLocaleString()}</div>
            </div>
          </div>
        </section>
      </div>

      {/* Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="💳 Record Business Expense"
        size="medium"
      >
        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>When did you spend this money?</label>
            <input
              className={styles.input}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>What did you spend money on?</label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g., Annual malpractice insurance, CE course registration"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>How much did it cost?</label>
            <div className={styles.amountInput}>
              <span className={styles.dollarSign}>$</span>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>What category does this expense fall under?</label>
            <select
              className={styles.input}
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
            >
              {groupedCategories.professional.length > 0 && (
                <optgroup label="👨‍⚕️ Professional">
                  {groupedCategories.professional.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {groupedCategories.education.length > 0 && (
                <optgroup label="📚 Education & Development">
                  {groupedCategories.education.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {groupedCategories.business.length > 0 && (
                <optgroup label="🏢 Office & Equipment">
                  {groupedCategories.business.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {groupedCategories.services.length > 0 && (
                <optgroup label="💼 Professional Services">
                  {groupedCategories.services.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {groupedCategories.travel.length > 0 && (
                <optgroup label="✈️ Travel & Meals">
                  {groupedCategories.travel.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>How did you pay?</label>
            <select
              className={styles.input}
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="credit">Credit Card</option>
              <option value="debit">Debit Card</option>
              <option value="check">Check</option>
              <option value="ach">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div className={styles.buttonGroup}>
            <Button variant="outline" onClick={() => setShowExpenseModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              💳 Record Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* Recent Expenses */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Recent Expenses</h3>
        <div className={styles.transactionList}>
          {transactions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No expenses recorded yet. Add your first expense above! ☝️</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const category = categories.find((c) => c.id === t.categoryId)
                  return (
                    <tr key={t.id}>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td>{category?.name || 'Other'}</td>
                      <td>{t.description}</td>
                      <td className={styles.amount}>-${t.amount.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}

export default Expenses
