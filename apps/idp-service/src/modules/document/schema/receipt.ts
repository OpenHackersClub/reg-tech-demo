import { z } from 'zod';

// Simplified flat schema for receipt extraction - Meta compatible
export const ReceiptDataSchema = z.object({
  // Basic merchant info
  merchant_name: z.string().nullish(),
  merchant_address: z.string().nullish(),

  // Transaction details
  receipt_number: z.string().nullish(),
  date: z.string().nullish(),
  time: z.string().nullish(),

  // Line items (simplified)
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
      total: z.number(),
    }),
  ),

  // Financial summary
  subtotal: z.number().nullish(),
  tax: z.number().nullish(),
  total: z.number(),
  currency: z.string().nullish(),

  // Payment info
  payment_method: z.string().nullish(),
  amount_paid: z.number().nullish(),
  change: z.number().nullish(),

  // // Metadata
  // is_refund: z.boolean(),
  // quality: z.enum(['excellent', 'good', 'fair', 'poor']),
});

// Type inference from Zod schema
export type ReceiptData = z.infer<typeof ReceiptDataSchema>;
