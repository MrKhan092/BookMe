import crypto from 'crypto';
import redis, { isRedisConnected } from '../config/redis.js';
import { sendOtpNotification } from './bookingNotifications.js';

// Fallback: keep MongoDB import for when Redis is down
import EmailOtp from '../models/EmailOtp.js';
import bcrypt from 'bcryptjs';

const OTP_TTL_SECONDS = 600; // 10 minutes
const MAX_ATTEMPTS = 5;

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const createCode = () => crypto.randomInt(100000, 999999).toString();

/**
 * Generates and stores a new OTP.
 * Uses Redis if available, falls back to MongoDB.
 */
export const requestEmailOtp = async ({ email, purpose }) => {
  const normalizedEmailValue = normalizeEmail(email);
  if (!normalizedEmailValue) {
    throw new Error('Invalid email address');
  }

  const code = createCode();

  if (isRedisConnected()) {
    // --- Redis path: simple SET with auto-expiry ---
    const otpKey = `otp:${purpose}:${normalizedEmailValue}`;
    const attemptsKey = `otp-attempts:${purpose}:${normalizedEmailValue}`;

    await redis.set(otpKey, code, 'EX', OTP_TTL_SECONDS);
    await redis.set(attemptsKey, '0', 'EX', OTP_TTL_SECONDS);
  } else {
    // --- MongoDB fallback ---
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
    await EmailOtp.deleteMany({ email: normalizedEmailValue, purpose, consumeAt: null });
    await EmailOtp.create({ email: normalizedEmailValue, purpose, codeHash, expiresAt });
  }

  await sendOtpNotification({ email: normalizedEmailValue, code, purpose });

  return {
    sent: true,
    email: normalizedEmailValue,
    expiresInMinutes: OTP_TTL_SECONDS / 60,
  };
};

/**
 * Verifies an OTP code.
 * Uses Redis if available, falls back to MongoDB.
 *
 * @param {object} options
 * @param {string} options.email   - Customer email
 * @param {string} options.purpose - OTP purpose (e.g., 'booking', 'registration')
 * @param {string} options.code    - The OTP code to verify
 * @param {boolean} options.consume - If true, delete the OTP after successful verification
 */
export const verifyEmailOtp = async ({ email, purpose, code, consume = false }) => {
  const normalizedEmailValue = normalizeEmail(email);
  if (!normalizedEmailValue || !code) {
    return { verified: false, reason: 'Invalid email or code' };
  }

  if (isRedisConnected()) {
    // --- Redis path ---
    const otpKey = `otp:${purpose}:${normalizedEmailValue}`;
    const attemptsKey = `otp-attempts:${purpose}:${normalizedEmailValue}`;

    const storedCode = await redis.get(otpKey);
    if (!storedCode) {
      return { verified: false, reason: 'No valid OTP found or it has expired' };
    }

    const attempts = parseInt(await redis.get(attemptsKey) || '0', 10);
    if (attempts >= MAX_ATTEMPTS) {
      return { verified: false, reason: 'Maximum verification attempts exceeded' };
    }

    if (String(code).trim() !== storedCode) {
      await redis.incr(attemptsKey);
      return { verified: false, reason: 'Incorrect OTP' };
    }

    // OTP is correct
    if (consume) {
      await redis.del(otpKey);
      await redis.del(attemptsKey);
    }

    return { verified: true, email: normalizedEmailValue };
  } else {
    // --- MongoDB fallback (original logic) ---
    const record = await EmailOtp.findOne({
      email: normalizedEmailValue,
      purpose,
      consumeAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record) {
      return { verified: false, reason: 'No valid OTP found or it has expired' };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return { verified: false, reason: 'Maximum verification attempts exceeded' };
    }

    const isMatch = await bcrypt.compare(String(code).trim(), record.codeHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return { verified: false, reason: 'Incorrect OTP' };
    }

    if (consume) {
      record.consumeAt = new Date();
      await record.save();
    }

    return { verified: true, email: normalizedEmailValue };
  }
};