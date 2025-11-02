import { Effect, Context, Layer } from "effect";
import { KafkaJS } from "@confluentinc/kafka-javascript";
import { getKafkaConfig } from "../config/kafka.config";

export interface ProducerMessage {
  topic: string;
  key?: string;
  value: string;
  headers?: Record<string, string>;
}

export class KafkaProducerService extends Context.Tag("KafkaProducerService")<
  KafkaProducerService,
  {
    readonly send: (message: ProducerMessage) => Effect.Effect<void, Error>;
    readonly sendBatch: (messages: ProducerMessage[]) => Effect.Effect<void, Error>;
    readonly disconnect: () => Effect.Effect<void, Error>;
  }
>() {}

export const makeKafkaProducerService = Effect.gen(function* (_) {
  const config = getKafkaConfig();
  const kafka = new KafkaJS.Kafka({kafkaJS: config});
  const producer = kafka.producer();
  
  console.log('kafka config', config);
  // Connect the producer
  yield* _(
    Effect.tryPromise({
      try: async () => {
        await producer.connect();
      },
      catch: (error) => new Error(`Failed to connect Kafka producer: ${error}`),
    })
  );

  const send = (message: ProducerMessage) =>
    Effect.tryPromise({
      try: async () => {
        await producer.send({
          topic: message.topic,
          messages: [
            {
              key: message.key,
              value: message.value,
              headers: message.headers,
            },
          ],
        });
      },
      catch: (error) => new Error(`Failed to send message to Kafka: ${error}`),
    }).pipe(Effect.map(() => undefined));

  const sendBatch = (messages: ProducerMessage[]) =>
    Effect.tryPromise({
      try: async () => {
        // Group messages by topic
        const messagesByTopic = messages.reduce((acc, msg) => {
          if (!acc[msg.topic]) {
            acc[msg.topic] = [];
          }
          acc[msg.topic].push({
            key: msg.key,
            value: msg.value,
            headers: msg.headers,
          });
          return acc;
        }, {} as Record<string, Array<{ key?: string; value: string; headers?: Record<string, string> }>>);

        // Send all messages for each topic
        await Promise.all(
          Object.entries(messagesByTopic).map(([topic, msgs]) =>
            producer.send({ topic, messages: msgs })
          )
        );
      },
      catch: (error) => new Error(`Failed to send batch messages to Kafka: ${error}`),
    }).pipe(Effect.map(() => undefined));

  const disconnect = () =>
    Effect.tryPromise({
      try: async () => {
        await producer.disconnect();
      },
      catch: (error) =>
        new Error(`Failed to disconnect Kafka producer: ${error}`),
    }).pipe(Effect.map(() => undefined));

  return {
    send,
    sendBatch,
    disconnect,
  } as const;
});

export const KafkaProducerServiceLive = Layer.scoped(
  KafkaProducerService,
  Effect.acquireRelease(
    makeKafkaProducerService,
    (service) => service.disconnect()
  )
);
