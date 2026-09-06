import Availability from "../models/Availability.js";
import { isValidTimeFormat } from "../utils/time.js";

export const listAvailability = async (req, res) => {
    try {
        const availability = await Availability.find({ userId: req.user.id }).sort({ dayOfWeek: 1 });
        res.json({ availability });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' ,error:err.message});
    }
};
export const saveAvailability = async (req, res) => {
    try {
        const { dayOfWeek, slot } = req.body;
        if (dayOfWeek===undefined || dayOfWeek < 0 || dayOfWeek > 6) {
            return res.status(400).json({ message: 'Invalid day of week' });
        }
        const cleanedSlots = (slot || []).filter((slot)=>(
            slot.startTime && slot.endTime && isValidTimeFormat(slot.startTime,slot.endTime )
        ));
        const availability=await Availability.findOneAndUpdate(
            {userId:req.user.id,dayOfWeek},
            {slot:cleanedSlots},
            {new:true, upsert:true}
        );
        res.json({message :'Availability saved',availability});
    }catch(err){
        res.status(500).json({
            message:'Server error',error:err.message
        });
    }
}