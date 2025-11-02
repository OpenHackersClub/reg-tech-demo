# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

RegTech Demo is a regulatory technology platform for AML (Anti-Money Laundering) compliance and transaction monitoring. The system ingests financial transactions from Confluent Cloud Kafka, processes them through Apache Flink for real-time anomaly detection, and provides a web interface for compliance officers to review alerts and manage client documents.

## Monorepo Structure

This is a pnpm workspace monorepo with the following structure:

- **apps/txn-service** - Transaction ingestion and AML detection backend service
- **apps/web** - React Router v7 web application (Cloudflare Workers/Pages)
- **packages/transaction-fixtures** - Mock transaction data and CSV loading utilities
- **packages/kafka-client** - Shared Kafka client utilities
- **packages/pulumi** - Infrastructure as Code for Confluent Cloud (Kafka + Flink)
- **packages/typescript-config** - Shared TypeScript configurations
- **packages/ui** - Shared UI components

## Development Commands

### Root Level
```bash
pnpm install                    # Install all dependencies
pnpm build                      # Build all packages
```

### Transaction Service (apps/txn-service)
```bash
cd apps/txn-service
npm run build                   # Compile TypeScript
npm run dev                     # Watch mode for development
npm run start                   # Start HTTP server
npm run ingest:transactions     # Load CSV fixtures to Kafka
npm run aml:detect              # Run AML detection worker
npm run lint                    # Lint code with Biome
npm run db:generate             # Generate Drizzle migrations
npm run db:migrate              # Run database migrations
```

### Web Application (apps/web)
```bash
cd apps/web
npm run dev                     # Start dev server with HMR (port 5173)
npm run build                   # Build for production
npm run start                   # Preview production build (Wrangler)
npm run deploy                  # Deploy to Cloudflare Pages
npm run typecheck               # Type check with React Router typegen
npm run cf-typegen              # Generate Cloudflare + React Router types
```

### Infrastructure (packages/pulumi)
```bash
cd packages/pulumi
pulumi stack init dev           # Initialize stack
pulumi preview                  # Preview infrastructure changes
pulumi up                       # Deploy infrastructure
pulumi stack output             # View outputs (cluster IDs, API keys, etc.)
pulumi destroy                  # Destroy infrastructure
```

## Architecture

### Transaction Service Architecture

The transaction service uses **Effect** (effect-ts.dev) for type-safe, functional error handling and resource management. Key architectural patterns:

1. **Services Layer** (`src/services/`): Effect-based services with automatic resource cleanup
   - `kafka.service.ts`: KafkaProducerService with Layer-based dependency injection
   - Uses `Layer.scoped` with `Effect.acquireRelease` for automatic producer disconnection

2. **Workers** (`src/workers/`): Standalone processes for background tasks
   - `transaction-ingestion.worker.ts`: Reads CSV fixtures, publishes to Kafka in batches
   - `aml-detection.worker.ts`: Periodically executes Flink SQL queries, publishes alerts
   - All workers use `NodeRuntime.runMain` for Effect program execution

3. **Configuration** (`src/config/`):
   - `kafka.config.ts`: Confluent Cloud SASL_SSL configuration
   - `flink.config.ts`: Flink SQL Gateway URL and predefined SQL queries
   - All config uses environment variables with validation

4. **Database** (`src/db/`): Drizzle ORM with PostgreSQL
   - Schema: transactions, alerts, clientDocuments tables
   - Migrations handled via drizzle-kit

### Web Application Architecture

Built with **React Router v7** (formerly Remix) for edge-first SSR:

1. **Routes** (`app/routes/`): File-based routing
   - `/` - Home page
   - `/documents` - Client documents management
   - `/alerts` - Real-time alerts dashboard
   - `/tooljet` - Embedded ToolJet form for document uploads

2. **Deployment**: Cloudflare Workers/Pages
   - Entry point: `workers/app.ts`
   - SSR bundle: `build/server/`
   - Static assets: `build/client/`

3. **Styling**: Tailwind CSS v4 with dark mode support

### Kafka Topics

Defined in `apps/txn-service/src/config/kafka.config.ts`:
- `transactions` - Financial transaction events
- `alerts` - AML compliance alerts from Flink detection

### Confluent Cloud Infrastructure

Managed via Pulumi (`packages/pulumi/`):
- **Kafka Cluster**: Single-zone cluster in AWS us-west-2
- **Flink Compute Pool**: Max 5 CFU for SQL processing
- **Service Account**: Dedicated account with proper role bindings
- **API Keys**: Auto-generated for authentication

### Effect-Based Patterns

The transaction service extensively uses Effect for:
1. **Resource Management**: Automatic cleanup via `Layer.scoped`
2. **Error Handling**: Type-safe errors with `Effect.tryPromise`
3. **Async Operations**: `Effect.gen` for generator-based async code
4. **Scheduling**: `Schedule.fixed` for periodic tasks (AML detection runs every 30s)

Example pattern from `kafka.service.ts:95-101`:
```typescript
export const KafkaProducerServiceLive = Layer.scoped(
  KafkaProducerService,
  Effect.acquireRelease(
    makeKafkaProducerService,
    (service) => service.disconnect()
  )
);
```

## Environment Variables

### Transaction Service
Required for Confluent Cloud connectivity:
```bash
KAFKA_BROKERS=pkc-xxxxx.us-west-2.aws.confluent.cloud:9092
KAFKA_API_KEY=your-api-key
KAFKA_API_SECRET=your-api-secret
KAFKA_CLIENT_ID=txn-service
KAFKA_TOPIC_TRANSACTIONS=transactions
FLINK_SQL_GATEWAY_URL=http://localhost:8083
```

### Web Application
Local development (`.dev.vars`):
```bash
API_URL=http://localhost:3000
```

Production: Configure in `wrangler.json` under `vars` section

## Key Dependencies

- **Transaction Service**: Effect v3, @confluentinc/kafka-javascript, Drizzle ORM, tsdown (TS runner)
- **Web App**: React Router v7, Cloudflare Workers, Tailwind CSS v4, Vite 6
- **Infrastructure**: Pulumi, @pulumi/confluentcloud

## Testing Transaction Ingestion

1. Build transaction-fixtures package:
   ```bash
   cd packages/transaction-fixtures && npm run build
   ```

2. Ensure Confluent Cloud credentials are set in `.env`

3. Run ingestion worker:
   ```bash
   cd apps/txn-service
   npm run ingest:transactions
   ```

This loads 1000 mock transactions from `packages/transaction-fixtures/transactions_mock_1000_for_participants.csv` and publishes them in batches of 100 to Kafka.

## Common Troubleshooting

### Kafka Connection Issues
- Verify broker URL includes port (`:9092`)
- Check API credentials are correct in `.env`
- Ensure Confluent Cloud cluster is accessible from your network

### Missing Transaction Fixtures
- Build transaction-fixtures package first: `cd packages/transaction-fixtures && npm run build`
- Verify CSV file exists at expected path

### Web App Build Errors
- Run `npm run cf-typegen` to regenerate Cloudflare and React Router types
- Ensure `wrangler` is installed and authenticated
