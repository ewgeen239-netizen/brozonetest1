"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Plus,
  RefreshCcw,
  TriangleAlert,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, Progress, Skeleton } from "@/components/ui/misc";
import { MiniBars } from "@/components/ui/data-viz";
import { EmptyState } from "@/components/ui/states";
import { KpiCard, PageBody, PageHeader, SourceBadge, StatusBadge } from "@/components/admin/shared";
import { DayGrid } from "@/components/admin/day-grid";
import { AppointmentDrawer } from "@/components/admin/appointment-drawer";
import { useStore } from "@/lib/store";
import { occupancyFor } from "@/lib/availability";
import type { Appointment } from "@/lib/types";
import {
  addDays,
  cn,
  formatDatePL,
  minutesFromClock,
  plnFormat,
  relativeTimePL,
  sum,
  WEEKDAYS_PL,
  isoWeekday,
} from "@/lib/utils";

export default function DashboardPage() {
  const { appointments, barbers, clients, today, cashReports, booksy, syncLogs, syncing, runSync } =
    useStore();
  const [selected, setSelected] = React.useState<Appointment | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  const activeBarbers = barbers.filter((b) => b.status === "active");
  const todayApts = appointments.filter((a) => a.date === today);
  const yesterday = addDays(today, -1);
  const yApts = appointments.filter((a) => a.date === yesterday);

  const done = todayApts.filter((a) => a.status === "completed");
  const revenue = sum(done, (a) => a.price);
  const yRevenue = sum(
    yApts.filter((a) => a.status === "completed"),
    (a) => a.price,
  );
  const cash = sum(done.filter((a) => a.paymentMethod === "cash"), (a) => a.price);
  const card = sum(done.filter((a) => a.paymentMethod === "card"), (a) => a.price);
  const noShow = todayApts.filter((a) => a.status === "no_show").length;
  const weekNoShow = appointments.filter(
    (a) => a.status === "no_show" && a.date > addDays(today, -7) && a.date <= today,
  ).length;

  const occupancy = Math.round(
    activeBarbers.reduce(
      (acc, b) => acc + occupancyFor({ barber: b, date: today, appointments }).pct,
      0,
    ) / Math.max(1, activeBarbers.length),
  );

  const last7 = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i)),
    [today],
  );
  const revSpark = last7.map((d) =>
    sum(appointments.filter((a) => a.date === d && a.status === "completed"), (a) => a.price),
  );
  const bookSpark = last7.map(
    (d) => appointments.filter((a) => a.date === d && a.status !== "cancelled").length,
  );

  const pending = todayApts
    .filter((a) => a.status === "booked" || a.status === "confirmed")
    .sort((a, b) => minutesFromClock(a.start) - minutesFromClock(b.start));
  const upcoming = pending.slice(0, 6);

  const todayCash = cashReports.find((r) => r.date === today);
  const lastSync = syncLogs[0];
  const conflicts = appointments.filter((a) => a.conflict && !a.conflict.resolved).length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        en="Overview"
        description={`Podsumowanie dnia — ${formatDatePL(today, "long")}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => runSync()} disabled={syncing}>
              <RefreshCcw className={cn(syncing && "animate-spin")} /> Sync from Booksy
            </Button>
            <Button asChild variant="brass" size="sm">
              <Link href="/admin/rezerwacje">
                <Plus /> Nowa rezerwacja
              </Link>
            </Button>
          </>
        }
      />

      <PageBody>
        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3.5">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="mt-3 h-6 w-24" />
                <Skeleton className="mt-3 h-2 w-full" />
              </div>
            ))
          ) : (
            <>
              <KpiCard
                index={0}
                label="Rezerwacje dzisiaj"
                en="Bookings"
                value={todayApts.filter((a) => a.status !== "cancelled").length}
                delta={
                  yApts.length
                    ? ((todayApts.length - yApts.length) / yApts.length) * 100
                    : undefined
                }
                spark={bookSpark}
                hint={`${done.length} zrealizowanych · ${pending.length} przed nami`}
              />
              <KpiCard
                index={1}
                label="Przychód dzisiaj"
                en="Revenue"
                value={revenue}
                format="pln"
                delta={yRevenue ? ((revenue - yRevenue) / yRevenue) * 100 : undefined}
                spark={revSpark}
                color="var(--ok)"
                hint={`Wczoraj ${plnFormat(yRevenue, { compact: true })}`}
              />
              <KpiCard
                index={2}
                label="Gotówka"
                en="Cash"
                value={cash}
                format="pln"
                color="var(--warn)"
                hint={`${done.filter((a) => a.paymentMethod === "cash").length} transakcji`}
              />
              <KpiCard
                index={3}
                label="Karta"
                en="Card"
                value={card}
                format="pln"
                color="var(--info)"
                hint={`${done.filter((a) => a.paymentMethod === "card").length} transakcji`}
              />
              <KpiCard
                index={4}
                label="Obłożenie barberów"
                en="Utilisation"
                value={occupancy}
                format="pct"
                color="var(--brass)"
                hint={`${activeBarbers.length} barberów na zmianie`}
              />
              <KpiCard
                index={5}
                label="No-show"
                en="Missed"
                value={noShow}
                color="var(--danger)"
                hint={`${weekNoShow} w ostatnich 7 dniach`}
              />
            </>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          {/* timeline */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Dzisiejszy grafik</CardTitle>
                <Badge tone="outline" size="sm">
                  {formatDatePL(today)}
                </Badge>
              </div>
              <Button asChild variant="ghost" size="xs">
                <Link href="/admin/rezerwacje">
                  Pełny kalendarz <ArrowUpRight />
                </Link>
              </Button>
            </CardHeader>
            {loading ? (
              <div className="p-4">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : activeBarbers.length ? (
              <DayGrid
                date={today}
                barbers={activeBarbers}
                appointments={todayApts}
                compact
                onSelect={setSelected}
              />
            ) : (
              <EmptyState title="Brak barberów na zmianie" />
            )}
          </Card>

          {/* right rail */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Najbliższe wizyty</CardTitle>
                <span className="text-[11px] text-[var(--fg-subtle)]">{upcoming.length}</span>
              </CardHeader>
              {loading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : upcoming.length ? (
                <div className="divide-y divide-[var(--border)]">
                  {upcoming.map((a, i) => {
                    const barber = barbers.find((b) => b.id === a.barberId);
                    const client = clients.find((c) => c.id === a.clientId);
                    return (
                      <motion.button
                        key={a.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelected(a)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--panel-muted)]"
                      >
                        <span className="w-10 shrink-0 text-[12px] font-semibold tabular">
                          {a.start}
                        </span>
                        <Avatar
                          src={barber?.photoUrl}
                          name={barber?.name ?? ""}
                          ring={barber?.color}
                          className="size-7"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-medium">
                            {client?.name}
                          </span>
                          <span className="block truncate text-[10px] text-[var(--fg-subtle)]">
                            {barber?.name}
                          </span>
                        </span>
                        <SourceBadge source={a.source} />
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Brak zaplanowanych wizyt"
                  description="Wszystkie dzisiejsze rezerwacje są już zrealizowane."
                  className="py-10"
                />
              )}
            </Card>

            {/* booksy */}
            <Card>
              <CardHeader>
                <CardTitle>Booksy sync</CardTitle>
                <Badge
                  tone={
                    booksy.connectionState === "connected"
                      ? "ok"
                      : booksy.connectionState === "degraded"
                        ? "warn"
                        : "neutral"
                  }
                  size="sm"
                >
                  {booksy.mode} mode
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[var(--fg-muted)]">Ostatnia synchronizacja</span>
                  <span className="tabular">
                    {booksy.lastSyncAt ? relativeTimePL(booksy.lastSyncAt) : "—"}
                  </span>
                </div>
                {lastSync ? (
                  <div className="rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-2.5">
                    <div className="flex items-center gap-2">
                      {lastSync.status === "error" ? (
                        <TriangleAlert className="size-3.5 text-[var(--danger)]" />
                      ) : lastSync.status === "partial" ? (
                        <TriangleAlert className="size-3.5 text-[var(--warn)]" />
                      ) : (
                        <CheckCircle2 className="size-3.5 text-[var(--ok)]" />
                      )}
                      <span className="text-[11px] leading-snug text-[var(--fg-muted)]">
                        {lastSync.message}
                      </span>
                    </div>
                  </div>
                ) : null}
                {conflicts ? (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/admin/booksy">
                      <TriangleAlert /> Rozwiąż {conflicts} konflikt
                      {conflicts > 1 ? "y" : ""}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => runSync()}
                    disabled={syncing}
                  >
                    <RefreshCcw className={cn(syncing && "animate-spin")} /> Sync from Booksy
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* cash */}
            <Card>
              <CardHeader>
                <CardTitle>Raport kasowy</CardTitle>
                <Badge
                  tone={
                    todayCash?.status === "approved"
                      ? "ok"
                      : todayCash?.status === "closed"
                        ? "info"
                        : "warn"
                  }
                  size="sm"
                >
                  {todayCash?.status === "approved"
                    ? "Zatwierdzony"
                    : todayCash?.status === "closed"
                      ? "Zamknięty"
                      : "Otwarty"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <Row icon={Banknote} label="Gotówka w kasie" value={plnFormat(todayCash ? todayCash.openingCash + todayCash.cashIncome - todayCash.payouts : 0)} />
                <Row icon={CreditCard} label="Terminal" value={plnFormat(card)} />
                <Row icon={UserX} label="Napiwki" value={plnFormat(todayCash?.tips ?? 0)} />
                <Button asChild variant="subtle" size="sm" className="w-full">
                  <Link href="/admin/raport-kasowy">Otwórz RK dnia</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* bottom row */}
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Przychód — ostatnie 7 dni</CardTitle>
              <span className="text-[11px] tabular text-[var(--fg-subtle)]">
                {plnFormat(sum(revSpark, (v) => v), { compact: true })}
              </span>
            </CardHeader>
            <CardContent>
              <MiniBars
                data={revSpark}
                labels={last7.map((d) => WEEKDAYS_PL[isoWeekday(d) - 1])}
                valueFormat={(v) => plnFormat(v, { compact: true })}
                height={120}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Obłożenie barberów dzisiaj</CardTitle>
              <span className="text-[11px] tabular text-[var(--fg-subtle)]">{occupancy}%</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeBarbers.map((b) => {
                const occ = occupancyFor({ barber: b, date: today, appointments });
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[12px]">
                      <Avatar src={b.photoUrl} name={b.name} ring={b.color} className="size-6" />
                      <span className="truncate">{b.name}</span>
                      <span className="ml-auto tabular text-[var(--fg-muted)]">
                        {occ.capacity ? `${Math.round(occ.booked / 60)}h / ${Math.round(occ.capacity / 60)}h` : "wolne"}
                      </span>
                      <span className="w-9 text-right tabular font-medium">{occ.pct}%</span>
                    </div>
                    <Progress value={occ.pct} color={b.color} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </PageBody>

      <AppointmentDrawer
        appointment={selected}
        open={Boolean(selected)}
        onOpenChange={(v) => !v && setSelected(null)}
      />
    </>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <Icon className="size-3.5 text-[var(--fg-subtle)]" />
      <span className="text-[var(--fg-muted)]">{label}</span>
      <span className="ml-auto font-medium tabular">{value}</span>
    </div>
  );
}
