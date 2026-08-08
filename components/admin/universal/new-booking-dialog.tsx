"use client";

import * as React from "react";
import { Check, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import {
  createBooking,
  fetchSlots,
  useClients,
  useServices,
  useStaff,
} from "@/lib/booking/use-api";
import { CATEGORY_COLOR, CATEGORY_LABEL, priceLabel, type Category } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Dodawanie wizyty w trzech krokach na jednym ekranie: kto → co → kiedy.
   Przycisk zapisu budzi się dopiero, gdy wszystkie trzy są wypełnione.
-------------------------------------------------------------------------- */

const CATEGORIES: Category[] = ["barber", "tattoo", "massage"];

export function NewBookingDialog({
  open,
  onOpenChange,
  defaultDate,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDate: string;
  onCreated: () => void;
}) {
  const [category, setCategory] = React.useState<Category>("barber");
  const [serviceId, setServiceId] = React.useState("");
  const [staffId, setStaffId] = React.useState("");
  const [date, setDate] = React.useState(defaultDate);
  const [time, setTime] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  const [slots, setSlots] = React.useState<{ time: string; staffId: string }[] | null>(null);
  const [slotsLoading, setSlotsLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const services = useServices(category);
  const staff = useStaff(category);
  const clients = useClients(query);

  React.useEffect(() => {
    if (!open) return;
    setDate(defaultDate);
    setTime("");
    setError(null);
  }, [open, defaultDate]);

  // zmiana kategorii resetuje wybór usługi i osoby
  React.useEffect(() => {
    setServiceId("");
    setStaffId("");
    setTime("");
  }, [category]);

  React.useEffect(() => {
    if (!serviceId || !date) {
      setSlots(null);
      return;
    }
    let alive = true;
    setSlotsLoading(true);
    fetchSlots({ date, serviceId, staffId: staffId || undefined })
      .then((result) => alive && setSlots(result))
      .catch(() => alive && setSlots([]))
      .finally(() => alive && setSlotsLoading(false));
    return () => {
      alive = false;
    };
  }, [serviceId, staffId, date]);

  const uniqueSlots = React.useMemo(() => {
    const map = new Map<string, { time: string; staffId: string }>();
    for (const slot of slots ?? []) if (!map.has(slot.time)) map.set(slot.time, slot);
    return [...map.values()];
  }, [slots]);

  const ready = Boolean(serviceId && date && time && clientName.trim() && clientPhone.trim());

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const chosen = uniqueSlots.find((s) => s.time === time);
      await createBooking({
        date,
        timeStart: time,
        serviceId,
        staffId: staffId || chosen?.staffId,
        clientName,
        clientPhone,
        status: "confirmed",
        source: "manual",
        consentRodo: true,
      });
      onCreated();
      onOpenChange(false);
      setClientName("");
      setClientPhone("");
      setQuery("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,44rem)]">
        <DialogHeader>
          <DialogTitle>Dodaj wizytę</DialogTitle>
          <DialogDescription>
            Wizyta dodana tutaj jest od razu potwierdzona — zakładamy, że rozmawiasz z klientem.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[64vh] space-y-5 overflow-y-auto p-5">
          {/* 1. kto */}
          <Step number={1} title="Kto przychodzi">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj po nazwisku lub telefonie…"
                className="pl-8"
              />
            </div>

            {query && clients.data?.length ? (
              <div className="mt-2 max-h-32 divide-y divide-[var(--border)] overflow-y-auto rounded-md border border-[var(--border)]">
                {clients.data.slice(0, 6).map((client) => (
                  <button
                    key={client.clientId}
                    onClick={() => {
                      setClientName(client.name);
                      setClientPhone(client.phone);
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12px] transition-colors hover:bg-[var(--panel-muted)]"
                  >
                    <span className="font-medium">{client.name}</span>
                    <span className="tabular text-[var(--fg-subtle)]">{client.phone}</span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Field label="Imię i nazwisko">
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </Field>
              <Field label="Telefon">
                <Input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="600 100 200"
                />
              </Field>
            </div>
          </Step>

          {/* 2. co */}
          <Step number={2} title="Co robimy">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors",
                    category === c
                      ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]"
                      : "border-[var(--border)] hover:border-[var(--border-strong)]",
                  )}
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: CATEGORY_COLOR[c] }}
                  />
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Field label="Usługa">
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] px-3 text-sm"
                >
                  <option value="">— wybierz —</option>
                  {(services.data ?? [])
                    .filter((s) => s.active)
                    .map((s) => (
                      <option key={s.serviceId} value={s.serviceId}>
                        {s.name} · {s.durationMinutes} min · {priceLabel(s)}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Specjalista" hint="Puste = pierwszy wolny">
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] px-3 text-sm"
                >
                  <option value="">Dowolny</option>
                  {(staff.data ?? [])
                    .filter((s) => s.active)
                    .map((s) => (
                      <option key={s.staffId} value={s.staffId}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </Field>
            </div>
          </Step>

          {/* 3. kiedy */}
          <Step number={3} title="Kiedy">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

            <div className="mt-3">
              {!serviceId ? (
                <p className="text-[12px] text-[var(--fg-muted)]">
                  Najpierw wybierz usługę — wtedy pokażemy wolne godziny.
                </p>
              ) : slotsLoading ? (
                <p className="text-[12px] text-[var(--fg-muted)]">Szukamy wolnych godzin…</p>
              ) : uniqueSlots.length ? (
                <div className="grid max-h-40 grid-cols-5 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-8">
                  {uniqueSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setTime(slot.time)}
                      className={cn(
                        "rounded-md border px-1 py-1.5 text-[12px] tabular transition-colors",
                        time === slot.time
                          ? "border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--brand-white)]"
                          : "border-[var(--border)] hover:border-[var(--accent)]",
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[var(--fg-muted)]">
                  W tym dniu nie ma wolnych godzin. Wybierz inny dzień albo innego specjalistę.
                </p>
              )}
            </div>
          </Step>

          {error ? (
            <p
              role="alert"
              className="rounded-md border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2 text-[12px] text-[var(--danger)]"
            >
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Wróć
          </Button>
          <Button variant="accent" size="sm" disabled={!ready || saving} onClick={submit}>
            {saving ? <Loader2 className="animate-spin" /> : <Check />} Zapisz wizytę
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-full bg-[var(--panel-muted)] text-[11px] font-bold tabular text-[var(--accent)]">
          {number}
        </span>
        <h3 className="text-[13px] font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}
