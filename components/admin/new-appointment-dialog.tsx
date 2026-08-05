"use client";

import * as React from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, NativeSelect } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { slotsFor } from "@/lib/availability";
import type { AppointmentSource } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NewAppointmentDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultBarberId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDate: string;
  defaultBarberId?: string;
}) {
  const { barbers, services, clients, appointments, createAppointment, toast } = useStore();
  const activeBarbers = barbers.filter((b) => b.status === "active");
  const activeServices = services.filter((s) => s.active);

  const [barberId, setBarberId] = React.useState(defaultBarberId ?? activeBarbers[0]?.id ?? "");
  const [serviceId, setServiceId] = React.useState(activeServices[0]?.id ?? "");
  const [clientId, setClientId] = React.useState(clients[0]?.id ?? "");
  const [date, setDate] = React.useState(defaultDate);
  const [start, setStart] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<AppointmentSource>("manual");

  React.useEffect(() => {
    if (open) {
      setDate(defaultDate);
      setStart(null);
      if (defaultBarberId) setBarberId(defaultBarberId);
    }
  }, [open, defaultDate, defaultBarberId]);

  const barber = activeBarbers.find((b) => b.id === barberId);
  const service = activeServices.find((s) => s.id === serviceId);

  const slots =
    barber && service ? slotsFor({ barber, date, service, appointments }) : [];

  const submit = () => {
    if (!barber || !service || !start) return;
    createAppointment({
      clientId,
      barberId: barber.id,
      serviceIds: [service.id],
      date,
      start,
      durationMin: service.durationMin,
      status: "confirmed",
      source,
      price: service.price,
      paymentMethod: "unpaid",
    });
    toast({
      title: "Rezerwacja dodana",
      description: `${date} ${start} · ${barber.name}`,
      tone: "ok",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,40rem)]">
        <DialogHeader>
          <DialogTitle>Nowa rezerwacja</DialogTitle>
          <DialogDescription>
            Wizyta zapisana lokalnie w BROZONE OS. Nie trafia automatycznie do Booksy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Klient">
              <NativeSelect value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.slice(0, 40).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.phone}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Źródło">
              <NativeSelect
                value={source}
                onChange={(e) => setSource(e.target.value as AppointmentSource)}
              >
                <option value="manual">Manual (telefon)</option>
                <option value="walkin">Walk-in</option>
                <option value="website">Website</option>
                <option value="booksy">Booksy (przepisana)</option>
              </NativeSelect>
            </Field>
            <Field label="Usługa">
              <NativeSelect value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                {activeServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.durationMin} min · {s.price} zł
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Barber">
              <NativeSelect value={barberId} onChange={(e) => setBarberId(e.target.value)}>
                {activeBarbers
                  .filter((b) => !service || b.serviceIds.includes(service.id))
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </NativeSelect>
            </Field>
            <Field label="Data" className="sm:col-span-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
              Godzina
            </p>
            {slots.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-6 text-center text-[12px] text-[var(--fg-muted)]">
                Barber nie pracuje w tym dniu.
              </div>
            ) : (
              <div className="grid max-h-40 grid-cols-6 gap-1.5 overflow-y-auto pr-1">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    disabled={!s.available}
                    onClick={() => setStart(s.time)}
                    className={cn(
                      "rounded-md border px-1 py-1.5 text-[12px] tabular transition-colors",
                      start === s.time
                        ? "border-[var(--brass)] bg-[var(--brass)] font-semibold text-[#0b0c0d]"
                        : s.available
                          ? "border-[var(--border)] hover:border-[var(--brass)]"
                          : "cursor-not-allowed border-transparent text-[var(--fg-subtle)] line-through opacity-40",
                    )}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button variant="brass" size="sm" onClick={submit} disabled={!start}>
            <Check /> Dodaj rezerwację
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
