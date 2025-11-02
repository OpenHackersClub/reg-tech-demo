import pkg from '@confluentinc/kafka-javascript';
const { Kafka } = pkg;
import { getKafkaConfig } from '../config/kafka.config';

async function createTopics() {
  const config = getKafkaConfig();

  const kafka = new Kafka({
    kafkaJS: {
      brokers: [config['bootstrap.servers']],
      sasl: {
        mechanism: config['sasl.mechanisms'],
        username: config['sasl.username'],
        password: config['sasl.password'],
      },
      ssl: true,
    }
  });

  const admin = kafka.admin();

  try {
    await admin.connect();
    console.log('Connected to Kafka admin');

    // Create topics
    const topics = ['txn', 'alerts'];

    await admin.createTopics({
      topics: topics.map(topic => ({
        topic,
        numPartitions: 3,
        replicationFactor: 3,
      })),
    });

    console.log(`Created topics: ${topics.join(', ')}`);

    // List topics to verify
    const topicsList = await admin.listTopics();
    console.log('Available topics:', topicsList);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await admin.disconnect();
  }
}

createTopics();
