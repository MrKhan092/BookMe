import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api/admin";
import logo from "../assets/logo.png";
import { adminLoginPageStyles as s } from "../assets/dummyStyles";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await adminLogin(form);
      if (data.token) {
        localStorage.setItem("adminToken", data.token);
      }
      navigate("/admin/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Admin Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.pageContainer}>
      <div className={s.card}>
        {/* Left decorative panel */}
        <div className={s.leftPanel}>
          <div className={s.leftContent}>
            <div className={s.leftEyebrow}>ADMIN PORTAL</div>
            <div className={s.leftLogoRow}>
              <img src={logo} alt="BookMe" className={s.leftLogoImg} />
            </div>
            <h1 className={s.leftHeading}>
              Manage the
              <br />
              <span className={s.leftHeadingAccent}>platform.</span>
            </h1>
            <p className={s.leftDescription}>
              Access the admin dashboard to manage users, bookings, and
              withdrawal requests across the platform.
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className={s.rightPanel}>
          <h2 className={s.formTitle}>Admin Sign In</h2>
          <p className={s.formSubtitle}>
            Enter your admin credentials to continue
          </p>

          {message && <div className={s.messageBox}>{message}</div>}

          <form className={s.form} onSubmit={handleSubmit}>
            <div>
              <label className={s.inputLabel}>Email</label>
              <input
                type="email"
                className={s.textInput}
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="admin@bookme.com"
                required
              />
            </div>
            <div>
              <label className={s.inputLabel}>Password</label>
              <input
                type="password"
                className={s.textInput}
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className={s.submitButton}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}