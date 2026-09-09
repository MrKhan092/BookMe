import { dashboardPageStyles as s } from "../assets/dummyStyles";

const STATUS_COLORS = {
  confirmed: "#4f46e5",
  cancelled: "#e11d48",
  pending: "#d97706",
  pending_payment: "#7c3aed",
  payment_failed: "#dc2626",
};

export default function StatusPanel({ bookings = [] }) {
  const total = bookings.length;

  // Count by status
  const counts = {};
  bookings.forEach((b) => {
    counts[b.status] = (counts[b.status] || 0) + 1;
  });

  const statuses = Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    percent: total ? ((count / total) * 100).toFixed(1) : 0,
    color: STATUS_COLORS[status] || "#64748b",
  }));

  // Build donut segments
  const radius = 80;
  const cx = 104, cy = 104;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = statuses.map((s) => {
    const pct = total ? s.count / total : 0;
    const len = pct * circumference;
    const segment = { ...s, offset, len };
    offset += len;
    return segment;
  });

  const formatLabel = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className={s.statusPanelContainerFlex}>
      {/* Donut */}
      <div className={s.statusDonutWrapper}>
        <svg width="208" height="208" viewBox="0 0 208 208">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={22}
              strokeDasharray={`${seg.len} ${circumference - seg.len}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          ))}
        </svg>
        <div className={s.statusDonutInner}>
          <span className={s.statusTotalNumber}>{total}</span>
          <span className={s.statusTotalLabel}>Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className={s.statusLegendList}>
        {statuses.map((st) => (
          <div key={st.status} className={s.statusLegendItem}>
            <div className={s.statusLegendLeft}>
              <span
                className={s.statusColorSwatch}
                style={{ background: st.color }}
              />
              <span className={s.statusLegendLabel}>
                {formatLabel(st.status)}
              </span>
            </div>
            <div className={s.statusLegendRight}>
              <span className={s.statusLegendValue}>{st.count}</span>
              <span className={s.statusLegendPercent}>{st.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
