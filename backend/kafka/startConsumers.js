import { startEmailWorker } from './consumers/emailWorker.js';
import { startCalendarWorker } from './consumers/calendarWorker.js';
import { startWalletWorker } from './consumers/walletWorker.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Attempts to start a worker with retries.
 * Kafka topics may not be ready immediately after broker starts,
 * so we retry a few times with increasing delays.
 */
const startWithRetry = async (name, startFn, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await startFn();
      return;
    } catch (err) {
      if (attempt < retries) {
        const waitTime = attempt * 2000;
        console.warn(`⚠️  ${name} Worker failed (attempt ${attempt}/${retries}), retrying in ${waitTime / 1000}s...`);
        await delay(waitTime);
      } else {
        console.warn(`⚠️  ${name} Worker failed after ${retries} attempts:`, err.message);
      }
    }
  }
};

/**
 * Starts all Kafka consumer workers.
 * Called once from server.js at application startup.
 * Waits 3 seconds for Kafka to be fully ready before starting workers.
 */
export const startAllConsumers = async () => {
  // Give Kafka broker time to finish initialization
  await delay(3000);

  await startWithRetry('Email', startEmailWorker);
  await startWithRetry('Calendar', startCalendarWorker);
  await startWithRetry('Wallet', startWalletWorker);

  console.log('✅ All Kafka consumers started');
};
