import redis, { isRedisConnected } from '../config/redis.js';

/**
 * Slot Locking — prevents double-booking using Redis distributed locks.
 *
 * When a customer starts booking a slot, we acquire a lock.
 * If another customer tries to book the same slot, the lock prevents it.
 * The lock auto-expires after 5 minutes (in case the customer abandons payment).
 */

const LOCK_TTL_SECONDS = 300; // 5 minutes

/**
 * Tries to acquire a lock on a specific time slot.
 * Uses Redis SET with NX (only set if not exists) for atomicity.
 *
 * @param {string} userId    - The provider's user ID
 * @param {string} date      - Booking date (e.g., "2026-09-16")
 * @param {string} startTime - Slot start time (e.g., "09:00")
 * @returns {boolean} true if lock acquired, false if slot is already locked
 */
export const acquireSlotLock = async (userId, date, startTime) => {
  if (!isRedisConnected()) return true; // Redis down — allow booking

  const key = `slot-lock:${userId}:${date}:${startTime}`;

  try {
    // SET key value NX EX ttl — only sets if key doesn't exist
    const result = await redis.set(key, Date.now(), 'NX', 'EX', LOCK_TTL_SECONDS);
    return result === 'OK'; // 'OK' = lock acquired, null = already locked
  } catch (err) {
    console.error('Slot lock acquire error:', err.message);
    return true; // On error, allow booking
  }
};

/**
 * Releases a slot lock (after booking confirmed, cancelled, or payment failed).
 *
 * @param {string} userId    - The provider's user ID
 * @param {string} date      - Booking date
 * @param {string} startTime - Slot start time
 */
export const releaseSlotLock = async (userId, date, startTime) => {
  if (!isRedisConnected()) return;

  const key = `slot-lock:${userId}:${date}:${startTime}`;

  try {
    await redis.del(key);
  } catch (err) {
    console.error('Slot lock release error:', err.message);
  }
};
