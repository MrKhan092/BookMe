import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Singleton Redis client instance.
 * Used across the app for OTP storage, rate limiting, caching, and slot locking.
 *
 * Gracefully handles connection failures — the app still works
 * (falls back to MongoDB for OTPs, skips rate limiting/caching).
 */
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) return null; // stop retrying after 5 attempts
    return Math.min(times * 500, 3000);
  },
  lazyConnect: true,
});

let isConnected = false;

redis.on('connect', () => {
  isConnected = true;
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  if (isConnected) {
    console.error('❌ Redis error:', err.message);
  }
});

redis.on('close', () => {
  isConnected = false;
});

/**
 * Connects to Redis. Called once at server startup.
 */
export const connectRedis = async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.warn('⚠️  Redis failed to connect (app will still work):', err.message);
  }
};

/**
 * Returns whether Redis is currently connected.
 */
export const isRedisConnected = () => isConnected;

export default redis;
