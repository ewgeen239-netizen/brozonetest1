"use client";

import * as React from "react";
import { Check, Loader2, Phone, RefreshCcw, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/misc";
import { PageBody, PageHeader } from "@/components/admin/shared";
import { CategoryBar, StatusPill } from "@/components/admin/universal/badges";
import { BookingDrawer } from "@/components/admin/universal/booking-drawer";
import type { Booking } from "@/lib/booking/types";
import {
  formatDateLong,
  isoToday,
  setBookingStatus,
  shiftDate,
  useBookings,
} from "@/lib/booking/use-api";

/* --------------------------------------------------------------------------
   Widok pracownika: jedna lista własnych wizyt na dziś i trzy przyciski.
   Bez menu, bez cennika, bez bazy klientów — patrz Simple_UX_Rules.md, punkt 10.
-------------------------------------------------------------------------- */

export default function MyBookingsPage() {
  const today = isoToday();
  const [date, setDate] = React.useState(today);
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const { data, loading, error, reload } = useBookings({ from: date, to: date });
  const list = (data ?? []).filter((b) => b.status !== "cancelled");

  const act = async (booking: Booking, status: Booking["status"], key: string) => {
    setBusy(key);
    try {
      await setBookingStatus(booking.bookingId, status);
      reload();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Moje wizyty"
        en="Today"
        description={formatDateLong(date)}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setDate(shiftDate(date, -1))}>
              Wczoraj
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDate(today)}>
              Dzisiaj
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDate(shiftDate(date, 1))}>
              Jutro
            </Button>
            <Button variant="ghost" size="sm" onClick={reload} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCcw />} Odśwież
            </Button>
          </>
        }
      />

      <PageBody className="mx-auto max-w-3xl">
        {loading && !data ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            <EmptyState
              title="Nie udało się wczytać wizyt"
              description={error}
              action={
                <Button variant="outline" size="sm" onClick={reload}>
                  Spróbuj ponownie
                </Button>
              }
            />
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            <EmptyState title="Nie masz dziś żadnych wizyt." description="Wolny dzień." />
          </div>
        ) : (
          <ul className="space-y-2">
            {list.map((booking) => {
              const settled =
                booking.status === "completed" || booking.status === "no_show";
              return (
                <li
                  key={booking.bookingId}
                  className="relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]"
                >
                  <CategoryBar category={booking.category} />

                  <button
                    onClick={() => setSelected(booking)}
                    className="flex w-full items-start gap-4 py-4 pl-5 pr-4 text-left"
                  >
                    <span className="w-14 shrink-0 text-[18px] font-bold tabular">
                      {booking.timeStart}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">
                        {booking.clientName}
                      </span>
                      <span className="block truncate text-[13px] text-[var(--fg-muted)]">
                        {booking.serviceName} · {booking.price} zł
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--fg-subtle)]">
                        <Phone className="size-3" /> {booking.clientPhone}
                      </span>
                    </span>
                    <StatusPill status={booking.status} />
                  </button>

                  {!settled ? (
                    <div className="grid grid-cols-3 gap-2 border-t border-[var(--border)] p-3">
                      <Button
                        variant={booking.status === "new" ? "accent" : "outline"}
                        disabled={busy !== null || booking.status !== "new"}
                        onClick={() => act(booking, "confirmed", `c${booking.bookingId}`)}
                      >
                        {busy === `c${booking.bookingId}` ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Check />
                        )}
                        Potwierdź
                      </Button>
                      <Button
                        variant={booking.status === "confirmed" ? "accent" : "outline"}
                        disabled={busy !== null}
                        onClick={() => setSelected(booking)}
                      >
                        <Check /> Wykonane
                      </Button>
                      <Button
                        variant="outline"
                        disabled={busy !== null}
                        onClick={() => act(booking, "no_show", `n${booking.bookingId}`)}
                      >
                        {busy === `n${booking.bookingId}` ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <UserX />
                        )}
                        Nie przyszedł
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </PageBody>

      <BookingDrawer
        booking={selected}
        open={Boolean(selected)}
        onOpenChange={(v) => !v && setSelected(null)}
        onChanged={reload}
      />
    </>
  );
}
