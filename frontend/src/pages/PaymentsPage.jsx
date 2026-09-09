import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  getPaymentOverview,
  updatePayoutDetails,
  requestWithdrawal,
} from "../api/client";
import { paymentsPageStyles as s } from "../assets/dummyStyles";
import heroImg from "../assets/P7.png";
import {
  Wallet,
  DollarSign,
  Clock,
  Send,
  Building2,
  Save,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  CreditCard,
} from "lucide-react";

export default function PaymentsPage() {
  const { user } = useOutletContext();
  const [payments, setPayments] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutForm, setPayoutForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountLast4: "",
    ifsc: "",
    upiId: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getPaymentOverview()
      .then((r) => {
        setPayments(r.data);
        if (r.data.payoutDetails) {
          setPayoutForm((prev) => ({ ...prev, ...r.data.payoutDetails }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.payoutDetails) {
      setPayoutForm((prev) => ({ ...prev, ...user.payoutDetails }));
    }
  }, [user]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await requestWithdrawal({ amount: Number(withdrawAmount) });
      setMessage("Withdrawal requested!");
      setWithdrawAmount("");
      // Refresh
      getPaymentOverview().then((r) => setPayments(r.data)).catch(() => {});
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await updatePayoutDetails(payoutForm);
      setMessage("Payout details saved!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) =>
    setPayoutForm((p) => ({ ...p, [key]: e.target.value }));

  const available = payments?.availableBalance || 0;
  const totalEarned = payments?.totalEarned || 0;
  const pending = payments?.pendingBalance || 0;
  const paidOut = payments?.paidOut || 0;
  const transactions = payments?.recentTransactions || [];

  return (
    <div className={s.mainGrid}>
      {/* ── Left Column ── */}
      <div className={s.leftColumn}>
        {/* Header */}
        <div className={s.leftTopArea}>
          <div>
            <div className={s.pageLabel}>PAYMENTS</div>
            <h1 className={s.mainHeading}>
              Track your
              <br />
              <span className={s.gradientEarnings}>earnings.</span>
            </h1>
            <p className={s.subText}>
              View your balance, request withdrawals, and manage payout details.
            </p>
          </div>
          <div className={s.illustrationContainer}>
            <img src={heroImg} alt="" className={s.illustrationImg} />
          </div>
        </div>

        {/* Wallet cards */}
        <div className={s.walletCardsGrid}>
          <div className={s.walletCard}>
            <div className={s.walletCardHeader}>
              <div className={s.walletIconBoxAvailable}>
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <span className={s.walletCardLabel}>Available</span>
            </div>
            <div className={s.walletAmount}>₹{available}</div>
          </div>

          <div className={s.walletCard}>
            <div className={s.walletCardHeader}>
              <div className={s.walletIconBoxEarned}>
                <DollarSign className="h-4 w-4 text-[#7D57F5]" />
              </div>
              <span className={s.walletCardLabel}>Total Earned</span>
            </div>
            <div className={s.walletAmount}>₹{totalEarned}</div>
            <div className={s.paidOutText}>Paid out: ₹{paidOut}</div>
          </div>

          <div className={s.walletCard}>
            <div className={s.walletCardHeader}>
              <div className={s.walletIconBoxPending}>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <span className={s.walletCardLabel}>Pending</span>
            </div>
            <div className={s.walletAmount}>₹{pending}</div>
          </div>
        </div>

        {/* Withdraw */}
        <div className={s.withdrawSection}>
          <div className={s.withdrawTitle}>
            <Send className={s.withdrawIcon} />
            Request Withdrawal
          </div>
          <div className={s.withdrawForm}>
            <div className={s.withdrawInputContainer}>
              <DollarSign className={s.withdrawInputIcon} />
              <input
                type="number"
                className={s.withdrawInput}
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min={1}
              />
            </div>
            <button
              className={s.requestButton}
              onClick={handleWithdraw}
              disabled={loading}
            >
              <Send className={s.requestButtonIcon} />
              {loading ? "Sending…" : "Request"}
            </button>
          </div>
          <p className={s.withdrawWarning}>
            Withdrawals are processed within 2–5 business days.
          </p>
        </div>

        {/* Payout details */}
        <div className={s.payoutDetailsSection}>
          <div className={s.payoutTitle}>
            <Building2 className={s.payoutTitleIcon} />
            Payout Details
          </div>
          <p className={s.payoutDescription}>
            Add your bank account or UPI ID to receive payouts.
          </p>
          <form className={s.payoutForm} onSubmit={handleSavePayout}>
            <div>
              <label className={s.inputLabel}>Account Holder Name</label>
              <input
                type="text"
                className={s.textInput}
                value={payoutForm.accountHolderName}
                onChange={set("accountHolderName")}
                placeholder="Full name as on bank account"
              />
            </div>
            <div className={s.payoutGridTwoCol}>
              <div>
                <label className={s.inputLabel}>Bank Name</label>
                <input
                  type="text"
                  className={s.textInput}
                  value={payoutForm.bankName}
                  onChange={set("bankName")}
                  placeholder="e.g. HDFC Bank"
                />
              </div>
              <div>
                <label className={s.inputLabel}>Account Last 4</label>
                <input
                  type="text"
                  className={s.textInput}
                  value={payoutForm.accountLast4}
                  onChange={set("accountLast4")}
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
            </div>
            <div className={s.payoutGridTwoCol}>
              <div>
                <label className={s.inputLabel}>IFSC Code</label>
                <input
                  type="text"
                  className={s.textInput}
                  value={payoutForm.ifsc}
                  onChange={set("ifsc")}
                  placeholder="HDFC0001234"
                />
              </div>
              <div>
                <label className={s.inputLabel}>UPI ID</label>
                <input
                  type="text"
                  className={s.textInput}
                  value={payoutForm.upiId}
                  onChange={set("upiId")}
                  placeholder="name@upi"
                />
              </div>
            </div>
            <button
              type="submit"
              className={s.saveButton}
              disabled={loading}
            >
              <Save className={s.saveIcon} />
              {loading ? "Saving…" : "Save payout details"}
            </button>
          </form>
        </div>

        {message && <div className={s.messageBox}>{message}</div>}
      </div>

      {/* ── Right Column ── */}
      <div className={s.rightColumn}>
        <div className={s.recentActivitySection}>
          <div className={s.recentActivityHeader}>
            <div className={s.recentActivityTitle}>
              <Activity className={s.recentActivityTitleIcon} />
              Recent Activity
            </div>
            <Link to="/bookings" className={s.bookingsLink}>
              All bookings
              <ArrowRight className={s.bookingsLinkIcon} />
            </Link>
          </div>

          <div className={s.transactionList}>
            {transactions.length === 0 && (
              <p className={s.emptyText}>No recent transactions.</p>
            )}
            {transactions.map((tx, i) => {
              const isPositive = tx.type === "earning" || tx.amount > 0;
              return (
                <div key={i} className={s.transactionItem}>
                  <div className={s.transactionLeft}>
                    <div
                      className={
                        isPositive
                          ? s.transactionIconBoxPositive
                          : s.transactionIconBoxNegative
                      }
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </div>
                    <span className={s.transactionLabel}>
                      {tx.description || tx.type || "Transaction"}
                    </span>
                  </div>
                  <span
                    className={
                      isPositive
                        ? s.transactionAmountPositive
                        : s.transactionAmountNegative
                    }
                  >
                    {isPositive ? "+" : ""}₹{Math.abs(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
