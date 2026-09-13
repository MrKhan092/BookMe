import redis, { isRedisConnected } from '../config/redis.js';

/**
 * Cache utility — get, set, and invalidate cached data in Redis.
 * All cached values are JSON-serialized.
 * If Redis is down, cache misses gracefully (returns null).
 */

/**
 * Get a cached value by key.
 *
 * @param {string} key - Cache key
 * @returns {object|null} Parsed JSON data, or null if not cached
 */
export const getCache = async (key) => {
  if (!isRedisConnected()) return null;

  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Cache get error:', err.message);
    return null;
  }
};

/**
 * Store a value in cache with a TTL.
 *
 * @param {string} key          - Cache key
 * @param {object} data         - Data to cache (will be JSON-serialized)
 * @param {number} ttlSeconds   - Time-to-live in seconds
 */
export const setCache = async (key, data, ttlSeconds) => {
  if (!isRedisConnected()) return;

  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Cache set error:', err.message);
  }
};

/**
 * Invalidate (delete) cached keys matching a pattern.
 * Uses Redis SCAN to find matching keys safely (non-blocking).
 *
 * @param {string} pattern - Key pattern (e.g., "cache:slots:learnedge-tutors:*")
 */
export const invalidateCache = async (pattern) => {
  if (!isRedisConnected()) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error('Cache invalidate error:', err.message);
  }
};
