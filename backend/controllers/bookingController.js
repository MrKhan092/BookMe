import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { buildCustomerCalenderUrl } from '../utils/calenderLink.js';
import { timeOverlap } from '../utils/overlap.js';
import { publishEvent } from '../kafka/producer.js';
import { TOPICS } from '../kafka/topics.js';

/**
 * Retrieves a list of bookings for the authenticated user based on query parameters.
 * Filters can include booking status and date.
 * Populates service details and appends a customer Google Calendar URL if available.
 * 
 * @param {Object} req - Express request object containing user ID and query parameters.
 * @param {Object} res - Express response object.
 */
export const listBookings = async (req, res) => {
  try {
    const query = { userId: req.user.id };

    if (req.query.status) {
      if (req.query.status === 'rescheduled') {
        query.isRescheduled = true;
      } else {
        query.status = req.query.status;
      }
    }
    if (!req.query.status || req.query.status === 'rescheduled') {
      query.status = { $nin: ['pending_payment', 'payment_failed'] };
    }
    if (req.query.date) query.date = req.query.date;

    const [bookings, business] = await Promise.all([
      Booking.find(query)
        .populate('serviceId', 'name duration price')
        .sort({ createdAt: -1 })
        .lean(),
      User.findById(req.user.id).select('name businessName').lean(),
    ]);

    const bookingsWithCalendarUrls = bookings.map((booking) => {
      if (booking.customerCalendarUrl || !business || !booking.serviceId) {
        return booking;
      }

      return {
        ...booking,
        customerCalendarUrl: buildCustomerCalenderUrl({
          business,
          service: booking.serviceId,
          booking,
        }),
      };
    });

    res.json({ bookings: bookingsWithCalendarUrls });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Updates the status of a specific booking (e.g., confirmed, cancelled).
 * Handles sending email notifications to the customer about the status change.
 * If the booking is cancelled, it also removes the event from Google Calendar.
 * 
 * @param {Object} req - Express request object containing booking ID in params and new status in body.
 * @param {Object} res - Express response object.
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'pending_payment', 'confirmed', 'cancelled', 'payment_failed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    ).populate('serviceId', 'name duration price');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (status === 'cancelled') {
      // Publish event to Kafka — email and calendar workers handle the rest
      await publishEvent(TOPICS.BOOKING_CANCELLED, {
        bookingId: String(booking._id),
        userId: String(req.user.id),
      }, String(booking._id));
    }

    res.json({ message: 'Booking updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Reschedules an existing booking to a new date and time slot.
 * Validates for conflicting bookings to prevent double-booking.
 * Updates the existing Google Calendar event and sends a reschedule notification email.
 * 
 * @param {Object} req - Express request object containing booking ID in params and new date/time in body.
 * @param {Object} res - Express response object.
 */
export const rescheduleBooking = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Date, start time, and end time are required' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const conflictingBookings = await Booking.find({
      _id: { $ne: booking._id },
      userId: req.user.id,
      date,
      status: { $nin: ['cancelled', 'payment_failed'] },
    });

    const hasConflict = conflictingBookings.some((candidate) => (
      timeOverlap(startTime, endTime, candidate.startTime, candidate.endTime)
    ));

    if (hasConflict) {
      return res.status(409).json({ message: 'That slot is already booked' });
    }

    booking.date = date;
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.status = booking.status === 'cancelled' ? 'confirmed' : booking.status;
    booking.isRescheduled = true;
    booking.rescheduleCount = (booking.rescheduleCount || 0) + 1;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id).populate('serviceId', 'name duration price');

    // Publish event to Kafka — email and calendar workers handle the rest
    await publishEvent(TOPICS.BOOKING_RESCHEDULED, {
      bookingId: String(booking._id),
      userId: String(req.user.id),
      serviceId: String(booking.serviceId),
    }, String(booking._id));

    res.json({ message: 'Booking rescheduled', booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};