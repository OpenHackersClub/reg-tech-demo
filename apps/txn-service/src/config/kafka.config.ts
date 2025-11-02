export interface KafkaJSConfig {
  clientId: string;
  brokers: string[];
  ssl: boolean;
  authenticationTimeout: number;
  sasl: {
    mechanism: 'plain';
    username: string;
    password: string;
  };
}

export function getKafkaConfig(): KafkaJSConfig {
  const brokers = process.env.KAFKA_BROKERS || '';
  const apiKey = process.env.KAFKA_API_KEY || '';
  const apiSecret = process.env.KAFKA_API_SECRET || '';
  const clientId = process.env.KAFKA_CLIENT_ID || 'txn-service';

  if (!brokers || !apiKey || !apiSecret) {
    throw new Error(
      'Missing required Kafka configuration. Please set KAFKA_BROKERS, KAFKA_API_KEY, and KAFKA_API_SECRET environment variables.'
    );
  }

  return {
    clientId,
    brokers: brokers.split(',').map(b => b.trim()),
    ssl: true,
    authenticationTimeout: 10000,
    sasl: {
      mechanism: 'plain',
      username: apiKey,
      password: apiSecret,
    },
  };
}

export const KAFKA_TOPICS = {
  TRANSACTIONS: "txn",
  ALERTS: "alerts",
};
