"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { LANGS, LANG_LABEL, useLang, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Language carousel.
 *
 * `compact` (default) shows only the active language and rolls the others out
 * in an overlay panel — it keeps the header narrow so the nav pill never has to
 * fight it for space. `segmented` keeps all three visible for wide contexts.
 */
export function LanguageSwitcher({
  id = "lang",
  className,
  tone = "dark",
  variant = "compact",
  showIcon = false,
}: {
  id?: string;
  className?: string;
  tone?: "dark" | "panel";
  variant?: "compact" | "segmented";
  showIcon?: boolean;
}) {
  const { lang, setLang } = useLang();

  if (variant === "segmented") {
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
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
            Lang
          </span>
        ) : null}
        {LANGS.map((l) => {
          const active = l === lang;
          return (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={active}
              className={cn(
                "relative rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] transition-colors",
                active
                  ? "text-[var(--brand-black)]"
                  : tone === "dark"
                    ? "text-white/55 hover:text-white"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={`lang-pill-${id}`}
                  className="absolute inset-0 rounded-full bg-[var(--accent)]"
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

  return <CompactSwitcher lang={lang} setLang={setLang} tone={tone} className={className} />;
}

function CompactSwitcher({
  lang,
  setLang,
  tone,
  className,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  tone: "dark" | "panel";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ordered: Lang[] = [lang, ...LANGS.filter((l) => l !== lang)];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className={cn(
          "flex items-center gap-1 rounded-full border py-1 pl-2.5 pr-1.5 text-[11px] font-semibold tracking-[0.06em] transition-colors",
          tone === "dark"
            ? "border-white/15 bg-white/[0.06] text-white/85 backdrop-blur-xl hover:border-white/30 hover:text-white"
            : "border-[var(--border-strong)] bg-[var(--panel-muted)] text-[var(--fg)] hover:border-[var(--accent)]",
        )}
      >
        {LANG_LABEL[lang]}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="size-3" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute right-0 top-[calc(100%+6px)] z-50 min-w-[4.25rem] overflow-hidden rounded-xl border p-1 shadow-xl",
              tone === "dark"
                ? "border-white/15 bg-[color-mix(in_oklab,var(--brand-black)_82%,transparent)] backdrop-blur-xl"
                : "border-[var(--border)] bg-[var(--bg-elevated)]",
            )}
          >
            {ordered.map((l) => {
              const active = l === lang;
              return (
                <li key={l}>
                  <button
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setLang(l);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.06em] transition-colors",
                      active
                        ? "bg-[var(--accent)] text-[var(--brand-black)]"
                        : tone === "dark"
                          ? "text-white/70 hover:bg-white/10 hover:text-white"
                          : "text-[var(--fg-muted)] hover:bg-[var(--panel-muted)] hover:text-[var(--fg)]",
                    )}
                  >
                    {LANG_LABEL[l]}
                    {active ? <Check className="size-3" /> : null}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
