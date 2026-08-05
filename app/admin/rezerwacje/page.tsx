"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, NativeSelect } from "@/components/ui/input";
import { Avatar } from "@/components/ui/misc";
import { Table, TBody, THead, TableWrap } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FilterBar,
  PageHeader,
  SegmentedControl,
  SourceBadge,
  StatusBadge,
} from "@/components/admin/shared";
import { DayGrid, type DropProposal } from "@/components/admin/day-grid";
import { AppointmentDrawer } from "@/components/admin/appointment-drawer";
import { NewAppointmentDialog } from "@/components/admin/new-appointment-dialog";
import { useStore } from "@/lib/store";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import {
  addDays,
  addMinutes,
  cn,
  formatDatePL,
  fromISODate,
  isoWeekday,
  minutesFromClock,
  monthMatrix,
  MONTHS_PL,
  plnFormat,
  weekDates,
  WEEKDAYS_PL,
} from "@/lib/utils";

type View = "day" | "week" | "month" | "list";

export default function AppointmentsPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-[13px] text-[var(--fg-muted)]">Wczytywanie kalendarza…</div>}>
      <AppointmentsView />
    </React.Suspense>
  );
}

function AppointmentsView() {
  const params = useSearchParams();
  const { appointments, barbers, clients, services, today, moveAppointment, toast } = useStore();

  const [view, setView] = React.useState<View>("day");
  const [date, setDate] = React.useState(today);
  const [barberFilter, setBarberFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Appointment | null>(null);
  const [proposal, setProposal] = React.useState<DropProposal | null>(null);
  const [creating, setCreating] = React.useState(false);

  const activeBarbers = React.useMemo(
    () => barbers.filter((b) => b.status === "active" && (barberFilter === "all" || b.id === barberFilter)),
    [barbers, barberFilter],
  );

  // deep link from command bar: ?apt=<id>
  React.useEffect(() => {
    const id = params.get("apt");
    if (!id) return;
    const found = appointments.find((a) => a.id === id);
    if (found) {
      setDate(found.date);
      setSelected(found);
    }
  }, [params, appointments]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments.filter((a) => {
      if (barberFilter !== "all" && a.barberId !== barberFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      const client = clients.find((c) => c.id === a.clientId);
      return (
        client?.name.toLowerCase().includes(q) ||
        client?.phone.includes(q) ||
        a.booksyId?.toLowerCase().includes(q)
      );
    });
  }, [appointments, barberFilter, statusFilter, query, clients]);

  const step = view === "week" ? 7 : view === "month" ? 30 : 1;
  const rangeLabel =
    view === "day"
      ? formatDatePL(date, "long")
      : view === "week"
        ? `${formatDatePL(weekDates(date)[0])} – ${formatDatePL(weekDates(date)[6])}`
        : view === "month"
          ? `${MONTHS_PL[fromISODate(date).getMonth()]} ${fromISODate(date).getFullYear()}`
          : "Wszystkie rezerwacje";

  const confirmMove = () => {
    if (!proposal) return;
    moveAppointment(proposal.appointment.id, proposal.barberId, proposal.date, proposal.start);
    const barber = barbers.find((b) => b.id === proposal.barberId);
    toast({
      title: "Wizyta przeniesiona",
      description: `${proposal.start} · ${barber?.name}`,
      tone: "ok",
    });
    setProposal(null);
  };

  return (
    <>
      <PageHeader
        title="Rezerwacje"
        en="Appointments"
        description="Kalendarz operacyjny — barberzy w kolumnach, godziny w wierszach. Przeciągnij wizytę, aby ją przenieść."
        actions={
          <>
            <SegmentedControl
              value={view}
              onChange={(v) => setView(v)}
              options={[
                { value: "day", label: "Dzień" },
                { value: "week", label: "Tydzień" },
                { value: "month", label: "Miesiąc" },
                { value: "list", label: "Lista" },
              ]}
            />
            <Button variant="brass" size="sm" onClick={() => setCreating(true)}>
              <Plus /> Nowa rezerwacja
            </Button>
          </>
        }
      >
        <FilterBar>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => setDate(addDays(date, -step))}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDate(today)}>
              Dzisiaj
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setDate(addDays(date, step))}>
              <ChevronRight />
            </Button>
          </div>
          <span className="text-[13px] font-medium">{rangeLabel}</span>

          <span className="mx-1 h-5 w-px bg-[var(--border)]" />

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Klient, telefon, Booksy ID…"
              className="h-8 w-56 pl-8 text-[12px]"
            />
          </div>

          <NativeSelect
            value={barberFilter}
            onChange={(e) => setBarberFilter(e.target.value)}
            className="h-8 w-40 text-[12px]"
          >
            <option value="all">Wszyscy barberzy</option>
            {barbers
              .filter((b) => b.status === "active")
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </NativeSelect>

          <NativeSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 w-40 text-[12px]"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="booked">Zarezerwowana</option>
            <option value="confirmed">Potwierdzona</option>
            <option value="completed">Zrealizowana</option>
            <option value="cancelled">Anulowana</option>
            <option value="no_show">No-show</option>
          </NativeSelect>

          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--fg-subtle)]">
            <Filter className="size-3" />
            {filtered.length} rekordów
          </span>
        </FilterBar>
      </PageHeader>

      <div className="p-4 sm:p-6">
        {view === "day" ? (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            {activeBarbers.length ? (
              <DayGrid
                date={date}
                barbers={activeBarbers}
                appointments={filtered.filter((a) => a.date === date)}
                onSelect={setSelected}
                onPropose={setProposal}
              />
            ) : (
              <EmptyState title="Brak barberów spełniających filtr" />
            )}
          </div>
        ) : null}

        {view === "week" ? (
          <WeekView
            date={date}
            appointments={filtered}
            onSelect={setSelected}
            onPickDay={(d) => {
              setDate(d);
              setView("day");
            }}
          />
        ) : null}

        {view === "month" ? (
          <MonthView
            date={date}
            appointments={filtered}
            onPickDay={(d) => {
              setDate(d);
              setView("day");
            }}
          />
        ) : null}

        {view === "list" ? <ListView appointments={filtered} onSelect={setSelected} /> : null}
      </div>

      {/* reschedule confirmation */}
      <Dialog open={Boolean(proposal)} onOpenChange={(v) => !v && setProposal(null)}>
        <DialogContent className="w-[min(92vw,26rem)]">
          <DialogHeader>
            <DialogTitle>Przenieść wizytę?</DialogTitle>
            <DialogDescription>
              Zmiana dotyczy tylko kalendarza BROZONE OS. Jeśli rezerwacja pochodzi z Booksy,
              poinformuj klienta osobno.
            </DialogDescription>
          </DialogHeader>
          {proposal ? (
            <div className="space-y-3 p-5">
              <div className="grid grid-cols-2 gap-3">
                <MoveCol
                  label="Przed"
                  barber={barbers.find((b) => b.id === proposal.appointment.barberId)?.name ?? ""}
                  time={`${proposal.appointment.start}–${addMinutes(proposal.appointment.start, proposal.appointment.durationMin)}`}
                  date={formatDatePL(proposal.appointment.date)}
                />
                <MoveCol
                  highlight
                  label="Po zmianie"
                  barber={barbers.find((b) => b.id === proposal.barberId)?.name ?? ""}
                  time={`${proposal.start}–${addMinutes(proposal.start, proposal.appointment.durationMin)}`}
                  date={formatDatePL(proposal.date)}
                />
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-2.5 text-[12px]">
                <div className="font-medium">
                  {clients.find((c) => c.id === proposal.appointment.clientId)?.name}
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--fg-muted)]">
                  {proposal.appointment.serviceIds
                    .map((id) => services.find((s) => s.id === id)?.name)
                    .filter(Boolean)
                    .join(" + ")}
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setProposal(null)}>
              Anuluj
            </Button>
            <Button variant="brass" size="sm" onClick={confirmMove}>
              Przenieś wizytę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AppointmentDrawer
        appointment={selected}
        open={Boolean(selected)}
        onOpenChange={(v) => !v && setSelected(null)}
      />

      <NewAppointmentDialog open={creating} onOpenChange={setCreating} defaultDate={date} />
    </>
  );
}

