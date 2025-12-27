export const appSchema = {
  // Primary Key (++) means auto-incrementing ID
  // We index fields we want to search/filter by (like date and status)
  transactions: '++id, date, categoryId, status, amount, practiceId, type, reconciled',
  categories: '++id, name, type',
  practices: '++id, name, isActive',
  productions: '++id, date, practiceId, patientId, amount',
  collections: '++id, date, practiceId, productionId, amount, paymentMethod',
  taxEvents: '++id, quarter, year, type, dueDate',
  reconciliations: '++id, practiceId, month, year, status',
  settings: 'key, value'
}
