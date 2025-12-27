import React, { useState, useEffect } from 'react'
import { transactionService } from '../../services/transactionService'
import { format } from 'date-fns'
import Button from '../ui/Button'
import styles from './TransactionTable.module.css'

const TransactionTable = ({ practiceId, refreshTrigger }) => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    loadTransactions()
  }, [practiceId, refreshTrigger])

  useEffect(() => {
    applyFilters()
  }, [transactions, searchTerm, filterType, filterStatus, sortField, sortDirection])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const data = practiceId
        ? await transactionService.getByPractice(practiceId)
        : await transactionService.getAll()
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.amount.toString().includes(searchTerm)
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === filterStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (sortField === 'date') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredTransactions(filtered)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleEdit = (transaction) => {
    setEditingId(transaction.id)
    setEditForm({ ...transaction })
  }

  const handleSave = async (id) => {
    try {
      await transactionService.update(id, editForm)
      setEditingId(null)
      loadTransactions()
    } catch (error) {
      console.error('Failed to update transaction:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.delete(id)
        loadTransactions()
      } catch (error) {
        console.error('Failed to delete transaction:', error)
      }
    }
  }

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.length} selected transactions?`)) {
      try {
        await Promise.all(selectedIds.map((id) => transactionService.delete(id)))
        setSelectedIds([])
        loadTransactions()
      } catch (error) {
        console.error('Failed to delete transactions:', error)
      }
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredTransactions.map((t) => t.id))
    }
  }

  if (loading) return <div className={styles.loading}>Loading transactions...</div>

  return (
    <div className={styles.container}>
      {/* Filters and Search */}
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search transactions..."
          className={styles.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className={styles.filter}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          className={styles.filter}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="cleared">Cleared</option>
          <option value="flagged">Flagged</option>
        </select>

        {selectedIds.length > 0 && (
          <Button variant="outline" onClick={handleBulkDelete} size="sm">
            Delete {selectedIds.length} Selected
          </Button>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('date')} className={styles.sortable}>
                Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('description')} className={styles.sortable}>
                Description {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('amount')} className={styles.sortable}>
                Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.empty}>
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className={selectedIds.includes(transaction.id) ? styles.selected : ''}>
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(transaction.id)}
                      onChange={() => toggleSelect(transaction.id)}
                    />
                  </td>
                  {editingId === transaction.id ? (
                    <>
                      <td>
                        <input
                          type="date"
                          className={styles.editInput}
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className={styles.editInput}
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className={styles.editInput}
                          value={editForm.amount}
                          onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                        />
                      </td>
                      <td>
                        <select
                          className={styles.editInput}
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        >
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className={styles.editInput}
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="cleared">Cleared</option>
                          <option value="flagged">Flagged</option>
                        </select>
                      </td>
                      <td className={styles.actions}>
                        <button className={styles.saveBtn} onClick={() => handleSave(transaction.id)}>
                          ✓
                        </button>
                        <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>
                          ✕
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                      <td>{transaction.description}</td>
                      <td className={transaction.type === 'income' ? styles.income : styles.expense}>
                        ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[transaction.type]}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[transaction.status]}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => handleEdit(transaction)}>
                          ✎
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(transaction.id)}>
                          🗑
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Transactions:</span>
          <span className={styles.summaryValue}>{filteredTransactions.length}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Income:</span>
          <span className={`${styles.summaryValue} ${styles.income}`}>
            $
            {filteredTransactions
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Expenses:</span>
          <span className={`${styles.summaryValue} ${styles.expense}`}>
            $
            {filteredTransactions
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TransactionTable
