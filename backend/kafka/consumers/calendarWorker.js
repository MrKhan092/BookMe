import { createConsumer } from '../client.js';
import { TOPICS } from '../topics.js';
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import Service from '../../models/Service.js';
import {
  createBookingCalendarEvent,
  cancelBookingCalendarEvent,
  updateBookingCalendarEvent,
} from '../../utils/googleCalendar.js';

const GROUP_ID = 'bookme-calendar-worker';

/**
 * Calendar Worker — Kafka consumer that syncs bookings with Google Calendar.
 *
 * Listens to:
 *   - booking.created            → creates a new calendar event
 *   - booking.payment-confirmed  → creates a new calendar event
 *   - booking.cancelled          → cancels the calendar event
 *   - booking.rescheduled        → updates the calendar event
 */
export const startCalendarWorker = async () => {
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

        const booking = await Booking.findById(bookingId);
        if (!booking) {
          console.warn(`📅 Calendar Worker: Booking ${bookingId} not found, skipping`);
          return;
        }

        const business = await User.findById(booking.userId);
        if (!business || !business.googleCalendarConnected) {
          return; // Google Calendar not connected, nothing to do
        }

        const service = await Service.findById(booking.serviceId);
        if (!service) {
          console.warn(`📅 Calendar Worker: Service not found for booking ${bookingId}`);
          return;
        }

        if (topic === TOPICS.BOOKING_CANCELLED) {
          await cancelBookingCalendarEvent({ business, booking });
          console.log(`📅 Calendar event cancelled for booking ${bookingId}`);
        } else if (topic === TOPICS.BOOKING_RESCHEDULED) {
          const result = await updateBookingCalendarEvent({ business, service, booking });
          if (result.googleEventId) {
            booking.googleEventId = result.googleEventId;
            booking.customerCalendarUrl = result.customerCalendarUrl || booking.customerCalendarUrl;
            await booking.save();
          }
          console.log(`📅 Calendar event updated for booking ${bookingId}`);
        } else {
          // booking.created or booking.payment-confirmed → create event
          const result = await createBookingCalendarEvent({ business, service, booking });
          if (result.googleEventId) {
            booking.googleEventId = result.googleEventId;
            booking.customerCalendarUrl = result.customerCalendarUrl || booking.customerCalendarUrl;
            await booking.save();
          }
          console.log(`📅 Calendar event created for booking ${bookingId}`);
        }
      } catch (err) {
        console.error(`📅 Calendar Worker error:`, err.message);
      }
    },
  });

  console.log('📅 Calendar Worker started');
};
