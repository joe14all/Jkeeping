import db from '../db'
import { TransactionSchema } from '../db/validation/transactionSchema'

export const transactionService = {
  // Get all transactions sorted by date
  getAll: async () => {
    return await db.transactions.orderBy('date').reverse().toArray()
  },

  // Add a transaction with validation
  create: async (data) => {
    const validatedData = TransactionSchema.parse(data)
    return await db.transactions.add(validatedData)
  },

  // Get transactions by category (e.g., all "Lab Fees")
  getByCategory: async (categoryId) => {
    return await db.transactions.where('categoryId').equals(categoryId).toArray()
  },

  // Delete a record
  delete: async (id) => {
    return await db.transactions.delete(id)
  }
}
