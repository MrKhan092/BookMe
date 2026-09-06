import User from "../models/User.js";
import { getGoogleAuthUrl, getGoogleTokens } from "../utils/googleCalendar.js";

export const getGoogleConnectUrl=async (req ,res)=>{
    if(!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(503).json({message:"Google Integration is not configured yet"})
    }
    res.json({url:getGoogleAuthUrl(req.user.id)})

};

export const handleGoogleCallback=async (req ,res)=>{
    try{
        const {code,state}=req.query;
    if(!code || !state){
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendar=failed`);
    }
    const token=await getGoogleTokens(code);
    if(!token.refresh_token){
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendar=missing-refresh-token`);
    };

    await User.findByIdAndUpdate(req.user.id,{
        googleRefreshToken:token.refresh_token,
        googleCalendarId:'primary',
        googleCalendarConnected:true,
        
    });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendar=connected`);
    }catch(err){
        console.error(err);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendar=failed`);    
    }
};

    
