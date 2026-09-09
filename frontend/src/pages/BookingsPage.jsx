import { useState, useEffect } from "react";
import {
  listBookings,
  updateBookingStatus,
  rescheduleBooking,
} from "../api/client";
import { bookingsPageStyles as s } from "../assets/dummyStyles";
import heroImg from "../assets/P6.png";
import {
  CalendarDays,
  Clock,
  ChevronDown,
  X,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  ExternalLink,
  MoreVertical,
  History,
  Calendar,
} from "lucide-react";

const STATUS_LABELS = {
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  pending: "Pending",
  pending_payment: "Pending Payment",
  payment_failed: "Payment Failed",
};

const PAYMENT_LABELS = {
  paid: "Paid",
  not_required: "Free",
  pending: "Pending",
  failed: "Failed",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState("");

  // Modal states
  const [cancelModal, setCancelModal] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    startTime: "",
  });
  const [modalLoading, setModalLoading] = useState(false);

  const load = () => {
    const params = {};
    if (dateFilter) params.date = dateFilter;
    if (statusFilter) params.status = statusFilter;
    listBookings(params)
      .then((r) => setBookings(r.data.bookings || r.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, [dateFilter, statusFilter]);

  const handleCancel = async () => {
    setModalLoading(true);
    try {
      await updateBookingStatus(cancelModal._id, { status: "cancelled" });
      setMessage("Booking cancelled.");
      setCancelModal(null);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to cancel.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleForm.date || !rescheduleForm.startTime) {
      setMessage("Select a new date and time.");
      return;
    }
    setModalLoading(true);
    try {
      await rescheduleBooking(rescheduleModal._id, rescheduleForm);
      setMessage("Booking rescheduled.");
      setRescheduleModal(null);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reschedule.");
    } finally {
      setModalLoading(false);
    }
  };

  const statusBadgeClass = (status) =>
    s.statusBadgeClassMap[status] || s.statusBadgeClassMap.default;

  const paymentBadgeClass = (ps) =>
    s.paymentBadgeClassMap[ps] || s.paymentBadgeClassMap.default;

  const statusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className={s.badgeIcon} />;
      case "cancelled":
        return <XCircle className={s.badgeIcon} />;
      case "pending":
      case "pending_payment":
        return <AlertCircle className={s.badgeIcon} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className={s.headerSection}>
        <div className={s.headerLeftArea}>
          <div>
            <div className={s.bookingLabel}>BOOKINGS</div>
            <h1 className={s.mainHeading}>
              Manage your{" "}
              <span className={s.mainHeadingGradient}>bookings.</span>
            </h1>
            <p className={s.subText}>
              Track, reschedule, or cancel your appointments.
            </p>
          </div>
          <div className={s.illustrationContainer}>
            <img src={heroImg} alt="" className={s.illustrationImg} />
          </div>
        </div>

        {/* Filters */}
        <div className={s.filterRow}>
          <div className={s.filterDateContainer}>
            <CalendarDays className={s.filterIcon} />
            <input
              type="date"
              className={s.filterDateInput}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className={s.filterStatusContainer}>
            <select
              className={s.filterStatusSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="payment_failed">Payment Failed</option>
            </select>
            <ChevronDown className={s.filterSelectIcon} />
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`${s.messageBanner} ${s.messageBannerInfo}`}>
          {message}
        </div>
      )}

      {/* ── Booking List ── */}
      <div className={s.bookingListSection}>
        {bookings.length === 0 && (
          <div className={s.emptyStateContainer}>
            <CalendarDays className={s.emptyStateIcon} />
            <p className={s.emptyStateText}>No bookings found.</p>
          </div>
        )}

        {bookings.map((bk) => (
          <div key={bk._id} className={s.cardContainer}>
            <div className={s.cardInnerLayout}>
              <div className={s.cardLeftBlock}>
                {/* Badges */}
                <div className={s.badgesContainer}>
                  <span
                    className={`${s.statusBadgeBase} ${statusBadgeClass(bk.status)}`}
                  >
                    {statusIcon(bk.status)}
                    {STATUS_LABELS[bk.status] || bk.status}
                  </span>
                  <span
                    className={`${s.paymentBadgeBase} ${paymentBadgeClass(bk.paymentStatus)}`}
                  >
                    <CreditCard className={s.badgeIcon} />
                    {PAYMENT_LABELS[bk.paymentStatus] || bk.paymentStatus}
                  </span>
                </div>

                {/* Customer */}
                <div className={s.customerInfoRow}>
                  <div className={s.customerAvatarContainer}>
                    <img
                      src={`/src/assets/avatars/${bk.customerAvatar || "A1.png"}`}
                      alt=""
                      className={s.customerAvatarImg}
                    />
                  </div>
                  <div>
                    <div className={s.customerName}>{bk.customerName}</div>
                    <div className={s.customerEmail}>{bk.customerEmail}</div>
                  </div>
                </div>

                {/* Details */}
                <div className={s.bookingDetailsRow}>
                  <div className={s.bookingDetailsIconContainer}>
                    <CalendarDays className={s.bookingDetailsIcon} />
                  </div>
                  <div className={s.bookingDetailsTextContainer}>
                    <div className={s.bookingDateTimeText}>
                      {bk.date} · {bk.startTime} – {bk.endTime}
                    </div>
                    <div className={s.bookingServiceRow}>
                      <span className={s.bookingServiceDot} />
                      <span className={s.bookingServiceText}>
                        {bk.serviceId?.name || "Service"} ·{" "}
                        {bk.serviceId?.duration || "–"} min
                        {bk.amount > 0 && ` · ₹${bk.amount}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className={s.timestampsContainer}>
                  <span className={s.timestampSpan}>
                    <Clock className={s.timestampIcon} />
                    Booked{" "}
                    {new Date(bk.createdAt).toLocaleDateString()}
                  </span>
                  {bk.isRescheduled && (
                    <span className={s.timestampSpan}>
                      <RefreshCw className={s.timestampIcon} />
                      Rescheduled
                    </span>
                  )}
                </div>

                {/* Calendar sync */}
                {bk.googleEventId && (
                  <div className={s.calendarSyncRow}>
                    <Calendar className={s.timestampIcon} />
                    Synced to Google Calendar
                  </div>
                )}

                {bk.customerCalendarUrl ? (
                  <a
                    href={bk.customerCalendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={s.calendarLinkButton}
                  >
                    <ExternalLink className={s.calendarLinkIcon} />
                    Add to Calendar
                  </a>
                ) : null}
              </div>

              {/* Actions */}
              <div className={s.cardRightBlock}>
                {bk.status === "confirmed" && (
                  <div className={s.actionButtonsContainer}>
                    <button
                      className={s.rescheduleButton}
                      onClick={() => {
                        setRescheduleModal(bk);
                        setRescheduleForm({ date: bk.date, startTime: bk.startTime });
                      }}
                    >
                      <RefreshCw className={s.actionIcon} />
                      Reschedule
                    </button>
                    <button
                      className={s.cancelButton}
                      onClick={() => setCancelModal(bk)}
                    >
                      <XCircle className={s.actionIcon} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cancel Modal ── */}
      {cancelModal && (
        <div className={s.modalOverlay} onClick={() => setCancelModal(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>Cancel Booking</h3>
              <button
                className={s.modalCloseBtn}
                onClick={() => setCancelModal(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={s.modalBody}>
              <p className={s.modalMessage}>
                Are you sure you want to cancel the booking for{" "}
                <strong>{cancelModal.customerName}</strong> on{" "}
                <strong>{cancelModal.date}</strong>?
              </p>
            </div>
            <div className={s.modalFooter}>
              <button
                className={s.modalButtonSecondary}
                onClick={() => setCancelModal(null)}
              >
                Keep booking
              </button>
              <button
                className={s.modalButtonDanger}
                onClick={handleCancel}
                disabled={modalLoading}
              >
                {modalLoading ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reschedule Modal ── */}
      {rescheduleModal && (
        <div
          className={s.modalOverlay}
          onClick={() => setRescheduleModal(null)}
        >
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>Reschedule Booking</h3>
              <button
                className={s.modalCloseBtn}
                onClick={() => setRescheduleModal(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={s.modalBody}>
              <div className={s.rescheduleGrid}>
                <div className={s.rescheduleInputContainer}>
                  <CalendarDays className={s.rescheduleInputIcon} />
                  <input
                    type="date"
                    className={s.rescheduleInputField}
                    value={rescheduleForm.date}
                    onChange={(e) =>
                      setRescheduleForm((p) => ({
                        ...p,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={s.rescheduleInputContainer}>
                  <Clock className={s.rescheduleInputIcon} />
                  <input
                    type="time"
                    className={s.rescheduleInputField}
                    value={rescheduleForm.startTime}
                    onChange={(e) =>
                      setRescheduleForm((p) => ({
                        ...p,
                        startTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className={s.modalFooter}>
              <button
                className={s.modalButtonSecondary}
                onClick={() => setRescheduleModal(null)}
              >
                Cancel
              </button>
              <button
                className={s.modalButtonPrimary}
                onClick={handleReschedule}
                disabled={modalLoading}
              >
                {modalLoading ? "Saving…" : "Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
