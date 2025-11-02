import { Effect, Console, Schedule, Layer } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { KafkaProducerService, KafkaProducerServiceLive } from "../services/kafka.service";
import { FlinkSqlService, FlinkSqlServiceLive } from "../services/flink.service";
import { KAFKA_TOPICS } from "../config/kafka.config";
import { FLINK_CONFIG, FLINK_SQL_QUERIES } from "../config/flink.config";

const program = Effect.gen(function* (_) {
  const kafkaProducer = yield* _(KafkaProducerService);
  const flinkSql = yield* _(FlinkSqlService);

  yield* _(Console.log("Starting AML Detection worker..."));
  yield* _(Console.log(`Connecting to Flink SQL Gateway at: ${FLINK_CONFIG.SQL_GATEWAY_URL}`));

  // Initialize Flink SQL tables (creates tables if they don't exist)
  yield* _(flinkSql.initializeTables());

  yield* _(Console.log("Starting periodic anomaly detection..."));

  // Periodically execute Flink SQL for anomaly detection
  yield* _(
    Effect.repeat(
      Effect.gen(function* (_) {
        yield* _(Console.log("Running anomaly detection queries..."));

        // Execute high frequency detection query
        yield* _(
          Effect.gen(function* (_) {
            yield* _(Console.log("Executing high frequency detection..."));
            yield* _(flinkSql.executeStatement(FLINK_SQL_QUERIES.ANOMALY_DETECTION_HIGH_FREQUENCY));
          }).pipe(
            Effect.catchAll((error) =>
              Effect.gen(function* (_) {
                yield* _(Console.error(`Error in high frequency detection: ${error}`));
                return Effect.void;
              })
            )
          )
        );

        // Execute multiple receivers detection query
        yield* _(
          Effect.gen(function* (_) {
            yield* _(Console.log("Executing multiple receivers detection..."));
            yield* _(flinkSql.executeStatement(FLINK_SQL_QUERIES.ANOMALY_DETECTION_MULTIPLE_RECEIVERS));
          }).pipe(
            Effect.catchAll((error) =>
              Effect.gen(function* (_) {
                yield* _(Console.error(`Error in multiple receivers detection: ${error}`));
                return Effect.void;
              })
            )
          )
        );

        // Execute PEP transaction detection query
        yield* _(
          Effect.gen(function* (_) {
            yield* _(Console.log("Executing PEP transaction detection..."));
            yield* _(flinkSql.executeStatement(FLINK_SQL_QUERIES.ANOMALY_DETECTION_PEP_TRANSACTIONS));
          }).pipe(
            Effect.catchAll((error) =>
              Effect.gen(function* (_) {
                yield* _(Console.error(`Error in PEP detection: ${error}`));
                return Effect.void;
              })
            )
          )
        );

        // Execute high risk customer detection query
        yield* _(
          Effect.gen(function* (_) {
            yield* _(Console.log("Executing high risk customer detection..."));
            yield* _(flinkSql.executeStatement(FLINK_SQL_QUERIES.ANOMALY_DETECTION_HIGH_RISK_CUSTOMER));
          }).pipe(
            Effect.catchAll((error) =>
              Effect.gen(function* (_) {
                yield* _(Console.error(`Error in high risk customer detection: ${error}`));
                return Effect.void;
              })
            )
          )
        );

        yield* _(Console.log("✓ All anomaly detection queries submitted"));
      }),
      Schedule.fixed("30 seconds") // Run every 30 seconds
    )
  );

  yield* _(Console.log("AML Detection worker running indefinitely..."));
});

// Run the program with both Kafka producer and Flink SQL layers
const mainLayer = Layer.mergeAll(KafkaProducerServiceLive, FlinkSqlServiceLive);
const runnable = Effect.provide(program, mainLayer);

NodeRuntime.runMain(runnable);