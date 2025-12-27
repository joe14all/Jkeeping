import db from '../db'

export const practiceService = {
  // Get all practices
  getAll: async () => {
    return await db.practices.toArray()
  },

  // Get active practices only
  getActive: async () => {
    return await db.practices.where('isActive').equals(1).toArray()
  },

  // Get single practice by ID
  getById: async (id) => {
    return await db.practices.get(id)
  },

  // Create new practice
  create: async (data) => {
    const id = await db.practices.add({
      ...data,
      isActive: true,
      createdAt: new Date().toISOString()
    })
    return await db.practices.get(id)
  },

  // Update practice
  update: async (id, data) => {
    return await db.practices.update(id, data)
  },

  // Soft delete (deactivate)
  deactivate: async (id) => {
    return await db.practices.update(id, { isActive: false })
  },

  // Get practice stats
  getStats: async (practiceId, startDate, endDate) => {
    const transactions = await db.transactions
      .where('practiceId')
      .equals(practiceId)
      .and((t) => t.date >= startDate && t.date <= endDate)
      .toArray()

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: income - expenses,
      transactionCount: transactions.length
    }
  }
}
