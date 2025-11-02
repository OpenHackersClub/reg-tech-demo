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

  // Process transactions in batches
  let processedCount = 0;
  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);

    const messages = batch.map((transaction: any) => ({
      topic: KAFKA_TOPICS.TRANSACTIONS,
      key: transaction.transaction_id || transaction.id,
      value: JSON.stringify(transaction),
      headers: {
        'content-type': 'application/json',
        'source': 'transaction-fixtures',
      },
    }));

    yield* _(kafkaProducer.sendBatch(messages));

    processedCount += batch.length;
    yield* _(Console.log(`Sent ${processedCount}/${transactions.length} transactions to Kafka`));
  }

  yield* _(Console.log(`✓ Successfully ingested ${transactions.length} transactions to topic: ${KAFKA_TOPICS.TRANSACTIONS}`));
});

// Run the program with the Kafka producer layer
const runnable = program.pipe(Effect.provide(KafkaProducerServiceLive));

NodeRuntime.runMain(runnable);
