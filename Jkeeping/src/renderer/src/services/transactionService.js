import db from '../db'
import { TransactionSchema } from '../db/validation/transactionSchema'

export const transactionService = {
  // Get all transactions sorted by date
  getAll: async () => {
    return await db.transactions.orderBy('date').reverse().toArray()
  },

  // Get transactions by practice
  getByPractice: async (practiceId) => {
    return await db.transactions.where('practiceId').equals(practiceId).reverse().sortBy('date')
  },

  // Add a transaction with validation
  create: async (data) => {
    const validatedData = TransactionSchema.parse(data)
    return await db.transactions.add(validatedData)
  },

  // Update a transaction
  update: async (id, data) => {
    return await db.transactions.update(id, data)
  },

  // Get transactions by category (e.g., all "Lab Fees")
  getByCategory: async (categoryId) => {
    return await db.transactions.where('categoryId').equals(categoryId).toArray()
  },

  // Get transactions by date range
  getByDateRange: async (startDate, endDate) => {
    return await db.transactions.where('date').between(startDate, endDate, true, true).toArray()
  },

  // Delete a record
  delete: async (id) => {
    return await db.transactions.delete(id)
  },

  // Bulk import transactions
  bulkCreate: async (transactions) => {
    return await db.transactions.bulkAdd(transactions)
  },

  // Get reconciled vs unreconciled
  getUnreconciled: async (practiceId) => {
    const query = db.transactions.where('reconciled').equals(0)
    if (practiceId) {
      return await query.and((t) => t.practiceId === practiceId).toArray()
    }
    return await query.toArray()
  }
}
