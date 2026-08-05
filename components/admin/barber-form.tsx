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
import { Field, Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/misc";
import { useStore } from "@/lib/store";
import type { Barber } from "@/lib/types";
import { cn, uid, WEEKDAYS_PL } from "@/lib/utils";

const COLORS = ["#c8a55b", "#4cc2ff", "#9d7bff", "#3ecf8e", "#f0674f", "#e3b341", "#ff8bd1"];

const emptyBarber = (): Barber => ({
  id: uid("brb"),
  name: "",
  photoUrl: "",
  specialization: "",
  serviceIds: [],
  workingHours: Array.from({ length: 7 }, (_, i) => ({
    weekday: i + 1,
    start: "10:00",
    end: "20:00",
    enabled: i < 5,
  })),
  daysOff: [],
  commissionPct: 40,
  color: COLORS[0],
  phone: "",
  email: "",
  hiredAt: new Date().toISOString().slice(0, 10),
  status: "active",
  rating: 5,
});

export function BarberFormDialog({
  open,
  onOpenChange,
  barber,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barber?: Barber | null;
}) {
  const { services, upsertBarber, toast } = useStore();
  const [draft, setDraft] = React.useState<Barber>(barber ?? emptyBarber());
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDraft(barber ? { ...barber } : emptyBarber());
      setError(null);
    }
  }, [open, barber]);

  const patch = (p: Partial<Barber>) => setDraft((d) => ({ ...d, ...p }));

  const submit = () => {
    if (!draft.name.trim()) return setError("Imię i nazwisko są wymagane.");
    if (!draft.serviceIds.length) return setError("Wybierz przynajmniej jedną usługę.");
    upsertBarber(draft);
    toast({ title: barber ? "Barber zaktualizowany" : "Barber dodany", tone: "ok" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,46rem)]">
        <DialogHeader>
          <DialogTitle>{barber ? "Edytuj barbera" : "Nowy barber"}</DialogTitle>
          <DialogDescription>
            Dane zespołu zasilają kalendarz, grafik, prowizje i ewidencję czasu pracy.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[62vh] space-y-4 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Imię i nazwisko">
              <Input value={draft.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Jan Kowalski" />
            </Field>
            <Field label="Specjalizacja">
              <Input
                value={draft.specialization}
                onChange={(e) => patch({ specialization: e.target.value })}
                placeholder="Fade & classic"
              />
            </Field>
            <Field label="Telefon">
              <Input value={draft.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="+48 600 000 000" />
            </Field>
            <Field label="E-mail">
              <Input value={draft.email} onChange={(e) => patch({ email: e.target.value })} placeholder="imie@brozone.pl" />
            </Field>
            <Field label="URL zdjęcia" className="sm:col-span-2">
              <Input
                value={draft.photoUrl}
                onChange={(e) => patch({ photoUrl: e.target.value })}
                placeholder="https://…"
              />
            </Field>
            <Field label="Prowizja %">
              <Input
                type="number"
                min={0}
                max={100}
                value={draft.commissionPct}
                onChange={(e) => patch({ commissionPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Link do profilu Booksy">
              <Input
                value={draft.booksyProfileUrl ?? ""}
                onChange={(e) => patch({ booksyProfileUrl: e.target.value })}
                placeholder="https://booksy.com/…"
              />
            </Field>
          </div>

          <Field label="Kolor w kalendarzu">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => patch({ color: c })}
                  className={cn(
                    "size-7 rounded-md border-2 transition-transform hover:scale-110",
                    draft.color === c ? "border-[var(--fg)]" : "border-transparent",
                  )}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </Field>

          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
              Usługi
            </p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {services.map((s) => {
                const on = draft.serviceIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() =>
                      patch({
                        serviceIds: on
                          ? draft.serviceIds.filter((id) => id !== s.id)
                          : [...draft.serviceIds, s.id],
                      })
                    }
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-[12px] transition-colors",
                      on
                        ? "border-[var(--brass)] bg-[color-mix(in_oklab,var(--brass)_10%,transparent)]"
                        : "border-[var(--border)] hover:border-[var(--border-strong)]",
                    )}
                  >
                    <span className="truncate">{s.name}</span>
                    {on ? <Check className="size-3.5 shrink-0 text-[var(--brass)]" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
              Godziny pracy
            </p>
            <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
              {draft.workingHours.map((h, i) => (
                <div key={h.weekday} className="flex items-center gap-3 px-3 py-2">
                  <span className="w-10 text-[12px] font-medium">{WEEKDAYS_PL[h.weekday - 1]}</span>
                  <Switch
                    checked={h.enabled}
                    onCheckedChange={(v) => {
                      const next = [...draft.workingHours];
                      next[i] = { ...h, enabled: v };
                      patch({ workingHours: next });
                    }}
                  />
                  <Input
                    type="time"
                    value={h.start}
                    disabled={!h.enabled}
                    onChange={(e) => {
                      const next = [...draft.workingHours];
                      next[i] = { ...h, start: e.target.value };
                      patch({ workingHours: next });
                    }}
                    className="h-8 w-28 text-[12px]"
                  />
                  <span className="text-[var(--fg-subtle)]">–</span>
                  <Input
                    type="time"
                    value={h.end}
                    disabled={!h.enabled}
                    onChange={(e) => {
                      const next = [...draft.workingHours];
                      next[i] = { ...h, end: e.target.value };
                      patch({ workingHours: next });
                    }}
                    className="h-8 w-28 text-[12px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {error ? (
            <p className="rounded-md border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2 text-[12px] text-[var(--danger)]">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button variant="brass" size="sm" onClick={submit}>
            <Check /> Zapisz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
