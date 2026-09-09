import { useState, useRef, useEffect } from "react";
import { dashboardPageStyles as s } from "../assets/dummyStyles";

export default function BarChart({ data = [], color = "#8b5cf6" }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  if (!data.length) return null;

  const W = 600, H = 240, PL = 50, PR = 10, PT = 20, PB = 40;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min(32, chartW / data.length - 8);
  const gap = (chartW - barW * data.length) / (data.length + 1);

  // Y-axis ticks
  const ticks = 5;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) =>
    Math.round((maxVal / ticks) * i)
  );

  const handleMouseEnter = (e, d, x) => {
    const rect = svgRef.current.getBoundingClientRect();
    const elRect = e.target.getBoundingClientRect();
    setTooltip({
      value: d.value,
      x: elRect.left - rect.left + elRect.width / 2,
      y: elRect.top - rect.top - 8,
    });
  };

  return (
    <div className={s.barChartWrapper} style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={s.barChartSvg}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y-axis ticks */}
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
                x={PL - 8}
                y={y + 4}
                textAnchor="end"
                className={s.barChartTickText}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = PL + gap + i * (barW + gap);
          const barH = (d.value / maxVal) * chartH;
          const y = PT + chartH - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={6}
                fill={color}
                opacity={0.85}
                className={s.barChartBar}
                onMouseEnter={(e) => handleMouseEnter(e, d, x)}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: "pointer" }}
              />
              <text
                x={x + barW / 2}
                y={H - PB + 18}
                textAnchor="middle"
                className={s.barChartLabel}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className={s.barChartTooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.value}
          <div className={s.barChartTooltipArrow} />
        </div>
      )}
    </div>
  );
}
