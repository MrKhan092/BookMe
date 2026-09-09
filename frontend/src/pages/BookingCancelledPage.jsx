import { Link } from "react-router-dom";
import { bookingCancelledPageStyles as s } from "../assets/dummyStyles";
import { XCircle, ArrowLeft } from "lucide-react";

export default function BookingCancelledPage() {
  return (
    <div className={s.container}>
      <div className={s.card}>
        <div className={s.iconCircle}>
          <XCircle className={s.icon} />
        </div>
        <div className={s.statusLabel}>PAYMENT CANCELLED</div>
        <h1 className={s.heading}>Booking not completed</h1>
        <p className={s.description}>
          Your payment was cancelled or did not go through. No booking has been
          created. You can try again anytime.
        </p>
        <Link to="/" className={s.homeLink}>
          <ArrowLeft className={s.homeLinkIcon} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
