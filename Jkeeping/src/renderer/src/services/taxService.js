import db from '../db'

export const taxService = {
  // Calculate total expenses for a specific period
  calculateTotalExpenses: async (startDate, endDate) => {
    const transactions = await db.transactions.where('date').between(startDate, endDate).toArray()

    return transactions
      .filter((t) => t.amount > 0) // Ensure we only count positive expense values
      .reduce((sum, t) => sum + t.amount, 0)
  },

  // Estimate Quarterly Tax (25% rule of thumb, adjustable)
  estimateQuarterlyTax: async (quarter) => {
    // Logic to sum income and subtract expenses for the quarter
    // This is where your dental practice profit logic lives
    const totalProfit = 50000 // Mock calculation
    return totalProfit * 0.25
  }
}
