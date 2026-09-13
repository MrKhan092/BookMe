import kafka from './client.js';

const producer = kafka.producer();
let isConnected = false;

/**
 * Connects the Kafka producer. Called once at server startup.
 * If Kafka is unavailable, logs a warning and continues
 * (the app still works, just without async events).
 */
export const connectProducer = async () => {
  try {
    await producer.connect();
    isConnected = true;
    console.log('Kafka producer connected');
  } catch (err) {
    console.warn('Kafka producer failed to connect (app will still work):', err.message);
  }
};

/**
 * Publishes an event to a Kafka topic.
 *
 * @param {string} topic   - The Kafka topic name (use TOPICS constants)
 * @param {object} payload - The event data to send (will be JSON-serialized)
 * @param {string} [key]   - Optional partition key (e.g., bookingId for ordering)
 *
 * @example
 *   await publishEvent(TOPICS.BOOKING_CREATED, { bookingId: '123', userId: '456' }, '123');
 */
export const publishEvent = async (topic, payload, key = null) => {
  if (!isConnected) {
    console.warn(` Kafka not connected. Skipping event: ${topic}`);
    return;
  }

  try {
    await producer.send({
      topic,
      messages: [
        {
          key: key ? String(key) : null,
          value: JSON.stringify({
            ...payload,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(` Event published → ${topic}`, key ? `(key: ${key})` : '');
  } catch (err) {
    console.error(` Failed to publish to ${topic}:`, err.message);
  }
};

export default producer;
