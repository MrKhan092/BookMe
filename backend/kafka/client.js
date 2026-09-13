import { Kafka, logLevel, Partitioners } from 'kafkajs';

// Silence the default partitioner warning
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const clientId = process.env.KAFKA_CLIENT_ID || 'bookme-backend';

/**
 * Singleton Kafka client instance.
 * All producers and consumers share this client.
 */
const kafka = new Kafka({
  clientId,
  brokers,
  logLevel: logLevel.WARN,
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});

/**
 * Creates a new consumer with the given group ID.
 * Each worker (email, calendar, wallet) gets its own consumer group
 * so they all receive every message independently.
 *
 * @param {string} groupId - Unique consumer group identifier
 * @returns {import('kafkajs').Consumer}
 */
export const createConsumer = (groupId) => {
  return kafka.consumer({ groupId });
};

export default kafka;
