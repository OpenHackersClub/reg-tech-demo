import { Effect, Console, Schedule } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { KafkaProducerService, KafkaProducerServiceLive } from "../services/kafka.service";
import { KAFKA_TOPICS } from "../config/kafka.config";
import { FLINK_CONFIG, FLINK_SQL_QUERIES } from "../config/flink.config";

// Mock Flink SQL client for demonstration purposes
const mockFlinkSqlClient = {
  executeSql: (sqlQuery: string) =>
    Effect.gen(function* (_) {
      yield* _(Console.log(`Executing Flink SQL query:\n${sqlQuery}`));
      // Simulate a delay for query execution
      yield* _(Effect.sleep("5 seconds"));

      // Simulate anomaly detection results
      const anomaliesDetected = Math.random() > 0.7; // Simulate 30% chance of anomaly

      if (anomaliesDetected) {
        const mockAlert = {
          id: `alert-${Date.now()}`,
          type: "high_frequency_transactions",
          severity: "high",
          transactionId: `txn-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          details: "Simulated high frequency transactions detected.",
        };
        yield* _(Console.log("Anomaly detected:", mockAlert));
        return Effect.succeed([mockAlert]);
      } else {
        yield* _(Console.log("No anomalies detected in this run."));
        return Effect.succeed([]);
      }
    }),
};

const program = Effect.gen(function* (_) {
  const kafkaProducer = yield* _(KafkaProducerService);

  yield* _(Console.log("Starting AML Detection worker..."));
  yield* _(Console.log(`Connecting to Flink SQL Gateway at: ${FLINK_CONFIG.SQL_GATEWAY_URL}`));

  // Periodically execute Flink SQL for anomaly detection
  yield* _(
    Effect.repeat(
      Effect.gen(function* (_) {
        const alerts = yield* _(mockFlinkSqlClient.executeSql(FLINK_SQL_QUERIES.ANOMALY_DETECTION));

        for (const alert of alerts) {
          yield* _(
            kafkaProducer.send({
              topic: KAFKA_TOPICS.ALERTS,
              key: alert.id,
              value: JSON.stringify(alert),
              headers: {
                "content-type": "application/json",
                source: "aml-detection-worker",
              },
            })
          );
          yield* _(Console.log(`Sent alert ${alert.id} to Kafka topic ${KAFKA_TOPICS.ALERTS}`));
        }
      }),
      Schedule.fixed("30 seconds") // Run every 30 seconds
    )
  );

  yield* _(Console.log("AML Detection worker running indefinitely..."));
});

// Run the program with the Kafka producer layer
const runnable = program.pipe(Effect.provide(KafkaProducerServiceLive));

NodeRuntime.runMain(runnable);