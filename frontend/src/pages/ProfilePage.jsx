import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { updateProfile, getGoogleConnectUrl } from "../api/client";
import {
  profilePageStyles as s,
  brandThemeOptions,
  brandThemeStyles,
  getBrandThemeStyle,
} from "../assets/dummyStyles";
import heroImg from "../assets/P2.png";
import stripeIcon from "../assets/stripeicon.jpeg";
import calendarIcon from "../assets/Google_Calendar-Logo.wine.png";
import gmailIcon from "../assets/logo_gmail_lockup_default_2x_r7.png";
import greenImg from "../assets/green.png";
import {
  Copy,
  Link2,
  CheckCircle,
  Save,
  Globe,
  Users,
  CalendarDays,
  Shield,
  Clock,
  CreditCard,
  Zap,
  Mail,
  Info,
} from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useOutletContext();
  const [form, setForm] = useState({
    businessName: "",
    businessDescription: "",
    timezone: "Asia/Kolkata",
    brandTheme: "emerald",
    brandAccent: "#047857",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        businessName: user.businessName || "",
        businessDescription: user.businessDescription || "",
        timezone: user.timezone || "Asia/Kolkata",
        brandTheme: user.brandTheme || "emerald",
        brandAccent: user.brandAccent || "#047857",
      });
    }
  }, [user]);

  const publicLink = `${window.location.origin}/book/${user?.slug || ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await updateProfile(form);
      setUser(data.user);
      setMessage("Profile saved successfully!");
      setMsgType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const { data } = await getGoogleConnectUrl();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setMessage("Failed to get Google connect URL.");
      setMsgType("error");
    }
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const themeStyle = getBrandThemeStyle(form.brandTheme);

  return (
    <div className={s.pageLayout}>
      {/* ── Left Column ── */}
      <div className={s.leftColumn}>
        {/* Header */}
        <div className={s.headerRow}>
          <div className={s.headerTextBlock}>
            <div className={s.profileLabel}>PROFILE</div>
            <h1 className={s.mainHeading}>
              Shape your{" "}
              <span className={s.headingGradientPublic}>public</span>
              <br />
              <span className={s.headingGradientBooking}>
                <span className={s.headingGradientBookingInner}>
                  booking experience.
                </span>
              </span>
            </h1>
            <p className={s.subHeading}>
              Personalize your booking page, connect your tools, and share your
              link with confidence.
            </p>
          </div>
          <div className={s.illustrationContainer}>
            <img src={heroImg} alt="" className={s.illustrationImg} />
          </div>
        </div>

        {/* Public link card */}
        <div className={s.linkCard}>
          <div className={s.linkCardTitle}>Public booking link</div>
          <div className={s.linkRow}>
            <div className={s.linkBar}>
              <span className={s.linkText}>{publicLink}</span>
              <button className={s.linkCopyButtonSmall} onClick={handleCopy}>
                <Copy className={s.iconSmall} />
              </button>
            </div>
            <button className={s.linkCopyButtonMain} onClick={handleCopy}>
              <Copy className={s.iconSmall} />
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
          <div className={s.linkLiveIndicator}>
            <CheckCircle className={s.iconSmall} />
            Your link is live and ready to share!
          </div>
        </div>

        {/* Integrations */}
        <div className={s.integrationsGrid}>
          {/* Stripe */}
          <div className={s.integrationCard}>
            <div className={s.integrationHeader}>
              <div className={s.integrationLogoBox}>
                <img src={stripeIcon} alt="Stripe" className={s.integrationLogoImg} />
              </div>
              <span className={s.integrationLabel}>Stripe</span>
            </div>
            <div className={s.integrationStatusConfigured}>
              {user?.stripeConfigured ? (
                <>
                  Configured <CheckCircle className={s.integrationCheckIcon} />
                </>
              ) : (
                "Not configured"
              )}
            </div>
            <p className={s.integrationDesc}>
              Collect payments securely via Stripe.
            </p>
            <div className={s.integrationInfoPill}>Platform payment gateway</div>
          </div>

          {/* Google Calendar */}
          <div className={s.integrationCard}>
            <div className={s.integrationHeader}>
              <div className={s.integrationLogoBox}>
                <img
                  src={calendarIcon}
                  alt="Calendar"
                  className={s.integrationLogoImg}
                />
              </div>
              <span className={s.integrationLabel}>Calendar</span>
            </div>
            <div className={s.integrationStatusConnected}>
              {user?.googleCalendarConnected ? (
                <>
                  Connected <CheckCircle className={s.integrationCheckIcon} />
                </>
              ) : (
                "Not connected"
              )}
            </div>
            <p className={s.integrationDesc}>
              Bookings will sync automatically.
            </p>
            <button
              className={s.integrationManageButton}
              onClick={handleConnectCalendar}
            >
              Manage
            </button>
          </div>

          {/* Emails */}
          <div className={s.integrationCard}>
            <div className={s.integrationHeader}>
              <div className={s.integrationLogoBox}>
                <img src={gmailIcon} alt="Email" className={s.integrationLogoImg} />
              </div>
              <span className={s.integrationLabel}>Emails</span>
            </div>
            <div className={s.integrationStatusConfigured}>
              Configured <CheckCircle className={s.integrationCheckIcon} />
            </div>
            <p className={s.integrationDesc}>
              Customers receive email updates.
            </p>
            <div className={s.integrationInfoPill}>Automatic booking emails</div>
          </div>
        </div>
      </div>

      {/* ── Right Column (Form) ── */}
      <div className={s.rightColumn}>
        <div className={s.formHeader}>
          <div className={s.formHeaderIcon}>
            <Users className={s.formHeaderUserIcon} />
          </div>
          <div>
            <div className={s.formTitle}>Business details</div>
            <div className={s.formSubtitle}>Update your profile info</div>
          </div>
        </div>

        <form className={s.form} onSubmit={handleSave}>
          {/* Business Name */}
          <div>
            <label className={s.inputLabel}>Business Name</label>
            <div className={s.inputWrapper}>
              <input
                type="text"
                className={s.textInput}
                value={form.businessName}
                onChange={set("businessName")}
                placeholder="Your business name"
              />
              <Globe className={s.inputIconRight} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={s.inputLabel}>Business Description</label>
            <textarea
              className={s.textareaInput}
              rows={3}
              value={form.businessDescription}
              onChange={set("businessDescription")}
              placeholder="A short description of your business"
            />
          </div>

          {/* Timezone & Accent Color */}
          <div className={s.twoColGrid}>
            <div>
              <label className={s.inputLabel}>Timezone</label>
              <div className={s.inputWrapper}>
                <Globe className={s.inputIconLeft} />
                <select
                  className={s.selectInput}
                  value={form.timezone}
                  onChange={set("timezone")}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="Australia/Sydney">Australia/Sydney</option>
                </select>
              </div>
            </div>

            <div>
              <label className={s.inputLabel}>Accent color</label>
              <div className={s.colorInputRow}>
                <input
                  type="color"
                  className={s.colorPicker}
                  value={form.brandAccent}
                  onChange={set("brandAccent")}
                />
                <input
                  type="text"
                  className={s.colorTextInput}
                  value={form.brandAccent}
                  onChange={set("brandAccent")}
                />
              </div>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className={s.inputLabel}>Theme</label>
            <div className={s.themeSwatches}>
              {brandThemeOptions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={
                    form.brandTheme === t.id
                      ? s.themeBtnActive
                      : s.themeBtnInactive
                  }
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      brandTheme: t.id,
                      brandAccent: t.accent,
                    }))
                  }
                >
                  <span
                    className={s.themeSwatch}
                    style={{ background: t.accent }}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={s.saveButton}
            disabled={loading}
          >
            <Save className={s.saveButtonIcon} />
            {loading ? "Saving…" : "Save profile"}
          </button>
        </form>

        {message && (
          <div
            className={`${s.messageBanner} ${
              msgType === "success"
                ? s.messageBannerSuccess
                : s.messageBannerError
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* ── Bottom Preview ── */}
      <div className={s.bottomFullWidth}>
        {/* Public preview */}
        <div className={s.previewContainer}>
          <div
            className={s.previewBanner}
            style={{
              "--brand-panel": themeStyle.panel,
              "--brand-accent": themeStyle.accent || form.brandAccent,
            }}
          >
            <div className={s.previewBannerBg}>
              <img src={greenImg} alt="" className={s.previewBannerImg} />
              <div className={s.previewBannerOverlay} />
            </div>
            <div className={s.previewBannerContent}>
              <div className={s.previewAvatarRow}>
                <div
                  className={s.previewAvatar}
                  style={{ background: themeStyle.accent || form.brandAccent }}
                >
                  {(form.businessName || "B").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={s.previewLabel}>PUBLIC PREVIEW</div>
                  <div className={s.previewTitle}>
                    {form.businessName || "Your Business"}
                  </div>
                </div>
              </div>
              <p className={s.previewDesc}>
                {form.businessDescription ||
                  "Book online therapy and wellness sessions with certified professionals."}
              </p>
            </div>
          </div>

          {/* Feature cards overlay */}
          <div className={s.previewFeatureCard}>
            {[
              { icon: CalendarDays, title: "Easy Booking", desc: "Book your session in just a few clicks." },
              { icon: CreditCard, title: "Secure Payments", desc: "Powered by Stripe for safe transactions." },
              { icon: Mail, title: "Instant Updates", desc: "Get email & calendar reminders." },
              { icon: Zap, title: "Hassle-free", desc: "Manage bookings anytime, anywhere." },
            ].map((f) => (
              <div key={f.title} className={s.featureItem}>
                <div className={s.featureIconBox}>
                  <f.icon className={s.featureIcon} />
                </div>
                <div>
                  <div className={s.featureTitle}>{f.title}</div>
                  <div className={s.featureText}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer view */}
        <div className={s.customerViewContainer}>
          <span className={s.customerViewLabel}>Customer view</span>
          <div className={s.customerViewCard}>
            <div
              className={s.customerViewOverlay}
              style={{
                backgroundImage: `linear-gradient(135deg, ${themeStyle.panelDeep || themeStyle.panel}, ${themeStyle.panelSoft || themeStyle.panel})`,
              }}
            />
            <div className={s.customerViewContent}>
              <div
                className={s.customerAvatar}
                style={{ background: themeStyle.accent || form.brandAccent }}
              >
                {(form.businessName || "B").charAt(0).toUpperCase()}
              </div>
              <div className={s.customerName}>
                {form.businessName || "Your Business"}
              </div>
              <div className={s.customerMeta}>
                <span className={s.customerMetaItem}>
                  <Clock className={s.customerMetaIcon} /> 60 min
                </span>
                <span className={s.customerMetaItem}>
                  <CreditCard className={s.customerMetaIcon} /> ₹ 900
                </span>
              </div>
              <div className={s.customerTimeslotSection}>
                <div className={s.timeslotLabel}>SELECT TIME</div>
                <button
                  className={s.timeslotActiveBtn}
                  style={{ background: themeStyle.accent || form.brandAccent }}
                >
                  10:00 AM
                </button>
                <button className={s.timeslotInactiveBtn}>11:30 AM</button>
              </div>
            </div>
          </div>
          <div className={s.customerViewHint}>
            <Info className={s.hintIcon} />
            Preview your public booking page.
          </div>
        </div>
      </div>
    </div>
  );
}
