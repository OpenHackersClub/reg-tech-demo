import { Effect, Console } from "effect";
import { createConsumer, subscribe } from "@reg-tech-demo/kafka-client";
import { db } from "../../src/db";
import { alerts } from "../../src/db/schema";

const brokers = ["localhost:9092"]; // Replace with your Kafka broker address
const groupId = "api-alerts-consumer-group";
const topics = ["alerts"];

const program = Effect.gen(function* (_) {
  const consumer = yield* _(Effect.promise(() => createConsumer(brokers, groupId)));

  yield* _(Console.log("Kafka Alerts Consumer started."));

  subscribe(consumer, topics, (message) => {
    Effect.runPromise(
      Effect.gen(function* (_) {
        const alert = JSON.parse(message);
        yield* _(Console.log("Received alert:", alert));
        // Store alert in the database
        yield* _(Effect.promise(() => db.insert(alerts).values({
          id: alert.id || Math.random().toString(36).substring(7),
          priority: alert.priority || 'medium',
          type: alert.alertType || 'unknown',
          status: 'open',
          transactionId: alert.transactionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).execute()));
        yield* _(Console.log("Alert stored in DB."));
      })
    );
  });

  yield* _(Effect.never); // Keep the consumer running indefinitely
});

Effect.runPromise(program);
