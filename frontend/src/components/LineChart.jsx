import { useState, useRef } from "react";
import { dashboardPageStyles as s } from "../assets/dummyStyles";

export default function LineChart({ data = [], color = "#8b5cf6" }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  if (!data.length) return null;

  const W = 600, H = 320, PL = 60, PR = 20, PT = 20, PB = 40;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const points = data.map((d, i) => ({
    x: PL + (i / (data.length - 1 || 1)) * chartW,
    y: PT + chartH - (d.value / maxVal) * chartH,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L${points[points.length - 1].x},${PT + chartH} L${points[0].x},${PT + chartH} Z`;

  // Y-axis ticks
  const ticks = 5;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) =>
    Math.round((maxVal / ticks) * i)
  );

  return (
    <div className={s.lineChartWrapper} style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={s.lineChartSvg}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = PT + chartH - (tick / maxVal) * chartH;
          return (
            <g key={tick}>
              <line
                x1={PL}
                y1={y}
                x2={W - PR}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth={1}
              />
              <text
                x={PL - 10}
                y={y + 4}
                textAnchor="end"
                className={s.lineChartTickText}
              >
                ₹{tick}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={color} opacity={0.08} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots + Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={5}
              fill="white"
              stroke={color}
              strokeWidth={2.5}
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => {
                const rect = svgRef.current.getBoundingClientRect();
                const cr = e.target.getBoundingClientRect();
                setTooltip({
                  value: `₹${p.value}`,
                  x: cr.left - rect.left + cr.width / 2,
                  y: cr.top - rect.top - 10,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
            <text
              x={p.x}
              y={H - PB + 20}
              textAnchor="middle"
              className={s.lineChartLabel}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {tooltip && (
        <div
          className={s.lineChartTooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.value}
          <div className={s.lineChartTooltipArrow} />
        </div>
      )}
    </div>
  );
}
