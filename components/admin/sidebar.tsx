"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronsLeft, ExternalLink, PanelLeft } from "lucide-react";
import { NAV_GROUPS, NAV_ITEMS } from "./nav-config";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/misc";
import { useStore } from "@/lib/store";
import { useMe } from "@/lib/booking/use-api";

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const { appointments, today, booksy } = useStore();
  const { data: me } = useMe();

  const pendingConflicts = appointments.filter((a) => a.conflict && !a.conflict.resolved).length;
  const todayCount = appointments.filter(
    (a) => a.date === today && a.status !== "cancelled",
  ).length;

  const badgeFor = (href: string) => {
    if (href === "/admin/booksy" && pendingConflicts) return String(pendingConflicts);
    if (href === "/admin/rezerwacje") return String(todayCount);
    return null;
  };

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] transition-[width,transform] duration-300",
          collapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-[var(--border)] px-3">
          <Link href="/" className="group relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-[7px] bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] text-[13px] font-black text-[#0b0c0d]">
            B
            <span className="absolute inset-0 -translate-x-full bg-white/40 blur-[6px] transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold tracking-[0.18em]">BROZONE</div>
              <div className="truncate text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                Operating system
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onToggle}
              className="hidden rounded-md p-1 text-[var(--fg-subtle)] transition-colors hover:bg-[var(--panel-muted)] hover:text-[var(--fg)] lg:block"
              aria-label="Zwiń panel"
            >
              <ChevronsLeft className="size-4" />
            </button>
          )}
        </div>

        {/* nav */}
        <nav className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-2 py-3">
          {NAV_GROUPS.map((group) => {
            // menu pokazuje tylko to, na co rola i tak ma prawo po stronie serwera
            const items = NAV_ITEMS.filter(
              (i) => i.group === group.key && (!me || me.sections.includes(i.section)),
            );
            if (!items.length) return null;
            return (
              <div key={group.key}>
                {!collapsed && (
                  <div className="px-2 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
                    {group.label}
                  </div>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);
                    const badge = badgeFor(item.href);
                    const link = (
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] transition-colors",
                          active
                            ? "text-[var(--fg)]"
                            : "text-[var(--fg-muted)] hover:bg-[var(--panel-muted)] hover:text-[var(--fg)]",
                          collapsed && "justify-center px-0",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-0 -z-10 rounded-md border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <item.icon
                          className={cn(
                            "size-4 shrink-0",
                            active ? "text-[var(--accent)]" : "text-[var(--fg-subtle)]",
                          )}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && badge ? (
                          <span
                            className={cn(
                              "ml-auto rounded-full px-1.5 py-px text-[10px] tabular",
                              item.href === "/admin/booksy"
                                ? "bg-[color-mix(in_oklab,var(--warn)_18%,transparent)] text-[var(--warn)]"
                                : "bg-[var(--panel-muted)] text-[var(--fg-subtle)]",
                            )}
                          >
                            {badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                    return (
                      <li key={item.href}>
                        {collapsed ? (
                          <Tooltip side="right" content={`${item.label} · ${item.en}`}>
                            {link}
                          </Tooltip>
                        ) : (
                          link
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* footer */}
        <div className="border-t border-[var(--border)] p-2">
          {collapsed ? (
            <button
              onClick={onToggle}
              className="mx-auto flex size-9 items-center justify-center rounded-md text-[var(--fg-subtle)] transition-colors hover:bg-[var(--panel-muted)] hover:text-[var(--fg)]"
              aria-label="Rozwiń panel"
            >
              <PanelLeft className="size-4" />
            </button>
          ) : (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    booksy.connectionState === "connected"
                      ? "bg-[var(--ok)]"
                      : booksy.connectionState === "degraded"
                        ? "bg-[var(--warn)]"
                        : "bg-[var(--fg-subtle)]",
                  )}
                />
                <span className="text-[11px] font-medium">Booksy · {booksy.mode}</span>
              </div>
              <Link
                href="/"
                className="mt-2 flex items-center gap-1 text-[11px] text-[var(--fg-subtle)] transition-colors hover:text-[var(--accent)]"
              >
                Strona klienta <ExternalLink className="size-3" />
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
