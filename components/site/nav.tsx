"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { LayoutGrid, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { BrozoneSymbol, BrozoneWordmark } from "./brand-mark";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const { t } = useLang();

  const links = [
    { href: "#rezerwacja", label: t.nav.booking },
    { href: "#uslugi", label: t.nav.services },
    { href: "#barberzy", label: t.nav.barbers },
    { href: "#realizacje", label: t.nav.gallery },
    { href: "#opinie", label: t.nav.reviews },
    { href: "#kontakt", label: t.nav.contact },
  ];

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b border-[var(--border)]" : "border-b border-transparent",
      )}
    >
      {/* three tracks: the pill centres inside the middle one, so it can never
          slide under the logo or the action cluster */}
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          {/* over the dark hero the white mark always wins; once the glass bar
              kicks in the mark follows the theme */}
          <BrozoneSymbol
            variant={scrolled ? "auto" : "white"}
            className="h-5 w-auto transition-opacity group-hover:opacity-80"
          />
          <BrozoneWordmark
            variant={scrolled ? "auto" : "white"}
            className="hidden h-3.5 w-auto sm:block"
          />
        </Link>

        {/* glass pill — transparent inside */}
        <nav className="hidden justify-self-center lg:block">
          <ul
            className={cn(
              "flex items-center gap-0.5 rounded-full border p-1 backdrop-blur-xl transition-colors duration-300",
              scrolled
                ? "border-[var(--border-strong)] bg-[color-mix(in_oklab,var(--panel)_45%,transparent)]"
                : "border-white/15 bg-white/[0.06]",
            )}
          >
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={cn(
                    "block whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors",
                    scrolled
                      ? "text-[var(--fg-muted)] hover:bg-[var(--panel-muted)] hover:text-[var(--fg)]"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <LanguageSwitcher id="nav" className="hidden sm:block" />
          <Button asChild variant="ghost" size="sm" className="hidden xl:inline-flex">
            <Link href="/admin">
              <LayoutGrid /> BROZONE OS
            </Link>
          </Button>
          <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
            <a href="#rezerwacja">{t.nav.cta}</a>
          </Button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid size-9 place-items-center rounded-md border border-[var(--border-strong)] lg:hidden"
            aria-label={t.nav.menu}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="glass overflow-hidden border-t border-[var(--border)] lg:hidden"
        >
          <div className="flex flex-col p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                {t.nav.language}
              </span>
              <LanguageSwitcher id="nav-mobile" tone="panel" variant="segmented" />
            </div>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-[var(--fg-muted)] hover:bg-[var(--panel-muted)] hover:text-[var(--fg)]"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/admin"
              className="rounded-md px-3 py-2.5 text-sm text-[var(--fg-muted)] hover:bg-[var(--panel-muted)] hover:text-[var(--fg)]"
            >
              {t.nav.panel}
            </Link>
            <Button asChild variant="accent" className="mt-2">
              <a href="#rezerwacja" onClick={() => setOpen(false)}>
                {t.nav.cta}
              </a>
            </Button>
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}
