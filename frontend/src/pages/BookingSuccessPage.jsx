import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getBookingStatus } from "../api/client";
import { bookingSuccessPageStyles as s } from "../assets/dummyStyles";
import {
  CheckCircle,
  CalendarDays,
  ArrowLeft,
  Calendar,
} from "lucide-react";

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    const sessionId = searchParams.get("session_id");
    if (bookingId || sessionId) {
      getBookingStatus({ bookingId, session_id: sessionId })
        .then((r) => setBooking(r.data.booking || r.data))
        .catch(() => {});
    }
  }, [searchParams]);

  return (
    <div className={s.container}>
      <div className={s.card}>
        <div className={s.iconCircle}>
          <CheckCircle className={s.checkIcon} />
        </div>
        <div className={s.statusLabel}>BOOKING CONFIRMED</div>
        <h1 className={s.heading}>You're all set!</h1>

        {booking && (
          <div className={s.bookingDetails}>
            <div className={s.serviceRow}>
              <CalendarDays className={s.calendarDaysIcon} />
              <span className={s.serviceName}>
                {booking.serviceId?.name || "Service"}
              </span>
            </div>
            <p className={s.detailText}>
              {booking.date} · {booking.startTime} – {booking.endTime}
            </p>
            <p className={s.statusText}>
              Status: {booking.status}
            </p>
          </div>
        )}

        {booking?.customerCalendarUrl && (
          <a
            href={booking.customerCalendarUrl}
            target="_blank"
            rel="noreferrer"
            className={s.addToCalendarLink}
          >
            <Calendar className={s.calendarIcon} />
            Add to Calendar
          </a>
        )}

        <Link to="/" className={s.backLink}>
          <ArrowLeft className={s.backIcon} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
