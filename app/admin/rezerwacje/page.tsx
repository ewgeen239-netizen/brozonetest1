"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, TableSkeleton } from "@/components/ui/states";
import { FilterBar, PageBody, PageHeader } from "@/components/admin/shared";
import { CategoryBar, SourceTag, StatusPill } from "@/components/admin/universal/badges";
import { BookingDrawer } from "@/components/admin/universal/booking-drawer";
import { NewBookingDialog } from "@/components/admin/universal/new-booking-dialog";
import { CategoryFilter } from "@/components/admin/universal/category-filter";
import { SyncBar } from "@/components/admin/universal/sync-bar";
import type { Booking } from "@/lib/booking/types";
import { STATUS_LABEL } from "@/lib/booking/types";
import { formatWhen, isoToday, shiftDate, useBookings } from "@/lib/booking/use-api";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Jedna lista dla trzech kategorii. Maksymalnie pięć filtrów —
   patrz 02_ADMIN_PANEL/Bookings_Spec.md.
-------------------------------------------------------------------------- */

type Range = "today" | "tomorrow" | "week" | "all";

const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Dziś" },
  { value: "tomorrow", label: "Jutro" },
  { value: "week", label: "Tydzień" },
  { value: "all", label: "Wszystkie" },
];

const STATUSES = ["all", "new", "confirmed", "completed", "cancelled", "no_show"] as const;

export default function BookingsPage() {
  return (
    <React.Suspense
      fallback={<div className="p-6 text-[13px] text-[var(--fg-muted)]">Wczytywanie…</div>}
    >
      <BookingsView />
    </React.Suspense>
  );
}

function BookingsView() {
  const params = useSearchParams();
  const today = isoToday();

  const [range, setRange] = React.useState<Range>("today");
  const [category, setCategory] = React.useState("all");
  const [status, setStatus] = React.useState(params.get("status") ?? "all");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [creating, setCreating] = React.useState(false);

  // wejście z dashboardu z konkretnym statusem pokazuje szerszy zakres
  React.useEffect(() => {
    if (params.get("status")) setRange("week");
  }, [params]);

  const window = React.useMemo(() => {
    switch (range) {
      case "today":
        return { from: today, to: today };
      case "tomorrow":
        return { from: shiftDate(today, 1), to: shiftDate(today, 1) };
      case "week":
        return { from: shiftDate(today, -7), to: shiftDate(today, 7) };
      default:
        return {};
    }
  }, [range, today]);

  const { data, loading, error, reload } = useBookings({ ...window, category, status });

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter(
      (b) =>
        b.clientName.toLowerCase().includes(q) ||
        b.clientPhone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        b.bookingId.toLowerCase().includes(q),
    );
  }, [data, query]);

  const activeFilters =
    (category !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0) + (query ? 1 : 0);

  return (
    <>
      <PageHeader
        title="Rezerwacje"
        en="Bookings"
        description="Wszystkie wizyty — barber, tatuaż i masaż w jednym miejscu."
        actions={
          <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
            <Plus /> Dodaj wizytę
          </Button>
        }
      >
        <FilterBar>
          <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--panel-muted)] p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                  range === r.value
                    ? "bg-[var(--panel)] text-[var(--fg)] shadow-sm"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <CategoryFilter value={category} onChange={setCategory} id="bookings" />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-full border border-[var(--border-strong)] bg-[var(--panel-muted)] px-3 text-[12px]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Każdy status" : STATUS_LABEL[s]}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nazwisko albo telefon…"
              className="h-9 w-56 rounded-full pl-8 text-[12px]"
            />
          </div>

          <span className="ml-auto flex items-center gap-2 text-[11px] text-[var(--fg-subtle)]">
            {loading ? <Loader2 className="size-3 animate-spin" /> : null}
            {filtered.length} wizyt
          </span>
        </FilterBar>
      </PageHeader>

      <PageBody>
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          {loading && !data ? (
            <TableSkeleton rows={8} cols={5} />
          ) : error ? (
            <EmptyState
              title="Nie udało się wczytać rezerwacji"
              description={error}
              action={
                <Button variant="outline" size="sm" onClick={reload}>
                  Spróbuj ponownie
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={
                activeFilters ? "Brak wizyt dla wybranych filtrów." : "Nie masz jeszcze rezerwacji."
              }
              description={
                activeFilters
                  ? "Zmień zakres dat albo wyczyść filtry."
                  : "Zgłoszenia ze strony pojawią się tutaj automatycznie."
              }
              action={
                activeFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCategory("all");
                      setStatus("all");
                      setQuery("");
                      setRange("week");
                    }}
                  >
                    Wyczyść filtry
                  </Button>
                ) : (
                  <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
                    <Plus /> Dodaj pierwszą wizytę
                  </Button>
                )
              }
            />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {filtered.map((booking) => (
                <li key={booking.bookingId} className="relative">
                  <CategoryBar category={booking.category} />
                  <button
                    onClick={() => setSelected(booking)}
                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 py-3 pl-4 pr-3 text-left transition-colors hover:bg-[var(--panel-muted)]"
                  >
                    <span className="w-24 shrink-0 text-[13px] font-semibold tabular">
                      {formatWhen(booking.date, booking.timeStart)}
                    </span>

                    <span className="min-w-[9rem] flex-1">
                      <span className="block truncate text-[13px] font-medium">
                        {booking.clientName}
                      </span>
                      <span className="block truncate text-[11px] tabular text-[var(--fg-subtle)]">
                        {booking.clientPhone}
                      </span>
                    </span>

                    <span className="min-w-[10rem] flex-1">
                      <span className="block truncate text-[13px]">{booking.serviceName}</span>
                      <span className="block truncate text-[11px] text-[var(--fg-subtle)]">
                        {booking.staffName}
                      </span>
                    </span>

                    <span className="w-16 shrink-0 text-right text-[13px] font-semibold tabular">
                      {booking.price} zł
                    </span>

                    <span className="hidden shrink-0 sm:block">
                      <SourceTag source={booking.source} />
                    </span>
                    <StatusPill status={booking.status} size="sm" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SyncBar onRefresh={reload} />
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
        defaultDate={today}
        onCreated={reload}
      />
    </>
  );
}
