"use client";

import * as React from "react";
import {
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Lock,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Table, TBody, TFoot, THead, TableWrap } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { ExportButtons, FilterBar, KpiCard, PageBody, PageHeader } from "@/components/admin/shared";
import { useStore } from "@/lib/store";
import type { CashOperation } from "@/lib/types";
import { addDays, cn, formatDatePL, plnFormat, sum } from "@/lib/utils";

const KIND_LABEL: Record<CashOperation["kind"], string> = {
  income: "Wpływ",
  payout: "Wypłata",
  tip: "Napiwek",
  deposit: "Pogotowie kasowe",
  correction: "Korekta",
};

export default function CashReportPage() {
  const { cashReports, barbers, today, closeCashDay, approveCashReport } = useStore();
  const [date, setDate] = React.useState(today);
  const [closing, setClosing] = React.useState(false);

  const report = cashReports.find((r) => r.date === date);
  const responsible = barbers.find((b) => b.id === report?.responsiblePersonId);

  const expected = report ? report.openingCash + report.cashIncome - report.payouts : 0;
  const totalIncome = report ? report.cashIncome + report.cardIncome + report.transferIncome : 0;

  const exportRows =
    report?.operations.map((o) => ({
      Data: report.date,
      Godzina: o.time,
      Typ: KIND_LABEL[o.kind],
      Opis: o.title,
      Kwota_PLN: o.amount,
      Forma: o.method,
      Dokument: o.document ?? "",
      Barber: barbers.find((b) => b.id === o.barberId)?.name ?? "",
    })) ?? [];

  return (
    <>
      <PageHeader
        title="Raport kasowy"
        en="Cash report / RK"
        description="Dzienny raport kasowy dla księgowości — stan otwarcia, wpływy, wypłaty, napiwki, stan zamknięcia i różnica."
        actions={<ExportButtons filename={`RK-${date}`} rows={exportRows} />}
      >
        <FilterBar>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => setDate(addDays(date, -1))}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDate(today)}>
              Dzisiaj
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDate(addDays(date, 1))}
              disabled={date >= today}
            >
              <ChevronRight />
            </Button>
          </div>
          <span className="text-[13px] font-medium">{formatDatePL(date, "long")}</span>
          {report ? (
            <Badge
              tone={
                report.status === "approved" ? "ok" : report.status === "closed" ? "info" : "warn"
              }
            >
              {report.status === "approved"
                ? "Zatwierdzony"
                : report.status === "closed"
                  ? "Zamknięty"
                  : "Otwarty"}
            </Badge>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            {report?.status === "open" ? (
              <Button variant="brass" size="sm" onClick={() => setClosing(true)}>
                <Lock /> Zamknij dzień
              </Button>
            ) : null}
            {report?.status === "closed" ? (
              <Button variant="outline" size="sm" onClick={() => approveCashReport(date)}>
                <ShieldCheck /> Zatwierdź (księgowość)
              </Button>
            ) : null}
          </div>
        </FilterBar>
      </PageHeader>

      <PageBody>
        {!report ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            <EmptyState
              icon={Banknote}
              title="Brak raportu dla tego dnia"
              description="Salon był zamknięty albo raport nie został jeszcze utworzony."
              action={
                <Button variant="outline" size="sm" onClick={() => setDate(today)}>
                  Przejdź do dzisiaj
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
              <KpiCard label="Stan otwarcia" en="Opening" value={report.openingCash} format="pln" index={0} />
              <KpiCard label="Wpływy gotówka" en="Cash in" value={report.cashIncome} format="pln" color="var(--warn)" index={1} />
              <KpiCard label="Wpływy karta" en="Card in" value={report.cardIncome} format="pln" color="var(--info)" index={2} />
              <KpiCard label="Wypłaty" en="Payouts" value={report.payouts} format="pln" color="var(--danger)" index={3} />
              <KpiCard label="Napiwki" en="Tips" value={report.tips} format="pln" color="var(--brass)" index={4} />
              <KpiCard
                label="Stan zamknięcia"
                en="Closing"
                value={report.closingCash}
                format="pln"
                color="var(--ok)"
                index={5}
                hint={`oczekiwano ${plnFormat(expected, { compact: true })}`}
              />
            </div>

            {report.difference !== 0 ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-[color-mix(in_oklab,var(--warn)_9%,transparent)] p-3">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--warn)]" />
                <div>
                  <p className="text-[12px] font-medium">
                    Różnica kasowa: {plnFormat(report.difference, { sign: true })}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--fg-muted)]">
                    {report.note ?? "Uzupełnij wyjaśnienie przed zatwierdzeniem przez księgowość."}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Operacje kasowe</CardTitle>
                  <span className="text-[11px] text-[var(--fg-subtle)]">
                    {report.operations.length} pozycji
                  </span>
                </CardHeader>
                <TableWrap className="max-h-[32rem] overflow-y-auto">
                  <Table>
                    <THead>
                      <tr>
                        <th>Godz.</th>
                        <th>Typ</th>
                        <th>Opis</th>
                        <th>Forma</th>
                        <th>Dokument</th>
                        <th className="text-right">Kwota</th>
                      </tr>
                    </THead>
                    <TBody>
                      {report.operations.map((o) => (
                        <tr key={o.id}>
                          <td className="tabular">{o.time}</td>
                          <td>
                            <Badge
                              size="sm"
                              tone={
                                o.kind === "payout"
                                  ? "danger"
                                  : o.kind === "tip"
                                    ? "brass"
                                    : o.kind === "deposit"
                                      ? "neutral"
                                      : "ok"
                              }
                            >
                              {KIND_LABEL[o.kind]}
                            </Badge>
                          </td>
                          <td className="max-w-72 truncate">{o.title}</td>
                          <td className="text-[var(--fg-muted)]">
                            {o.method === "cash" ? "gotówka" : o.method === "card" ? "karta" : o.method}
                          </td>
                          <td className="font-mono text-[11px] text-[var(--fg-subtle)]">
                            {o.document ?? "—"}
                          </td>
                          <td
                            className={cn(
                              "text-right tabular font-medium",
                              o.amount < 0 && "text-[var(--danger)]",
                            )}
                          >
                            {plnFormat(o.amount)}
                          </td>
                        </tr>
                      ))}
                    </TBody>
                    <TFoot>
                      <tr>
                        <td colSpan={5}>Suma operacji</td>
                        <td className="text-right tabular">
                          {plnFormat(sum(report.operations, (o) => o.amount))}
                        </td>
                      </tr>
                    </TFoot>
                  </Table>
                </TableWrap>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Podsumowanie dnia</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-[12px]">
                    <SumRow label="Przychód całkowity" value={plnFormat(totalIncome)} strong />
                    <SumRow icon={Banknote} label="w tym gotówka" value={plnFormat(report.cashIncome)} />
                    <SumRow icon={CreditCard} label="w tym karta" value={plnFormat(report.cardIncome)} />
                    <div className="my-2 h-px bg-[var(--border)]" />
                    <SumRow label="Stan otwarcia" value={plnFormat(report.openingCash)} />
                    <SumRow label="Wypłaty" value={plnFormat(-report.payouts)} />
                    <SumRow label="Oczekiwany stan kasy" value={plnFormat(expected)} />
                    <SumRow label="Policzono" value={plnFormat(report.closingCash)} strong />
                    <SumRow
                      label="Różnica"
                      value={plnFormat(report.difference, { sign: true })}
                      tone={report.difference === 0 ? undefined : "danger"}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Odpowiedzialność</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-[12px]">
                    <SumRow label="Osoba odpowiedzialna" value={responsible?.name ?? "—"} />
                    <SumRow
                      label="Status"
                      value={
                        report.status === "approved"
                          ? "Zatwierdzony"
                          : report.status === "closed"
                            ? "Zamknięty"
                            : "Otwarty"
                      }
                    />
                    {report.approvedBy ? (
                      <SumRow label="Zatwierdził" value={report.approvedBy} />
                    ) : null}
                    {report.note ? (
                      <div className="rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-2.5 text-[11px] text-[var(--fg-muted)]">
                        {report.note}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </PageBody>

      {report ? (
        <CloseDayDialog
          open={closing}
          onOpenChange={setClosing}
          expected={expected}
          onConfirm={(counted, note) => {
            closeCashDay(date, counted, note);
            setClosing(false);
          }}
        />
      ) : null}
    </>
  );
}

function SumRow({
  label,
  value,
  icon: Icon,
  strong,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  strong?: boolean;
  tone?: "danger";
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon ? <Icon className="size-3.5 text-[var(--fg-subtle)]" /> : null}
      <span className={cn("text-[var(--fg-muted)]", strong && "text-[var(--fg)]")}>{label}</span>
      <span
        className={cn("ml-auto tabular", strong && "font-semibold")}
        style={tone === "danger" ? { color: "var(--danger)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function CloseDayDialog({
  open,
  onOpenChange,
  expected,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  expected: number;
  onConfirm: (counted: number, note?: string) => void;
}) {
  const [counted, setCounted] = React.useState(expected);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setCounted(expected);
      setNote("");
    }
  }, [open, expected]);

  const diff = Math.round((counted - expected) * 100) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,28rem)]">
        <DialogHeader>
          <DialogTitle>Zamknięcie dnia</DialogTitle>
          <DialogDescription>
            Przelicz gotówkę w kasie i zapisz stan zamknięcia. Po zamknięciu raport trafia do
            akceptacji księgowości.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-5">
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-[var(--fg-muted)]">Oczekiwany stan kasy</span>
              <span className="tabular font-medium">{plnFormat(expected)}</span>
            </div>
          </div>

          <Field label="Policzona gotówka (PLN)">
            <Input
              type="number"
              step="0.01"
              value={counted}
              onChange={(e) => setCounted(Number(e.target.value))}
              autoFocus
            />
          </Field>

          <div
            className={cn(
              "rounded-md border px-3 py-2 text-[12px]",
              diff === 0
                ? "border-[color-mix(in_oklab,var(--ok)_35%,transparent)] bg-[color-mix(in_oklab,var(--ok)_10%,transparent)]"
                : "border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)]",
            )}
          >
            <div className="flex justify-between">
              <span>Różnica</span>
              <span className="tabular font-semibold">{plnFormat(diff, { sign: true })}</span>
            </div>
          </div>

          {diff !== 0 ? (
            <Field label="Wyjaśnienie różnicy" hint="Wymagane przy niezerowej różnicy kasowej.">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="np. brak paragonu za zakup ręczników"
              />
            </Field>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button
            variant="brass"
            size="sm"
            disabled={diff !== 0 && !note.trim()}
            onClick={() => onConfirm(counted, note || undefined)}
          >
            <Check /> Zamknij dzień
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
