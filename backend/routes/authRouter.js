import express  from 'express';
import {getMe , loginUser, registerUser,requestRegistrationOtp ,updateProfile,verifyRegistrationOtp} from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router=express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/me',auth,getMe);
router.put('/profile',auth,updateProfile);
router.post('/register/request-otp',requestRegistrationOtp);
router.post('/register/verify-otp',verifyRegistrationOtp);

export default router;