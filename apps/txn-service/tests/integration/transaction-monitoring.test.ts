import { Effect } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { createProducer, sendMessage } from "@reg-tech-demo/kafka-client";
import { db } from "../../src/db";
import { alerts } from "../../src/db/schema";
import { eq } from "drizzle-orm";

// Placeholder for starting Flink job and API server
// In a real scenario, these would be managed by Dagger or similar orchestration tool
const startFlinkJob = Effect.sync(() => console.log("Starting Flink Job (placeholder)"));
const startApiServer = Effect.sync(() => console.log("Starting API Server (placeholder)"));

describe("Transaction Monitoring Flow", () => {
  it("should generate an alert for a high-value transaction", () =>
    Effect.gen(function* (_) {
      // 1. Start necessary services (placeholders)
      yield* _(startFlinkJob);
      yield* _(startApiServer);

      // 2. Send a high-value transaction to Kafka
      const producer = yield* _(Effect.promise(() => createProducer(["localhost:9092"])));
      const transaction = {
        id: "txn-123",
        amount: 1500,
        currency: "USD",
        sender_id: "user-a",
        receiver_id: "user-b",
        timestamp: new Date().toISOString(),
      };
      yield* _(Effect.promise(() => sendMessage(producer, "transactions", JSON.stringify(transaction))));
      yield* _(Console.log("Sent high-value transaction to Kafka."));

      // 3. Wait for the alert to be processed and stored (polling for simplicity)
      yield* _(Effect.sleep("5 seconds")); // Give Flink and worker time to process

      // 4. Verify alert in the database
      const storedAlerts = yield* _(Effect.promise(() => db.select().from(alerts).where(eq(alerts.transactionId, transaction.id)).execute()));
      expect(storedAlerts.length).toBe(1);
      expect(storedAlerts[0].type).toBe("high_value_transaction");
      expect(storedAlerts[0].status).toBe("open");

      // 5. Verify alert via API endpoint (assuming API is running on port 3000)
      const response = yield* _(Effect.promise(() => fetch("http://localhost:3000/alerts")));
      const apiAlerts = yield* _(Effect.promise(() => response.json()));
      const foundAlert = apiAlerts.find((a: any) => a.transactionId === transaction.id);
      expect(foundAlert).toBeDefined();
      expect(foundAlert.type).toBe("high_value_transaction");
    }).pipe(Effect.runPromise));
});
