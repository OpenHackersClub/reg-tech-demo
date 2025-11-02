import { Effect, Context, Layer } from "effect";
import schemaRegistryPkg from "@confluentinc/schemaregistry";
const { SchemaRegistry } = schemaRegistryPkg;
import { getSchemaRegistryConfig } from "../config/schema-registry.config";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AvroSerializer {
  /**
   * Serialize a value using the Avro schema for a specific subject
   * @param subject Schema Registry subject name (usually topic-key or topic-value)
   * @param value The value to serialize
   * @returns Avro-encoded binary data with schema ID header
   */
  readonly serialize: (subject: string, value: any) => Effect.Effect<Buffer, Error>;

  /**
   * Deserialize Avro-encoded data
   * @param buffer Avro-encoded binary data with schema ID header
   * @returns Decoded value
   */
  readonly deserialize: (buffer: Buffer) => Effect.Effect<any, Error>;
}

export class AvroSerializerService extends Context.Tag("AvroSerializerService")<
  AvroSerializerService,
  AvroSerializer
>() {}

export const makeAvroSerializerService = Effect.gen(function* (_) {
  const config = getSchemaRegistryConfig();

  const registry = new SchemaRegistry({
    host: config.url,
    auth: {
      username: config.auth.username,
      password: config.auth.password,
    },
  });

  // Load the transaction schema
  const schemaPath = path.resolve(__dirname, "../schemas/transaction.avsc");
  const schemaContent = yield* _(
    Effect.tryPromise({
      try: () => fs.readFile(schemaPath, "utf-8"),
      catch: (error) => new Error(`Failed to load Avro schema: ${error}`),
    })
  );

  const schema = JSON.parse(schemaContent);

  const serialize = (subject: string, value: any) =>
    Effect.tryPromise({
      try: async () => {
        // Register the schema if not already registered, and serialize
        const id = await registry.register({
          type: 'AVRO',
          schema: JSON.stringify(schema),
        }, {
          subject,
        });

        // Encode the value with the schema
        const encoded = await registry.encode(id, value);

        return Buffer.from(encoded);
      },
      catch: (error) => new Error(`Failed to serialize Avro message: ${error}`),
    });

  const deserialize = (buffer: Buffer) =>
    Effect.tryPromise({
      try: async () => {
        return await registry.decode(buffer);
      },
      catch: (error) => new Error(`Failed to deserialize Avro message: ${error}`),
    });

  return {
    serialize,
    deserialize,
  } as const;
});

export const AvroSerializerServiceLive = Layer.scoped(
  AvroSerializerService,
  makeAvroSerializerService
);
