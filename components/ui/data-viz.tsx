"use client";

import * as React from "react";
import { animate, useInView } from "framer-motion";
import { cn, numberFormat, plnFormat } from "@/lib/utils";

/* --------------------------- animated counter ---------------------------- */

export function AnimatedNumber({
  value,
  format = "number",
  fractionDigits = 0,
  className,
  duration = 1.1,
  suffix,
}: {
  value: number;
  format?: "number" | "pln" | "pct";
  fractionDigits?: number;
  className?: string;
  duration?: number;
  suffix?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  const text =
    format === "pln"
      ? plnFormat(display, { compact: false }).replace(",00", "")
      : format === "pct"
        ? `${numberFormat(display, fractionDigits)}%`
        : numberFormat(display, fractionDigits);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {text}
      {suffix}
    </span>
  );
}

/* -------------------------------- spark ---------------------------------- */

export function Sparkline({
  data,
  color = "var(--brass)",
  className,
  height = 32,
  fill = true,
}: {
  data: number[];
  color?: string;
  className?: string;
  height?: number;
  fill?: boolean;
}) {
  const w = 100;
  const h = 30;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y] as const;
  });
  const path = pts
    .map(([x, y], i) => (i === 0 ? `M${x.toFixed(2)},${y.toFixed(2)}` : `L${x.toFixed(2)},${y.toFixed(2)}`))
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const gid = React.useId();

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <path d={area} fill={`url(#${gid})`} /> : null}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------- bar chart -------------------------------- */

export function MiniBars({
  data,
  labels,
  color = "var(--brass)",
  height = 96,
  valueFormat = (v: number) => numberFormat(v),
}: {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
  valueFormat?: (v: number) => string;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="group relative flex flex-1 flex-col items-center justify-end gap-1.5">
          <div className="pointer-events-none absolute -top-6 z-10 hidden rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] tabular shadow group-hover:block">
            {valueFormat(v)}
          </div>
          <div
            className="w-full rounded-t-[3px] transition-all duration-500 ease-out group-hover:brightness-125"
            style={{
              height: `${Math.max(3, (v / max) * (height - 18))}px`,
              background: `linear-gradient(180deg, ${color}, color-mix(in oklab, ${color} 35%, transparent))`,
            }}
          />
          <span className="text-[9px] text-[var(--fg-subtle)]">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- donut ----------------------------------- */

export function Donut({
  segments,
  size = 96,
  thickness = 10,
  center,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--bg-sunken)"
          strokeWidth={thickness}
        />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              className="transition-all duration-700"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {center ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">{center}</div>
      ) : null}
    </div>
  );
}
