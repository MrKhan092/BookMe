import { createConsumer } from '../client.js';
import { TOPICS } from '../topics.js';
import Booking from '../../models/Booking.js';
import WalletTransaction from '../../models/walletTransaction.js';
import { createBookingPayouttransaction } from '../../utils/wallet.js';

const GROUP_ID = 'bookme-wallet-worker';

/**
 * Wallet Worker — Kafka consumer that credits provider wallets after bookings.
 *
 * Listens to:
 *   - booking.created            → credits wallet for free bookings
 *   - booking.payment-confirmed  → credits wallet for paid bookings
 *
 * Includes idempotency check: skips if a payout transaction already exists
 * for this booking (prevents double-crediting on message retry).
 */
export const startWalletWorker = async () => {
  const consumer = createConsumer(GROUP_ID);
  await consumer.connect();

  await consumer.subscribe({
    topics: [
      TOPICS.BOOKING_CREATED,
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
          console.warn(`💰 Wallet Worker: Booking ${bookingId} not found, skipping`);
          return;
        }

        // Skip free bookings (no payout needed)
        if (booking.providerPayoutAmount <= 0) {
          return;
        }

        // Idempotency: check if payout already exists for this booking
        const existingPayout = await WalletTransaction.findOne({
          bookingId: booking._id,
          type: 'booking_payout',
        });

        if (existingPayout) {
          console.log(`💰 Wallet Worker: Payout already exists for booking ${bookingId}, skipping`);
          return;
        }

        await createBookingPayouttransaction({
          booking,
          description: `Booking payment from ${booking.customerName || 'Customer'}`,
        });

        console.log(`💰 Wallet credited ₹${booking.providerPayoutAmount / 100} for booking ${bookingId}`);
      } catch (err) {
        console.error(`💰 Wallet Worker error:`, err.message);
      }
    },
  });

  console.log('💰 Wallet Worker started');
};
