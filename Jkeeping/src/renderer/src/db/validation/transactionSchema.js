import { z } from 'zod'

export const TransactionSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  description: z.string().min(2, 'Description is too short'),
  amount: z.number().positive('Amount must be greater than 0'),
  categoryId: z.number().int(),
  status: z.enum(['pending', 'cleared', 'flagged']).default('pending'),
  note: z.string().optional()
})
