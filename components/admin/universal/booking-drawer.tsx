"use client";

import * as React from "react";
import {
  AlertTriangle,
  Ban,
  Banknote,
  CalendarClock,
  CreditCard,
  Check,
  Clock,
  Loader2,
  Phone,
  Sparkles,
  UserX,
} from "lucide-react";
import { Drawer } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Separator } from "@/components/ui/misc";
import { CategoryTag, SourceTag, StatusPill } from "./badges";
import type { Booking, BookingStatus, PaymentMethod } from "@/lib/booking/types";
import { PAYMENT_LABEL } from "@/lib/booking/types";
import {
  fetchSlots,
  formatDateLong,
  rescheduleBooking,
  setBookingStatus,
} from "@/lib/booking/use-api";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Panel szczegółów wizyty. Cztery duże działania na wierzchu, reszta poniżej.
   Dwa kliknięcia do celu — patrz Simple_UX_Rules.md, punkt 9.
-------------------------------------------------------------------------- */

export function BookingDrawer({
  booking,
  open,
  onOpenChange,
  onChanged,
  readOnly = false,
}: {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChanged: () => void;
  readOnly?: boolean;
}) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [rescheduling, setRescheduling] = React.useState(false);
  const [paying, setPaying] = React.useState(false);
  const [tip, setTip] = React.useState("");

  React.useEffect(() => {
    setNote(booking?.notes ?? "");
    setError(null);
    setConfirmCancel(false);
    setRescheduling(false);
    setPaying(false);
    setTip("");
  }, [booking?.bookingId, booking?.notes]);

  if (!booking) return null;

  const run = async (label: string, action: () => Promise<unknown>) => {
    setBusy(label);
    setError(null);
    try {
      await action();
      onChanged();
      if (label !== "note") onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const changeStatus = (
    status: BookingStatus,
    label: string,
    extra?: { paymentMethod?: PaymentMethod; tip?: number },
  ) => run(label, () => setBookingStatus(booking.bookingId, status, { note: note || undefined, ...extra }));

  const done = booking.status === "completed";
  const dead = booking.status === "cancelled" || booking.status === "no_show";

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      width="30rem"
      title={
        <span className="flex flex-wrap items-center gap-2">
          {booking.clientName}
          <CategoryTag category={booking.category} />
        </span>
      }
      description={`${formatDateLong(booking.date)} · ${booking.timeStart}–${booking.timeEnd}`}
    >
      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <StatusPill status={booking.status} />
          <SourceTag source={booking.source} />
        </div>

        {/* główne działania */}
        {!readOnly && !done && !dead ? (
          <div className="space-y-2">
            {booking.status === "new" ? (
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                disabled={busy !== null}
                onClick={() => changeStatus("confirmed", "confirm")}
              >
                {busy === "confirm" ? <Loader2 className="animate-spin" /> : <Check />}
                Potwierdź
              </Button>
            ) : (
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                disabled={busy !== null}
                onClick={() => setPaying((v) => !v)}
              >
                <Check /> Wykonane
              </Button>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() => setRescheduling((v) => !v)}
              >
                <CalendarClock /> Zmień termin
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() => changeStatus("no_show", "noshow")}
              >
                <UserX /> Nie przyszedł
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={busy !== null}
                onClick={() => setConfirmCancel(true)}
              >
                <Ban /> Anuluj
              </Button>
            </div>
          </div>
        ) : null}

        {confirmCancel ? (
          <div className="rounded-lg border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] p-3">
            <p className="text-[13px] font-medium">Anulować wizytę?</p>
            <p className="mt-1 text-[12px] text-[var(--fg-muted)]">
              Klient nie dostanie automatycznego powiadomienia — zadzwoń do niego.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(false)}>
                Wróć
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="ml-auto"
                disabled={busy !== null}
                onClick={() => changeStatus("cancelled", "cancel")}
              >
                Anuluj wizytę
              </Button>
            </div>
          </div>
        ) : null}

        {paying ? (
          <div className="rounded-lg border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent)_7%,transparent)] p-3">
            <p className="text-[13px] font-medium">Jak klient zapłacił?</p>
            <p className="mt-0.5 text-[12px] text-[var(--fg-muted)]">
              Kwota {booking.price} zł. Gotówka trafi do raportu kasowego.
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {(
                [
                  { value: "cash", label: "Gotówka", icon: Banknote },
                  { value: "card", label: "Karta", icon: CreditCard },
                  { value: "transfer", label: "Przelew", icon: CalendarClock },
                ] as const
              ).map((option) => (
                <Button
                  key={option.value}
                  variant={option.value === "cash" ? "accent" : "outline"}
                  disabled={busy !== null}
                  onClick={() =>
                    changeStatus("completed", "complete", {
                      paymentMethod: option.value,
                      tip: tip ? Number(tip) : undefined,
                    })
                  }
                >
                  {busy === "complete" ? <Loader2 className="animate-spin" /> : <option.icon />}
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="mt-3 flex items-end gap-2">
              <Field label="Napiwek (zł)" className="flex-1">
                <Input
                  type="number"
                  min={0}
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  placeholder="0"
                  className="h-9"
                />
              </Field>
              <Button variant="ghost" size="sm" onClick={() => setPaying(false)}>
                Wróć
              </Button>
            </div>
          </div>
        ) : null}

        {rescheduling ? (
          <RescheduleBox
            booking={booking}
            busy={busy !== null}
            onCancel={() => setRescheduling(false)}
            onPick={(date, time) =>
              run("move", () => rescheduleBooking(booking.bookingId, date, time))
            }
          />
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2 text-[12px] text-[var(--danger)]"
          >
            {error}
          </p>
        ) : null}

        <Separator />

        <Section title="Klient">
          <div className="text-[13px] font-medium">{booking.clientName}</div>
          <a
            href={`tel:${booking.clientPhone}`}
            className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--fg-muted)] hover:text-[var(--accent)]"
          >
            <Phone className="size-3" /> {booking.clientPhone}
          </a>
          {booking.clientEmail ? (
            <div className="text-[12px] text-[var(--fg-subtle)]">{booking.clientEmail}</div>
          ) : null}
        </Section>

        <Section title="Usługa">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-medium">{booking.serviceName}</span>
            <span className="whitespace-nowrap text-[14px] font-semibold tabular">
              {booking.price} zł
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--fg-muted)]">
            <Clock className="size-3" /> {booking.timeStart}–{booking.timeEnd} · {booking.staffName}
          </div>
          {booking.status === "completed" ? (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--ok)_40%,transparent)] bg-[color-mix(in_oklab,var(--ok)_10%,transparent)] px-2 py-0.5 text-[11px] text-[var(--ok)]">
              <Banknote className="size-3" /> {PAYMENT_LABEL[booking.paymentMethod]}
              {booking.tip ? ` · napiwek ${booking.tip} zł` : ""}
            </div>
          ) : null}
          {booking.deposit > 0 ? (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)] px-2 py-0.5 text-[11px] text-[var(--warn)]">
              <Sparkles className="size-3" /> Zadatek {booking.deposit} zł
            </div>
          ) : null}
        </Section>

        {booking.tattoo ? (
          <Section title="Projekt tatuażu">
            <Row label="Pomysł" value={booking.tattoo.idea || "—"} />
            <Row label="Miejsce" value={booking.tattoo.placement} />
            <Row label="Rozmiar" value={booking.tattoo.size} />
            {booking.tattoo.reference ? (
              <Row label="Inspiracja" value={booking.tattoo.reference} />
            ) : null}
            <Row
              label="Konsultacja"
              value={booking.tattoo.consultationDone ? "odbyta" : "wymagana"}
            />
          </Section>
        ) : null}

        {booking.massage ? (
          <Section title="Preferencje masażu">
            <Row label="Nacisk" value={booking.massage.pressure} />
            <Row label="Obszar" value={booking.massage.focus} />
            {booking.massage.contraindications ? (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-[color-mix(in_oklab,var(--warn)_45%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)] p-2.5">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-[var(--warn)]" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--warn)]">
                    Przeciwwskazania
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed">
                    {booking.massage.contraindications}
                  </p>
                </div>
              </div>
            ) : null}
          </Section>
        ) : null}

        <Field label="Notatka">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ustalenia, preferencje, uwagi po wizycie…"
            disabled={readOnly}
          />
          {!readOnly ? (
            <Button
              variant="subtle"
              size="sm"
              className="mt-2"
              disabled={busy !== null || note === (booking.notes ?? "")}
              onClick={() => changeStatus(booking.status, "note")}
            >
              {busy === "note" ? <Loader2 className="animate-spin" /> : <Check />} Zapisz notatkę
            </Button>
          ) : null}
        </Field>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3 text-[11px] text-[var(--fg-subtle)]">
          Numer zgłoszenia: <span className="font-mono">{booking.bookingId}</span>
          <br />
          Utworzona: {booking.createdAt}
        </div>
      </div>
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
        {title}
      </h3>
      <div className="rounded-lg border border-[var(--border)] p-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-0.5 text-[12px]">
      <span className="shrink-0 text-[var(--fg-muted)]">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

