"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Coffee, Plane, Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, NativeSelect } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/misc";
import { ExportButtons, FilterBar, PageBody, PageHeader } from "@/components/admin/shared";
import { useStore } from "@/lib/store";
import type { ShiftKind, WorkShift } from "@/lib/types";
import {
  addDays,
  cn,
  formatDatePL,
  fromISODate,
  hoursBetween,
  isoWeekday,
  startOfWeek,
  weekDates,
  WEEKDAYS_PL,
} from "@/lib/utils";

const KIND_META: Record<ShiftKind, { label: string; tone: string; icon?: React.ElementType }> = {
  work: { label: "Praca", tone: "var(--ok)" },
  vacation: { label: "Urlop", tone: "var(--info)", icon: Plane },
  sick: { label: "L4", tone: "var(--danger)", icon: Stethoscope },
  off: { label: "Wolne", tone: "var(--fg-subtle)", icon: X },
  training: { label: "Szkolenie", tone: "var(--brass)", icon: Coffee },
};

export default function SchedulePage() {
  const { barbers, shifts, upsertShift, today, toast } = useStore();
  const [anchor, setAnchor] = React.useState(startOfWeek(today));
  const [editing, setEditing] = React.useState<{ shift: WorkShift; barberName: string } | null>(null);

  const days = weekDates(anchor);
  const activeBarbers = barbers.filter((b) => b.status === "active");

  const shiftFor = (barberId: string, date: string): WorkShift => {
    const found = shifts.find((s) => s.barberId === barberId && s.date === date);
    if (found) return found;
    const barber = barbers.find((b) => b.id === barberId)!;
    const hours = barber.workingHours.find((h) => h.weekday === isoWeekday(date));
    return {
      id: `shf_${date}_${barberId}`,
      barberId,
      date,
      kind: hours?.enabled ? "work" : "off",
      start: hours?.start ?? "10:00",
      end: hours?.end ?? "18:00",
      breakMin: hours?.enabled ? 30 : 0,
    };
  };

  const weekHours = (barberId: string) =>
    days.reduce((acc, d) => {
      const s = shiftFor(barberId, d);
      return acc + (s.kind === "work" ? hoursBetween(s.start, s.end, s.breakMin) : 0);
    }, 0);

  const exportRows = activeBarbers.flatMap((b) =>
    days.map((d) => {
      const s = shiftFor(b.id, d);
      return {
        Barber: b.name,
        Data: d,
        Dzien: WEEKDAYS_PL[isoWeekday(d) - 1],
        Typ: KIND_META[s.kind].label,
        Od: s.kind === "work" ? s.start : "",
        Do: s.kind === "work" ? s.end : "",
        Przerwa_min: s.breakMin,
        Godziny: s.kind === "work" ? hoursBetween(s.start, s.end, s.breakMin) : 0,
      };
    }),
  );

  return (
    <>
      <PageHeader
        title="Grafik pracy"
        en="Schedule"
        description="Zmiany, przerwy, urlopy i L4. Dane zasilają ewidencję czasu pracy i rozliczenie prowizji."
        actions={
          <ExportButtons filename={`grafik-${anchor}`} rows={exportRows} />
        }
      >
        <FilterBar>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => setAnchor(addDays(anchor, -7))}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAnchor(startOfWeek(today))}>
              Bieżący tydzień
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setAnchor(addDays(anchor, 7))}>
              <ChevronRight />
            </Button>
          </div>
          <span className="text-[13px] font-medium">
            {formatDatePL(days[0])} – {formatDatePL(days[6])}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {(Object.keys(KIND_META) as ShiftKind[]).map((k) => (
              <span key={k} className="flex items-center gap-1.5 text-[11px] text-[var(--fg-muted)]">
                <span className="size-2 rounded-sm" style={{ background: KIND_META[k].tone }} />
                {KIND_META[k].label}
              </span>
            ))}
          </div>
        </FilterBar>
      </PageHeader>

      <PageBody>
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="overflow-x-auto">
            <div className="min-w-[1080px]">
              {/* header */}
              <div
                className="grid border-b border-[var(--border)]"
                style={{ gridTemplateColumns: "176px repeat(7, minmax(112px, 1fr)) 88px" }}
              >
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
                  Barber
                </div>
                {days.map((d) => (
                  <div
                    key={d}
                    className={cn(
                      "border-l border-[var(--border)] px-3 py-2",
                      d === today && "bg-[color-mix(in_oklab,var(--brass)_8%,transparent)]",
                    )}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
                      {WEEKDAYS_PL[isoWeekday(d) - 1]}
                    </div>
                    <div className="text-[13px] font-medium tabular">
                      {fromISODate(d).getDate()}.{`${fromISODate(d).getMonth() + 1}`.padStart(2, "0")}
                    </div>
                  </div>
                ))}
                <div className="border-l border-[var(--border)] px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
                  Suma
                </div>
              </div>

              {/* rows */}
              {activeBarbers.map((b) => (
                <div
                  key={b.id}
                  className="grid border-b border-[var(--border)] last:border-0"
                  style={{ gridTemplateColumns: "176px repeat(7, minmax(112px, 1fr)) 88px" }}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Avatar src={b.photoUrl} name={b.name} ring={b.color} className="size-7" />
                    <div className="min-w-0">
                      <div className="truncate text-[12px] font-medium">{b.name}</div>
                      <div className="truncate text-[10px] text-[var(--fg-subtle)]">
                        {b.commissionPct}% prowizji
                      </div>
                    </div>
                  </div>

                  {days.map((d) => {
                    const s = shiftFor(b.id, d);
                    const meta = KIND_META[s.kind];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={d}
                        onClick={() => setEditing({ shift: s, barberName: b.name })}
                        className={cn(
                          "group border-l border-[var(--border)] px-2 py-2 text-left transition-colors hover:bg-[var(--panel-muted)]",
                          d === today && "bg-[color-mix(in_oklab,var(--brass)_5%,transparent)]",
                        )}
                      >
                        {s.kind === "work" ? (
                          <div
                            className="rounded-md border px-2 py-1.5"
                            style={{
                              borderColor: `color-mix(in oklab, ${b.color} 40%, transparent)`,
                              background: `color-mix(in oklab, ${b.color} 10%, transparent)`,
                            }}
                          >
                            <div className="text-[12px] font-medium tabular">
                              {s.start}–{s.end}
                            </div>
                            <div className="text-[10px] text-[var(--fg-subtle)]">
                              przerwa {s.breakMin} min
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 rounded-md border border-dashed border-[var(--border-strong)] px-2 py-2 text-[11px] text-[var(--fg-subtle)]">
                            {Icon ? <Icon className="size-3" style={{ color: meta.tone }} /> : null}
                            {meta.label}
                          </div>
                        )}
                      </button>
                    );
                  })}

                  <div className="flex items-center justify-end border-l border-[var(--border)] px-3 py-2.5">
                    <span className="text-[13px] font-semibold tabular">
                      {weekHours(b.id).toFixed(1)} h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--fg-muted)]">
          <Badge tone="outline" size="sm">Norma</Badge>
          Etat 40 h/tydz. · nadgodziny liczone powyżej 8 h dziennie i przenoszone do ewidencji czasu pracy.
        </div>
      </PageBody>

      <ShiftEditor
        editing={editing}
        onClose={() => setEditing(null)}
        onSave={(shift) => {
          upsertShift(shift);
          toast({ title: "Grafik zaktualizowany", tone: "ok" });
          setEditing(null);
        }}
      />
    </>
  );
}

