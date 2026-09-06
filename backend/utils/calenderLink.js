const toGoogleDateTime=(date,time)=>{
    return `${date.replaceAll('-','')}T${time.replace(':','')}00`;
};

export const buildCustomerCalenderUrl=({bussiness,service,booking})=>{
    const params=new URLSearchParams({
        action:"TEMPLATE",
        text:`${service.name} booking with ${bussiness.businessName}`,
        dates:`${toGoogleDateTime(booking.date,booking.startTime)}/${toGoogleDateTime(booking.date,booking.endTime)}`,
        details:Booking.notes|| `Booking with ${bussiness.businessName||bussiness.name}`,

    });
    return `https://calender.google.com/calendar/render?${params.toString()}`;
};
    
