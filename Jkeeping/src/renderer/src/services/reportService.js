import db from '../db'
import { startOfYear, endOfYear, startOfQuarter, endOfQuarter } from 'date-fns'

export const reportService = {
  /**
   * Generates a Profit & Loss summary for a specific date range
   */
  getPLSummary: async (startDate, endDate) => {
    const transactions = await db.transactions.where('date').between(startDate, endDate).toArray()

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expenses,
      netProfit: income - expenses,
      overheadRatio: income > 0 ? (expenses / income) * 100 : 0
    }
  },

  /**
   * Calculates Dental-Specific KPIs
   * Lab fees should typically be 6-10% of gross production
   * Supplies should be 5-7%
   */
  getDentalKPIs: async (year = new Date().getFullYear()) => {
    const start = startOfYear(new Date(year, 0, 1)).toISOString()
    const end = endOfYear(new Date(year, 0, 1)).toISOString()

    const transactions = await db.transactions.where('date').between(start, end).toArray()

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const getCategoryTotal = (catName) =>
      transactions.filter((t) => t.categoryName === catName).reduce((sum, t) => sum + t.amount, 0)

    const labFees = getCategoryTotal('Lab Fees')
    const supplies = getCategoryTotal('Dental Supplies')

    return {
      labFeePercentage: totalIncome > 0 ? (labFees / totalIncome) * 100 : 0,
      supplyPercentage: totalIncome > 0 ? (supplies / totalIncome) * 100 : 0,
      isLabHealthy: labFees / totalIncome <= 0.1 // Benchmark 10%
    }
  },

  /**
   * S-Corp Estimated Tax Preparation
   * Estimates 25% of net profit for quarterly vouchers
   */
  getTaxProjection: async (quarter) => {
    // quarters 1-4
    const now = new Date()
    const start = startOfQuarter(now).toISOString() // Simplified for current Q
    const end = endOfQuarter(now).toISOString()

    const pl = await reportService.getPLSummary(start, end)
    const estimatedTax = pl.netProfit > 0 ? pl.netProfit * 0.25 : 0

    return {
      quarter,
      projectedNet: pl.netProfit,
      estimatedVoucherAmount: estimatedTax
    }
  }
}
