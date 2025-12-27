import db from '../db'
import { reportService } from './reportService'

export const taxPlanningService = {
  // Calculate quarterly estimated tax payments
  getQuarterlyEstimate: async (year, quarter, practiceId = null) => {
    const quarterRanges = {
      1: { start: `${year}-01-01`, end: `${year}-03-31` },
      2: { start: `${year}-04-01`, end: `${year}-06-30` },
      3: { start: `${year}-07-01`, end: `${year}-09-30` },
      4: { start: `${year}-10-01`, end: `${year}-12-31` }
    }

    const range = quarterRanges[quarter]
    const pl = await reportService.getPLSummary(range.start, range.end)

    // Federal estimated tax (25% rule of thumb for S-Corp)
    const federalTax = pl.netProfit * 0.25

    // Self-employment tax (approx 15.3% on reasonable compensation)
    const seAssumption = pl.netProfit * 0.4 // 40% as reasonable compensation
    const seTax = seAssumption * 0.153

    // State tax (example: 5% - adjust based on state)
    const stateTax = pl.netProfit * 0.05

    return {
      quarter,
      netProfit: pl.netProfit,
      estimatedFederal: federalTax,
      estimatedSE: seTax,
      estimatedState: stateTax,
      totalEstimated: federalTax + seTax + stateTax,
      dueDate: getTaxDueDate(year, quarter)
    }
  },

  // Calculate safe harbor amount (100% of prior year or 110% if high income)
  getSafeHarbor: async (currentYear, priorYearTax = null) => {
    // If prior year tax not provided, try to calculate from last year's data
    if (!priorYearTax) {
      const priorYear = currentYear - 1
      const pl = await reportService.getPLSummary(`${priorYear}-01-01`, `${priorYear}-12-31`)
      priorYearTax = pl.netProfit * 0.25 // Simplified
    }

    const safeHarborPercentage = priorYearTax > 150000 ? 1.1 : 1.0
    const quarterlyAmount = (priorYearTax * safeHarborPercentage) / 4

    return {
      priorYearTax,
      safeHarborMultiplier: safeHarborPercentage,
      totalSafeHarbor: priorYearTax * safeHarborPercentage,
      quarterlyPayment: quarterlyAmount
    }
  },

  // Calculate reasonable S-Corp officer compensation
  calculateReasonableCompensation: async (year, practiceId = null) => {
    const pl = await reportService.getPLSummary(`${year}-01-01`, `${year}-12-31`)

    // IRS guidance: 40-60% of net profit as reasonable W-2 compensation
    const lowRange = pl.netProfit * 0.4
    const midRange = pl.netProfit * 0.5
    const highRange = pl.netProfit * 0.6

    // Calculate tax savings from S-Corp structure
    const asW2Tax = pl.netProfit * 0.153 // All as self-employment
    const asSCorpTax = midRange * 0.153 // Only W-2 portion subject to SE tax
    const savings = asW2Tax - asSCorpTax

    return {
      netProfit: pl.netProfit,
      recommendedRange: {
        low: lowRange,
        mid: midRange,
        high: highRange
      },
      estimatedSavings: savings
    }
  },

  // Get all tax due dates for the year
  getTaxCalendar: (year) => {
    return [
      { quarter: 1, type: 'Estimated Tax', dueDate: `${year}-04-15`, form: '1040-ES' },
      { quarter: 2, type: 'Estimated Tax', dueDate: `${year}-06-15`, form: '1040-ES' },
      { quarter: 3, type: 'Estimated Tax', dueDate: `${year}-09-15`, form: '1040-ES' },
      { quarter: 4, type: 'Estimated Tax', dueDate: `${year + 1}-01-15`, form: '1040-ES' },
      { type: 'S-Corp Tax Return', dueDate: `${year + 1}-03-15`, form: '1120-S' },
      { type: 'Personal Tax Return', dueDate: `${year + 1}-04-15`, form: '1040' }
    ]
  },

  // Store tax payment record
  recordTaxPayment: async (data) => {
    return await db.taxEvents.add({
      ...data,
      createdAt: new Date().toISOString()
    })
  },

  // Get tax payment history
  getTaxHistory: async (year) => {
    return await db.taxEvents.where('year').equals(year).toArray()
  },

  // Calculate QBI deduction (Qualified Business Income)
  calculateQBIDeduction: async (year, practiceId = null) => {
    const pl = await reportService.getPLSummary(`${year}-01-01`, `${year}-12-31`)

    // QBI deduction is generally 20% of qualified business income
    // (subject to limitations based on income level and business type)
    const qbiDeduction = pl.netProfit * 0.2

    return {
      qualifiedBusinessIncome: pl.netProfit,
      qbiDeduction,
      taxSavings: qbiDeduction * 0.37 // Assuming 37% marginal rate (high earner)
    }
  }
}

// Helper function to get tax due dates
const getTaxDueDate = (year, quarter) => {
  const dueDates = {
    1: `${year}-04-15`,
    2: `${year}-06-15`,
    3: `${year}-09-15`,
    4: `${year + 1}-01-15`
  }
  return dueDates[quarter]
}
