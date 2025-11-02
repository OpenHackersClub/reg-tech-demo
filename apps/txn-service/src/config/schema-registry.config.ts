export interface SchemaRegistryConfig {
  url: string;
  auth: {
    username: string;
    password: string;
  };
}

export function getSchemaRegistryConfig(): SchemaRegistryConfig {
  const url = process.env.SCHEMA_REGISTRY_URL || '';
  const apiKey = process.env.SCHEMA_REGISTRY_API_KEY || '';
  const apiSecret = process.env.SCHEMA_REGISTRY_API_SECRET || '';

  if (!url || !apiKey || !apiSecret) {
    throw new Error(
      'Missing required Schema Registry configuration. Please set SCHEMA_REGISTRY_URL, SCHEMA_REGISTRY_API_KEY, and SCHEMA_REGISTRY_API_SECRET environment variables.'
    );
  }

  return {
    url,
    auth: {
      username: apiKey,
      password: apiSecret,
    },
  };
}
