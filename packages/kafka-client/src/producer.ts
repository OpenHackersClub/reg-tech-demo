import { Producer } from '@confluentinc/kafka-javascript';

export async function createProducer(brokers: string[]) {
  const producer = new Producer({
    'bootstrap.servers': brokers.join(','),
    'dr_cb': true
  });

  await producer.connect();

  return producer;
}

export async function sendMessage(producer: Producer, topic: string, message: string) {
  producer.produce(
    topic,
    null,
    Buffer.from(message),
    null,
    Date.now()
  );
}
