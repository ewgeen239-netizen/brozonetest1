"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { LayoutGrid, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
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
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid size-8 place-items-center overflow-hidden rounded-[7px] border border-[color-mix(in_oklab,var(--brass)_45%,transparent)] bg-gradient-to-b from-[var(--brass-soft)] to-[var(--brass)] text-[13px] font-black text-[#0b0c0d]">
            B
            <span className="absolute inset-0 -translate-x-full bg-white/40 blur-[6px] transition-transform duration-700 group-hover:translate-x-full" />
          </span>
          <span className="text-[15px] font-bold tracking-[0.22em]">BROZONE</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-[13px] text-[var(--fg-muted)] transition-colors hover:bg-[var(--panel-muted)] hover:text-[var(--fg)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher id="nav" className="hidden sm:inline-flex" />
          <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
            <Link href="/admin">
              <LayoutGrid /> BROZONE OS
            </Link>
          </Button>
          <Button asChild variant="brass" size="sm" className="hidden sm:inline-flex">
            <a href="#rezerwacja">{t.nav.cta}</a>
          </Button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid size-9 place-items-center rounded-md border border-[var(--border-strong)] md:hidden"
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
          className="glass overflow-hidden border-t border-[var(--border)] md:hidden"
        >
          <div className="flex flex-col p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                {t.nav.language}
              </span>
              <LanguageSwitcher id="nav-mobile" tone="panel" />
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
            <Button asChild variant="brass" className="mt-2">
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
