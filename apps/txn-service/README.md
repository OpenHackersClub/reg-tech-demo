# Transaction Service

A service for processing and ingesting financial transactions to Confluent Cloud Kafka.

## Features

- **Transaction Ingestion**: Load transaction fixtures from CSV and publish to Kafka
- **Confluent Cloud Integration**: Native support for Confluent Cloud using `@confluentinc/kafka-javascript`
- **Effect-based Architecture**: Built with Effect for type-safe error handling and resource management
- **Batch Processing**: Efficiently processes and sends transactions in configurable batches

## Prerequisites

- Node.js 20+
- Access to Confluent Cloud Kafka cluster
- Confluent Cloud API credentials

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `apps/txn-service` directory:

```bash
cp .env.example .env
```

Edit `.env` with your Confluent Cloud credentials:

```env
KAFKA_BROKERS=pkc-xxxxx.us-east-1.aws.confluent.cloud:9092
KAFKA_API_KEY=your-api-key
KAFKA_API_SECRET=your-api-secret
KAFKA_CLIENT_ID=txn-service
KAFKA_TOPIC_TRANSACTIONS=transactions
```

### 3. Build the Project

```bash
npm run build
```

## Usage

### Ingest Transaction Fixtures

To load and publish the transaction fixtures to Kafka:

```bash
npm run ingest:transactions
```

This command will:
1. Load 1000 mock transactions from `packages/transaction-fixtures/transactions_mock_1000_for_participants.csv`
2. Send them in batches to the configured Kafka topic
3. Display progress and completion status

### Run the HTTP Server

```bash
npm start
```

The server will start on `http://localhost:3000`.

## Architecture

### Kafka Producer Service

Located in `src/services/kafka.service.ts`, this service provides:
- Connection management with automatic cleanup
- Single message sending
- Batch message sending for improved performance
- Effect-based error handling

### Transaction Ingestion Worker

Located in `src/workers/transaction-ingestion.worker.ts`, this worker:
- Reads transaction fixtures from the CSV file
- Transforms each transaction to Kafka messages
- Sends messages in configurable batches (default: 100)
- Tracks and logs progress

## Development

### Watch Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

### Database Migrations

Generate migrations:
```bash
npm run db:generate
```

Run migrations:
```bash
npm run db:migrate
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `KAFKA_BROKERS` | Comma-separated list of Kafka brokers | Yes | - |
| `KAFKA_API_KEY` | Confluent Cloud API key | Yes | - |
| `KAFKA_API_SECRET` | Confluent Cloud API secret | Yes | - |
| `KAFKA_CLIENT_ID` | Client identifier | No | `txn-service` |
| `KAFKA_TOPIC_TRANSACTIONS` | Topic name for transactions | No | `transactions` |

## Troubleshooting

### Connection Issues

If you encounter connection issues with Confluent Cloud:
1. Verify your API credentials are correct
2. Ensure your broker URL includes the port (`:9092`)
3. Check that your Confluent Cloud cluster is accessible from your network

### Missing Transactions

If no transactions are being ingested:
1. Check that the CSV file exists at the expected path
2. Verify the transaction-fixtures package is built (`cd packages/transaction-fixtures && npm run build`)
3. Review the worker logs for any errors
