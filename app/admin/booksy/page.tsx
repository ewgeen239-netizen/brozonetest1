"use client";

import * as React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileUp,
  Info,
  Link2,
  RefreshCcw,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Switch, Separator } from "@/components/ui/misc";
import { Table, TBody, THead, TableWrap } from "@/components/ui/table";
import { Drawer } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { FilterBar, KpiCard, PageBody, PageHeader } from "@/components/admin/shared";
import { useStore } from "@/lib/store";
import { BOOKSY_MODE_INFO, MockBooksyAdapter } from "@/lib/booksy-adapter";
import type { BooksyMode, BooksySyncLog } from "@/lib/types";
import { cn, formatDatePL, plnFormat, relativeTimePL, sum } from "@/lib/utils";

export default function BooksySyncPage() {
  const {
    booksy,
    syncLogs,
    syncing,
    runSync,
    setBooksyMode,
    updateBooksy,
    appointments,
    barbers,
    clients,
    resolveConflict,
    toast,
  } = useStore();

  const [openLog, setOpenLog] = React.useState<BooksySyncLog | null>(null);
  const conflicts = appointments.filter((a) => a.conflict && !a.conflict.resolved);
  const adapter = React.useMemo(() => new MockBooksyAdapter(booksy), [booksy]);

  const importedTotal = sum(syncLogs, (l) => l.imported);
  const errorCount = syncLogs.filter((l) => l.status === "error").length;

  const onCsv = async (file: File) => {
    const text = await file.text();
    const parsed = adapter.parseCSV(text);
    toast({
      title: "Plik przetworzony",
      description: `${parsed.length} rekordów gotowych do importu (podgląd — nic nie zapisano).`,
      tone: parsed.length ? "ok" : "warn",
    });
  };

  return (
    <>
      <PageHeader
        title="Booksy Sync"
        en="Integration"
        description="Warstwa integracji zbudowana na wzorcu adaptera. Booksy nie udostępnia publicznego API do zapisu, dlatego panel obsługuje trzy realne tryby pracy."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <a href={booksy.businessUrl} target="_blank" rel="noreferrer">
                Profil Booksy <ExternalLink />
              </a>
            </Button>
            <Button variant="brass" size="sm" onClick={() => runSync()} disabled={syncing}>
              <RefreshCcw className={cn(syncing && "animate-spin")} /> Sync from Booksy
            </Button>
          </>
        }
      >
        <FilterBar>
          <span className="flex items-center gap-2 text-[12px]">
            <span
              className={cn(
                "size-2 rounded-full",
                booksy.connectionState === "connected"
                  ? "bg-[var(--ok)]"
                  : booksy.connectionState === "degraded"
                    ? "bg-[var(--warn)]"
                    : "bg-[var(--fg-subtle)]",
              )}
            />
            {booksy.connectionState === "connected"
              ? "Połączono"
              : booksy.connectionState === "degraded"
                ? "Połączenie niestabilne"
                : "Rozłączono"}
          </span>
          <span className="text-[12px] text-[var(--fg-muted)]">
            Ostatnia synchronizacja: {booksy.lastSyncAt ? relativeTimePL(booksy.lastSyncAt) : "—"}
          </span>
          {conflicts.length ? (
            <Badge tone="warn">
              <TriangleAlert className="size-3" /> {conflicts.length} konfliktów
            </Badge>
          ) : (
            <Badge tone="ok">Brak konfliktów</Badge>
          )}
        </FilterBar>
      </PageHeader>

      <PageBody>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Zaimportowane rekordy" en="Imported" value={importedTotal} index={0} />
          <KpiCard label="Konflikty" en="Conflicts" value={conflicts.length} color="var(--warn)" index={1} />
          <KpiCard label="Błędy synchronizacji" en="Errors" value={errorCount} color="var(--danger)" index={2} />
          <KpiCard
            label="Interwał auto-sync"
            en="Interval"
            value={booksy.autoSyncIntervalMin}
            suffix=" min"
            color="var(--info)"
            index={3}
            hint={booksy.autoSyncEnabled ? "auto-sync włączony" : "auto-sync wyłączony"}
          />
        </div>

        {/* modes */}
        <div className="grid gap-3 lg:grid-cols-3">
          {(Object.keys(BOOKSY_MODE_INFO) as BooksyMode[]).map((mode) => {
            const info = BOOKSY_MODE_INFO[mode];
            const active = booksy.mode === mode;
            return (
              <button
                key={mode}
                onClick={() => setBooksyMode(mode)}
                className={cn(
                  "flex flex-col rounded-lg border p-4 text-left transition-all",
                  active
                    ? "border-[var(--brass)] bg-[color-mix(in_oklab,var(--brass)_8%,var(--panel))] shadow-[0_18px_40px_-28px_var(--brass-glow)]"
                    : "border-[var(--border)] bg-[var(--panel)] hover:border-[var(--border-strong)]",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold">{info.label}</span>
                  {active ? (
                    <Badge tone="brass" size="sm">
                      aktywny
                    </Badge>
                  ) : null}
                  <span className="ml-auto text-[10px] uppercase tracking-[0.12em] text-[var(--fg-subtle)]">
                    {info.en}
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-[var(--fg-muted)]">
                  {info.description}
                </p>

                <div className="mt-3 space-y-1">
                  {info.capabilities.map((c) => (
                    <div key={c} className="flex items-start gap-1.5 text-[11px]">
                      <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-[var(--ok)]" />
                      <span className="text-[var(--fg-muted)]">{c}</span>
                    </div>
                  ))}
                  {info.limits.map((c) => (
                    <div key={c} className="flex items-start gap-1.5 text-[11px]">
                      <XCircle className="mt-0.5 size-3 shrink-0 text-[var(--fg-subtle)]" />
                      <span className="text-[var(--fg-subtle)]">{c}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-[var(--info)]" />
          <p className="text-[12px] leading-relaxed text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">Uczciwie o ograniczeniach:</span> Booksy
            nie udostępnia otwartego API do dwukierunkowej synchronizacji. BROZONE OS pobiera dane
            jednostronnie (API partnerskie, eksport CSV lub webhook) i nigdy nie zapisuje zmian z
            powrotem do Booksy. Zmiany wykonane w panelu pozostają lokalne — poinformuj klienta
            osobno lub popraw wizytę również w Booksy.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          {/* sync log */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Sync log</CardTitle>
              <span className="text-[11px] text-[var(--fg-subtle)]">{syncLogs.length} wpisów</span>
            </CardHeader>
            {syncLogs.length === 0 ? (
              <EmptyState icon={RefreshCcw} title="Brak historii synchronizacji" />
            ) : (
              <TableWrap className="max-h-[30rem] overflow-y-auto">
                <Table>
                  <THead>
                    <tr>
                      <th>Czas</th>
                      <th>Tryb</th>
                      <th>Wyzwalacz</th>
                      <th className="text-right">Import</th>
                      <th className="text-right">Aktual.</th>
                      <th className="text-right">Konfl.</th>
                      <th className="text-right">Błędy</th>
                      <th>Status</th>
                    </tr>
                  </THead>
                  <TBody>
                    {syncLogs.map((l) => (
                      <tr key={l.id} className="cursor-pointer" onClick={() => setOpenLog(l)}>
                        <td className="whitespace-nowrap tabular">
                          {new Date(l.startedAt).toLocaleTimeString("pl-PL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          <span className="ml-1.5 text-[10px] text-[var(--fg-subtle)]">
                            {relativeTimePL(l.startedAt)}
                          </span>
                        </td>
                        <td className="text-[var(--fg-muted)]">{l.mode}</td>
                        <td className="text-[var(--fg-muted)]">{l.trigger}</td>
                        <td className="text-right tabular">{l.imported}</td>
                        <td className="text-right tabular">{l.updated}</td>
                        <td className="text-right tabular">
                          {l.conflicts ? (
                            <span className="text-[var(--warn)]">{l.conflicts}</span>
                          ) : (
                            "0"
                          )}
                        </td>
                        <td className="text-right tabular">
                          {l.errors ? <span className="text-[var(--danger)]">{l.errors}</span> : "0"}
                        </td>
                        <td>
                          <Badge
                            size="sm"
                            tone={
                              l.status === "success"
                                ? "ok"
                                : l.status === "partial"
                                  ? "warn"
                                  : l.status === "running"
                                    ? "info"
                                    : "danger"
                            }
                          >
                            {l.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            )}
          </Card>

          {/* config */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Konfiguracja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Adres profilu Booksy">
                  <Input
                    value={booksy.businessUrl}
                    onChange={(e) => updateBooksy({ businessUrl: e.target.value })}
                  />
                </Field>
                <Field label="Klucz API (partnerski)" hint="Wymagany tylko w trybie Import.">
                  <Input value={booksy.apiKeyMasked ?? ""} readOnly className="font-mono text-[12px]" />
                </Field>
                <Field label="Webhook URL">
                  <div className="flex gap-1.5">
                    <Input value={booksy.webhookUrl ?? ""} readOnly className="font-mono text-[12px]" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(booksy.webhookUrl ?? "");
                        toast({ title: "Skopiowano URL webhooka", tone: "ok" });
                      }}
                    >
                      <Copy />
                    </Button>
                  </div>
                </Field>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-medium">Auto-sync</div>
                    <div className="text-[11px] text-[var(--fg-subtle)]">
                      co {booksy.autoSyncIntervalMin} minut
                    </div>
                  </div>
                  <Switch
                    checked={booksy.autoSyncEnabled}
                    onCheckedChange={(v) => updateBooksy({ autoSyncEnabled: v })}
                  />
                </div>

                <Field label="Interwał (min)">
                  <Input
                    type="number"
                    min={5}
                    step={5}
                    value={booksy.autoSyncIntervalMin}
                    onChange={(e) => updateBooksy({ autoSyncIntervalMin: Number(e.target.value) })}
                  />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import z pliku CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <p className="text-[11px] leading-relaxed text-[var(--fg-muted)]">
                  Eksport z Booksy Biz → wgraj plik. Oczekiwane kolumny:{" "}
                  <span className="font-mono">booking_id;date;time;duration;price;note</span>
                </p>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-6 text-[12px] text-[var(--fg-muted)] transition-colors hover:border-[var(--brass)] hover:text-[var(--fg)]">
                  <FileUp className="size-4" />
                  Wybierz plik CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onCsv(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <Button variant="outline" size="sm" className="w-full">
                  <Download /> Pobierz szablon CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Widget na stronie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-[11px] leading-relaxed text-[var(--fg-muted)]">
                  Przycisk „Rezerwuj przez Booksy” na stronie klienta prowadzi pod adres z
                  parametrami usługi, barbera i terminu.
                </p>
                <code className="block overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--bg-sunken)] px-2.5 py-2 font-mono text-[10px] text-[var(--fg-muted)]">
                  {booksy.widgetUrl}
                </code>
                <Button asChild variant="subtle" size="sm" className="w-full">
                  <a href="/" target="_blank" rel="noreferrer">
                    <Link2 /> Podgląd strony klienta
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* conflicts */}
        <Card>
          <CardHeader>
            <CardTitle>Conflict resolver</CardTitle>
            <Badge tone={conflicts.length ? "warn" : "ok"} size="sm">
              {conflicts.length} do rozwiązania
            </Badge>
          </CardHeader>
          {conflicts.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Brak konfliktów"
              description="Rekordy lokalne i zdalne są spójne."
              className="py-10"
            />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {conflicts.map((a) => {
                const client = clients.find((c) => c.id === a.clientId);
                const localBarber = barbers.find((b) => b.id === a.barberId);
                const remote = a.conflict!.remote as Record<string, string | number>;
                const fields = Object.keys(remote);
                return (
                  <div key={a.id} className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-medium">{client?.name}</span>
                      <Badge tone="outline" size="sm">
                        {formatDatePL(a.date)}
                      </Badge>
                      <span className="font-mono text-[11px] text-[var(--fg-subtle)]">
                        {a.booksyId}
                      </span>
                      <span className="ml-auto flex items-center gap-1 text-[11px] text-[var(--fg-subtle)]">
                        <Clock className="size-3" />
                        wykryto {relativeTimePL(a.conflict!.detectedAt)}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
                      <div className="rounded-lg border border-[var(--border)] p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                          BROZONE OS (lokalnie)
                        </div>
                        <dl className="mt-2 space-y-1 text-[12px]">
                          {fields.map((f) => (
                            <div key={f} className="flex justify-between gap-3">
                              <dt className="text-[var(--fg-muted)]">{labelFor(f)}</dt>
                              <dd className="tabular font-medium">
                                {renderValue(f, (a as unknown as Record<string, string | number>)[f], barbers)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      <div className="hidden items-center justify-center sm:flex">
                        <ArrowRight className="size-4 text-[var(--fg-subtle)]" />
                      </div>

                      <div className="rounded-lg border border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-[color-mix(in_oklab,var(--warn)_7%,transparent)] p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--warn)]">
                          Booksy (zdalnie)
                        </div>
                        <dl className="mt-2 space-y-1 text-[12px]">
                          {fields.map((f) => (
                            <div key={f} className="flex justify-between gap-3">
                              <dt className="text-[var(--fg-muted)]">{labelFor(f)}</dt>
                              <dd className="tabular font-medium">
                                {renderValue(f, remote[f], barbers)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          resolveConflict(a.id, "local");
                          toast({ title: "Zachowano wersję lokalną", tone: "ok" });
                        }}
                      >
                        Zachowaj lokalną
                      </Button>
                      <Button
                        variant="brass"
                        size="sm"
                        onClick={() => {
                          resolveConflict(a.id, "remote");
                          toast({ title: "Przyjęto wersję z Booksy", tone: "ok" });
                        }}
                      >
                        Przyjmij z Booksy
                      </Button>
                      <span className="text-[11px] text-[var(--fg-subtle)]">
                        Barber lokalnie: {localBarber?.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </PageBody>

      <Drawer
        open={Boolean(openLog)}
        onOpenChange={(v) => !v && setOpenLog(null)}
        title="Szczegóły synchronizacji"
        description={openLog ? new Date(openLog.startedAt).toLocaleString("pl-PL") : undefined}
      >
        {openLog ? (
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <Stat label="Tryb" value={openLog.mode} />
              <Stat label="Wyzwalacz" value={openLog.trigger} />
              <Stat label="Zaimportowane" value={String(openLog.imported)} />
              <Stat label="Zaktualizowane" value={String(openLog.updated)} />
              <Stat label="Pominięte" value={String(openLog.skipped)} />
              <Stat label="Konflikty" value={String(openLog.conflicts)} />
            </div>

            <div
              className={cn(
                "rounded-lg border p-3 text-[12px]",
                openLog.status === "error"
                  ? "border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--danger)_9%,transparent)]"
                  : "border-[var(--border)] bg-[var(--panel-muted)]",
              )}
            >
              {openLog.message}
            </div>

            {openLog.lines?.length ? (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                  Log techniczny
                </p>
                <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-sunken)] p-3 font-mono text-[10px] leading-relaxed text-[var(--fg-muted)]">
                  {openLog.lines.join("\n")}
                </pre>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--fg-subtle)]">{label}</div>
      <div className="mt-0.5 font-medium tabular">{value}</div>
    </div>
  );
}

function labelFor(field: string) {
  return (
    {
      start: "Godzina",
      barberId: "Barber",
      price: "Cena",
      date: "Data",
      durationMin: "Czas",
      status: "Status",
    }[field] ?? field
  );
}

function renderValue(
  field: string,
  value: unknown,
  barbers: { id: string; name: string }[],
) {
  if (value === undefined || value === null) return "—";
  if (field === "barberId") return barbers.find((b) => b.id === value)?.name ?? String(value);
  if (field === "price") return plnFormat(Number(value), { compact: true });
  return String(value);
}
