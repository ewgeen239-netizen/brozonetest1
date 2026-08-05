"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Calendar, Check, Clock, Scissors, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/misc";
import { useStore } from "@/lib/store";
import { MockBooksyAdapter } from "@/lib/booksy-adapter";
import { openBooksy, useBooksyWidgetReady } from "./booksy-widget";
import { LanguageSwitcher } from "./language-switcher";
import { useLang } from "@/lib/i18n";
import { slotsFor } from "@/lib/availability";
import {
  addDays,
  cn,
  durationLabel,
  formatDatePL,
  isoWeekday,
  plnFormat,
  WEEKDAYS_PL,
  fromISODate,
} from "@/lib/utils";

const STEP_ICONS = [Scissors, User, Calendar, Check];

export function BookingBlock() {
  const { t } = useLang();
  const { services, barbers, appointments, booksy, today } = useStore();
  const activeServices = React.useMemo(() => services.filter((s) => s.active), [services]);
  const activeBarbers = React.useMemo(
    () => barbers.filter((b) => b.status === "active"),
    [barbers],
  );

  const [serviceId, setServiceId] = React.useState(activeServices[0]?.id ?? "");
  const [barberId, setBarberId] = React.useState<string | "any">("any");
  const [date, setDate] = React.useState(today);
  const [time, setTime] = React.useState<string | null>(null);

  const service = activeServices.find((s) => s.id === serviceId) ?? activeServices[0];
  const eligibleBarbers = activeBarbers.filter((b) => b.serviceIds.includes(service?.id ?? ""));
  const chosenBarber =
    barberId === "any" ? eligibleBarbers[0] : eligibleBarbers.find((b) => b.id === barberId);

  const days = React.useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(today, i)),
    [today],
  );

  const slots = React.useMemo(() => {
    if (!service) return [];
    if (barberId === "any") {
      // union of every eligible barber's free slots
      const map = new Map<string, boolean>();
      for (const b of eligibleBarbers) {
        for (const s of slotsFor({ barber: b, date, service, appointments })) {
          map.set(s.time, (map.get(s.time) ?? false) || s.available);
        }
      }
      return [...map.entries()]
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([t, available]) => ({ time: t, available }));
    }
    return chosenBarber
      ? slotsFor({ barber: chosenBarber, date, service, appointments })
      : [];
  }, [service, barberId, eligibleBarbers, chosenBarber, date, appointments]);

  const freeSlots = slots.filter((s) => s.available);

  React.useEffect(() => setTime(null), [serviceId, barberId, date]);

  const widgetReady = useBooksyWidgetReady();
  const adapter = React.useMemo(() => new MockBooksyAdapter(booksy), [booksy]);
  const bookingUrl = service
    ? adapter.buildBookingUrl({
        serviceId: service.id,
        barberId: barberId === "any" ? undefined : barberId,
        booksyServiceId: service.booksyServiceId,
        booksyStafferUrl: barberId === "any" ? undefined : chosenBarber?.booksyProfileUrl,
        date,
        time: time ?? undefined,
      })
    : booksy.businessUrl;

  const complete = Boolean(service && time);

  return (
    <section
      id="rezerwacja"
      className="relative border-y border-[var(--border)] bg-[var(--bg)] py-14 sm:py-20"
    >
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
              {t.booking.eyebrow}
            </p>
            <h2 className="mt-2 text-[clamp(1.8rem,4vw,2.75rem)] font-bold leading-tight tracking-tight">
              {t.booking.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher id="booking" tone="panel" showIcon />
            <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--ok)] opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--ok)]" />
            </span>
              {freeSlots.length} {t.booking.slotsFree} · {formatDatePL(date)}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-panel)]">
          <div className="grid grid-cols-1 divide-y divide-[var(--border)] lg:grid-cols-[1fr_1fr_1.25fr] lg:divide-x lg:divide-y-0">
            {/* 1 — service */}
            <Column index={0} title={t.booking.stepService} subtitle={t.booking.stepServiceEn}>
              <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                {activeServices.map((s) => {
                  const selected = s.id === serviceId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setServiceId(s.id);
                        // drop the barber selection if they don't offer the new service
                        if (
                          barberId !== "any" &&
                          !activeBarbers.some(
                            (b) => b.id === barberId && b.serviceIds.includes(s.id),
                          )
                        ) {
                          setBarberId("any");
                        }
                      }}
                      className={cn(
                        "group flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                        selected
                          ? "border-[var(--brass)] bg-[color-mix(in_oklab,var(--brass)_9%,transparent)]"
                          : "border-transparent hover:border-[var(--border-strong)] hover:bg-[var(--panel-muted)]",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium">{s.name}</div>
                        <div className="mt-0.5 text-[11px] text-[var(--fg-subtle)]">
                          {durationLabel(s.durationMin)} · {s.nameEn}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[13px] font-semibold tabular">{plnFormat(s.price, { compact: true })}</div>
                        {selected ? (
                          <Check className="ml-auto mt-0.5 size-3.5 text-[var(--brass)]" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Column>

            {/* 2 — barber */}
            <Column index={1} title={t.booking.stepBarber} subtitle={t.booking.stepBarberEn}>
              <div className="space-y-1.5">
                <button
                  onClick={() => setBarberId("any")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                    barberId === "any"
                      ? "border-[var(--brass)] bg-[color-mix(in_oklab,var(--brass)_9%,transparent)]"
                      : "border-transparent hover:border-[var(--border-strong)] hover:bg-[var(--panel-muted)]",
                  )}
                >
                  <span className="grid size-8 place-items-center rounded-full border border-dashed border-[var(--border-strong)] text-[var(--fg-subtle)]">
                    <User className="size-3.5" />
                  </span>
                  <div>
                    <div className="text-[13px] font-medium">{t.booking.anyBarber}</div>
                    <div className="text-[11px] text-[var(--fg-subtle)]">{t.booking.anyBarberHint}</div>
                  </div>
                </button>

                {eligibleBarbers.map((b) => {
                  const selected = b.id === barberId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBarberId(b.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                        selected
                          ? "border-[var(--brass)] bg-[color-mix(in_oklab,var(--brass)_9%,transparent)]"
                          : "border-transparent hover:border-[var(--border-strong)] hover:bg-[var(--panel-muted)]",
                      )}
                    >
                      <Avatar src={b.photoUrl} name={b.name} ring={b.color} />
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium">{b.name}</div>
                        <div className="truncate text-[11px] text-[var(--fg-subtle)]">
                          {b.specialization}
                        </div>
                      </div>
                      <span className="ml-auto text-[11px] tabular text-[var(--fg-subtle)]">
                        ★ {b.rating}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Column>

            {/* 3 — date + time */}
            <Column index={2} title={t.booking.stepDate} subtitle={t.booking.stepDateEn}>
              <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
                {days.map((d) => {
                  const selected = d === date;
                  const closed = isoWeekday(d) === 7;
                  return (
                    <button
                      key={d}
                      disabled={closed}
                      onClick={() => setDate(d)}
                      className={cn(
                        "flex min-w-13 shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2.5 py-2 transition-all",
                        selected
                          ? "border-[var(--brass)] bg-[color-mix(in_oklab,var(--brass)_12%,transparent)]"
                          : "border-[var(--border)] hover:border-[var(--border-strong)]",
                        closed && "opacity-35",
                      )}
                    >
                      <span className="text-[10px] uppercase tracking-wide text-[var(--fg-subtle)]">
                        {WEEKDAYS_PL[isoWeekday(d) - 1]}
                      </span>
                      <span className="text-[15px] font-semibold tabular leading-none">
                        {fromISODate(d).getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 max-h-52 overflow-y-auto pr-1">
                {slots.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-8 text-center">
                    <p className="text-[13px] font-medium">{t.booking.noSchedule}</p>
                    <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
                      {t.booking.noScheduleHint}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 lg:grid-cols-4">
                    {slots.map((s) => (
                      <button
                        key={s.time}
                        disabled={!s.available}
                        onClick={() => setTime(s.time)}
                        className={cn(
                          "rounded-md border px-1 py-1.5 text-[12px] tabular transition-all",
                          time === s.time
                            ? "border-[var(--brass)] bg-[var(--brass)] font-semibold text-[#0b0c0d]"
                            : s.available
                              ? "border-[var(--border)] hover:border-[var(--brass)] hover:bg-[var(--panel-muted)]"
                              : "cursor-not-allowed border-transparent text-[var(--fg-subtle)] line-through opacity-40",
                        )}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Column>
          </div>

          {/* summary bar */}
          <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[var(--fg-muted)]">
              <span className="flex items-center gap-1.5">
                <Scissors className="size-3.5 text-[var(--brass)]" />
                {service?.name ?? "—"}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="size-3.5 text-[var(--brass)]" />
                {barberId === "any" ? t.booking.anyBarber : chosenBarber?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-[var(--brass)]" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`${date}-${time}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {formatDatePL(date)}
                    {time ? ` · ${time}` : ` · ${t.booking.pickTime}`}
                  </motion.span>
                </AnimatePresence>
              </span>
              {service ? (
                <Badge tone="brass">{plnFormat(service.price, { compact: true })}</Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild={complete}
                variant="brass"
                size="lg"
                disabled={!complete}
                className="w-full sm:w-auto"
              >
                {complete ? (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      // prefer the embedded Booksy widget when its loader is up
                      if (!widgetReady) return;
                      e.preventDefault();
                      openBooksy(bookingUrl);
                    }}
                  >
                    {t.booking.cta} <ArrowUpRight />
                  </a>
                ) : (
                  <span>{t.booking.cta}</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-[var(--fg-subtle)]">
          {t.booking.note}
        </p>
      </div>
    </section>
  );
}

function Column({
  index,
  title,
  subtitle,
  children,
}: {
  index: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const Icon = STEP_ICONS[index];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] text-[10px] font-bold tabular text-[var(--brass)]">
          {index + 1}
        </span>
        <span className="text-[13px] font-semibold">{title}</span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
          {subtitle}
        </span>
        <Icon className="ml-auto size-3.5 text-[var(--fg-subtle)]" />
      </div>
      {children}
    </motion.div>
  );
}
