import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { listBookings, listServices, getPaymentOverview } from "../api/client";
import { dashboardPageStyles as s } from "../assets/dummyStyles";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import StatusPanel from "../components/StatusPanel";
import heroImg from "../assets/P1.png";
import stripeIcon from "../assets/stripeicon.jpeg";
import calendarIcon from "../assets/Google_Calendar-Logo.wine.png";
import gmailIcon from "../assets/logo_gmail_lockup_default_2x_r7.png";
import whatsappIcon from "../assets/WhatsApp-Logo.wine.png";
import instagramIcon from "../assets/Instagram-Glyph-Color-Logo.wine.png";
import facebookIcon from "../assets/Facebook-f_Logo-Blue-Logo.wine.png";
import {
  ArrowRight,
  Copy,
  CalendarDays,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Layers,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useOutletContext();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    listBookings().then((r) => setBookings(r.data.bookings || r.data || [])).catch(() => {});
    listServices().then((r) => setServices(r.data.services || r.data || [])).catch(() => {});
    getPaymentOverview().then((r) => setPayments(r.data)).catch(() => {});
  }, []);

  const publicLink = `${window.location.origin}/book/${user?.slug || ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const totalRevenue = payments?.totalEarned || bookings.reduce((s, b) => s + (b.amount || 0), 0);
  const activeServices = services.filter((sv) => sv.isActive).length;

  // Bar chart: bookings by day of week
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayCounts = new Array(7).fill(0);
  bookings.forEach((b) => {
    const d = new Date(b.date);
    const day = (d.getDay() + 6) % 7; // Mon=0
    dayCounts[day]++;
  });
  const barData = dayLabels.map((label, i) => ({ label, value: dayCounts[i] }));

  // Line chart: earnings by month
  const monthCounts = {};
  bookings
    .filter((b) => b.paymentStatus === "paid")
    .forEach((b) => {
      const d = new Date(b.createdAt || b.date);
      const key = d.toLocaleString("en", { month: "short" });
      monthCounts[key] = (monthCounts[key] || 0) + (b.amount || 0);
    });
  const lineData = Object.entries(monthCounts).map(([label, value]) => ({
    label,
    value,
  }));

  // Top services
  const serviceBookingMap = {};
  bookings.forEach((b) => {
    const sid = b.serviceId?._id || b.serviceId;
    serviceBookingMap[sid] = (serviceBookingMap[sid] || 0) + 1;
  });
  const topServices = services
    .map((sv) => ({
      ...sv,
      bookingCount: serviceBookingMap[sv._id] || 0,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 5);
  const maxServiceBookings = Math.max(...topServices.map((s) => s.bookingCount), 1);

  // Upcoming bookings
  const now = new Date();
  const upcoming = bookings
    .filter((b) => b.status === "confirmed" && new Date(b.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const statCards = [
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: CalendarDays,
      bg: "bg-[#F4F0FF]",
      color: "text-[#7D57F5]",
    },
    {
      label: "Confirmed",
      value: confirmedBookings,
      icon: CheckCircle,
      bg: "bg-[#eafbef]",
      color: "text-[#16a34a]",
    },
    {
      label: "Revenue",
      value: `₹${totalRevenue}`,
      icon: DollarSign,
      bg: "bg-[#f3e8ff]",
      color: "text-[#8b5cf6]",
    },
    {
      label: "Active Services",
      value: activeServices,
      icon: Layers,
      bg: "bg-[#eff6ff]",
      color: "text-[#2563eb]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Hero Grid ── */}
      <div className={s.heroGrid}>
        {/* Hero card */}
        <div className={s.heroCard}>
          <div className={s.heroContent}>
            <h1 className={s.heroTitle}>
              Welcome back,
              <br />
              {user?.name || "there"} 👋
            </h1>
            <Link to="/bookings" className={s.heroButton}>
              View Bookings <ArrowRight className={s.arrowIcon} />
            </Link>
          </div>
          <div className={s.heroImageWrapper}>
            <img src={heroImg} alt="" className={s.heroImage} />
          </div>
        </div>

        {/* Public link card */}
        <div className={s.publicLinkCard}>
          <div className={s.publicLinkTitle}>Public booking link</div>
          <div className={s.publicLinkInputContainer}>
            <span className={s.publicLinkText}>{publicLink}</span>
            <button className={s.copyButton} onClick={handleCopy}>
              <Copy className={s.copyIcon} />
            </button>
          </div>
          <p className={s.publicLinkHelper}>
            {copied
              ? "✅ Link copied!"
              : "Share this link with your customers so they can book online."}
          </p>

          <div className={s.shareTitle}>Share via</div>
          <div className={s.socialIconsContainer}>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(publicLink)}`}
              target="_blank"
              rel="noreferrer"
              className={s.socialIconLink}
            >
              <img src={whatsappIcon} alt="WhatsApp" className={s.socialIconImgWhatsapp} />
            </a>
            <a
              href={`https://www.instagram.com/`}
              target="_blank"
              rel="noreferrer"
              className={s.socialIconLinkInstagram}
            >
              <img src={instagramIcon} alt="Instagram" className={s.socialIconImgInstagram} />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicLink)}`}
              target="_blank"
              rel="noreferrer"
              className={s.socialIconLink}
            >
              <img src={facebookIcon} alt="Facebook" className={s.socialIconImgFacebook} />
            </a>
            <a
              href={`mailto:?subject=Book with us!&body=${encodeURIComponent(publicLink)}`}
              className={s.socialIconLink}
            >
              <img src={gmailIcon} alt="Gmail" className={s.socialIconImgGmail} />
            </a>
            <button className={s.copySocialButton} onClick={handleCopy}>
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className={s.statsGrid}>
        {statCards.map((card) => (
          <div key={card.label} className={s.statCard}>
            <div className={`${s.statIconWrapper} ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <div className={s.statLabel}>{card.label}</div>
              <div className={s.statValue}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className={s.chartsGrid}>
        <div className={s.chartCard}>
          <div className={s.chartHeader}>
            <h3 className={s.chartTitle}>Bookings Overview</h3>
          </div>
          <div className={s.chartOverflow}>
            <div className={s.chartInnerWrapper}>
              <BarChart data={barData} color="#8b5cf6" />
            </div>
          </div>
        </div>

        <div className={s.chartCard}>
          <div className={s.chartHeader}>
            <h3 className={s.chartTitle}>Booking Status</h3>
          </div>
          <div className={s.statusPanelContainer}>
            <StatusPanel bookings={bookings} />
          </div>
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className={s.bottomGrid}>
        {/* Top services */}
        <div className={s.topServicesCard}>
          <div className={s.servicesHeader}>
            <h3 className={s.chartTitle}>Top Services</h3>
            <Link to="/services" className={s.viewAllLink}>
              View all
            </Link>
          </div>
          <div className={s.servicesList}>
            {topServices.length === 0 && (
              <p className="text-sm text-slate-500">No services yet.</p>
            )}
            {topServices.map((sv, i) => {
              const pct = Math.round((sv.bookingCount / maxServiceBookings) * 100);
              const colors = [
                "#8b5cf6",
                "#6366f1",
                "#3b82f6",
                "#0ea5e9",
                "#14b8a6",
              ];
              return (
                <div key={sv._id} className={s.serviceRow}>
                  <div className={s.serviceIconBox}>
                    <img
                      src={`/src/assets/icons/${sv.icon || "C1.png"}`}
                      alt=""
                      className={s.serviceIconImg}
                    />
                  </div>
                  <div className={s.serviceInfo}>
                    <div className={s.serviceNameRow}>
                      <span className={s.serviceName}>{sv.name}</span>
                      <span className={s.servicePercent}>{pct}%</span>
                    </div>
                    <div className={s.serviceBookingCount}>
                      {sv.bookingCount} bookings
                    </div>
                    <div className={s.progressBarContainer}>
                      <div
                        className={s.progressFillBase}
                        style={{
                          width: `${pct}%`,
                          background: colors[i % colors.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming bookings */}
        <div className={s.upcomingCard}>
          <div className={s.upcomingHeader}>
            <h3 className={s.chartTitle}>Upcoming Bookings</h3>
            <Link to="/bookings" className={s.viewAllLink}>
              View all
            </Link>
          </div>
          <div className={s.upcomingList}>
            {upcoming.length === 0 && (
              <p className="text-sm text-slate-500">No upcoming bookings.</p>
            )}
            {upcoming.map((bk) => (
              <div key={bk._id} className={s.bookingRow}>
                <div className={s.bookingLeft}>
                  <div className={s.avatarBox}>
                    <img
                      src={`/src/assets/avatars/${bk.customerAvatar || "A1.png"}`}
                      alt=""
                      className={s.avatarImg}
                    />
                  </div>
                  <div>
                    <div className={s.bookingCustomerName}>{bk.customerName}</div>
                    <div className={s.bookingServiceName}>
                      {bk.serviceId?.name || "Service"}
                    </div>
                  </div>
                </div>
                <div className={s.bookingRight}>
                  <div className={s.bookingDateTimeWrapper}>
                    <div className={s.bookingDate}>
                      <CalendarDays className={s.calendarIconSmall} />
                      {bk.date}
                    </div>
                    <div className={s.bookingTime}>
                      <Clock className={s.clockIconSmall} />
                      {bk.startTime}
                    </div>
                  </div>
                  <span
                    className={`${s.bookingBadgeBase} ${
                      bk.status === "confirmed"
                        ? s.badgeConfirmed
                        : s.badgePending
                    }`}
                  >
                    {bk.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Earnings ── */}
      {lineData.length > 0 && (
        <div className={s.earningsCard}>
          <div className={s.earningsHeader}>
            <h3 className={s.chartTitle}>Earnings Overview</h3>
          </div>
          <div className={s.earningsAmountRow}>
            <span className={s.earningsAmount}>₹{totalRevenue}</span>
            <div className={s.earningsTrendContainer}>
              <span className={s.earningsTrendUp}>
                <ArrowUpRight className={s.trendArrow} /> Total
              </span>
            </div>
          </div>
          <div className={s.earningsChartWrapper}>
            <div className={s.earningsChartInner}>
              <LineChart data={lineData} color="#8b5cf6" />
            </div>
          </div>
        </div>
      )}

      {/* ── Integrations ── */}
      <div className={s.integrationsCard}>
        <h3 className={s.integrationsTitle}>Integrations</h3>
        <div className={s.integrationsList}>
          <div className={s.integrationItem}>
            <div className={s.integrationIconBox}>
              <img src={stripeIcon} alt="Stripe" className={s.integrationIconImgDefault} />
            </div>
            <div>
              <div className={s.integrationName}>Stripe</div>
              <div className={s.integrationStatus}>
                {user?.stripeConfigured ? (
                  <>
                    <CheckCircle className={s.checkIconSmall} />
                    <span className={s.statusTextSmall}>Configured</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-500">Not configured</span>
                )}
              </div>
            </div>
          </div>

          <div className={s.integrationItem}>
            <div className={s.integrationIconBox}>
              <img src={calendarIcon} alt="Calendar" className={s.integrationIconImgDefault} />
            </div>
            <div>
              <div className={s.integrationName}>Google Calendar</div>
              <div className={s.integrationStatus}>
                {user?.googleCalendarConnected ? (
                  <>
                    <CheckCircle className={s.checkIconSmall} />
                    <span className={s.statusTextSmall}>Connected</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-500">Not connected</span>
                )}
              </div>
            </div>
          </div>

          <div className={s.integrationItem}>
            <div className={s.integrationIconBox}>
              <img src={gmailIcon} alt="Email" className={s.integrationIconImgGmail} />
            </div>
            <div>
              <div className={s.integrationName}>Emails</div>
              <div className={s.integrationStatus}>
                <CheckCircle className={s.checkIconSmall} />
                <span className={s.statusTextSmall}>Configured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
