"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarRange,
  Loader2,
  Plus,
  RefreshCcw,
  Scissors,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/misc";
import { PageBody, PageHeader } from "@/components/admin/shared";
import { CategoryBar, StatusPill } from "@/components/admin/universal/badges";
import { BookingDrawer } from "@/components/admin/universal/booking-drawer";
import { NewBookingDialog } from "@/components/admin/universal/new-booking-dialog";
import { CategoryFilter } from "@/components/admin/universal/category-filter";
import { SyncBar } from "@/components/admin/universal/sync-bar";
import { formatDateLong, isoToday, shiftDate, useBookings } from "@/lib/booking/use-api";
import type { Booking } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Dashboard odpowiada na jedno pytanie: co się dzieje dzisiaj?
   Bez wykresów i porównań — patrz 02_ADMIN_PANEL/Dashboard_Spec.md.
-------------------------------------------------------------------------- */

export default function DashboardPage() {
  const today = isoToday();
  const [category, setCategory] = React.useState("all");
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [creating, setCreating] = React.useState(false);

  const todayList = useBookings({ from: today, to: today, category });
  const week = useBookings({ from: shiftDate(today, -7), to: shiftDate(today, 7), category });

  const bookings = todayList.data ?? [];
  const live = bookings.filter((b) => b.status !== "cancelled");
  const waiting = bookings.filter((b) => b.status === "new");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const upcoming = live
    .filter((b) => b.status === "new" || b.status === "confirmed")
    .slice(0, 8);

  const noShows = (week.data ?? []).filter(
    (b) => b.status === "no_show" && b.date <= today && b.date >= shiftDate(today, -7),
  );
  const fresh = (week.data ?? []).filter(
    (b) => b.source === "website" && b.createdAt >= shiftDate(today, -1),
  );

  const reloadAll = () => {
    todayList.reload();
    week.reload();
  };

  return (
    <>
      <PageHeader
        title="Dzisiaj"
        en="Dashboard"
        description={formatDateLong(today)}
        actions={
          <>
            <CategoryFilter value={category} onChange={setCategory} />
            <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
              <Plus /> Dodaj wizytę
            </Button>
          </>
        }
      />

      <PageBody>
        {/* sześć kafelków — jedna liczba, jedno zdanie */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <Tile
            label="Dzisiejsze wizyty"
            value={live.length}
            hint="wszystkie kategorie"
            href="/admin/rezerwacje"
            loading={todayList.loading}
          />
          <Tile
            label="Wymagają potwierdzenia"
            value={waiting.length}
            hint={waiting.length ? "kliknij, żeby potwierdzić" : "wszystko potwierdzone"}
            href="/admin/rezerwacje?status=new"
            loading={todayList.loading}
            alert={waiting.length > 0}
          />
          <Tile
            label="Najbliższe wizyty"
            value={upcoming.length}
            hint="jeszcze przed nami"
            href="/admin/kalendarz"
            loading={todayList.loading}
          />
          <Tile
            label="Nowe ze strony"
            value={fresh.length}
            hint="ostatnie 24 godziny"
            href="/admin/rezerwacje?status=new"
            loading={week.loading}
          />
          <Tile
            label="Anulowane dzisiaj"
            value={cancelled.length}
            hint="zwolnione terminy"
            href="/admin/rezerwacje?status=cancelled"
            loading={todayList.loading}
          />
          <Tile
            label="Nieobecności"
            value={noShows.length}
            hint="ostatnie 7 dni"
            href="/admin/rezerwacje?status=no_show"
            loading={week.loading}
          />
        </div>

        {/* lista dnia */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Plan dnia</CardTitle>
            <Button variant="ghost" size="xs" onClick={reloadAll} disabled={todayList.loading}>
              {todayList.loading ? <Loader2 className="animate-spin" /> : <RefreshCcw />} Odśwież
            </Button>
          </CardHeader>

          {todayList.loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : todayList.error ? (
            <EmptyState
              title="Nie udało się wczytać wizyt"
              description={todayList.error}
              action={
                <Button variant="outline" size="sm" onClick={reloadAll}>
                  Spróbuj ponownie
                </Button>
              }
            />
          ) : live.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Dzisiaj nie ma jeszcze żadnych wizyt."
              description="Rezerwacje ze strony pojawią się tu automatycznie."
              action={
                <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
                  <Plus /> Dodaj wizytę ręcznie
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {live.map((booking) => (
                <li key={booking.bookingId} className="relative">
                  <CategoryBar category={booking.category} />
                  <button
                    onClick={() => setSelected(booking)}
                    className="flex w-full items-center gap-3 py-3 pl-4 pr-3 text-left transition-colors hover:bg-[var(--panel-muted)]"
                  >
                    <span className="w-12 shrink-0 text-[14px] font-semibold tabular">
                      {booking.timeStart}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">
                        {booking.clientName}
                      </span>
                      <span className="block truncate text-[12px] text-[var(--fg-muted)]">
                        {booking.serviceName} · {booking.staffName}
                      </span>
                    </span>
                    <StatusPill status={booking.status} size="sm" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* szybkie przyciski */}
        <div className="flex flex-wrap gap-2">
          <Button variant="subtle" onClick={() => setCreating(true)}>
            <Plus /> Dodaj wizytę
          </Button>
          <Button asChild variant="subtle">
            <Link href="/admin/klienci">
              <UserPlus /> Dodaj klienta
            </Link>
          </Button>
          <Button asChild variant="subtle">
            <Link href="/admin/uslugi">
              <Scissors /> Dodaj usługę
            </Link>
          </Button>
          <Button asChild variant="subtle">
            <Link href="/admin/kalendarz">
              <CalendarRange /> Otwórz kalendarz
            </Link>
          </Button>
        </div>

        <SyncBar onRefresh={reloadAll} />
      </PageBody>

      <BookingDrawer
        booking={selected}
        open={Boolean(selected)}
        onOpenChange={(v) => !v && setSelected(null)}
        onChanged={reloadAll}
      />
      <NewBookingDialog
        open={creating}
        onOpenChange={setCreating}
        defaultDate={today}
        onCreated={reloadAll}
      />
    </>
  );
}

function Tile({
  label,
  value,
  hint,
  href,
  loading,
  alert,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  loading: boolean;
  alert?: boolean;
}) {
  return (
    <div>
      <Link
        href={href}
        className={cn(
          "block rounded-lg border p-4 transition-colors",
          alert
            ? "border-[color-mix(in_oklab,var(--warn)_50%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)]"
            : "border-[var(--border)] bg-[var(--panel)] hover:border-[var(--border-strong)]",
        )}
      >
        <div className="text-[12px] font-medium leading-tight text-[var(--fg-muted)]">{label}</div>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-12" />
        ) : (
          <div
            className={cn(
              "mt-1 text-[30px] font-bold leading-none tabular",
              alert && "text-[var(--warn)]",
            )}
          >
            {value}
          </div>
        )}
        <div className="mt-1.5 text-[11px] text-[var(--fg-subtle)]">{hint}</div>
      </Link>
    </div>
  );
}
