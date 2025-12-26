import Dexie from 'dexie'
import { appSchema } from './schema/appSchema'
import initialData from './seeds/initialData.json'

// Initialize the Database
export const db = new Dexie('JkeepingDB')

db.version(1).stores(appSchema)

// Hook to populate the DB with categories on first run
db.on('populate', async () => {
  console.log('Initializing Jkeeping for the first time...')
  await db.categories.bulkAdd(initialData.categories)
  await db.transactions.bulkAdd(initialData.mockTransactions)

  await db.settings.add({ key: 'setupComplete', value: true })
  await db.settings.add({ key: 'currency', value: 'USD' })
})

// Helper function to validate and add a transaction
export const addTransaction = async (data) => {
  try {
    // 1. Run validation
    // TransactionSchema.parse(data);

    // 2. Add to IndexedDB
    return await db.transactions.add(data)
  } catch (error) {
    console.error('Database Error:', error)
    throw error
  }
}

export default db
