/**
 * Central registry of all Kafka topic names.
 * Using constants avoids typos and makes refactoring easy.
 */
export const TOPICS = {
  BOOKING_CREATED: 'booking.created',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_RESCHEDULED: 'booking.rescheduled',
  BOOKING_PAYMENT_CONFIRMED: 'booking.payment-confirmed',
  WITHDRAWAL_REQUESTED: 'withdrawal.requested',
  WITHDRAWAL_STATUS_CHANGED: 'withdrawal.status-changed',
};
