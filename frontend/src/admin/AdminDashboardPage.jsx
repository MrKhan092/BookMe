import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAdminDashboard, updateWithdrawalStatus } from "../api/admin";
import logo from "../assets/logo.png";
import { adminDashboardPageStyles as s } from "../assets/dummyStyles";
import {
  Users,
  CalendarDays,
  DollarSign,
  TrendingUp,
  CreditCard,
  Layers,
  LogOut,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Wallet,
  Building2,
  AlertCircle,
  X,
} from "lucide-react";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const load = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    getAdminDashboard()
      .then((r) => setData(r.data))
      .catch(() => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login", { replace: true });
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  const handleWithdrawalAction = async (id, status) => {
    setConfirmModal({ id, status });
  };

  const confirmAction = async () => {
    if (!confirmModal) return;
    setModalLoading(true);
    try {
      await updateWithdrawalStatus(confirmModal.id, {
        status: confirmModal.status,
      });
      setMessage(`Withdrawal ${confirmModal.status} successfully.`);
      setConfirmModal(null);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed.");
    } finally {
      setModalLoading(false);
    }
  };

  if (!data) {
    return (
      <div className={s.pageContainer}>
        <p className="text-center py-20 text-slate-500">Loading…</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: data.totalUsers || 0,
      icon: Users,
      bg: s.statBg1,
      color: s.statColor1,
    },
    {
      label: "Total Bookings",
      value: data.totalBookings || 0,
      icon: CalendarDays,
      bg: s.statBg2,
      color: s.statColor2,
    },
    {
      label: "Total Revenue",
      value: `₹${data.totalRevenue || 0}`,
      icon: DollarSign,
      bg: s.statBg3,
      color: s.statColor3,
    },
    {
      label: "Platform Fees",
      value: `₹${data.totalPlatformFees || 0}`,
      icon: TrendingUp,
      bg: s.statBg4,
      color: s.statColor4,
    },
    {
      label: "Provider Earnings",
      value: `₹${data.totalProviderEarnings || 0}`,
      icon: Wallet,
      bg: s.statBg5,
      color: s.statColor5,
    },
    {
      label: "Pending Withdrawals",
      value: data.pendingWithdrawals || 0,
      icon: Clock,
      bg: s.statBg6,
      color: s.statColor6,
    },
  ];

  const users = data.users || [];
  const withdrawals = data.withdrawals || [];
  const recentBookings = data.recentBookings || [];

  return (
    <div className={s.pageContainer}>
      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <div className={s.logoRow}>
            <img src={logo} alt="BookMe" className={s.logoImg} />
            <span className={s.logoText}>
              BookMe<span className={s.logoAccent}> Admin</span>
            </span>
          </div>
          <div className={s.headerActions}>
            <Link to="/login" className={s.clientAppLink}>
              Client App
            </Link>
            <button className={s.logoutButton} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className={s.main}>
        {/* Hero */}
        <div className={s.heroSection}>
          <div>
            <h1 className={s.heroTitle}>
              Platform{" "}
              <span className={s.heroTitleAccent}>Overview</span>
            </h1>
            <p className={s.heroSubtitle}>
              Monitor all users, bookings, and financials.
            </p>
          </div>
          {message && <div className={s.messageBanner}>{message}</div>}
        </div>

        {/* Stats */}
        <div className={s.statsGrid}>
          {stats.map((st) => (
            <div key={st.label} className={s.statCard}>
              <div className={`${s.statIconContainer} ${st.bg}`}>
                <st.icon className={`${s.statIcon} ${st.color}`} />
              </div>
              <div>
                <div className={s.statLabel}>{st.label}</div>
                <div className={s.statValue}>{st.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tables grid */}
        <div className={s.tablesGrid}>
          {/* Users table */}
          <div className={s.tableCard}>
            <div className={s.tableHeader}>
              <h2 className={s.tableTitle}>
                <Users className={s.tableTitleIcon} />
                All Users
              </h2>
            </div>
            <div className={s.tableScrollContainer}>
              <table className={s.table}>
                <thead>
                  <tr className={s.tableHeadRow}>
                    <th className={s.th}>Business</th>
                    <th className={s.th}>Email</th>
                    <th className={s.th}>Bookings</th>
                    <th className={s.th}>Revenue</th>
                    <th className={s.th}>Fees</th>
                    <th className={s.th}>Earnings</th>
                    <th className={s.th}>Payout</th>
                  </tr>
                </thead>
                <tbody className={s.tbody}>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className={s.emptyTableCell}>
                        No users yet.
                      </td>
                    </tr>
                  )}
                  {users.map((u) => (
                    <tr key={u._id || u.email} className={s.tr}>
                      <td className={s.tdBold}>
                        <span className={s.userBusinessName}>
                          {u.businessName || u.name}
                        </span>
                      </td>
                      <td className={s.tdMuted}>{u.email}</td>
                      <td className={s.tdBold}>{u.totalBookings || 0}</td>
                      <td className={s.tdBold}>₹{u.totalRevenue || 0}</td>
                      <td className={s.tdFees}>₹{u.totalFees || 0}</td>
                      <td className={s.tdEarnings}>₹{u.totalEarnings || 0}</td>
                      <td className={s.td}>
                        <span
                          className={`${s.payoutStatusBadge} ${
                            u.payoutReady
                              ? s.userPayoutReady
                              : s.userPayoutPending
                          }`}
                        >
                          {u.payoutReady ? "Ready" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Withdrawals */}
          <div className={s.withdrawalCard}>
            <div className={s.tableHeader}>
              <h2 className={s.tableTitle}>
                <Wallet className={s.tableTitleIcon} />
                Withdrawals
              </h2>
            </div>
            <div className={s.withdrawalList}>
              {withdrawals.length === 0 && (
                <div className={s.emptyWithdrawals}>
                  <div className={s.emptyWithdrawalsIconCircle}>
                    <Wallet className={s.emptyWithdrawalsIcon} />
                  </div>
                  <p className={s.emptyWithdrawalsText}>No withdrawals yet.</p>
                </div>
              )}
              {withdrawals.map((w) => {
                const statusColor =
                  s.withdrawalStatusColors[w.status] ||
                  s.withdrawalStatusDefault;
                return (
                  <div key={w._id} className={s.withdrawalItem}>
                    <div className={s.withdrawalItemHeader}>
                      <div>
                        <div className={s.withdrawalProviderName}>
                          {w.userId?.businessName || w.userId?.name || "User"}
                        </div>
                        <div className={s.withdrawalProviderEmail}>
                          {w.userId?.email || ""}
                        </div>
                      </div>
                      <div className={s.withdrawalAmountCol}>
                        <div className={s.withdrawalAmount}>₹{w.amount}</div>
                        <div className={s.withdrawalStatusWrap}>
                          <span
                            className={`${s.withdrawalStatusBadge} ${statusColor}`}
                          >
                            {w.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {w.payoutDetails && (
                      <div className={s.withdrawalAccountInfo}>
                        <Building2 className={s.withdrawalAccountIcon} />
                        {w.payoutDetails.bankName} ···{" "}
                        {w.payoutDetails.accountLast4}
                        {w.payoutDetails.upiId && ` | UPI: ${w.payoutDetails.upiId}`}
                      </div>
                    )}

                    {w.status === "processing" && (
                      <div className={s.withdrawalActions}>
                        <button
                          className={`${s.withdrawalActionBtn} ${s.withdrawalActionBtnInactive}`}
                          onClick={() =>
                            handleWithdrawalAction(w._id, "paid")
                          }
                        >
                          ✓ Mark Paid
                        </button>
                        <button
                          className={`${s.withdrawalActionBtn} ${s.withdrawalActionBtnInactive}`}
                          onClick={() =>
                            handleWithdrawalAction(w._id, "rejected")
                          }
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className={s.recentBookingsCard}>
          <div className={s.tableHeader}>
            <h2 className={s.tableTitle}>
              <CalendarDays className={s.tableTitleIcon} />
              Recent Bookings
            </h2>
          </div>
          <div className={s.tableScrollContainer}>
            <table className={s.table}>
              <thead>
                <tr className={s.tableHeadRow}>
                  <th className={s.th}>Customer</th>
                  <th className={s.th}>Provider</th>
                  <th className={s.th}>Service</th>
                  <th className={s.th}>Date</th>
                  <th className={s.th}>Amount</th>
                  <th className={s.th}>Status</th>
                  <th className={s.th}>Payout</th>
                </tr>
              </thead>
              <tbody className={s.tbody}>
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className={s.emptyTableCell}>
                      No bookings yet.
                    </td>
                  </tr>
                )}
                {recentBookings.map((bk) => (
                  <tr key={bk._id} className={s.tr}>
                    <td className={s.tdBold}>{bk.customerName}</td>
                    <td className={s.tdMuted}>
                      {bk.userId?.businessName || bk.userId?.name || "–"}
                    </td>
                    <td className={s.tdMuted}>
                      {bk.serviceId?.name || "–"}
                    </td>
                    <td className={s.tdMuted}>{bk.date}</td>
                    <td className={s.tdBold}>₹{bk.amount || 0}</td>
                    <td className={s.td}>
                      <span
                        className={`${s.payoutStatusBadge} ${
                          bk.status === "confirmed"
                            ? s.userPayoutReady
                            : s.userPayoutPending
                        }`}
                      >
                        {bk.status}
                      </span>
                    </td>
                    <td className={s.td}>
                      <span className={s.bookingPayoutBadge}>
                        {bk.payoutStatus || "–"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Confirmation Modal ── */}
      {confirmModal && (
        <div className={s.confirmModalOverlay}>
          <div className={s.confirmModal}>
            <div className={s.confirmModalIconRow}>
              <div className={s.confirmModalIconWrap}>
                <AlertCircle className={s.confirmModalIcon} />
              </div>
              <button
                onClick={() => setConfirmModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className={s.confirmModalTitle}>Confirm Action</h3>
            <p className={s.confirmModalText}>
              Are you sure you want to mark this withdrawal as{" "}
              <strong>{confirmModal.status}</strong>?
            </p>
            <div className={s.confirmModalActions}>
              <button
                className={s.confirmModalCancelBtn}
                onClick={() => setConfirmModal(null)}
                disabled={modalLoading}
              >
                Cancel
              </button>
              <button
                className={s.confirmModalConfirmBtn}
                onClick={confirmAction}
                disabled={modalLoading}
              >
                {modalLoading ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
