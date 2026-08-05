"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Download, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedNumber, Sparkline } from "@/components/ui/data-viz";
import { cn, downloadCSV, pctFormat, toCSV } from "@/lib/utils";
import type { AppointmentSource, AppointmentStatus } from "@/lib/types";

/* ------------------------------ page header ------------------------------ */

export function PageHeader({
  title,
  en,
  description,
  actions,
  children,
}: {
  title: string;
  en?: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {en ? (
              <span className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--fg-subtle)]">
                {en}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[var(--fg-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function PageBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4 p-4 sm:p-6", className)} {...props} />;
}

/* -------------------------------- KPI card ------------------------------- */

export function KpiCard({
  label,
  en,
  value,
  format = "number",
  delta,
  spark,
  color = "var(--brass)",
  suffix,
  fractionDigits = 0,
  hint,
  index = 0,
}: {
  label: string;
  en?: string;
  value: number;
  format?: "number" | "pln" | "pct";
  delta?: number;
  spark?: number[];
  color?: string;
  suffix?: string;
  fractionDigits?: number;
  hint?: string;
  index?: number;
}) {
  const TrendIcon = delta === undefined ? Minus : delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  const trendTone =
    delta === undefined || delta === 0
      ? "text-[var(--fg-subtle)]"
      : delta > 0
        ? "text-[var(--ok)]"
        : "text-[var(--danger)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3.5 transition-colors hover:border-[var(--border-strong)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-medium leading-tight text-[var(--fg-muted)]">{label}</div>
          {en ? (
            <div className="truncate text-[9px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              {en}
            </div>
          ) : null}
        </div>
        {delta !== undefined ? (
          <span className={cn("flex items-center gap-0.5 text-[11px] tabular", trendTone)}>
            <TrendIcon className="size-3" />
            {pctFormat(Math.abs(delta), 1).replace("+", "")}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <AnimatedNumber
          value={value}
          format={format}
          fractionDigits={fractionDigits}
          suffix={suffix}
          className="text-[26px] font-semibold leading-none tracking-tight"
        />
        {spark ? (
          <div className="w-20 shrink-0 opacity-80 transition-opacity group-hover:opacity-100">
            <Sparkline data={spark} color={color} height={30} />
          </div>
        ) : null}
      </div>

      {hint ? <div className="mt-2 text-[10px] text-[var(--fg-subtle)]">{hint}</div> : null}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </motion.div>
  );
}

/* ------------------------------- badges ---------------------------------- */

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  booked: "Zarezerwowana",
  confirmed: "Potwierdzona",
  completed: "Zrealizowana",
  cancelled: "Anulowana",
  no_show: "No-show",
};

const STATUS_TONE = {
  booked: "neutral",
  confirmed: "info",
  completed: "ok",
  cancelled: "outline",
  no_show: "danger",
} as const;

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} size="sm">
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export const SOURCE_LABEL: Record<AppointmentSource, string> = {
  booksy: "Booksy",
  website: "Website",
  manual: "Manual",
  walkin: "Walk-in",
};

const SOURCE_TONE = {
  booksy: "brass",
  website: "info",
  manual: "neutral",
  walkin: "warn",
} as const;

export function SourceBadge({ source }: { source: AppointmentSource }) {
  return (
    <Badge tone={SOURCE_TONE[source]} size="sm">
      {SOURCE_LABEL[source]}
    </Badge>
  );
}

/* ------------------------------- exports --------------------------------- */

export function ExportButtons({
  filename,
  rows,
  headers,
  label = "Eksport",
}: {
  filename: string;
  rows: Record<string, string | number>[];
  headers?: string[];
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadCSV(`${filename}.csv`, toCSV(rows, headers))}
        disabled={!rows.length}
      >
        <Download /> CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()} disabled={!rows.length}>
        <Download /> PDF
      </Button>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/* ------------------------------ filter bar ------------------------------- */

export function FilterBar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex h-8 items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors",
            value === o.value ? "text-[var(--fg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
          )}
        >
          {value === o.value ? (
            <motion.span
              layoutId={`seg-${options.map((x) => x.value).join("")}`}
              className="absolute inset-0 rounded-[5px] bg-[var(--panel)] shadow-sm"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          ) : null}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
