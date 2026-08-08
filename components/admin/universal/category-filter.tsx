"use client";

import { motion } from "framer-motion";
import { CATEGORY_COLOR, CATEGORY_LABEL, type Category } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

const OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "barber", label: CATEGORY_LABEL.barber },
  { value: "tattoo", label: CATEGORY_LABEL.tattoo },
  { value: "massage", label: CATEGORY_LABEL.massage },
];

/** Jeden rząd, cztery przyciski. Filtr kategorii wygląda tak samo wszędzie. */
export function CategoryFilter({
  value,
  onChange,
  id = "cat",
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--panel-muted)] p-0.5">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        const color =
          option.value === "all" ? undefined : CATEGORY_COLOR[option.value as Category];
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
              active ? "text-[var(--fg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`cat-pill-${id}`}
                className="absolute inset-0 rounded-full bg-[var(--panel)] shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            {color ? (
              <span
                className="relative size-2 rounded-full"
                style={{ background: color }}
                aria-hidden
              />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
