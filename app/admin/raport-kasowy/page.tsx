"use client";

import * as React from "react";
import {
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  Minus,
  Plus,
  Trash2,
  TriangleAlert,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/misc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterBar, PageBody, PageHeader } from "@/components/admin/shared";
import { CASH_KIND_LABEL, type CashOperationKind } from "@/lib/booking/types";
import {
  addCashOperation,
  closeCashDay,
  formatDateLong,
  isoToday,
  removeCashOperation,
  reopenCashDay,
  setOpeningCash,
  shiftDate,
  useCashDay,
} from "@/lib/booking/use-api";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Raport kasowy — pilnuje wyłącznie gotówki.
   Karta i przelew są pokazane osobno, żeby było widać, ile z utargu
   naprawdę leży w szufladzie.
-------------------------------------------------------------------------- */

const zl = (value: number) =>
  `${value.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} zł`;

export default function CashReportPage() {
  const today = isoToday();
  const [date, setDate] = React.useState(today);
  const [closing, setClosing] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { data, loading, reload } = useCashDay(date);
  const report = data?.report;
  const summary = data?.summary;
  const rows = data?.rows ?? [];
  const closed = report?.status === "closed";

  const run = async (key: string, action: () => Promise<unknown>) => {
    setBusy(key);
    setError(null);
    try {
      await action();
      reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Raport kasowy"
        en="Cash"
        description="Ile gotówki jest w kasie i skąd się wzięła."
        actions={
          closed ? (
            <Button
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => run("reopen", () => reopenCashDay(date))}
            >
              {busy === "reopen" ? <Loader2 className="animate-spin" /> : <Unlock />} Otwórz dzień
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
                <Plus /> Wypłata z kasy
              </Button>
              <Button variant="accent" size="sm" onClick={() => setClosing(true)}>
                <Lock /> Zamknij dzień
              </Button>
            </>
          )
        }
      >
        <FilterBar>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => setDate(shiftDate(date, -1))}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDate(today)}>
              Dzisiaj
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={date >= today}
              onClick={() => setDate(shiftDate(date, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
          <span className="text-[13px] font-medium capitalize">{formatDateLong(date)}</span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[12px] font-semibold",
              closed
                ? "border-[color-mix(in_oklab,var(--ok)_45%,transparent)] bg-[color-mix(in_oklab,var(--ok)_12%,transparent)] text-[var(--ok)]"
                : "border-[var(--border-strong)] bg-[var(--panel-muted)] text-[var(--fg)]",
            )}
          >
            {closed ? "Dzień zamknięty" : "Dzień otwarty"}
          </span>
        </FilterBar>
      </PageHeader>

      <PageBody>
        {error ? (
          <p
            role="alert"
            className="rounded-md border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2 text-[12px] text-[var(--danger)]"
          >
            {error}
          </p>
        ) : null}

        {loading && !data ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            {/* najważniejsza liczba dnia */}
            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
              <div className="rounded-lg border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent)_8%,var(--panel))] p-5">
                <div className="text-[12px] font-medium text-[var(--fg-muted)]">
                  {closed ? "Policzono w kasie" : "Powinno być w kasie"}
                </div>
                <div className="mt-1 text-[40px] font-bold leading-none tabular">
                  {zl(closed ? (summary?.countedCash ?? 0) : (summary?.expectedCash ?? 0))}
                </div>
                <div className="mt-2 text-[12px] text-[var(--fg-subtle)]">
                  stan otwarcia {zl(report?.openingCash ?? 0)} + gotówka{" "}
                  {zl(summary?.cashIncome ?? 0)} − wypłaty {zl(summary?.payouts ?? 0)}
                </div>

                {closed && summary?.difference !== undefined ? (
                  <div
                    className={cn(
                      "mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-semibold",
                      summary.difference === 0
                        ? "border-[color-mix(in_oklab,var(--ok)_45%,transparent)] bg-[color-mix(in_oklab,var(--ok)_12%,transparent)] text-[var(--ok)]"
                        : "border-[color-mix(in_oklab,var(--danger)_45%,transparent)] bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-[var(--danger)]",
                    )}
                  >
                    {summary.difference === 0 ? (
                      <>
                        <Check className="size-3.5" /> Kasa się zgadza
                      </>
                    ) : (
                      <>
                        <TriangleAlert className="size-3.5" />
                        Różnica {summary.difference > 0 ? "+" : ""}
                        {zl(summary.difference)}
                      </>
                    )}
                  </div>
                ) : null}
              </div>

              <Tile
                icon={Banknote}
                label="Gotówka od klientów"
                value={zl(summary?.cashIncome ?? 0)}
                hint={`${summary?.paidVisits ?? 0} opłaconych wizyt`}
              />
              <Tile
                icon={CreditCard}
                label="Karta i przelew"
                value={zl((summary?.cardIncome ?? 0) + (summary?.transferIncome ?? 0))}
                hint="nie wpływa do szuflady"
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              {/* operacje */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Operacje kasowe</CardTitle>
                  <span className="text-[11px] text-[var(--fg-subtle)]">{rows.length} pozycji</span>
                </CardHeader>

                {rows.length === 0 ? (
                  <EmptyState
                    icon={Banknote}
                    title="Dziś nie było jeszcze żadnych operacji gotówkowych."
                    description="Wpływy pojawią się tu automatycznie, gdy oznaczysz wizytę jako opłaconą gotówką."
                    action={
                      !closed ? (
                        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
                          <Plus /> Dodaj wypłatę z kasy
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <ul className="divide-y divide-[var(--border)]">
                    {rows.map((row) => (
                      <li
                        key={row.operationId}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px]"
                      >
                        <span className="w-12 shrink-0 tabular text-[var(--fg-subtle)]">
                          {row.time}
                        </span>
                        <span
                          className={cn(
                            "w-28 shrink-0 rounded px-1.5 py-0.5 text-center text-[11px]",
                            row.amount < 0
                              ? "bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-[var(--danger)]"
                              : "bg-[var(--panel-muted)] text-[var(--fg-muted)]",
                          )}
                        >
                          {CASH_KIND_LABEL[row.kind as CashOperationKind] ?? row.kind}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{row.title}</span>
                        {row.document ? (
                          <span className="hidden shrink-0 font-mono text-[11px] text-[var(--fg-subtle)] sm:block">
                            {row.document}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "w-24 shrink-0 text-right font-semibold tabular",
                            row.amount < 0 && "text-[var(--danger)]",
                          )}
                        >
                          {row.amount > 0 ? "+" : ""}
                          {zl(row.amount)}
                        </span>
                        {!closed && !row.bookingId ? (
                          <Button
                            variant="ghost"
                            size="xs"
                            disabled={busy !== null}
                            onClick={() =>
                              run(row.operationId, () =>
                                removeCashOperation(date, row.operationId),
                              )
                            }
                          >
                            <Trash2 />
                          </Button>
                        ) : (
                          <span className="w-7 shrink-0" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {/* podsumowanie */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Podsumowanie dnia</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-[13px]">
                    <Row label="Stan otwarcia" value={zl(report?.openingCash ?? 0)}>
                      {!closed ? (
                        <OpeningEditor
                          current={report?.openingCash ?? 0}
                          disabled={busy !== null}
                          onSave={(amount) =>
                            run("opening", () => setOpeningCash(date, amount))
                          }
                        />
                      ) : null}
                    </Row>
                    <Row label="Gotówka od klientów" value={`+${zl(summary?.cashIncome ?? 0)}`} />
                    <Row label="Wypłaty z kasy" value={`−${zl(summary?.payouts ?? 0)}`} />
                    <div className="my-2 h-px bg-[var(--border)]" />
                    <Row label="Powinno być w kasie" value={zl(summary?.expectedCash ?? 0)} strong />
                    {closed ? (
                      <>
                        <Row label="Policzono" value={zl(summary?.countedCash ?? 0)} strong />
                        <Row
                          label="Różnica"
                          value={`${(summary?.difference ?? 0) > 0 ? "+" : ""}${zl(summary?.difference ?? 0)}`}
                          tone={summary?.difference ? "danger" : undefined}
                        />
                      </>
                    ) : null}
                    <div className="my-2 h-px bg-[var(--border)]" />
                    <Row label="Karta" value={zl(summary?.cardIncome ?? 0)} muted />
                    <Row label="Przelew" value={zl(summary?.transferIncome ?? 0)} muted />
                    <Row label="Napiwki" value={zl(summary?.tips ?? 0)} muted />
                  </CardContent>
                </Card>

                {(summary?.unpaidVisits ?? 0) > 0 && !closed ? (
                  <div className="flex items-start gap-2.5 rounded-lg border border-[color-mix(in_oklab,var(--warn)_45%,transparent)] bg-[color-mix(in_oklab,var(--warn)_9%,transparent)] p-3">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--warn)]" />
                    <p className="text-[12px] leading-relaxed">
                      <span className="font-medium">
                        {summary?.unpaidVisits} wykonanych wizyt bez sposobu zapłaty.
                      </span>{" "}
                      Otwórz wizytę w Rezerwacjach i zaznacz, czy klient zapłacił gotówką
                      czy kartą — inaczej kasa się nie zgodzi.
                    </p>
                  </div>
                ) : null}

                {closed ? (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3 text-[12px] text-[var(--fg-muted)]">
                    Zamknięte przez {report?.closedBy} · {report?.closedAt}
                    {report?.note ? (
                      <p className="mt-1.5 text-[var(--fg)]">{report.note}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </PageBody>

      <CloseDayDialog
        open={closing}
        onOpenChange={setClosing}
        expected={summary?.expectedCash ?? 0}
        onConfirm={(countedCash, note) =>
          run("close", async () => {
            await closeCashDay({ date, countedCash, note });
            setClosing(false);
          })
        }
      />

      <PayoutDialog
        open={adding}
        onOpenChange={setAdding}
        onConfirm={(payload) =>
          run("add", async () => {
            await addCashOperation({ date, ...payload });
            setAdding(false);
          })
        }
      />
    </>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--fg-muted)]">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="mt-1.5 text-[26px] font-bold leading-none tabular">{value}</div>
      <div className="mt-1.5 text-[11px] text-[var(--fg-subtle)]">{hint}</div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
  tone,
  children,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
  tone?: "danger";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("text-[var(--fg-muted)]", muted && "text-[var(--fg-subtle)]")}>
        {label}
      </span>
      {children}
      <span
        className={cn("ml-auto tabular", strong && "font-semibold")}
        style={tone === "danger" ? { color: "var(--danger)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

/** Stan otwarcia da się poprawić, dopóki dzień jest otwarty. */
function OpeningEditor({
  current,
  disabled,
  onSave,
}: {
  current: number;
  disabled: boolean;
  onSave: (amount: number) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(String(current));

  React.useEffect(() => setValue(String(current)), [current]);

  if (!editing) {
    return (
      <Button variant="ghost" size="xs" onClick={() => setEditing(true)}>
        zmień
      </Button>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-7 w-20 text-[12px]"
      />
      <Button
        variant="accent"
        size="xs"
        disabled={disabled}
        onClick={() => {
          onSave(Number(value));
          setEditing(false);
        }}
      >
        <Check />
      </Button>
    </span>
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
  onConfirm: (countedCash: number, note?: string) => void;
}) {
  const [counted, setCounted] = React.useState("");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setCounted("");
      setNote("");
    }
  }, [open]);

  const difference =
    counted === "" ? undefined : Math.round((Number(counted) - expected) * 100) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,28rem)]">
        <DialogHeader>
          <DialogTitle>Zamknięcie dnia</DialogTitle>
          <DialogDescription>
            Policz gotówkę w szufladzie i wpisz kwotę. Resztę policzymy sami.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-5">
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-[var(--fg-muted)]">Powinno być</span>
              <span className="font-semibold tabular">{zl(expected)}</span>
            </div>
          </div>

          <Field label="Ile naprawdę jest w kasie (zł)">
            <Input
              type="number"
              step="0.01"
              autoFocus
              value={counted}
              onChange={(e) => setCounted(e.target.value)}
              className="h-11 text-[18px] font-semibold"
            />
          </Field>

          {difference !== undefined ? (
            <div
              className={cn(
                "rounded-md border px-3 py-2 text-[13px]",
                difference === 0
                  ? "border-[color-mix(in_oklab,var(--ok)_40%,transparent)] bg-[color-mix(in_oklab,var(--ok)_10%,transparent)]"
                  : "border-[color-mix(in_oklab,var(--warn)_45%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)]",
              )}
            >
              <div className="flex justify-between">
                <span>Różnica</span>
                <span className="font-semibold tabular">
                  {difference > 0 ? "+" : ""}
                  {zl(difference)}
                </span>
              </div>
              {difference !== 0 ? (
                <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
                  {difference > 0
                    ? "W kasie jest więcej, niż wynika z wizyt."
                    : "W kasie brakuje pieniędzy. Napisz, co się stało."}
                </p>
              ) : null}
            </div>
          ) : null}

          {difference !== undefined && difference !== 0 ? (
            <Field label="Co się stało?" hint="Wymagane przy różnicy.">
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
            Wróć
          </Button>
          <Button
            variant="accent"
            size="sm"
            disabled={counted === "" || (difference !== 0 && !note.trim())}
            onClick={() => onConfirm(Number(counted), note || undefined)}
          >
            <Lock /> Zamknij dzień
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PayoutDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (p: {
    kind: CashOperationKind;
    title: string;
    amount: number;
    document?: string;
  }) => void;
}) {
  const [kind, setKind] = React.useState<CashOperationKind>("payout");
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [document, setDocument] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setKind("payout");
      setTitle("");
      setAmount("");
      setDocument("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,30rem)]">
        <DialogHeader>
          <DialogTitle>Ruch gotówki</DialogTitle>
          <DialogDescription>
            Wypłata to pieniądze wyjęte z kasy, wpłata to pieniądze dołożone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-5">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={kind === "payout" ? "accent" : "outline"}
              onClick={() => setKind("payout")}
            >
              <Minus /> Wypłata z kasy
            </Button>
            <Button
              variant={kind === "deposit" ? "accent" : "outline"}
              onClick={() => setKind("deposit")}
            >
              <Plus /> Wpłata do kasy
            </Button>
          </div>

          <Field label="Czego dotyczy">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. zakup ręczników"
            />
          </Field>
          <Field label="Kwota (zł)">
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Numer paragonu / faktury" hint="Opcjonalnie">
            <Input value={document} onChange={(e) => setDocument(e.target.value)} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Wróć
          </Button>
          <Button
            variant="accent"
            size="sm"
            disabled={!title.trim() || !amount}
            onClick={() =>
              onConfirm({
                kind,
                title,
                amount: Number(amount),
                document: document || undefined,
              })
            }
          >
            <Check /> Zapisz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
