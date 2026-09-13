import express from "express";
import {
    cancelPublicBookingPayment,
    createPublicBooking,
    getBookingStatus,
    getPublicBusiness,
    getPublicSlots,
    requestPublicBookingOtp,
    verifyPublicBookingOtp
} from '../controllers/publicController.js'
import rateLimiter from '../middleware/rateLimiter.js';

const router=express.Router();

router.get('/booking/status', getBookingStatus);
router.post('/booking/cancel-payment', cancelPublicBookingPayment);

router.get('/:slug',
    rateLimiter({ limit: 30, windowSeconds: 60, key: 'business' }),
    getPublicBusiness
);

router.get('/:slug/slots',
    rateLimiter({ limit: 30, windowSeconds: 60, key: 'slots' }),
    getPublicSlots
);

router.post('/:slug/request-otp',
    rateLimiter({ limit: 5, windowSeconds: 60, key: 'otp' }),
    requestPublicBookingOtp
);

router.post('/:slug/verify-otp',
    rateLimiter({ limit: 10, windowSeconds: 60, key: 'verify-otp' }),
    verifyPublicBookingOtp
);

router.post('/:slug/book',
    rateLimiter({ limit: 5, windowSeconds: 60, key: 'book' }),
    createPublicBooking
);

export default router;
