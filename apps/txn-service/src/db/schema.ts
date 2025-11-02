import { pgTable, text, integer, boolean, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';

export const priorityEnum = pgEnum('priority', ['high', 'medium', 'low']);
export const statusEnum = pgEnum('status', ['open', 'in_progress', 'closed']);

/**
 * Transactions table matching Confluent Cloud Avro schema
 * Schema: com.mycorp.mynamespace.SampleRecord
 * All fields from the Avro schema are included
 */
export const transactions = pgTable('transactions', {
  // Primary key
  transaction_id: text('transaction_id').primaryKey(),

  // Financial details
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  value_date: text('value_date').notNull(),

  // Booking information
  booking_datetime: text('booking_datetime').notNull(),
  booking_jurisdiction: text('booking_jurisdiction').notNull(),
  regulator: text('regulator').notNull(),

  // Channel and product
  channel: text('channel').notNull(),
  product_type: text('product_type').notNull(),
  product_complex: boolean('product_complex').notNull(),
  product_has_va_exposure: boolean('product_has_va_exposure').notNull(),

  // Originator details
  originator_name: text('originator_name').notNull(),
  originator_account: text('originator_account').notNull(),
  originator_country: text('originator_country').notNull(),
  ordering_institution_bic: text('ordering_institution_bic').notNull(),

  // Beneficiary details
  beneficiary_name: text('beneficiary_name').notNull(),
  beneficiary_account: text('beneficiary_account').notNull(),
  beneficiary_country: text('beneficiary_country').notNull(),
  beneficiary_institution_bic: text('beneficiary_institution_bic').notNull(),

  // SWIFT message details
  swift_mt: text('swift_mt').notNull(),
  swift_f50_present: boolean('swift_f50_present').notNull(),
  swift_f59_present: boolean('swift_f59_present').notNull(),
  swift_f70_purpose: text('swift_f70_purpose').notNull(),
  swift_f71_charges: text('swift_f71_charges').notNull(),

  // Travel Rule and compliance
  travel_rule_complete: boolean('travel_rule_complete').notNull(),

  // FX details
  fx_indicator: boolean('fx_indicator').notNull(),
  fx_base_ccy: text('fx_base_ccy').notNull(),
  fx_quote_ccy: text('fx_quote_ccy').notNull(),
  fx_applied_rate: integer('fx_applied_rate').notNull(),
  fx_market_rate: integer('fx_market_rate').notNull(),
  fx_spread_bps: integer('fx_spread_bps').notNull(),
  fx_counterparty: text('fx_counterparty').notNull(),

  // Customer information
  customer_id: text('customer_id').notNull(),
  customer_type: text('customer_type').notNull(),
  customer_risk_rating: text('customer_risk_rating').notNull(),
  customer_is_pep: boolean('customer_is_pep').notNull(),

  // KYC details
  kyc_last_completed: text('kyc_last_completed').notNull(),
  kyc_due_date: text('kyc_due_date').notNull(),
  edd_required: boolean('edd_required').notNull(),
  edd_performed: boolean('edd_performed').notNull(),
  sow_documented: boolean('sow_documented').notNull(),

  // Transaction purpose and narrative
  purpose_code: text('purpose_code').notNull(),
  narrative: text('narrative').notNull(),

  // Advisory and suitability
  is_advised: boolean('is_advised').notNull(),
  client_risk_profile: text('client_risk_profile').notNull(),
  suitability_assessed: boolean('suitability_assessed').notNull(),
  suitability_result: text('suitability_result').notNull(),

  // Virtual assets
  va_disclosure_provided: boolean('va_disclosure_provided').notNull(),

  // Cash transactions
  cash_id_verified: boolean('cash_id_verified').notNull(),
  daily_cash_total_customer: integer('daily_cash_total_customer').notNull(),
  daily_cash_txn_count: integer('daily_cash_txn_count').notNull(),

  // Sanctions and suspicious activity
  sanctions_screening: text('sanctions_screening').notNull(),
  suspicion_determined_datetime: text('suspicion_determined_datetime').notNull(),
  str_filed_datetime: text('str_filed_datetime').notNull(),
});

export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  priority: priorityEnum('priority').notNull(),
  type: text('type').notNull(),
  status: statusEnum('status').notNull(),
  assignedTo: text('assigned_to'),
  transactionId: text('transaction_id').references(() => transactions.transaction_id),
  clientDocumentId: text('client_document_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const clientDocuments = pgTable('client_documents', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull(),
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(),
  analysisResults: jsonb('analysis_results'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
