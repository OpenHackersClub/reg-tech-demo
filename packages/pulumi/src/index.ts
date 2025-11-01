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
  basics: [{
    protocol: 'SASL_SSL',
    authentication: 'PLAIN',
  }],
});

export const environmentId = env.id;
export const kafkaClusterId = cluster.id;
export const kafkaBootstrapEndpoint = cluster.bootstrapEndpoint;
