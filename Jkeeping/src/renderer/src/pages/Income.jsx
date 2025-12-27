import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { transactionService } from '../services/transactionService'
import { practiceService } from '../services/practiceService'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import styles from './Income.module.css'

/**
 * Income Page
 * Track payments received from dental practices
 */
const Income = () => {
  const { fiscalYear } = useApp()
  const [practices, setPractices] = useState([])
  const [transactions, setTransactions] = useState([])
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showPracticeModal, setShowPracticeModal] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    practiceId: null,
    categoryId: 1,
    type: 'income',
    status: 'cleared',
    reconciled: false,
    paymentMethod: 'check'
  })
  const [newPractice, setNewPractice] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    tin: ''
  })

  const loadPractices = async () => {
    try {
      const data = await practiceService.getAll()
      setPractices(data.filter((p) => p.isActive))
    } catch (error) {
      console.error('Failed to load practices:', error)
    }
  }

  const loadIncomeTransactions = async () => {
    try {
      const allTransactions = await transactionService.getAll()
      const incomeOnly = allTransactions
        .filter((t) => t.type === 'income')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      setTransactions(incomeOnly.slice(0, 10)) // Show last 10
    } catch (error) {
      console.error('Failed to load transactions:', error)
    }
  }

  useEffect(() => {
    loadPractices()
    loadIncomeTransactions()
  }, [])

  const handleAddPractice = async (e) => {
    e.preventDefault()
    try {
      const practice = await practiceService.create({
        ...newPractice,
        isActive: true
      })
      setNewPractice({ name: '', address: '', city: '', state: '', zip: '', tin: '' })
      setShowPracticeModal(false)
      await loadPractices()
      // Set the newly created practice as selected
      if (practice) {
        setFormData({ ...formData, practiceId: practice.id })
      }
    } catch (error) {
      console.error('Failed to add practice:', error)
      alert('Failed to add practice. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.practiceId || formData.practiceId === null) {
      alert('Please select a practice first!')
      return
    }

    try {
      const transaction = {
        date: formData.date,
        description: formData.description,
        amount: parseFloat(formData.amount),
        practiceId: Number(formData.practiceId),
        categoryId: 1, // Income category
        type: 'income',
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
        practiceId: formData.practiceId, // Keep same practice selected
        categoryId: 1,
        type: 'income',
        status: 'cleared',
        reconciled: false,
        paymentMethod: 'check'
      })
      setShowIncomeModal(false)
      await loadIncomeTransactions()
    } catch (err) {
      console.error('Submission failed:', err)
      alert('Failed to record payment. Please try again.')
    }
  }

  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>💰 Income from Practices</h1>
          <p className={styles.subtitle}>Track payments you receive from dental offices</p>
        </div>
        <div className={styles.totalBadge}>
          Total This Year: <strong>${totalIncome.toLocaleString()}</strong>
        </div>
      </header>

      <div className={styles.guideCard}>
        <div className={styles.guideIcon}>📝</div>
        <div className={styles.guideContent}>
          <h3>How to Use This Page</h3>
          <ol className={styles.stepList}>
            <li>
              <strong>First time?</strong> Add the dental practices you work with below
            </li>
            <li>
              <strong>Got paid?</strong> Record the payment by selecting the practice and entering
              the amount
            </li>
            <li>
              <strong>That&apos;s it!</strong> The app will track all your income automatically
            </li>
          </ol>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            if (practices.length === 0) {
              alert('Please add a practice first!')
              setShowPracticeModal(true)
            } else {
              if (!formData.practiceId) {
                setFormData({ ...formData, practiceId: practices[0].id })
              }
              setShowIncomeModal(true)
            }
          }}
        >
          💰 Record Payment
        </Button>
        <Button variant="outline" size="lg" onClick={() => setShowPracticeModal(true)}>
          🏥 Manage Practices
        </Button>
      </div>

      <div className={styles.twoColumn}>
        {/* Practice Management */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>🏥 Your Practices</h3>
          </div>

          <div className={styles.practiceList}>
            {practices.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No practices yet. Click &quot;Manage Practices&quot; to add one! 👆</p>
              </div>
            ) : (
              practices.map((practice) => (
                <div
                  key={practice.id}
                  className={`${styles.practiceItem} ${
                    formData.practiceId === practice.id ? styles.selected : ''
                  }`}
                  onClick={() => setFormData({ ...formData, practiceId: practice.id })}
                >
                  <div className={styles.practiceName}>{practice.name}</div>
                  {practice.city && (
                    <div className={styles.practiceLocation}>
                      {practice.city}, {practice.state}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Stats */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>📊 Income Summary</h3>
          <div className={styles.statsCard}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Total Income {fiscalYear}</div>
              <div className={styles.statValue}>${totalIncome.toLocaleString()}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Number of Payments</div>
              <div className={styles.statValue}>{transactions.length}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Active Practices</div>
              <div className={styles.statValue}>{practices.length}</div>
            </div>
          </div>
        </section>
      </div>

      {/* Income Modal */}
      <Modal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        title="💰 Record Payment from Practice"
        size="medium"
      >
        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Which practice paid you?</label>
            <select
              className={styles.input}
              value={formData.practiceId || ''}
              onChange={(e) => setFormData({ ...formData, practiceId: Number(e.target.value) })}
              required
            >
              <option value="">Select a practice...</option>
              {practices.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>When did you receive the payment?</label>
            <input
              className={styles.input}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>What was this payment for?</label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g., August clinical services, Week of Dec 15-19"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>How much did they pay you?</label>
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
            <label className={styles.label}>Payment Method</label>
            <select
              className={styles.input}
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="check">Check</option>
              <option value="ach">Direct Deposit (ACH)</option>
              <option value="wire">Wire Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div className={styles.buttonGroup}>
            <Button variant="outline" onClick={() => setShowIncomeModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              💰 Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Practice Modal */}
      <Modal
        isOpen={showPracticeModal}
        onClose={() => setShowPracticeModal(false)}
        title="🏥 Add New Practice"
        size="medium"
      >
        <form className={styles.modalForm} onSubmit={handleAddPractice}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Practice Name *</label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g., Smile Dental Group"
              value={newPractice.name}
              onChange={(e) => setNewPractice({ ...newPractice, name: e.target.value })}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Address (Optional)</label>
            <input
              className={styles.input}
              type="text"
              placeholder="123 Main St"
              value={newPractice.address}
              onChange={(e) => setNewPractice({ ...newPractice, address: e.target.value })}
            />
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>City</label>
              <input
                className={styles.input}
                type="text"
                value={newPractice.city}
                onChange={(e) => setNewPractice({ ...newPractice, city: e.target.value })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>State</label>
              <input
                className={styles.input}
                type="text"
                maxLength={2}
                placeholder="CA"
                value={newPractice.state}
                onChange={(e) =>
                  setNewPractice({ ...newPractice, state: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>ZIP</label>
              <input
                className={styles.input}
                type="text"
                maxLength={5}
                value={newPractice.zip}
                onChange={(e) => setNewPractice({ ...newPractice, zip: e.target.value })}
              />
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <Button variant="outline" onClick={() => setShowPracticeModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Practice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Recent Income */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Recent Payments</h3>
        <div className={styles.transactionList}>
          {transactions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No income recorded yet. Add your first payment above! ☝️</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Practice</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const practice = practices.find((p) => p.id === t.practiceId)
                  return (
                    <tr key={t.id}>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td>{practice?.name || 'Unknown'}</td>
                      <td>{t.description}</td>
                      <td className={styles.amount}>${t.amount.toLocaleString()}</td>
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

export default Income
