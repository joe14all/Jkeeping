import db from '../db'

export const csvService = {
  // Parse CSV text to transactions array
  parseCSV: (csvText) => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const transactions = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      const transaction = {}

      headers.forEach((header, index) => {
        transaction[header] = values[index]
      })

      // Map common CSV formats to our schema
      const mapped = {
        date: transaction.date || transaction['transaction date'] || transaction['posting date'],
        description:
          transaction.description ||
          transaction.memo ||
          transaction.payee ||
          transaction['transaction description'],
        amount: Math.abs(
          parseFloat(transaction.amount || transaction.debit || transaction.credit || 0)
        ),
        type: parseFloat(transaction.amount || 0) < 0 ? 'expense' : 'income',
        status: 'pending',
        categoryId: 1, // Default category
        reconciled: false
      }

      if (mapped.date && mapped.description && mapped.amount) {
        transactions.push(mapped)
      }
    }

    return transactions
  },

  // Auto-categorize based on description patterns
  autoCategorize: async (transaction) => {
    const desc = transaction.description.toLowerCase()

    // Load categories
    const categories = await db.categories.toArray()

    // Pattern matching rules
    const rules = [
      { pattern: /lab|glidewell|crown|dental lab/i, category: 'Lab Fees' },
      { pattern: /schein|patterson|supply|composite|bonding/i, category: 'Dental Supplies' },
      { pattern: /ce course|continuing education|seminar/i, category: 'Continuing Education' },
      { pattern: /payroll|salary|w-2|wage/i, category: 'S-Corp Payroll' },
      { pattern: /patient|insurance payment|delta|cigna/i, category: 'Clinical Income' },
      { pattern: /rent|lease/i, category: 'Rent' },
      { pattern: /electric|gas|water|utility/i, category: 'Utilities' }
    ]

    for (const rule of rules) {
      if (rule.pattern.test(desc)) {
        const category = categories.find((c) => c.name === rule.category)
        if (category) {
          return category.id
        }
      }
    }

    return 1 // Default category
  },

  // Import transactions from CSV
  importCSV: async (csvText, practiceId = 1) => {
    const transactions = csvService.parseCSV(csvText)

    // Auto-categorize each transaction
    for (const transaction of transactions) {
      transaction.categoryId = await csvService.autoCategorize(transaction)
      transaction.practiceId = practiceId
    }

    // Bulk add to database
    const ids = await db.transactions.bulkAdd(transactions)
    return { imported: ids.length, transactions }
  },

  // Export transactions to CSV
  exportCSV: async (practiceId = null, startDate = null, endDate = null) => {
    let query = db.transactions.toCollection()

    if (practiceId) {
      query = db.transactions.where('practiceId').equals(practiceId)
    }

    let transactions = await query.toArray()

    // Filter by date range if provided
    if (startDate && endDate) {
      transactions = transactions.filter((t) => t.date >= startDate && t.date <= endDate)
    }

    // Generate CSV
    const headers = [
      'Date',
      'Description',
      'Amount',
      'Type',
      'Status',
      'Category ID',
      'Practice ID'
    ]
    const rows = transactions.map((t) => [
      t.date,
      `"${t.description}"`,
      t.amount,
      t.type,
      t.status,
      t.categoryId,
      t.practiceId
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    return csv
  },

  // Download CSV file
  downloadCSV: (csvContent, filename = 'transactions.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
