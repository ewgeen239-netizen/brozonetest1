"use client";

import * as React from "react";
import { Check, ChevronLeft, ChevronRight, Clock4, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/input";
import { Avatar, Switch } from "@/components/ui/misc";
import { Table, TBody, TFoot, THead, TableWrap } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { ExportButtons, FilterBar, KpiCard, PageBody, PageHeader } from "@/components/admin/shared";
import { useStore } from "@/lib/store";
import type { ShiftKind } from "@/lib/types";
import { cn, formatDatePL, fromISODate, MONTHS_PL, sum, toISODate } from "@/lib/utils";

const KIND_LABEL: Record<ShiftKind, string> = {
  work: "Praca",
  vacation: "Urlop",
  sick: "L4",
  off: "Wolne",
  training: "Szkolenie",
};

export default function TimeEvidencePage() {
  const { timeEntries, barbers, today, approveTimeEntry, toast } = useStore();
  const [month, setMonth] = React.useState(today.slice(0, 7));
  const [barberFilter, setBarberFilter] = React.useState("all");
  const [onlyPending, setOnlyPending] = React.useState(false);

  const monthDate = fromISODate(`${month}-01`);

  const entries = timeEntries.filter((t) => {
    if (!t.date.startsWith(month)) return false;
    if (barberFilter !== "all" && t.barberId !== barberFilter) return false;
    if (onlyPending && t.approved) return false;
    return true;
  });

  const totalHours = sum(entries, (t) => t.totalHours);
  const overtime = sum(entries, (t) => t.overtimeHours);
  const pending = timeEntries.filter((t) => t.date.startsWith(month) && !t.approved).length;
  const absences = entries.filter((t) => t.kind === "vacation" || t.kind === "sick").length;

  const shiftMonth = (delta: number) => {
    const d = fromISODate(`${month}-01`);
    d.setMonth(d.getMonth() + delta);
    setMonth(toISODate(d).slice(0, 7));
  };

  const perBarber = barbers
    .filter((b) => b.status === "active")
    .map((b) => {
      const mine = entries.filter((t) => t.barberId === b.id);
      return {
        barber: b,
        hours: sum(mine, (t) => t.totalHours),
        overtime: sum(mine, (t) => t.overtimeHours),
        days: mine.filter((t) => t.kind === "work").length,
      };
    });

  const exportRows = entries.map((t) => ({
    Pracownik: barbers.find((b) => b.id === t.barberId)?.name ?? "",
    Data: t.date,
    Rozpoczecie: t.start,
    Zakonczenie: t.end,
    Przerwa_min: t.breakMin,
    Godziny: t.totalHours,
    Nadgodziny: t.overtimeHours,
    Rodzaj: KIND_LABEL[t.kind],
    Zrodlo: t.source === "auto" ? "auto (grafik)" : "ręczne",
    Zatwierdzone: t.approved ? "TAK" : "NIE",
  }));

  const approveAll = () => {
    entries.filter((t) => !t.approved).forEach((t) => approveTimeEntry(t.id, true));
    toast({ title: "Zatwierdzono wpisy", description: `${pending} pozycji`, tone: "ok" });
  };

  return (
    <>
      <PageHeader
        title="Ewidencja czasu pracy"
        en="Work time evidence"
        description="Zestawienie zgodne z wymogami PIP/ZUS — godziny, przerwy, nadgodziny i nieobecności. Dane liczone automatycznie z grafiku."
        actions={
          <>
            <ExportButtons filename={`ewidencja-${month}`} rows={exportRows} />
            <Button variant="accent" size="sm" onClick={approveAll} disabled={!pending}>
              <ShieldCheck /> Zatwierdź wszystkie ({pending})
            </Button>
          </>
        }
      >
        <FilterBar>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(-1)}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMonth(today.slice(0, 7))}>
              Bieżący miesiąc
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(1)}>
              <ChevronRight />
            </Button>
          </div>
          <span className="text-[13px] font-medium capitalize">
            {MONTHS_PL[monthDate.getMonth()]} {monthDate.getFullYear()}
          </span>

          <NativeSelect
            value={barberFilter}
            onChange={(e) => setBarberFilter(e.target.value)}
            className="h-8 w-44 text-[12px]"
          >
            <option value="all">Wszyscy pracownicy</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </NativeSelect>

          <label className="flex items-center gap-2 text-[12px] text-[var(--fg-muted)]">
            <Switch checked={onlyPending} onCheckedChange={setOnlyPending} />
            Tylko niezatwierdzone
          </label>

          <span className="ml-auto text-[11px] text-[var(--fg-subtle)]">{entries.length} wpisów</span>
        </FilterBar>
      </PageHeader>

      <PageBody>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Godziny łącznie" en="Total hours" value={totalHours} fractionDigits={1} suffix=" h" index={0} />
          <KpiCard label="Nadgodziny" en="Overtime" value={overtime} fractionDigits={1} suffix=" h" color="var(--warn)" index={1} />
          <KpiCard label="Do zatwierdzenia" en="Pending" value={pending} color="var(--danger)" index={2} />
          <KpiCard label="Nieobecności" en="Absences" value={absences} color="var(--info)" index={3} hint="urlop + L4" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Podsumowanie pracowników</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {perBarber.map((p) => (
                <div key={p.barber.id} className="flex items-center gap-2.5">
                  <Avatar
                    src={p.barber.photoUrl}
                    name={p.barber.name}
                    ring={p.barber.color}
                    className="size-7"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-medium">{p.barber.name}</div>
                    <div className="text-[10px] text-[var(--fg-subtle)]">{p.days} dni roboczych</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-semibold tabular">{p.hours.toFixed(1)} h</div>
                    {p.overtime > 0 ? (
                      <div className="text-[10px] tabular text-[var(--warn)]">
                        +{p.overtime.toFixed(1)} nadg.
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Karta ewidencji</CardTitle>
              <Badge tone="outline" size="sm">
                auto z grafiku
              </Badge>
            </CardHeader>
            {entries.length === 0 ? (
              <EmptyState
                icon={Clock4}
                title="Brak wpisów w tym miesiącu"
                description="Zmień miesiąc lub uzupełnij grafik pracy."
              />
            ) : (
              <TableWrap className="max-h-[38rem] overflow-y-auto">
                <Table>
                  <THead>
                    <tr>
                      <th>Pracownik</th>
                      <th>Data</th>
                      <th>Od</th>
                      <th>Do</th>
                      <th className="text-right">Przerwa</th>
                      <th className="text-right">Godziny</th>
                      <th className="text-right">Nadg.</th>
                      <th>Rodzaj</th>
                      <th className="text-center">Akceptacja</th>
                    </tr>
                  </THead>
                  <TBody>
                    {entries.slice(0, 150).map((t) => (
                      <tr key={t.id}>
                        <td className="whitespace-nowrap font-medium">
                          {barbers.find((b) => b.id === t.barberId)?.name}
                        </td>
                        <td className="tabular whitespace-nowrap">{formatDatePL(t.date)}</td>
                        <td className="tabular">{t.start}</td>
                        <td className="tabular">{t.end}</td>
                        <td className="text-right tabular">{t.breakMin} min</td>
                        <td className="text-right tabular font-medium">{t.totalHours.toFixed(2)}</td>
                        <td
                          className={cn(
                            "text-right tabular",
                            t.overtimeHours > 0 && "text-[var(--warn)]",
                          )}
                        >
                          {t.overtimeHours ? t.overtimeHours.toFixed(2) : "—"}
                        </td>
                        <td>
                          <Badge
                            size="sm"
                            tone={
                              t.kind === "work"
                                ? "ok"
                                : t.kind === "sick"
                                  ? "danger"
                                  : t.kind === "vacation"
                                    ? "info"
                                    : "outline"
                            }
                          >
                            {KIND_LABEL[t.kind]}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => approveTimeEntry(t.id, !t.approved)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] transition-colors",
                              t.approved
                                ? "border-[color-mix(in_oklab,var(--ok)_40%,transparent)] bg-[color-mix(in_oklab,var(--ok)_12%,transparent)] text-[var(--ok)]"
                                : "border-[var(--border-strong)] text-[var(--fg-muted)] hover:border-[var(--accent)]",
                            )}
                          >
                            {t.approved ? <Check className="size-3" /> : null}
                            {t.approved ? "OK" : "czeka"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </TBody>
                  <TFoot>
                    <tr>
                      <td colSpan={5}>Razem</td>
                      <td className="text-right tabular">{totalHours.toFixed(2)}</td>
                      <td className="text-right tabular">{overtime.toFixed(2)}</td>
                      <td colSpan={2} />
                    </tr>
                  </TFoot>
                </Table>
              </TableWrap>
            )}
          </Card>
        </div>

        <p className="text-[11px] leading-relaxed text-[var(--fg-subtle)]">
          Ewidencja czasu pracy prowadzona na podstawie art. 149 Kodeksu pracy. Eksport CSV/PDF
          zawiera komplet danych wymaganych przy kontroli PIP oraz do rozliczeń ZUS i PIT-4R.
        </p>
      </PageBody>
    </>
  );
}