/** Wybór nowego terminu — pokazujemy tylko wolne godziny. */
function RescheduleBox({
  booking,
  busy,
  onCancel,
  onPick,
}: {
  booking: Booking;
  busy: boolean;
  onCancel: () => void;
  onPick: (date: string, time: string) => void;
}) {
  const [date, setDate] = React.useState(booking.date);
  const [slots, setSlots] = React.useState<{ time: string }[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchSlots({ date, serviceId: booking.serviceId, staffId: booking.staffId })
      .then((result) => alive && setSlots(result))
      .catch(() => alive && setSlots([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [date, booking.serviceId, booking.staffId]);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium">Nowy termin</span>
        <Button variant="ghost" size="xs" onClick={onCancel}>
          Wróć
        </Button>
      </div>

      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mt-2 h-9"
      />

      <div className="mt-3">
        {loading ? (
          <p className="text-[12px] text-[var(--fg-muted)]">Szukamy wolnych godzin…</p>
        ) : slots && slots.length ? (
          <div className="grid max-h-40 grid-cols-4 gap-1.5 overflow-y-auto pr-1">
            {slots.map((slot) => (
              <button
                key={slot.time}
                disabled={busy}
                onClick={() => onPick(date, slot.time)}
                className={cn(
                  "rounded-md border border-[var(--border)] px-1 py-1.5 text-[12px] tabular transition-colors",
                  "hover:border-[var(--accent)] hover:bg-[var(--panel)]",
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-[var(--fg-muted)]">
            W tym dniu nie ma wolnych godzin. Wybierz inny dzień.
          </p>
        )}
      </div>
    </div>
  );
}
