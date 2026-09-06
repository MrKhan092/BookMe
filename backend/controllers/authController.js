import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requestEmailOtp, verifyEmailOtp } from "../utils/emailOtp.js";
import slugify from "../utils/slug.js";


const createToken = (userId) => {
    return jwt.sign({ id: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' });
};


const toUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  slug: user.slug,
  businessName: user.businessName,
  businessDescription: user.businessDescription,
  brandTheme: user.brandTheme,
  brandAccent: user.brandAccent,
  timezone: user.timezone,
  googleCalendarConnected: user.googleCalendarConnected,
  googleCalendarId: user.googleCalendarId,
  payoutDetails: user.payoutDetails,
  stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
});

export const registerUser = async (req, res) => {
    try {
        const { name, email, password ,businessName,businessDescription,timezone,emailOtp } = req.body;
        // ... rest of the registration logic
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        // Verify the email OTP
        const otpResult = await verifyEmailOtp({
            email: normalizedEmail,
            purpose: 'registration',
            code: emailOtp,
            consume: true,
        });
        if (!otpResult.verified) {
            return res.status(400).json({ message: otpResult.reason || 'Invalid or expired OTP' });
        }
        const baseSlug = slugify(businessName || name) || 'business';
        let finalSlug = baseSlug;
        let counter = 1;
        while (await User.findOne({ slug: finalSlug })) {
            finalSlug = `${baseSlug}-${counter}`;
            counter += 1;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user=await User.create({
            name,
            email:normalizedEmail,
            password:hashedPassword,
            slug:finalSlug,
            businessName:businessName || '',
            timezone:timezone || 'Asia/Kolkata',
        });
        const token=createToken(user._id);
        res.status(201).json({ message: 'User registered successfully', user: toUserResponse(user), token });  
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
 
export const requestRegistrationOtp = async (req, res) => {
    try {
        const { email } = req.body;
       
        const normalizedEmail = email?.trim().toLowerCase();
        if(!normalizedEmail){
            return res.status(400).json({ message: 'Invalid email address' });
        }
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const result=await requestEmailOtp({
            email: normalizedEmail,
            purpose: 'registration',
        });
        res.json({ message: 'Verification code sent', result });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const verifyRegistrationOtp = async (req, res) => {
    try {
        const { email, emailOtp } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();
        if(!normalizedEmail || !emailOtp){
            return res.status(400).json({ message: 'Invalid email or OTP' });
        }
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const otpResult = await verifyEmailOtp({
            email: normalizedEmail,
            purpose: 'registration',
            code: emailOtp,
            consume: false,
        });

        if (!otpResult.verified) {
            return res.status(400).json({ message: otpResult.reason || 'Invalid or expired OTP' });

        }
        res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;   
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = createToken(user._id);
        res.json({ message: 'Login successful', user: toUserResponse(user), token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }   
        res.json({ user: toUserResponse(user) });   
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const updateProfile = async (req, res) => {
  try {
    const { businessName, businessDescription, timezone, brandTheme, brandAccent } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (businessName !== undefined) user.businessName = businessName;
    if (businessDescription !== undefined) user.businessDescription = businessDescription;
    if (timezone !== undefined) user.timezone = timezone;
    if (brandTheme !== undefined) user.brandTheme = brandTheme;
    if (brandAccent !== undefined) user.brandAccent = brandAccent;

    const baseSlug = slugify(user.businessName || user.name) || 'business';
    let finalSlug = baseSlug;
    let counter = 1;

    while (await User.findOne({ slug: finalSlug, _id: { $ne: user._id } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    user.slug = finalSlug;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: toUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
