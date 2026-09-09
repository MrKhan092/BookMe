import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  registerUser,
  loginUser,
  requestRegistrationOtp,
  verifyRegistrationOtp,
} from "../api/client";
import logo from "../assets/logo.png";
import { authPageStyles as s } from "../assets/dummyStyles";
import {
  User,
  Building2,
  Mail,
  Lock,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(true);

  // Form state
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    password: "",
    emailOtp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [message, setMessage] = useState("");

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  // ── Request OTP ──
  const handleRequestOtp = async () => {
    if (!form.email) return setMessage("Enter your email first.");
    setOtpLoading(true);
    setMessage("");
    try {
      await requestRegistrationOtp({ email: form.email });
      setOtpSent(true);
      setMessage("Verification code sent to your email.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async () => {
    if (!form.emailOtp) return setMessage("Enter the verification code.");
    setOtpLoading(true);
    setMessage("");
    try {
      await verifyRegistrationOtp({ email: form.email, emailOtp: form.emailOtp });
      setOtpVerified(true);
      setMessage("Email verified successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (isRegister) {
        if (!otpVerified) {
          setLoading(false);
          return setMessage("Please verify your email first.");
        }
        const { data } = await registerUser(form);
        if (data.token) localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        const { data } = await loginUser({
          email: form.email,
          password: form.password,
        });
        if (data.token) localStorage.setItem("token", data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister((p) => !p);
    setMessage("");
    setOtpSent(false);
    setOtpVerified(false);
  };

  return (
    <div className={s.pageBg}>
      <div className={s.gridContainer}>
        {/* ── Left Brand ── */}
        <div className={s.brandSection}>
          <div className={s.logoRow}>
            <img src={logo} alt="BookMe" className={s.logoImg} />
            <span className={s.brandName}>BookMe</span>
          </div>

          <h1 className={s.mainHeading}>
            A calm booking desk
            <br />
            for <span className={s.gradientText}>small businesses.</span>
          </h1>

          <p className={s.subtitle}>
            Create your business profile, add services, set availability, and
            share one clean booking link.
          </p>

          <div className={s.featureGrid}>
            <div className={s.featureCard}>
              <div className={s.featureIconWrapPurple}>
                <Shield className={s.featureIconPurple} />
              </div>
              <div>
                <div className={s.featureTitle}>Easy Setup</div>
                <div className={s.featureDesc}>Get started in minutes</div>
              </div>
            </div>

            <div className={s.featureCard}>
              <div className={s.featureIconWrapEmerald}>
                <Lock className={s.featureIconEmerald} />
              </div>
              <div>
                <div className={s.featureTitle}>Secure</div>
                <div className={s.featureDesc}>Stripe-powered payments</div>
              </div>
            </div>

            <div className={s.featureCard}>
              <div className={s.featureIconWrapAmber}>
                <Zap className={s.featureIconAmber} />
              </div>
              <div>
                <div className={s.featureTitle}>Fast</div>
                <div className={s.featureDesc}>Instant booking links</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Form ── */}
        <div className={s.formCard}>
          <h2 className={s.formHeading}>
            {isRegister ? "Create account" : "Welcome back"}
          </h2>
          <p className={s.formSubtitle}>
            {isRegister
              ? "Set up your business in minutes"
              : "Sign in to your account"}
          </p>

          <form className={s.form} onSubmit={handleSubmit}>
            {/* Name */}
            {isRegister && (
              <div>
                <label className={s.inputLabel}>Name</label>
                <div className={s.inputWrapper}>
                  <User className={s.inputIcon} />
                  <input
                    type="text"
                    className={s.inputField}
                    placeholder="Your name"
                    value={form.name}
                    onChange={set("name")}
                    required
                  />
                </div>
              </div>
            )}

            {/* Business Name */}
            {isRegister && (
              <div>
                <label className={s.inputLabel}>Business Name</label>
                <div className={s.inputWrapper}>
                  <Building2 className={s.inputIcon} />
                  <input
                    type="text"
                    className={s.inputField}
                    placeholder="Your business name"
                    value={form.businessName}
                    onChange={set("businessName")}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className={s.inputLabel}>Email</label>
              <div className={s.inputWrapper}>
                <Mail className={s.inputIcon} />
                <input
                  type="email"
                  className={s.inputField}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </div>
            </div>

            {/* OTP section (register only) */}
            {isRegister && form.email && (
              <div className={s.otpContainer}>
                <div className={s.otpLabel}>Email verification code</div>
                <div className={s.otpGrid}>
                  <input
                    type="text"
                    className={s.otpField}
                    placeholder="Enter code"
                    value={form.emailOtp}
                    onChange={set("emailOtp")}
                  />
                  {otpVerified ? (
                    <button type="button" className={s.otpVerifiedButton} disabled>
                      <CheckCircle className={s.otpVerifiedIcon} />
                      Verified
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

            {/* Password */}
            <div>
              <label className={s.inputLabel}>Password</label>
              <div className={s.inputWrapper}>
                <Lock className={s.inputIcon} />
                <input
                  type="password"
                  className={s.inputField}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading
                ? "Please wait…"
                : isRegister
                ? "Create account"
                : "Sign in"}
              <ArrowRight className={s.submitIcon} />
            </button>
          </form>

          {message && <div className={s.message}>{message}</div>}

          <button type="button" className={s.toggleMode} onClick={toggleMode}>
            {isRegister
              ? "Already have an account? Log in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
