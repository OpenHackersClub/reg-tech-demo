import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/workers/transaction-ingestion.worker.ts'],
  format: ['esm'],
  clean: true,
  // Bundle the schema registry package to handle CommonJS interop
  noExternal: ['@confluentinc/schemaregistry'],
});
