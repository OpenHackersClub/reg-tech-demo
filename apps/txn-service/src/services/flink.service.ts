import { Context, Effect, Layer } from "effect";
import { FLINK_CONFIG, FLINK_DDL } from "../config/flink.config";

export interface FlinkSqlService {
  readonly executeStatement: (sql: string) => Effect.Effect<any, Error>;
  readonly initializeTables: () => Effect.Effect<void, Error>;
}

export const FlinkSqlService = Context.GenericTag<FlinkSqlService>("FlinkSqlService");

const makeFlinkSqlService = Effect.gen(function* (_) {
  const sqlGatewayUrl = FLINK_CONFIG.SQL_GATEWAY_URL;

  // Helper to execute SQL via REST API
  const executeStatement = (sql: string): Effect.Effect<any, Error> =>
    Effect.tryPromise({
      try: async () => {
        const response = await fetch(`${sqlGatewayUrl}/v1/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`Failed to create session: ${response.statusText}`);
        }

        const session = await response.json();
        const sessionHandle = session.sessionHandle;

        // Execute the SQL statement
        const execResponse = await fetch(
          `${sqlGatewayUrl}/v1/sessions/${sessionHandle}/statements`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statement: sql }),
          }
        );

        if (!execResponse.ok) {
          throw new Error(`Failed to execute statement: ${execResponse.statusText}`);
        }

        const result = await execResponse.json();

        // Close the session
        await fetch(`${sqlGatewayUrl}/v1/sessions/${sessionHandle}`, {
          method: "DELETE",
        });

        return result;
      },
      catch: (error) => new Error(`Flink SQL execution failed: ${error}`),
    });

  // Initialize tables by executing DDL statements
  const initializeTables = (): Effect.Effect<void, Error> =>
    Effect.gen(function* (_) {
      yield* _(Effect.log("Initializing Flink SQL tables..."));

      // Create transactions table
      yield* _(Effect.log("Creating transactions_topic table..."));
      yield* _(executeStatement(FLINK_DDL.CREATE_TRANSACTIONS_TABLE));

      // Create alerts table
      yield* _(Effect.log("Creating alerts_topic table..."));
      yield* _(executeStatement(FLINK_DDL.CREATE_ALERTS_TABLE));

      yield* _(Effect.log("✓ Flink SQL tables initialized successfully"));
    });

  return {
    executeStatement,
    initializeTables,
  } as FlinkSqlService;
});

export const FlinkSqlServiceLive = Layer.effect(FlinkSqlService, makeFlinkSqlService);
