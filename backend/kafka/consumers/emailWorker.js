import { createConsumer } from '../client.js';
import { TOPICS } from '../topics.js';
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import Service from '../../models/Service.js';
import { sendBookingNotification } from '../../utils/bookingNotifications.js';

const GROUP_ID = 'bookme-email-worker';

/**
 * Email Worker — Kafka consumer that handles all booking email notifications.
 *
 * Listens to:
 *   - booking.created            → sends confirmation email
 *   - booking.cancelled          → sends cancellation email
 *   - booking.rescheduled        → sends reschedule email
 *   - booking.payment-confirmed  → sends payment confirmation email
 */

const TOPIC_TO_EMAIL_TYPE = {
  [TOPICS.BOOKING_CREATED]: 'confirmed',
  [TOPICS.BOOKING_CANCELLED]: 'cancelled',
  [TOPICS.BOOKING_RESCHEDULED]: 'rescheduled',
  [TOPICS.BOOKING_PAYMENT_CONFIRMED]: 'confirmed',
};

export const startEmailWorker = async () => {
  const consumer = createConsumer(GROUP_ID);
  await consumer.connect();

  await consumer.subscribe({
    topics: [
      TOPICS.BOOKING_CREATED,
      TOPICS.BOOKING_CANCELLED,
      TOPICS.BOOKING_RESCHEDULED,
      TOPICS.BOOKING_PAYMENT_CONFIRMED,
    ],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const data = JSON.parse(message.value.toString());
        const { bookingId } = data;

        const booking = await Booking.findById(bookingId)
          .populate('serviceId', 'name duration price');
        if (!booking) {
          console.warn(`📧 Email Worker: Booking ${bookingId} not found, skipping`);
          return;
        }

        const business = await User.findById(booking.userId);
        if (!business || !booking.serviceId) {
          console.warn(`📧 Email Worker: Missing business/service for booking ${bookingId}`);
          return;
        }

        const emailType = TOPIC_TO_EMAIL_TYPE[topic] || 'status';

        await sendBookingNotification({
          business,
          service: booking.serviceId,
          booking,
          type: emailType,
        });

        console.log(`📧 Email sent (${emailType}) for booking ${bookingId}`);
      } catch (err) {
        console.error(`📧 Email Worker error:`, err.message);
      }
    },
  });

  console.log('📧 Email Worker started');
};
