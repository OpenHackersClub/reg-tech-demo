import { Consumer } from '@confluentinc/kafka-javascript';

export async function createConsumer(brokers: string[], groupId: string) {
  const consumer = new Consumer({
    'bootstrap.servers': brokers.join(','),
    'group.id': groupId,
    'auto.offset.reset': 'earliest'
  });

  await consumer.connect();

  return consumer;
}

export function subscribe(consumer: Consumer, topics: string[], onMessage: (message: any) => void) {
  consumer.subscribe(topics);

  consumer.on('data', (data) => {
    onMessage(data.value.toString());
  });
}
