import { pgTable, text, decimal, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';

export const priorityEnum = pgEnum('priority', ['high', 'medium', 'low']);
export const statusEnum = pgEnum('status', ['open', 'in_progress', 'closed']);

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
  currency: text('currency').notNull(),
  senderId: text('sender_id').notNull(),
  receiverId: text('receiver_id').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  priority: priorityEnum('priority').notNull(),
  type: text('type').notNull(),
  status: statusEnum('status').notNull(),
  assignedTo: text('assigned_to'),
  transactionId: text('transaction_id').references(() => transactions.id),
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
