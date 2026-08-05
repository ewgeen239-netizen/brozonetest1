"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { LANGS, LANG_LABEL, useLang, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Language carousel — PL / RU / EN with a sliding brass indicator.
 * `id` keeps the shared layout animation unique when several instances render.
 */
export function LanguageSwitcher({
  id = "lang",
  className,
  showIcon = false,
  tone = "dark",
}: {
  id?: string;
  className?: string;
  showIcon?: boolean;
  tone?: "dark" | "panel";
}) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-0.5",
        tone === "dark"
          ? "border-white/15 bg-white/5 backdrop-blur"
          : "border-[var(--border-strong)] bg-[var(--panel-muted)]",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {showIcon ? (
        <Globe className="ml-1.5 mr-0.5 size-3.5 shrink-0 text-[var(--fg-subtle)]" />
      ) : null}
      {LANGS.map((l: Lang) => {
        const active = l === lang;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={active}
            className={cn(
              "relative rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] transition-colors",
              active
                ? "text-[#0b0c0d]"
                : tone === "dark"
                  ? "text-white/55 hover:text-white"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`lang-pill-${id}`}
                className="absolute inset-0 rounded-full bg-gradient-to-b from-[var(--brass-soft)] to-[var(--brass)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative">{LANG_LABEL[l]}</span>
          </button>
        );
      })}
    </div>
  );
}
