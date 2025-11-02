# Confluent Cloud Infrastructure

This Pulumi project manages Confluent Cloud infrastructure including Kafka clusters and Flink compute pools.

## Resources Created

### Kafka Resources
- **Environment**: Development environment for Confluent Cloud resources
- **Kafka Cluster**: Single-zone Kafka cluster in AWS us-west-2

### Flink Resources
- **Flink Compute Pool**: Compute pool for running Flink SQL statements
  - Cloud: AWS
  - Region: us-west-2
  - Max CFU: 5
- **Service Account**: Dedicated service account for Flink operations
- **Role Bindings**: Proper access controls for environment and cluster
- **API Key**: Authentication credentials for Kafka cluster access

## Prerequisites

1. Install Pulumi CLI: `brew install pulumi` (macOS) or see [Pulumi Docs](https://www.pulumi.com/docs/get-started/install/)
2. Configure Confluent Cloud credentials:
   ```bash
   pulumi config set confluentcloud:cloudApiKey <your-api-key>
   pulumi config set confluentcloud:cloudApiSecret <your-api-secret> --secret
   ```

## Usage

### Initialize Stack
```bash
cd packages/pulumi
pulumi stack init dev
```

### Configure
```bash
# Set Confluent Cloud credentials
pulumi config set confluentcloud:cloudApiKey <your-cloud-api-key>
pulumi config set confluentcloud:cloudApiSecret <your-cloud-api-secret> --secret
```

### Deploy
```bash
# Build TypeScript
npm run build

# Preview changes
pulumi preview

# Deploy infrastructure
pulumi up
```

### Get Outputs
```bash
# View all outputs
pulumi stack output

# Get specific values
pulumi stack output flinkComputePoolId
pulumi stack output flinkComputePoolResourceName
pulumi stack output flinkApiKeyId
pulumi stack output flinkApiKeySecret --show-secrets
```

## Example: Running Flink SQL

Once deployed, you can use the Flink compute pool to run SQL statements:

```sql
-- Create a table from a Kafka topic
CREATE TABLE transactions (
  transaction_id STRING,
  amount DECIMAL(10,2),
  timestamp TIMESTAMP(3),
  WATERMARK FOR timestamp AS timestamp - INTERVAL '5' SECOND
) WITH (
  'connector' = 'kafka',
  'topic' = 'txn',
  'properties.bootstrap.servers' = '<kafka-bootstrap-endpoint>',
  'scan.startup.mode' = 'earliest-offset',
  'format' = 'json'
);

-- Run a continuous query
SELECT
  TUMBLE_START(timestamp, INTERVAL '1' MINUTE) as window_start,
  COUNT(*) as txn_count,
  SUM(amount) as total_amount
FROM transactions
GROUP BY TUMBLE(timestamp, INTERVAL '1' MINUTE);
```

## Cleanup
```bash
pulumi destroy
```
