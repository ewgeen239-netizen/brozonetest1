"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CornerDownLeft,
  Scissors,
  Search,
  User,
  UserSquare2,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { NAV_ITEMS } from "./nav-config";
import { useStore } from "@/lib/store";
import { cn, formatDatePL } from "@/lib/utils";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";

interface Result {
  id: string;
  label: string;
  hint: string;
  group: string;
  href: string;
  icon: React.ElementType;
}

export function CommandBar({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const { clients, barbers, appointments, services, today } = useStore();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const nav: Result[] = NAV_ITEMS.filter(
      (i) => !q || i.label.toLowerCase().includes(q) || i.en.toLowerCase().includes(q),
    ).map((i) => ({
      id: `nav-${i.href}`,
      label: i.label,
      hint: i.en,
      group: "Nawigacja",
      href: i.href,
      icon: i.icon,
    }));

    if (!q) {
      const upcoming = appointments
        .filter((a) => a.date === today && a.status !== "cancelled")
        .slice(0, 4)
        .map<Result>((a) => ({
          id: a.id,
          label: `${a.start} · ${clients.find((c) => c.id === a.clientId)?.name ?? "Klient"}`,
          hint: barbers.find((b) => b.id === a.barberId)?.name ?? "",
          group: "Dzisiaj",
          href: `/admin/rezerwacje?apt=${a.id}`,
          icon: CalendarDays,
        }));
      return [...nav.slice(0, 6), ...upcoming];
    }

    const clientHits = clients
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 5)
      .map<Result>((c) => ({
        id: c.id,
        label: c.name,
        hint: `${c.phone} · ${c.visits} wizyt`,
        group: "Klienci",
        href: `/admin/klienci?q=${encodeURIComponent(c.name)}`,
        icon: User,
      }));

    const barberHits = barbers
      .filter((b) => b.name.toLowerCase().includes(q) || b.specialization.toLowerCase().includes(q))
      .slice(0, 4)
      .map<Result>((b) => ({
        id: b.id,
        label: b.name,
        hint: b.specialization,
        group: "Barberzy",
        href: `/admin/barberzy/${b.id}`,
        icon: UserSquare2,
      }));

    const serviceHits = services
      .filter((s) => s.name.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q))
      .slice(0, 4)
      .map<Result>((s) => ({
        id: s.id,
        label: s.name,
        hint: `${s.durationMin} min · ${s.price} zł`,
        group: "Usługi",
        href: `/admin/uslugi?q=${encodeURIComponent(s.name)}`,
        icon: Scissors,
      }));

    const aptHits = appointments
      .filter((a) => {
        const client = clients.find((c) => c.id === a.clientId);
        return client?.name.toLowerCase().includes(q) || a.date.includes(q);
      })
      .slice(0, 4)
      .map<Result>((a) => ({
        id: a.id,
        label: `${formatDatePL(a.date)} ${a.start} · ${clients.find((c) => c.id === a.clientId)?.name}`,
        hint: barbers.find((b) => b.id === a.barberId)?.name ?? "",
        group: "Rezerwacje",
        href: `/admin/rezerwacje?apt=${a.id}`,
        icon: CalendarDays,
      }));

    return [...nav.slice(0, 4), ...clientHits, ...barberHits, ...serviceHits, ...aptHits];
  }, [query, clients, barbers, services, appointments, today]);

  React.useEffect(() => setActive(0), [query]);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = React.useCallback(
    (r: Result) => {
      onOpenChange(false);
      router.push(r.href);
    },
    [onOpenChange, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  let lastGroup = "";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="anim-dialog fixed left-1/2 top-[14vh] z-50 w-[min(94vw,38rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl outline-none"
          onKeyDown={onKeyDown}
        >
          <DialogPrimitive.Title className="sr-only">Wyszukiwarka</DialogPrimitive.Title>
          <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4">
            <Search className="size-4 shrink-0 text-[var(--fg-subtle)]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients, appointments, barbers…"
              className="h-12 w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--fg-subtle)]"
            />
            <kbd className="hidden rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[10px] text-[var(--fg-subtle)] sm:block">
              ESC
            </kbd>
          </div>

          <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-1.5">
            <AnimatePresence initial={false}>
              {results.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-[13px] font-medium">Brak wyników dla „{query}”</p>
                  <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
                    Szukaj po nazwisku klienta, numerze telefonu, barberze lub usłudze.
                  </p>
                </div>
              ) : (
                results.map((r, i) => {
                  const showGroup = r.group !== lastGroup;
                  lastGroup = r.group;
                  return (
                    <motion.div key={r.id} layout="position">
                      {showGroup ? (
                        <div className="px-2.5 pb-1 pt-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--fg-subtle)]">
                          {r.group}
                        </div>
                      ) : null}
                      <button
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(r)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                          i === active ? "bg-[var(--panel-muted)]" : "hover:bg-[var(--panel-muted)]",
                        )}
                      >
                        <r.icon className="size-3.5 shrink-0 text-[var(--fg-subtle)]" />
                        <span className="truncate text-[13px]">{r.label}</span>
                        <span className="ml-auto truncate pl-3 text-[11px] text-[var(--fg-subtle)]">
                          {r.hint}
                        </span>
                        {i === active ? (
                          <CornerDownLeft className="size-3 shrink-0 text-[var(--brass)]" />
                        ) : null}
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-[10px] text-[var(--fg-subtle)]">
            <span className="flex items-center gap-3">
              <span>↑↓ nawigacja</span>
              <span>⏎ otwórz</span>
            </span>
            <span>BROZONE OS · command bar</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
