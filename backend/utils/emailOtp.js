import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import EmailOtp from '../models/EmailOtp.js';
import { sendOtpNotification } from './bookingNotifications.js';

const OTP_TTL_MINUTES = 10; 
const MAX_ATTEMPTS = 5;

const normalizedEmail=(email= '')=>{
    return email.trim().toLowerCase();
}

const createCode=()=>{
    return crypto.randomInt(100000, 999999).toString();
}
export const requestEmailOtp=async({email,purpose})=>{
    const normalizedEmailValue=normalizedEmail(email);
    if(!normalizedEmailValue){
        throw new Error('Invalid email address');
    }
    const code=createCode();
    const codeHash=await bcrypt.hash(code,10);
    const expiresAt=new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await EmailOtp.deleteMany({email:normalizedEmailValue,purpose,consumeAt:null});
    await EmailOtp.create({
        email:normalizedEmailValue,
        purpose,
        codeHash,
        expiresAt,
    });
    await sendOtpNotification({email: normalizedEmailValue, code, purpose});
    return {
        sent:true,
        email:normalizedEmailValue,
        expiresInMinutes:OTP_TTL_MINUTES,
    };
}
export const verifyEmailOtp=async({email,purpose,code,consume=false})=>{
    const normalizedEmailValue=normalizedEmail(email);
    if(!normalizedEmailValue || !code){
        return {
            verified:false,
            reason:'Invalid email or code',
        };
    }
    const record=await EmailOtp.findOne({email:normalizedEmailValue,purpose,consumeAt:null,expiresAt:{$gt:new Date()}}).sort({createdAt:-1});
    if(!record){
        return {
            verified:false,
            reason:'No valid OTP found or it has expired',
        };
    }
    if(record.attempts>=MAX_ATTEMPTS){
        return {
            verified:false,
            reason:'Maximum verification attempts exceeded',
        };
    }
    const isMatch=await bcrypt.compare(String(code).trim(),record.codeHash);
    if(!isMatch){
        record.attempts+=1;
        await record.save();
        return {
            verified:false,
            reason:'Incorrect OTP',
        };
    }
    if(consume){
        record.consumeAt=new Date();
        await record.save();
    }
    return {
        verified:true,
        email:normalizedEmailValue,
    };
}