function ShiftEditor({
  editing,
  onClose,
  onSave,
}: {
  editing: { shift: WorkShift; barberName: string } | null;
  onClose: () => void;
  onSave: (s: WorkShift) => void;
}) {
  const [draft, setDraft] = React.useState<WorkShift | null>(null);

  React.useEffect(() => setDraft(editing ? { ...editing.shift } : null), [editing]);

  if (!editing || !draft) return null;

  const total = draft.kind === "work" ? hoursBetween(draft.start, draft.end, draft.breakMin) : 0;
  const overtime = Math.max(0, total - 8);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[min(92vw,26rem)]">
        <DialogHeader>
          <DialogTitle>{editing.barberName}</DialogTitle>
          <DialogDescription>{formatDatePL(draft.date, "long")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-5">
          <Field label="Typ dnia">
            <NativeSelect
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value as ShiftKind })}
            >
              {(Object.keys(KIND_META) as ShiftKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_META[k].label}
                </option>
              ))}
            </NativeSelect>
          </Field>

          {draft.kind === "work" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Od">
                  <Input
                    type="time"
                    value={draft.start}
                    onChange={(e) => setDraft({ ...draft, start: e.target.value })}
                  />
                </Field>
                <Field label="Do">
                  <Input
                    type="time"
                    value={draft.end}
                    onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Przerwa (min)">
                <Input
                  type="number"
                  min={0}
                  step={5}
                  value={draft.breakMin}
                  onChange={(e) => setDraft({ ...draft, breakMin: Number(e.target.value) })}
                />
              </Field>
              <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-2 text-[12px]">
                <span className="text-[var(--fg-muted)]">Czas pracy</span>
                <span className="tabular font-medium">
                  {total.toFixed(2)} h
                  {overtime > 0 ? (
                    <span className="ml-2 text-[var(--warn)]">+{overtime.toFixed(2)} nadg.</span>
                  ) : null}
                </span>
              </div>
            </>
          ) : null}

          <Field label="Notatka">
            <Input
              value={draft.note ?? ""}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="np. urlop wypoczynkowy"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Anuluj
          </Button>
          <Button variant="brass" size="sm" onClick={() => onSave(draft)}>
            Zapisz zmianę
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
