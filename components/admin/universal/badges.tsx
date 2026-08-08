"use client";

import { cn } from "@/lib/utils";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  SOURCE_LABEL,
  STATUS_LABEL,
  type BookingSource,
  type BookingStatus,
  type Category,
} from "@/lib/booking/types";

/* --------------------------------------------------------------------------
   Statusy: kolor PLUS słowo. Sam kolor nie wystarcza — patrz
   02_ADMIN_PANEL/Simple_UX_Rules.md, punkt 4.
-------------------------------------------------------------------------- */

const STATUS_CLASS: Record<BookingStatus, string> = {
  new: "border-[var(--border-strong)] bg-[var(--panel-muted)] text-[var(--fg)]",
  confirmed:
    "border-[color-mix(in_oklab,var(--info)_45%,transparent)] bg-[color-mix(in_oklab,var(--info)_14%,transparent)] text-[var(--info)]",
  completed:
    "border-[color-mix(in_oklab,var(--ok)_45%,transparent)] bg-[color-mix(in_oklab,var(--ok)_14%,transparent)] text-[var(--ok)]",
  cancelled:
    "border-[var(--border)] bg-transparent text-[var(--fg-subtle)] line-through",
  no_show:
    "border-[color-mix(in_oklab,var(--danger)_45%,transparent)] bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-[var(--danger)]",
};

export function StatusPill({
  status,
  size = "md",
}: {
  status: BookingStatus;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-semibold",
        size === "md" ? "px-2.5 py-1 text-[12px]" : "px-2 py-0.5 text-[11px]",
        STATUS_CLASS[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function CategoryDot({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ background: CATEGORY_COLOR[category] }}
      aria-hidden
    />
  );
}

export function CategoryTag({ category }: { category: Category }) {
  const color = CATEGORY_COLOR[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{
        borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
        background: `color-mix(in oklab, ${color} 12%, transparent)`,
        color,
      }}
    >
      <CategoryDot category={category} />
      {CATEGORY_LABEL[category]}
    </span>
  );
}

/** kolorowy pasek kategorii po lewej stronie wiersza / karty */
export function CategoryBar({ category }: { category: Category }) {
  return (
    <span
      className="absolute inset-y-0 left-0 w-1"
      style={{ background: CATEGORY_COLOR[category] }}
      aria-hidden
    />
  );
}

export function SourceTag({ source }: { source: BookingSource }) {
  return (
    <span className="whitespace-nowrap rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
      {SOURCE_LABEL[source]}
    </span>
  );
}
