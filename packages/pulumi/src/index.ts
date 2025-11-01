import * as pulumi from '@pulumi/pulumi';
import * as confluent from '@pulumi/confluentcloud';

// Create a Confluent Cloud Environment
const env = new confluent.Environment('dev-env', {
  displayName: 'Development Environment',
});

// Create a Confluent Cloud Kafka Cluster
const cluster = new confluent.KafkaCluster('dev-cluster', {
  environment: {
    id: env.id,
  },
  cloud: 'AWS',
  region: 'us-west-2',
  availability: 'SINGLE_ZONE',
  displayName: 'development-cluster',
  basic: {
    protocol: 'SASL_SSL',
    authentication: 'PLAIN',
  },
});

// Create a service account for Flink
const flinkServiceAccount = new confluent.ServiceAccount('flink-sa', {
  displayName: 'Flink Service Account',
  description: 'Service account for Flink compute pool',
});

// Create a Flink compute pool
const flinkComputePool = new confluent.FlinkComputePool('flink-pool', {
  environment: {
    id: env.id,
  },
  displayName: 'development-flink-pool',
  cloud: 'AWS',
  region: 'us-west-2',
  maxCfu: 5, // Max compute units
});

// Grant Flink service account access to the environment
const flinkEnvRoleBinding = new confluent.RoleBinding('flink-env-admin', {
  principal: pulumi.interpolate`User:${flinkServiceAccount.id}`,
  roleName: 'EnvironmentAdmin',
  crnPattern: env.id.apply(id => `crn://confluent.cloud/organization=*/environment=${id}`),
});

// Grant Flink service account access to the Kafka cluster
const flinkClusterRoleBinding = new confluent.RoleBinding('flink-cluster-admin', {
  principal: pulumi.interpolate`User:${flinkServiceAccount.id}`,
  roleName: 'CloudClusterAdmin',
  crnPattern: cluster.id.apply(id => `crn://confluent.cloud/organization=*/environment=${env.id}/cloud-cluster=${id}`),
});

// Create API key for Flink service account on the Kafka cluster
const flinkApiKey = new confluent.ApiKey('flink-api-key', {
  owner: {
    id: flinkServiceAccount.id,
    apiVersion: flinkServiceAccount.apiVersion,
    kind: flinkServiceAccount.kind,
  },
  managedResource: {
    id: cluster.id,
    apiVersion: cluster.apiVersion,
    kind: cluster.kind,
    environment: {
      id: env.id,
    },
  },
});

export const environmentId = env.id;
export const kafkaClusterId = cluster.id;
export const kafkaBootstrapEndpoint = cluster.bootstrapEndpoint;
export const flinkComputePoolId = flinkComputePool.id;
export const flinkComputePoolResourceName = flinkComputePool.resourceName;
export const flinkServiceAccountId = flinkServiceAccount.id;
export const flinkApiKeyId = flinkApiKey.id;
export const flinkApiKeySecret = flinkApiKey.secret;
