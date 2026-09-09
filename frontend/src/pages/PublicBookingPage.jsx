import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPublicBusiness,
  getPublicSlots,
  requestPublicBookingOtp,
  verifyPublicBookingOtp,
  createPublicBooking,
} from "../api/client";
import {
  publicBookingPageStyles as s,
  getBrandThemeStyle,
} from "../assets/dummyStyles";
import greenImg from "../assets/green.png";
import {
  CalendarDays,
  Clock,
  User,
  Mail,
  Shield,
  CheckCircle,
  CreditCard,
  Lock,
  MessageSquare,
} from "lucide-react";

const AVATARS = [
  "A1.png", "A2.png", "A3.png", "A4.png", "A5.png",
  "A6.png", "A7.png", "A8.png", "A9.png", "A10.png",
  "A11.png", "A12.png", "A13.png", "A15.png", "A16.png",
];

export default function PublicBookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Booking form
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [avatar, setAvatar] = useState("A1.png");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load business
  useEffect(() => {
    getPublicBusiness(slug)
      .then((r) => {
        setBusiness(r.data.business || r.data);
        setServices(r.data.services || []);
        if (r.data.services?.length > 0) {
          setSelectedService(r.data.services[0]);
        }
      })
      .catch(() => setMessage("Business not found."));
  }, [slug]);

  // Load slots when date/service changes
  useEffect(() => {
    if (!date || !selectedService) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    getPublicSlots(slug, { date, serviceId: selectedService._id })
      .then((r) => setSlots(r.data.slots || r.data || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [date, selectedService, slug]);

  const handleRequestOtp = async () => {
    if (!email) return setMessage("Enter your email.");
    setOtpLoading(true);
    setMessage("");
    try {
      await requestPublicBookingOtp(slug, { email });
      setOtpSent(true);
      setMessage("Verification code sent!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setMessage("Enter the code.");
    setOtpLoading(true);
    setMessage("");
    try {
      await verifyPublicBookingOtp(slug, { email, emailOtp: otp });
      setOtpVerified(true);
      setMessage("Email verified!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService || !date || !selectedSlot || !name || !email) {
      return setMessage("Please fill in all required fields.");
    }
    if (!otpVerified) {
      return setMessage("Please verify your email first.");
    }
    setLoading(true);
    setMessage("");
    try {
      const { data } = await createPublicBooking(slug, {
        serviceId: selectedService._id,
        date,
        startTime: selectedSlot,
        customerName: name,
        customerEmail: email,
        customerAvatar: avatar,
        notes,
        emailOtp: otp,
      });
      // If Stripe redirect
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      navigate(
        `/booking/success?bookingId=${data.booking?._id || data.bookingId || ""}`
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!business) {
    return (
      <div className={s.pageContainer}>
        <p className="text-center text-slate-500">Loading…</p>
      </div>
    );
  }

  const theme = getBrandThemeStyle(business.brandTheme || "emerald");
  const accent = business.brandAccent || theme.accent;
  const initial = (business.businessName || "B").charAt(0).toUpperCase();

  // Min date = today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className={s.pageContainer}
      style={{ "--brand-panel": theme.panel, "--brand-accent": accent }}
    >
      <div className={s.mainGrid}>
        {/* ── Left Panel ── */}
        <div className={s.leftPanel}>
          {/* Background image */}
          <div className={s.bgImageContainer}>
            <img src={greenImg} alt="" className={s.bgImage} />
            <div className={s.bgImageOverlay} />
          </div>
          <div className={s.bgFadeOverlay} />

          {/* Content */}
          <div className={s.leftContent}>
            <div className={s.businessInfoRow}>
              <div className={s.businessAvatar} style={{ background: accent }}>
                {initial}
              </div>
              <div>
                <div className={s.bookOnlineLabel}>BOOK ONLINE</div>
                <h1 className={s.businessName}>
                  {business.businessName || "Business"}
                </h1>
              </div>
            </div>

            {business.businessDescription && (
              <p className={s.businessDesc}>{business.businessDescription}</p>
            )}
          </div>

          {/* Service list */}
          <div className={s.serviceList}>
            {services.map((sv) => {
              const isActive = selectedService?._id === sv._id;
              return (
                <button
                  key={sv._id}
                  className={
                    isActive ? s.serviceBtnActive : s.serviceBtnInactive
                  }
                  onClick={() => {
                    setSelectedService(sv);
                    setSelectedSlot("");
                  }}
                >
                  <div className={s.serviceIconBase}>
                    <img
                      src={`/src/assets/icons/${sv.icon || "C1.png"}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={s.serviceTextBlock}>
                    <span
                      className={
                        isActive
                          ? s.serviceNameActive
                          : s.serviceNameInactive
                      }
                    >
                      {sv.name}
                    </span>
                    <span
                      className={
                        isActive
                          ? s.serviceDetailActive
                          : s.serviceDetailInactive
                      }
                    >
                      {sv.duration} min · {sv.price > 0 ? `₹${sv.price}` : "Free"}
                    </span>
                    {sv.description && (
                      <span
                        className={
                          isActive
                            ? s.serviceDescActive
                            : s.serviceDescInactive
                        }
                      >
                        {sv.description}
                      </span>
                    )}
                  </div>
                  <div
                    className={s.selectorIconBase}
                    style={
                      isActive
                        ? { background: accent }
                        : { border: "2px solid rgba(255,255,255,0.3)" }
                    }
                  >
                    {isActive && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className={s.rightPanel}>
          <h2 className={s.bookingTitle}>Book a Session</h2>
          {selectedService ? (
            <div className={s.selectedServiceInfo}>
              <CalendarDays className="w-4 h-4" />
              {selectedService.name} · {selectedService.duration} min
              {selectedService.price > 0 && ` · ₹${selectedService.price}`}
            </div>
          ) : (
            <p className={s.noServiceText}>Select a service to continue</p>
          )}

          <form className={s.form} onSubmit={handleSubmit}>
            {/* Date */}
            <div>
              <label className={s.inputLabel}>Select Date</label>
              <div className={s.inputWrapper}>
                <CalendarDays className={s.inputIcon} />
                <input
                  type="date"
                  className={s.dateInput}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedSlot("");
                  }}
                  min={today}
                  style={{ "--tw-ring-color": accent }}
                  required
                />
              </div>
            </div>

            {/* Time Slots */}
            {date && (
              <div>
                <label className={s.inputLabel}>Select Time</label>
                {slotsLoading ? (
                  <p className={s.noSlotsText}>Loading slots…</p>
                ) : slots.length === 0 ? (
                  <p className={s.noSlotsText}>No available slots for this date.</p>
                ) : (
                  <div className={s.timeSlotGrid}>
                    {slots.map((slot) => {
                      const time = typeof slot === "string" ? slot : slot.startTime || slot.time;
                      const isSelected = selectedSlot === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          className={`${s.slotBtnBase} ${
                            isSelected ? s.slotBtnSelected : s.slotBtnUnselected
                          }`}
                          style={isSelected ? { background: accent } : {}}
                          onClick={() => setSelectedSlot(time)}
                        >
                          <Clock className="w-4 h-4" />
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Name & Email */}
            <div className={s.nameEmailGrid}>
              <div>
                <label className={s.inputLabel}>Your Name</label>
                <div className={s.inputWrapper}>
                  <User className={s.inputIcon} />
                  <input
                    type="text"
                    className={s.textInput}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={s.inputLabel}>Email</label>
                <div className={s.inputWrapper}>
                  <Mail className={s.inputIcon} />
                  <input
                    type="email"
                    className={s.emailInput}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* OTP */}
            {email && (
              <div className={s.otpBlock}>
                <label className={s.otpLabel}>Email Verification</label>
                <div className={s.otpRow}>
                  <input
                    type="text"
                    className={s.otpInput}
                    placeholder="Enter code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  {otpVerified ? (
                    <button
                      type="button"
                      className={s.otpButton}
                      disabled
                      style={{ background: "#10b981", color: "white", border: "none" }}
                    >
                      ✓ Verified
                    </button>
                  ) : otpSent ? (
                    <button
                      type="button"
                      className={s.otpButton}
                      onClick={handleVerifyOtp}
                      disabled={otpLoading}
                    >
                      {otpLoading ? "Verifying…" : "Verify"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={s.otpButton}
                      onClick={handleRequestOtp}
                      disabled={otpLoading}
                    >
                      {otpLoading ? "Sending…" : "Send Code"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Avatar */}
            <div>
              <label className={s.inputLabel}>Choose your Avatar</label>
              <div className={s.avatarGrid}>
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    className={`${s.avatarBtnBase} ${
                      avatar === av ? s.avatarBtnSelected : s.avatarBtnUnselected
                    }`}
                    style={
                      avatar === av
                        ? { borderColor: accent, "--tw-ring-color": accent }
                        : {}
                    }
                    onClick={() => setAvatar(av)}
                  >
                    <img
                      src={`/src/assets/avatars/${av}`}
                      alt=""
                      className="w-full h-full object-cover rounded-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={s.inputLabel}>Notes (optional)</label>
              <textarea
                className={s.notesTextarea}
                rows={3}
                placeholder="Anything we should know before the session?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={s.submitButton}
              style={{ background: accent }}
              disabled={loading}
            >
              {loading
                ? "Booking…"
                : selectedService?.price > 0
                ? `Pay ₹${selectedService.price} & Book`
                : "Confirm Booking"}
            </button>

            {selectedService?.price > 0 && (
              <div className={s.securePaymentText}>
                <Lock className="w-3.5 h-3.5" />
                Secure payment via Stripe
              </div>
            )}
          </form>

          {/* Message */}
          {message && (
            <div className={`${s.messageBase} ${s.messageInfo} mt-4`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
