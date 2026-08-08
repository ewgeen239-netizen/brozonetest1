"use client";

import * as React from "react";
import { Check, Package, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, NativeSelect } from "@/components/ui/input";
import { Table, TBody, TFoot, THead, TableWrap } from "@/components/ui/table";
import { Donut } from "@/components/ui/data-viz";
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
import type { ProductCategory, ProductUnit } from "@/lib/types";
import { addDays, formatDatePL, groupBy, plnFormat, sum } from "@/lib/utils";

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  styling: "Stylizacja",
  shave: "Golenie",
  care: "Pielęgnacja",
  color: "Koloryzacja",
  disposable: "Jednorazowe",
  cleaning: "Dezynfekcja",
};

const PALETTE = ["var(--accent)", "var(--info)", "#9d7bff", "var(--ok)", "var(--warn)", "var(--danger)"];

export default function ProductUsagePage() {
  const { productUsage, barbers, services, today, removeUsageEntry } = useStore();
  const [range, setRange] = React.useState<"7" | "30" | "90">("30");
  const [category, setCategory] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const from = addDays(today, -Number(range));

  const filtered = productUsage.filter((e) => {
    if (e.date < from) return false;
    if (category !== "all" && e.category !== category) return false;
    const q = query.trim().toLowerCase();
    return !q || e.productName.toLowerCase().includes(q);
  });

  const totalCost = sum(filtered, (e) => e.cost);
  const byCategory = Object.entries(groupBy(filtered, (e) => e.category)).map(([key, items]) => ({
    key: key as ProductCategory,
    cost: sum(items, (e) => e.cost),
    count: items.length,
  }));
  const byProduct = Object.entries(groupBy(filtered, (e) => e.productName))
    .map(([name, items]) => ({ name, cost: sum(items, (e) => e.cost), count: items.length }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 6);

  const exportRows = filtered.map((e) => ({
    Data: e.date,
    Produkt: e.productName,
    Kategoria: CATEGORY_LABEL[e.category],
    Ilosc: e.amount,
    Jednostka: e.unit,
    Koszt_PLN: e.cost,
    Barber: barbers.find((b) => b.id === e.barberId)?.name ?? "",
    Usluga: services.find((s) => s.id === e.serviceId)?.name ?? "",
    Uwagi: e.note ?? "",
  }));

  return (
    <>
      <PageHeader
        title="Raport zużycia kosmetyków"
        en="Product usage"
        description="Ewidencja zużycia produktów do rozliczenia kosztów w księgowości."
        actions={
          <>
            <ExportButtons filename={`zuzycie-${from}_${today}`} rows={exportRows} />
            <Button variant="accent" size="sm" onClick={() => setAdding(true)}>
              <Plus /> Dodaj wpis
            </Button>
          </>
        }
      >
        <FilterBar>
          <NativeSelect
            value={range}
            onChange={(e) => setRange(e.target.value as typeof range)}
            className="h-8 w-32 text-[12px]"
          >
            <option value="7">7 dni</option>
            <option value="30">30 dni</option>
            <option value="90">90 dni</option>
          </NativeSelect>
          <NativeSelect
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-8 w-44 text-[12px]"
          >
            <option value="all">Wszystkie kategorie</option>
            {(Object.keys(CATEGORY_LABEL) as ProductCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </NativeSelect>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj produktu…"
              className="h-8 w-56 pl-8 text-[12px]"
            />
          </div>
          <span className="ml-auto text-[11px] text-[var(--fg-subtle)]">
            {filtered.length} wpisów · {formatDatePL(from)} – {formatDatePL(today)}
          </span>
        </FilterBar>
      </PageHeader>

      <PageBody>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Koszt zużycia" en="Total cost" value={totalCost} format="pln" index={0} />
          <KpiCard label="Wpisy" en="Entries" value={filtered.length} index={1} />
          <KpiCard
            label="Średni koszt / dzień"
            en="Daily avg"
            value={totalCost / Number(range)}
            format="pln"
            color="var(--info)"
            index={2}
          />
          <KpiCard
            label="Kategorie"
            en="Categories"
            value={byCategory.length}
            color="var(--accent)"
            index={3}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1.6fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Koszt wg kategorii</CardTitle>
              </CardHeader>
              <CardContent>
                {byCategory.length ? (
                  <div className="flex items-center gap-4">
                    <Donut
                      segments={byCategory.map((c, i) => ({
                        value: c.cost,
                        color: PALETTE[i % PALETTE.length],
                        label: CATEGORY_LABEL[c.key],
                      }))}
                      center={
                        <div className="text-center">
                          <div className="text-[14px] font-semibold tabular leading-none">
                            {plnFormat(totalCost, { compact: true })}
                          </div>
                          <div className="text-[9px] uppercase text-[var(--fg-subtle)]">koszt</div>
                        </div>
                      }
                    />
                    <ul className="min-w-0 flex-1 space-y-1.5">
                      {byCategory.map((c, i) => (
                        <li key={c.key} className="flex items-center gap-2 text-[12px]">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ background: PALETTE[i % PALETTE.length] }}
                          />
                          <span className="truncate">{CATEGORY_LABEL[c.key]}</span>
                          <span className="ml-auto tabular text-[var(--fg-muted)]">
                            {plnFormat(c.cost, { compact: true })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <EmptyState title="Brak danych" className="py-8" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top produkty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {byProduct.map((p) => (
                  <div key={p.name} className="flex items-center gap-2 text-[12px]">
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <Badge tone="outline" size="sm">
                      {p.count}×
                    </Badge>
                    <span className="w-16 text-right tabular font-medium">
                      {plnFormat(p.cost, { compact: true })}
                    </span>
                  </div>
                ))}
                {!byProduct.length ? <EmptyState title="Brak wpisów" className="py-6" /> : null}
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Ewidencja zużycia</CardTitle>
              <span className="text-[11px] text-[var(--fg-subtle)]">{filtered.length} pozycji</span>
            </CardHeader>
            {filtered.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Brak wpisów w wybranym okresie"
                description="Dodaj zużycie ręcznie lub zmień zakres dat."
                action={
                  <Button variant="accent" size="sm" onClick={() => setAdding(true)}>
                    <Plus /> Dodaj wpis
                  </Button>
                }
              />
            ) : (
              <TableWrap className="max-h-[38rem] overflow-y-auto">
                <Table>
                  <THead>
                    <tr>
                      <th>Data</th>
                      <th>Produkt</th>
                      <th>Kategoria</th>
                      <th className="text-right">Ilość</th>
                      <th>Barber</th>
                      <th>Usługa</th>
                      <th className="text-right">Koszt</th>
                      <th />
                    </tr>
                  </THead>
                  <TBody>
                    {filtered.slice(0, 120).map((e) => (
                      <tr key={e.id}>
                        <td className="tabular whitespace-nowrap">{formatDatePL(e.date)}</td>
                        <td className="font-medium">{e.productName}</td>
                        <td>
                          <Badge tone="outline" size="sm">
                            {CATEGORY_LABEL[e.category]}
                          </Badge>
                        </td>
                        <td className="text-right tabular">
                          {e.amount} {e.unit}
                        </td>
                        <td className="text-[var(--fg-muted)]">
                          {barbers.find((b) => b.id === e.barberId)?.name ?? "—"}
                        </td>
                        <td className="max-w-40 truncate text-[var(--fg-muted)]">
                          {services.find((s) => s.id === e.serviceId)?.name ?? "—"}
                        </td>
                        <td className="text-right tabular font-medium">{plnFormat(e.cost)}</td>
                        <td className="text-right">
                          <Button variant="ghost" size="xs" onClick={() => removeUsageEntry(e.id)}>
                            <Trash2 />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </TBody>
                  <TFoot>
                    <tr>
                      <td colSpan={6}>Razem</td>
                      <td className="text-right tabular">{plnFormat(totalCost)}</td>
                      <td />
                    </tr>
                  </TFoot>
                </Table>
              </TableWrap>
            )}
          </Card>
        </div>
      </PageBody>

      <UsageDialog open={adding} onOpenChange={setAdding} />
    </>
  );
}

function UsageDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { barbers, services, addUsageEntry, today, toast } = useStore();
  const [draft, setDraft] = React.useState({
    date: today,
    productName: "",
    category: "styling" as ProductCategory,
    amount: 50,
    unit: "ml" as ProductUnit,
    cost: 20,
    barberId: "",
    serviceId: "",
    note: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDraft((d) => ({ ...d, date: today, productName: "", note: "" }));
      setError(null);
    }
  }, [open, today]);

  const submit = () => {
    if (!draft.productName.trim()) return setError("Podaj nazwę produktu.");
    if (draft.amount <= 0) return setError("Ilość musi być większa od zera.");
    addUsageEntry({
      date: draft.date,
      productName: draft.productName,
      category: draft.category,
      amount: draft.amount,
      unit: draft.unit,
      cost: draft.cost,
      barberId: draft.barberId || undefined,
      serviceId: draft.serviceId || undefined,
      note: draft.note || undefined,
    });
    toast({ title: "Wpis dodany", tone: "ok" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,36rem)]">
        <DialogHeader>
          <DialogTitle>Nowy wpis zużycia</DialogTitle>
          <DialogDescription>
            Koszt trafia do raportu kosztowego przekazywanego księgowości.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <Field label="Data">
            <Input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </Field>
          <Field label="Produkt">
            <Input
              value={draft.productName}
              onChange={(e) => setDraft({ ...draft, productName: e.target.value })}
              placeholder="np. Reuzel Fiber Pomade"
            />
          </Field>
          <Field label="Kategoria">
            <NativeSelect
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as ProductCategory })}
            >
              {(Object.keys(CATEGORY_LABEL) as ProductCategory[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Jednostka">
            <NativeSelect
              value={draft.unit}
              onChange={(e) => setDraft({ ...draft, unit: e.target.value as ProductUnit })}
            >
              <option value="ml">ml</option>
              <option value="g">g</option>
              <option value="szt">szt</option>
              <option value="para">para</option>
            </NativeSelect>
          </Field>
          <Field label="Ilość">
            <Input
              type="number"
              min={0}
              value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
            />
          </Field>
          <Field label="Koszt (PLN)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={draft.cost}
              onChange={(e) => setDraft({ ...draft, cost: Number(e.target.value) })}
            />
          </Field>
          <Field label="Barber">
            <NativeSelect
              value={draft.barberId}
              onChange={(e) => setDraft({ ...draft, barberId: e.target.value })}
            >
              <option value="">—</option>
              {barbers
                .filter((b) => b.status === "active")
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </NativeSelect>
          </Field>
          <Field label="Usługa">
            <NativeSelect
              value={draft.serviceId}
              onChange={(e) => setDraft({ ...draft, serviceId: e.target.value })}
            >
              <option value="">—</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Uwagi" className="sm:col-span-2">
            <Input
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="opcjonalnie"
            />
          </Field>

          {error ? (
            <p className="rounded-md border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2 text-[12px] text-[var(--danger)] sm:col-span-2">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button variant="accent" size="sm" onClick={submit}>
            <Check /> Dodaj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
