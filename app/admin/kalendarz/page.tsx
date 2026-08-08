"use client";

import * as React from "react";
import { CalendarRange, ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/misc";
import { FilterBar, PageBody, PageHeader } from "@/components/admin/shared";
import { CategoryBar, StatusPill } from "@/components/admin/universal/badges";
import { BookingDrawer } from "@/components/admin/universal/booking-drawer";
import { NewBookingDialog } from "@/components/admin/universal/new-booking-dialog";
import { CategoryFilter } from "@/components/admin/universal/category-filter";
import type { Booking, Staff } from "@/lib/booking/types";
import { CATEGORY_COLOR } from "@/lib/booking/types";
import {
  formatDateLong,
  formatDateShort,
  isoToday,
  shiftDate,
  useBookings,
  useStaff,
} from "@/lib/booking/use-api";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Kalendarz: kto, kiedy, jaka usługa. Trzy widoki, bez enterprise'owych
   udziwnień — patrz 02_ADMIN_PANEL/Calendar_Spec.md.
-------------------------------------------------------------------------- */

type View = "day" | "week" | "list";

const DAY_START = 8 * 60;
const DAY_END = 21 * 60;
const PX_PER_MIN = 1.05;

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toClock = (m: number) =>
  `${`${Math.floor(m / 60)}`.padStart(2, "0")}:${`${m % 60}`.padStart(2, "0")}`;

export default function CalendarPage() {
  const today = isoToday();
  const [view, setView] = React.useState<View>("day");
  const [date, setDate] = React.useState(today);
  const [category, setCategory] = React.useState("all");
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [creating, setCreating] = React.useState(false);

  const range =
    view === "day" ? { from: date, to: date } : { from: date, to: shiftDate(date, 6) };

  const { data, loading, reload } = useBookings({ ...range, category });
  const staff = useStaff(category);

  const crew = (staff.data ?? []).filter((s) => s.active);
  const bookings = (data ?? []).filter((b) => b.status !== "cancelled");

  const step = view === "day" ? 1 : 7;

  return (
    <>
      <PageHeader
        title="Kalendarz"
        en="Calendar"
        description="Kto, kiedy i jaką usługę wykonuje."
        actions={
          <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
            <Plus /> Dodaj wizytę
          </Button>
        }
      >
        <FilterBar>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => setDate(shiftDate(date, -step))}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDate(today)}>
              Dzisiaj
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setDate(shiftDate(date, step))}>
              <ChevronRight />
            </Button>
          </div>

          <span className="text-[13px] font-medium capitalize">
            {view === "day"
              ? formatDateLong(date)
              : `${formatDateShort(date)} – ${formatDateShort(shiftDate(date, 6))}`}
          </span>

          <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--panel-muted)] p-0.5">
            {(
              [
                { value: "day", label: "Dzień" },
                { value: "week", label: "Tydzień" },
                { value: "list", label: "Lista" },
              ] as const
            ).map((v) => (
              <button
                key={v.value}
                onClick={() => setView(v.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                  view === v.value
                    ? "bg-[var(--panel)] text-[var(--fg)] shadow-sm"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          <CategoryFilter value={category} onChange={setCategory} id="calendar" />
        </FilterBar>
      </PageHeader>

      <PageBody>
        {loading && !data ? (
          <Skeleton className="h-96 w-full" />
        ) : crew.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            <EmptyState
              icon={Users}
              title="Nie masz jeszcze żadnych pracowników."
              description="Bez nich kalendarz nie ma czego pokazać."
            />
          </div>
        ) : view === "day" ? (
          <DayView
            crew={crew}
            bookings={bookings.filter((b) => b.date === date)}
            onSelect={setSelected}
          />
        ) : view === "week" ? (
          <WeekView
            start={date}
            bookings={bookings}
            onSelect={setSelected}
            onPickDay={(d) => {
              setDate(d);
              setView("day");
            }}
          />
        ) : (
          <ListView bookings={bookings} onSelect={setSelected} />
        )}
      </PageBody>

      <BookingDrawer
        booking={selected}
        open={Boolean(selected)}
        onOpenChange={(v) => !v && setSelected(null)}
        onChanged={reload}
      />
      <NewBookingDialog
        open={creating}
        onOpenChange={setCreating}
        defaultDate={date}
        onCreated={reload}
      />
    </>
  );
}

/* --------------------------------- dzień --------------------------------- */

function DayView({
  crew,
  bookings,
  onSelect,
}: {
  crew: Staff[];
  bookings: Booking[];
  onSelect: (b: Booking) => void;
}) {
  const height = (DAY_END - DAY_START) * PX_PER_MIN;
  const hours = React.useMemo(() => {
    const out: number[] = [];
    for (let m = DAY_START; m <= DAY_END; m += 60) out.push(m);
    return out;
  }, []);

  const [nowMin, setNowMin] = React.useState<number | null>(null);
  React.useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--panel)]">
      <div
        className="grid min-w-max"
        style={{ gridTemplateColumns: `56px repeat(${crew.length}, minmax(170px, 1fr))` }}
      >
        <div className="border-b border-r border-[var(--border)]" />
        {crew.map((s) => (
          <div key={s.staffId} className="border-b border-r border-[var(--border)] px-3 py-2">
            <div className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: CATEGORY_COLOR[s.category] }}
              />
              <span className="truncate text-[13px] font-medium">{s.name}</span>
            </div>
            <div className="truncate text-[11px] text-[var(--fg-subtle)]">
              {bookings.filter((b) => b.staffId === s.staffId).length} wizyt
            </div>
          </div>
        ))}

        <div className="relative border-r border-[var(--border)]" style={{ height }}>
          {hours.map((m, i) => (
            <div
              key={m}
              className="absolute w-14 pr-2 text-right text-[10px] tabular text-[var(--fg-subtle)]"
              style={{
                top: (m - DAY_START) * PX_PER_MIN,
                transform: i === 0 ? "none" : "translateY(-50%)",
              }}
            >
              {toClock(m)}
            </div>
          ))}
        </div>

        {crew.map((s) => (
          <div key={s.staffId} className="relative border-r border-[var(--border)]" style={{ height }}>
            {hours.map((m) => (
              <div
                key={m}
                className="pointer-events-none absolute inset-x-0 border-t border-[var(--border)]"
                style={{ top: (m - DAY_START) * PX_PER_MIN }}
              />
            ))}

            {bookings
              .filter((b) => b.staffId === s.staffId)
              .map((b) => {
                const top = (toMin(b.timeStart) - DAY_START) * PX_PER_MIN;
                const h = Math.max(
                  26,
                  (toMin(b.timeEnd) - toMin(b.timeStart)) * PX_PER_MIN - 2,
                );
                const color = CATEGORY_COLOR[b.category];
                return (
                  <button
                    key={b.bookingId}
                    onClick={() => onSelect(b)}
                    className={cn(
                      "absolute inset-x-1 overflow-hidden rounded-md border px-2 py-1 text-left transition-shadow hover:z-10 hover:shadow-lg",
                      b.status === "no_show" && "opacity-60",
                      b.status === "new" && "border-dashed",
                    )}
                    style={{
                      top,
                      height: h,
                      borderColor: `color-mix(in oklab, ${color} 55%, transparent)`,
                      background: `color-mix(in oklab, ${color} 16%, var(--panel))`,
                    }}
                  >
                    <div className="text-[11px] font-semibold tabular">{b.timeStart}</div>
                    {h > 34 ? (
                      <div className="truncate text-[12px] font-medium">{b.clientName}</div>
                    ) : null}
                    {h > 52 ? (
                      <div className="truncate text-[11px] text-[var(--fg-muted)]">
                        {b.serviceName}
                      </div>
                    ) : null}
                  </button>
                );
              })}

            {nowMin !== null && nowMin > DAY_START && nowMin < DAY_END ? (
              <div
                className="pointer-events-none absolute inset-x-0 flex items-center"
                style={{ top: (nowMin - DAY_START) * PX_PER_MIN }}
              >
                <span className="size-1.5 rounded-full bg-[var(--danger)]" />
                <span className="h-px flex-1 bg-[var(--danger)] opacity-70" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- tydzień -------------------------------- */

function WeekView({
  start,
  bookings,
  onSelect,
  onPickDay,
}: {
  start: string;
  bookings: Booking[];
  onSelect: (b: Booking) => void;
  onPickDay: (date: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => shiftDate(start, i));
  const today = isoToday();

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((day) => {
        const list = bookings.filter((b) => b.date === day);
        return (
          <div
            key={day}
            className={cn(
              "flex flex-col overflow-hidden rounded-lg border bg-[var(--panel)]",
              day === today ? "border-[var(--accent)]" : "border-[var(--border)]",
            )}
          >
            <button
              onClick={() => onPickDay(day)}
              className="flex items-center justify-between border-b border-[var(--border)] px-2.5 py-2 text-left transition-colors hover:bg-[var(--panel-muted)]"
            >
              <span className="text-[13px] font-semibold tabular">{formatDateShort(day)}</span>
              <span className="text-[11px] tabular text-[var(--fg-subtle)]">{list.length}</span>
            </button>
            <div className="max-h-80 flex-1 space-y-1 overflow-y-auto p-1.5">
              {list.length === 0 ? (
                <p className="px-1 py-4 text-center text-[11px] text-[var(--fg-subtle)]">
                  Wolny dzień
                </p>
              ) : (
                list.map((b) => (
                  <button
                    key={b.bookingId}
                    onClick={() => onSelect(b)}
                    className="w-full rounded-md border px-1.5 py-1 text-left transition-transform hover:-translate-y-px"
                    style={{
                      borderColor: `color-mix(in oklab, ${CATEGORY_COLOR[b.category]} 45%, transparent)`,
                      background: `color-mix(in oklab, ${CATEGORY_COLOR[b.category]} 12%, var(--panel))`,
                    }}
                  >
                    <div className="text-[10px] font-semibold tabular">{b.timeStart}</div>
                    <div className="truncate text-[11px]">{b.clientName}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- lista --------------------------------- */

function ListView({
  bookings,
  onSelect,
}: {
  bookings: Booking[];
  onSelect: (b: Booking) => void;
}) {
  if (!bookings.length) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <EmptyState icon={CalendarRange} title="Brak wizyt w tym zakresie." />
      </div>
    );
  }

  const byDay = bookings.reduce<Record<string, Booking[]>>((acc, b) => {
    (acc[b.date] ??= []).push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-4 print:space-y-2">
      {Object.entries(byDay).map(([day, list]) => (
        <div key={day} className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] bg-[var(--panel-muted)] px-4 py-2 text-[12px] font-semibold capitalize">
            {formatDateLong(day)}
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {list.map((b) => (
              <li key={b.bookingId} className="relative">
                <CategoryBar category={b.category} />
                <button
                  onClick={() => onSelect(b)}
                  className="flex w-full items-center gap-4 py-2.5 pl-4 pr-3 text-left transition-colors hover:bg-[var(--panel-muted)]"
                >
                  <span className="w-24 shrink-0 text-[13px] font-semibold tabular">
                    {b.timeStart}–{b.timeEnd}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                    {b.clientName}
                  </span>
                  <span className="hidden min-w-0 flex-1 truncate text-[12px] text-[var(--fg-muted)] sm:block">
                    {b.serviceName}
                  </span>
                  <span className="hidden w-28 shrink-0 truncate text-[12px] text-[var(--fg-muted)] md:block">
                    {b.staffName}
                  </span>
                  <span className="w-32 shrink-0 text-[12px] tabular text-[var(--fg-subtle)]">
                    {b.clientPhone}
                  </span>
                  <StatusPill status={b.status} size="sm" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
