import redis, { isRedisConnected } from '../config/redis.js';

/**
 * Rate limiter middleware factory using Redis.
 *
 * Uses a sliding window counter per IP + route key.
 * If Redis is down, requests are allowed through (open policy).
 *
 * @param {object} options
 * @param {number} options.limit         - Max requests allowed in the window
 * @param {number} options.windowSeconds - Time window in seconds
 * @param {string} options.key           - Route identifier (e.g., 'otp', 'book', 'slots')
 *
 * @example
 *   router.post('/request-otp', rateLimiter({ limit: 5, windowSeconds: 60, key: 'otp' }), controller);
 */
const rateLimiter = ({ limit, windowSeconds, key }) => {
  return async (req, res, next) => {
    if (!isRedisConnected()) {
      return next(); // Redis down — allow request through
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const redisKey = `ratelimit:${key}:${ip}`;

    try {
      const current = await redis.incr(redisKey);

      if (current === 1) {
        // First request in this window — set the TTL
        await redis.expire(redisKey, windowSeconds);
      }

      if (current > limit) {
        const ttl = await redis.ttl(redisKey);
        res.set('Retry-After', String(ttl));
        return res.status(429).json({
          message: 'Too many requests. Please try again later.',
          retryAfter: ttl,
        });
      }

      next();
    } catch (err) {
      console.error('Rate limiter error:', err.message);
      next(); // On error, allow request through
    }
  };
};

export default rateLimiter;