function MoveCol({
  label,
  barber,
  time,
  date,
  highlight,
}: {
  label: string;
  barber: string;
  time: string;
  date: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        highlight
          ? "border-[var(--brass)] bg-[color-mix(in_oklab,var(--brass)_9%,transparent)]"
          : "border-[var(--border)]",
      )}
    >
      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">{label}</div>
      <div className="mt-1.5 text-[13px] font-semibold tabular">{time}</div>
      <div className="text-[11px] text-[var(--fg-muted)]">{date}</div>
      <div className="mt-1 truncate text-[11px]">{barber}</div>
    </div>
  );
}

/* -------------------------------- week ----------------------------------- */

function WeekView({
  date,
  appointments,
  onSelect,
  onPickDay,
}: {
  date: string;
  appointments: Appointment[];
  onSelect: (a: Appointment) => void;
  onPickDay: (d: string) => void;
}) {
  const { barbers, clients, today } = useStore();
  const days = weekDates(date);

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((d) => {
        const items = appointments
          .filter((a) => a.date === d && a.status !== "cancelled")
          .sort((a, b) => minutesFromClock(a.start) - minutesFromClock(b.start));
        const revenue = items
          .filter((a) => a.status === "completed")
          .reduce((acc, a) => acc + a.price, 0);
        return (
          <div
            key={d}
            className={cn(
              "flex flex-col overflow-hidden rounded-lg border bg-[var(--panel)]",
              d === today ? "border-[var(--brass)]" : "border-[var(--border)]",
            )}
          >
            <button
              onClick={() => onPickDay(d)}
              className="flex items-center justify-between border-b border-[var(--border)] px-2.5 py-2 text-left transition-colors hover:bg-[var(--panel-muted)]"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--fg-subtle)]">
                  {WEEKDAYS_PL[isoWeekday(d) - 1]}
                </div>
                <div className="text-[15px] font-semibold tabular leading-tight">
                  {fromISODate(d).getDate()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] tabular font-medium">{items.length}</div>
                <div className="text-[9px] text-[var(--fg-subtle)]">
                  {plnFormat(revenue, { compact: true })}
                </div>
              </div>
            </button>
            <div className="max-h-96 flex-1 space-y-1 overflow-y-auto p-1.5">
              {items.length === 0 ? (
                <p className="px-1.5 py-6 text-center text-[11px] text-[var(--fg-subtle)]">
                  Brak wizyt
                </p>
              ) : (
                items.map((a) => {
                  const barber = barbers.find((b) => b.id === a.barberId);
                  return (
                    <button
                      key={a.id}
                      onClick={() => onSelect(a)}
                      className="w-full rounded-md border px-1.5 py-1 text-left transition-transform hover:-translate-y-px"
                      style={{
                        borderColor: `color-mix(in oklab, ${barber?.color} 45%, transparent)`,
                        background: `color-mix(in oklab, ${barber?.color} 12%, var(--panel))`,
                      }}
                    >
                      <div className="flex items-center gap-1 text-[10px] font-semibold tabular">
                        {a.start}
                        <span
                          className="ml-auto size-1.5 rounded-full"
                          style={{ background: barber?.color }}
                        />
                      </div>
                      <div className="truncate text-[11px]">
                        {clients.find((c) => c.id === a.clientId)?.name}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------- month ---------------------------------- */

function MonthView({
  date,
  appointments,
  onPickDay,
}: {
  date: string;
  appointments: Appointment[];
  onPickDay: (d: string) => void;
}) {
  const { today, barbers } = useStore();
  const colorOf = React.useCallback(
    (barberId: string) => barbers.find((b) => b.id === barberId)?.color ?? "var(--brass)",
    [barbers],
  );
  const cells = monthMatrix(date);
  const month = fromISODate(date).getMonth();

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
      <div className="grid grid-cols-7 border-b border-[var(--border)]">
        {WEEKDAYS_PL.map((w) => (
          <div
            key={w}
            className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-subtle)]"
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const items = appointments.filter((a) => a.date === d && a.status !== "cancelled");
          const revenue = items
            .filter((a) => a.status === "completed")
            .reduce((acc, a) => acc + a.price, 0);
          const outside = fromISODate(d).getMonth() !== month;
          return (
            <motion.button
              key={d}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.004 }}
              onClick={() => onPickDay(d)}
              className={cn(
                "group relative min-h-24 border-b border-r border-[var(--border)] p-1.5 text-left transition-colors hover:bg-[var(--panel-muted)]",
                outside && "opacity-40",
                d === today && "bg-[color-mix(in_oklab,var(--brass)_7%,transparent)]",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-[12px] tabular",
                    d === today && "font-bold text-[var(--brass)]",
                  )}
                >
                  {fromISODate(d).getDate()}
                </span>
                {items.length ? (
                  <span className="text-[10px] tabular text-[var(--fg-subtle)]">{items.length}</span>
                ) : null}
              </div>
              {items.length ? (
                <>
                  <div className="mt-1.5 flex flex-wrap gap-0.5">
                    {items.slice(0, 8).map((a) => (
                      <span
                        key={a.id}
                        className="h-1 w-3 rounded-full"
                        style={{ background: colorOf(a.barberId) }}
                      />
                    ))}
                  </div>
                  <div className="mt-1 text-[10px] tabular text-[var(--fg-subtle)]">
                    {plnFormat(revenue, { compact: true })}
                  </div>
                </>
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- list ---------------------------------- */

function ListView({
  appointments,
  onSelect,
}: {
  appointments: Appointment[];
  onSelect: (a: Appointment) => void;
}) {
  const { barbers, clients, services } = useStore();
  const [limit, setLimit] = React.useState(40);

  const sorted = React.useMemo(
    () =>
      [...appointments].sort((a, b) =>
        a.date === b.date
          ? minutesFromClock(a.start) - minutesFromClock(b.start)
          : a.date < b.date
            ? 1
            : -1,
      ),
    [appointments],
  );

  if (!sorted.length) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <EmptyState
          icon={CalendarDays}
          title="Brak rezerwacji"
          description="Zmień filtry lub dodaj nową rezerwację ręcznie."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
      <TableWrap className="max-h-[calc(100dvh-16rem)] overflow-y-auto">
        <Table>
          <THead>
            <tr>
              <th>Data</th>
              <th>Godzina</th>
              <th>Klient</th>
              <th>Barber</th>
              <th>Usługa</th>
              <th>Źródło</th>
              <th>Status</th>
              <th className="text-right">Kwota</th>
            </tr>
          </THead>
          <TBody>
            {sorted.slice(0, limit).map((a) => {
              const barber = barbers.find((b) => b.id === a.barberId);
              const client = clients.find((c) => c.id === a.clientId);
              return (
                <tr key={a.id} onClick={() => onSelect(a)} className="cursor-pointer">
                  <td className="whitespace-nowrap tabular">{formatDatePL(a.date)}</td>
                  <td className="whitespace-nowrap tabular">
                    {a.start}–{addMinutes(a.start, a.durationMin)}
                  </td>
                  <td className="whitespace-nowrap font-medium">{client?.name}</td>
                  <td>
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <Avatar
                        src={barber?.photoUrl}
                        name={barber?.name ?? ""}
                        ring={barber?.color}
                        className="size-6"
                      />
                      {barber?.name}
                    </span>
                  </td>
                  <td className="max-w-48 truncate text-[var(--fg-muted)]">
                    {a.serviceIds
                      .map((id) => services.find((s) => s.id === id)?.name)
                      .filter(Boolean)
                      .join(" + ")}
                  </td>
                  <td>
                    <SourceBadge source={a.source} />
                  </td>
                  <td>
                    <StatusBadge status={a.status as AppointmentStatus} />
                  </td>
                  <td className="whitespace-nowrap text-right font-medium tabular">
                    {plnFormat(a.price, { compact: true })}
                  </td>
                </tr>
              );
            })}
          </TBody>
        </Table>
      </TableWrap>
      {limit < sorted.length ? (
        <div className="border-t border-[var(--border)] p-2 text-center">
          <Button variant="ghost" size="sm" onClick={() => setLimit((l) => l + 40)}>
            Pokaż więcej ({sorted.length - limit})
          </Button>
        </div>
      ) : (
        <div className="border-t border-[var(--border)] px-3 py-2 text-[11px] text-[var(--fg-subtle)]">
          Wyświetlono wszystkie {sorted.length} rezerwacji
          <Badge tone="outline" size="sm" className="ml-2">
            koniec listy
          </Badge>
        </div>
      )}
    </div>
  );
}
