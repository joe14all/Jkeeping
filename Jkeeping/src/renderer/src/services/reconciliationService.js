import db from '../db'

export const reconciliationService = {
  // Get unreconciled transactions
  getUnreconciled: async (practiceId, month, year) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    let query = db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .and((t) => !t.reconciled)

    if (practiceId) {
      return await query.and((t) => t.practiceId === practiceId).toArray()
    }

    return await query.toArray()
  },

  // Get reconciliation status for a month
  getMonthStatus: async (practiceId, month, year) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    let query = db.transactions.where('date').between(startDate, endDate, true, true)

    if (practiceId) {
      query = query.and((t) => t.practiceId === practiceId)
    }

    const transactions = await query.toArray()
    const total = transactions.length
    const reconciled = transactions.filter((t) => t.reconciled).length

    return {
      total,
      reconciled,
      unreconciled: total - reconciled,
      percentage: total > 0 ? (reconciled / total) * 100 : 0
    }
  },

  // Mark transactions as reconciled
  markReconciled: async (transactionIds) => {
    const updates = transactionIds.map((id) => db.transactions.update(id, { reconciled: true }))
    return await Promise.all(updates)
  },

  // Mark transaction as unreconciled
  markUnreconciled: async (transactionId) => {
    return await db.transactions.update(transactionId, { reconciled: false })
  },

  // Create reconciliation record
  createReconciliation: async (practiceId, month, year, bankBalance) => {
    const transactions = await reconciliationService.getUnreconciled(practiceId, month, year)

    const bookBalance = transactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount)
    }, 0)

    return await db.reconciliations.add({
      practiceId,
      month,
      year,
      bankBalance,
      bookBalance,
      difference: bankBalance - bookBalance,
      status: Math.abs(bankBalance - bookBalance) < 0.01 ? 'matched' : 'discrepancy',
      createdAt: new Date().toISOString()
    })
  },

  // Get reconciliation history
  getHistory: async (practiceId) => {
    if (practiceId) {
      return await db.reconciliations
        .where('practiceId')
        .equals(practiceId)
        .reverse()
        .sortBy('year')
    }
    return await db.reconciliations.toArray()
  }
}
