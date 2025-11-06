import { Schema } from 'effect';

export const ReceiptDataSchema = Schema.Struct({
  merchant_name: Schema.NullishOr(Schema.String),
  merchant_address: Schema.NullishOr(Schema.String),
  // Transaction details
  receipt_number: Schema.NullishOr(Schema.String),
  date: Schema.NullishOr(Schema.String),
  time: Schema.NullishOr(Schema.String),

  // Line items (simplified)
  items: Schema.NullishOr(
    Schema.Array(
      Schema.Struct({
        name: Schema.NullishOr(Schema.String),
        quantity: Schema.NullishOr(Schema.Number),
        price: Schema.NullishOr(Schema.Number),
        total: Schema.NullishOr(Schema.Number),
      }),
    ),
  ),

  // Financial summary
  subtotal: Schema.NullishOr(Schema.Number),
  tax: Schema.NullishOr(Schema.Number),
  total: Schema.NullishOr(Schema.Number),
  currency: Schema.NullishOr(Schema.String),

  // Payment info
  payment_method: Schema.NullishOr(Schema.String),
  amount_paid: Schema.NullishOr(Schema.Number),
  change: Schema.NullishOr(Schema.Number),
});
