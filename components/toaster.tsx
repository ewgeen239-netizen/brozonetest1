"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import { useStore } from "@/lib/store";

const toneIcon = {
  default: Info,
  ok: Check,
  warn: AlertTriangle,
  danger: AlertTriangle,
} as const;

const toneColor = {
  default: "var(--info)",
  ok: "var(--ok)",
  warn: "var(--warn)",
  danger: "var(--danger)",
} as const;

export function Toaster() {
  const { toasts, dismissToast } = useStore();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,22rem)] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = toneIcon[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3 shadow-xl"
            >
              <span
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
                style={{
                  background: `color-mix(in oklab, ${toneColor[t.tone]} 16%, transparent)`,
                  color: toneColor[t.tone],
                }}
              >
                <Icon className="size-3" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-tight">{t.title}</p>
                {t.description ? (
                  <p className="mt-0.5 text-xs leading-snug text-[var(--fg-muted)]">
                    {t.description}
                  </p>
                ) : null}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="rounded p-0.5 text-[var(--fg-subtle)] transition-colors hover:text-[var(--fg)]"
                aria-label="Zamknij"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
