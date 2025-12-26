export const appSchema = {
  // Primary Key (++) means auto-incrementing ID
  // We index fields we want to search/filter by (like date and status)
  transactions: '++id, date, categoryId, status, amount',
  categories: '++id, name, type',
  settings: 'key, value'
}
