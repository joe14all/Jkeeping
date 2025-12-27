import db from '../db'

export const productionService = {
  // Create production entry (what was billed/earned)
  createProduction: async (data) => {
    return await db.productions.add({
      ...data,
      createdAt: new Date().toISOString()
    })
  },

  // Create collection entry (what was actually received)
  createCollection: async (data) => {
    return await db.collections.add({
      ...data,
      createdAt: new Date().toISOString()
    })
  },

  // Get production vs collection summary
  getSummary: async (practiceId, startDate, endDate) => {
    let productionQuery = db.productions.where('date').between(startDate, endDate, true, true)
    let collectionQuery = db.collections.where('date').between(startDate, endDate, true, true)

    if (practiceId) {
      productionQuery = productionQuery.and((p) => p.practiceId === practiceId)
      collectionQuery = collectionQuery.and((c) => c.practiceId === practiceId)
    }

    const productions = await productionQuery.toArray()
    const collections = await collectionQuery.toArray()

    const totalProduction = productions.reduce((sum, p) => sum + p.amount, 0)
    const totalCollections = collections.reduce((sum, c) => sum + c.amount, 0)

    return {
      production: totalProduction,
      collections: totalCollections,
      collectionPercentage: totalProduction > 0 ? (totalCollections / totalProduction) * 100 : 0,
      outstandingAR: totalProduction - totalCollections
    }
  },

  // Get aging accounts receivable
  getAgingAR: async (practiceId) => {
    // Get all productions
    let query = db.productions.toCollection()
    if (practiceId) {
      query = db.productions.where('practiceId').equals(practiceId)
    }

    const productions = await query.toArray()

    // Get all collections with productionId
    const collections = await db.collections.toArray()

    // Group collections by productionId
    const collectionsByProduction = collections.reduce((acc, c) => {
      if (!acc[c.productionId]) acc[c.productionId] = 0
      acc[c.productionId] += c.amount
      return acc
    }, {})

    const now = new Date()
    const aging = {
      current: 0, // 0-30 days
      thirtyDays: 0, // 31-60 days
      sixtyDays: 0, // 61-90 days
      ninetyDaysPlus: 0 // 90+ days
    }

    productions.forEach((prod) => {
      const collected = collectionsByProduction[prod.id] || 0
      const balance = prod.amount - collected

      if (balance > 0) {
        const daysSince = Math.floor((now - new Date(prod.date)) / (1000 * 60 * 60 * 24))

        if (daysSince <= 30) aging.current += balance
        else if (daysSince <= 60) aging.thirtyDays += balance
        else if (daysSince <= 90) aging.sixtyDays += balance
        else aging.ninetyDaysPlus += balance
      }
    })

    return aging
  },

  // Get collection breakdown by payment method
  getCollectionsByMethod: async (practiceId, startDate, endDate) => {
    let query = db.collections.where('date').between(startDate, endDate, true, true)

    if (practiceId) {
      query = query.and((c) => c.practiceId === practiceId)
    }

    const collections = await query.toArray()

    const breakdown = collections.reduce((acc, c) => {
      const method = c.paymentMethod || 'Unknown'
      if (!acc[method]) acc[method] = 0
      acc[method] += c.amount
      return acc
    }, {})

    return breakdown
  },

  // Get collection velocity (average days to collect)
  getCollectionVelocity: async (practiceId) => {
    let prodQuery = db.productions.toCollection()
    if (practiceId) {
      prodQuery = db.productions.where('practiceId').equals(practiceId)
    }

    const productions = await prodQuery.toArray()
    const collections = await db.collections.toArray()

    let totalDays = 0
    let count = 0

    productions.forEach((prod) => {
      const relatedCollections = collections.filter((c) => c.productionId === prod.id)
      relatedCollections.forEach((col) => {
        const days = Math.floor((new Date(col.date) - new Date(prod.date)) / (1000 * 60 * 60 * 24))
        if (days >= 0) {
          totalDays += days
          count++
        }
      })
    })

    return count > 0 ? totalDays / count : 0
  }
}
