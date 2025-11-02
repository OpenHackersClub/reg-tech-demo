import { Effect, Console } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { KafkaProducerService, KafkaProducerServiceLive } from "../services/kafka.service";
import { KAFKA_TOPICS } from "../config/kafka.config";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the transaction loader from fixtures package
// Since we're in a monorepo, we can import directly
import { loadTransactions, Transaction } from "@reg-tech-demo/transaction-fixtures";

const BATCH_SIZE = 100; // Send messages in batches for better performance

/**
 * Validates that a transaction conforms to the Avro schema requirements
 * Schema: com.mycorp.mynamespace.SampleRecord
 */
function validateTransaction(transaction: Transaction): boolean {
  const requiredStringFields = [
    'transaction_id', 'beneficiary_account', 'beneficiary_country',
    'beneficiary_institution_bic', 'beneficiary_name', 'booking_datetime',
    'booking_jurisdiction', 'channel', 'client_risk_profile', 'currency',
    'customer_id', 'customer_risk_rating', 'customer_type', 'fx_base_ccy',
    'fx_counterparty', 'fx_quote_ccy', 'kyc_due_date', 'kyc_last_completed',
    'narrative', 'ordering_institution_bic', 'originator_account',
    'originator_country', 'originator_name', 'product_type', 'purpose_code',
    'regulator', 'sanctions_screening', 'str_filed_datetime',
    'suitability_result', 'suspicion_determined_datetime', 'swift_f70_purpose',
    'swift_f71_charges', 'swift_mt', 'value_date'
  ];

  const requiredIntFields = [
    'amount', 'daily_cash_total_customer', 'daily_cash_txn_count',
    'fx_applied_rate', 'fx_market_rate', 'fx_spread_bps'
  ];

  const requiredBooleanFields = [
    'cash_id_verified', 'customer_is_pep', 'edd_performed', 'edd_required',
    'fx_indicator', 'is_advised', 'product_complex', 'product_has_va_exposure',
    'sow_documented', 'suitability_assessed', 'swift_f50_present',
    'swift_f59_present', 'travel_rule_complete', 'va_disclosure_provided'
  ];

  // Validate string fields
  for (const field of requiredStringFields) {
    if (typeof (transaction as any)[field] !== 'string') {
      console.error(`Validation failed: ${field} must be a string, got ${typeof (transaction as any)[field]}`);
      return false;
    }
  }

  // Validate integer fields
  for (const field of requiredIntFields) {
    if (typeof (transaction as any)[field] !== 'number' || !Number.isInteger((transaction as any)[field])) {
      console.error(`Validation failed: ${field} must be an integer, got ${typeof (transaction as any)[field]}`);
      return false;
    }
  }

  // Validate boolean fields
  for (const field of requiredBooleanFields) {
    if (typeof (transaction as any)[field] !== 'boolean') {
      console.error(`Validation failed: ${field} must be a boolean, got ${typeof (transaction as any)[field]}`);
      return false;
    }
  }

  return true;
}

const program = Effect.gen(function* (_) {
  const kafkaProducer = yield* _(KafkaProducerService);

  yield* _(Console.log("Starting transaction ingestion worker..."));

  // Load transaction fixtures
  const fixturesPath = path.resolve(
    __dirname,
    "../../../packages/transaction-fixtures/transactions_mock_1000_for_participants.csv"
  );

  yield* _(Console.log(`Loading transactions from: ${fixturesPath}`));

  const transactions = yield* _(
    Effect.tryPromise({
      try: () => loadTransactions(fixturesPath),
      catch: (error) => new Error(`Failed to load transactions: ${error}`),
    })
  );

  yield* _(Console.log(`Loaded ${transactions.length} transactions`));

  // Validate the first transaction as a sample
  if (transactions.length > 0) {
    const isValid = validateTransaction(transactions[0]);
    if (isValid) {
      yield* _(Console.log("✓ Transaction schema validation passed"));
      yield* _(Console.log(`Sample transaction: ${JSON.stringify(transactions[0], null, 2).substring(0, 500)}...`));
    } else {
      throw new Error("Transaction schema validation failed. Check logs for details.");
    }
  }

  // Process transactions in batches
  let processedCount = 0;
  let validationErrors = 0;

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);

    // Validate and create messages
    const messages = batch
      .filter((transaction) => {
        const isValid = validateTransaction(transaction);
        if (!isValid) {
          validationErrors++;
          console.error(`Skipping invalid transaction: ${transaction.transaction_id}`);
        }
        return isValid;
      })
      .map((transaction) => ({
        topic: KAFKA_TOPICS.TRANSACTIONS,
        key: transaction.transaction_id,
        value: JSON.stringify(transaction),
        headers: {
          'content-type': 'application/json',
          'source': 'transaction-fixtures',
          'schema-version': '1.0',
          'avro-schema': 'com.mycorp.mynamespace.SampleRecord',
        },
      }));

    if (messages.length > 0) {
      yield* _(kafkaProducer.sendBatch(messages));
      processedCount += messages.length;
      yield* _(Console.log(`Sent ${processedCount}/${transactions.length} transactions to Kafka`));
    }
  }

  if (validationErrors > 0) {
    yield* _(Console.log(`⚠ Warning: ${validationErrors} transactions failed validation and were skipped`));
  }

  yield* _(Console.log(`✓ Successfully ingested ${processedCount} transactions to topic: ${KAFKA_TOPICS.TRANSACTIONS}`));
});

// Run the program with the Kafka producer layer
const runnable = Effect.provide(program, KafkaProducerServiceLive);

NodeRuntime.runMain(runnable);
