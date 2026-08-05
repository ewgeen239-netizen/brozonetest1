"use client";

import * as React from "react";
import Link from "next/link";
import {
  Ban,
  Banknote,
  CalendarClock,
  Check,
  CreditCard,
  ExternalLink,
  Phone,
  Scissors,
  Trash2,
  TriangleAlert,
  UserX,
} from "lucide-react";
import { Drawer } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, Separator } from "@/components/ui/misc";
import { Field, Textarea } from "@/components/ui/input";
import { SourceBadge, STATUS_LABEL } from "./shared";
import { useStore } from "@/lib/store";
import type { Appointment, AppointmentStatus, PaymentMethod } from "@/lib/types";
import { addMinutes, durationLabel, formatDatePL, plnFormat, relativeTimePL } from "@/lib/utils";

const STATUS_FLOW: AppointmentStatus[] = [
  "booked",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

const PAYMENTS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: "cash", label: "Gotówka", icon: Banknote },
  { value: "card", label: "Karta", icon: CreditCard },
  { value: "transfer", label: "Przelew", icon: CalendarClock },
  { value: "unpaid", label: "Nieopłacone", icon: Ban },
];

export function AppointmentDrawer({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { barbers, clients, services, updateAppointment, toast } = useStore();
  const [note, setNote] = React.useState("");

  React.useEffect(() => setNote(appointment?.note ?? ""), [appointment?.id, appointment?.note]);

  if (!appointment) return null;

  const barber = barbers.find((b) => b.id === appointment.barberId);
  const client = clients.find((c) => c.id === appointment.clientId);
  const items = appointment.serviceIds.map((id) => services.find((s) => s.id === id)).filter(Boolean);

  const setStatus = (status: AppointmentStatus) => {
    updateAppointment(appointment.id, { status });
    toast({ title: "Status zmieniony", description: STATUS_LABEL[status], tone: "ok" });
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      width="30rem"
      title={
        <span className="flex items-center gap-2">
          {client?.name ?? "Rezerwacja"}
          <SourceBadge source={appointment.source} />
        </span>
      }
      description={`${formatDatePL(appointment.date, "long")} · ${appointment.start}–${addMinutes(appointment.start, appointment.durationMin)}`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Zamknij
          </Button>
          <Button variant="brass" size="sm" onClick={() => {
            updateAppointment(appointment.id, { note });
            toast({ title: "Zapisano", tone: "ok" });
            onOpenChange(false);
          }}>
            <Check /> Zapisz
          </Button>
        </>
      }
    >
      <div className="space-y-5 p-5">
        {appointment.conflict && !appointment.conflict.resolved ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)] p-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--warn)]" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium">Konflikt z Booksy</p>
              <p className="mt-0.5 text-[11px] text-[var(--fg-muted)]">
                Rekord zmienił się po obu stronach. Wymaga decyzji.
              </p>
              <Button asChild variant="outline" size="xs" className="mt-2">
                <Link href="/admin/booksy">Otwórz resolver</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {/* status */}
        <section>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
            Status
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={
                  appointment.status === s
                    ? "rounded-md border border-[var(--brass)] bg-[color-mix(in_oklab,var(--brass)_14%,transparent)] px-2.5 py-1 text-[12px] font-medium text-[var(--brass)]"
                    : "rounded-md border border-[var(--border)] px-2.5 py-1 text-[12px] text-[var(--fg-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--fg)]"
                }
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* barber + client */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[var(--border)] p-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">Barber</p>
            <div className="mt-2 flex items-center gap-2">
              <Avatar src={barber?.photoUrl} name={barber?.name ?? ""} ring={barber?.color} />
              <div className="min-w-0">
                <div className="truncate text-[12px] font-medium">{barber?.name}</div>
                <div className="truncate text-[10px] text-[var(--fg-subtle)]">
                  {barber?.specialization}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] p-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">Klient</p>
            <div className="mt-2">
              <div className="truncate text-[12px] font-medium">{client?.name}</div>
              <a
                href={`tel:${client?.phone}`}
                className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--fg-muted)] hover:text-[var(--brass)]"
              >
                <Phone className="size-3" /> {client?.phone}
              </a>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <Badge size="sm" tone={client?.tier === "vip" ? "brass" : client?.tier === "risk" ? "danger" : "neutral"}>
                  {client?.tier?.toUpperCase()}
                </Badge>
                <Badge size="sm" tone="outline">
                  {client?.visits} wizyt
                </Badge>
                {client?.noShows ? (
                  <Badge size="sm" tone="danger">
                    <UserX className="size-2.5" /> {client.noShows}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* services */}
        <section>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
            Usługi
          </p>
          <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
            {items.map((s) => (
              <div key={s!.id} className="flex items-center gap-2 px-3 py-2">
                <Scissors className="size-3.5 text-[var(--fg-subtle)]" />
                <span className="text-[12px]">{s!.name}</span>
                <span className="ml-auto text-[11px] text-[var(--fg-subtle)]">
                  {durationLabel(s!.durationMin)}
                </span>
                <span className="w-16 text-right text-[12px] font-medium tabular">
                  {plnFormat(s!.price, { compact: true })}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 bg-[var(--panel-muted)] px-3 py-2">
              <span className="text-[12px] font-medium">Razem</span>
              <span className="ml-auto text-[11px] text-[var(--fg-subtle)]">
                {durationLabel(appointment.durationMin)}
              </span>
              <span className="w-16 text-right text-[13px] font-semibold tabular">
                {plnFormat(appointment.price, { compact: true })}
              </span>
            </div>
          </div>
        </section>

        {/* payment */}
        <section>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
            Płatność
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {PAYMENTS.map((p) => (
              <button
                key={p.value}
                onClick={() => updateAppointment(appointment.id, { paymentMethod: p.value })}
                className={
                  appointment.paymentMethod === p.value
                    ? "flex flex-col items-center gap-1 rounded-md border border-[var(--brass)] bg-[color-mix(in_oklab,var(--brass)_12%,transparent)] px-2 py-2 text-[11px] text-[var(--brass)]"
                    : "flex flex-col items-center gap-1 rounded-md border border-[var(--border)] px-2 py-2 text-[11px] text-[var(--fg-muted)] transition-colors hover:border-[var(--border-strong)]"
                }
              >
                <p.icon className="size-3.5" />
                {p.label}
              </button>
            ))}
          </div>
          {appointment.tip ? (
            <p className="mt-2 text-[11px] text-[var(--fg-muted)]">
              Napiwek: <span className="tabular font-medium">{plnFormat(appointment.tip)}</span>
            </p>
          ) : null}
        </section>

        {/* note */}
        <Field label="Notatka">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Preferencje klienta, ustalenia…"
          />
        </Field>

        {/* meta */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3 text-[11px] text-[var(--fg-muted)]">
          <div className="flex justify-between gap-3">
            <span>Utworzona</span>
            <span className="tabular">{relativeTimePL(appointment.createdAt)}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span>Ostatnia zmiana</span>
            <span className="tabular">{relativeTimePL(appointment.updatedAt)}</span>
          </div>
          {appointment.booksyId ? (
            <div className="mt-1 flex justify-between gap-3">
              <span>Booksy ID</span>
              <span className="flex items-center gap-1 font-mono">
                {appointment.booksyId}
                <ExternalLink className="size-3" />
              </span>
            </div>
          ) : null}
        </section>

        <Button
          variant="danger"
          size="sm"
          className="w-full"
          onClick={() => {
            setStatus("cancelled");
            onOpenChange(false);
          }}
        >
          <Trash2 /> Anuluj rezerwację
        </Button>
      </div>
    </Drawer>
  );
}
