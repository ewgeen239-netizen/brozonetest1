"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Check, Pencil, Plus, Scissors, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/misc";
import { Table, TBody, THead, TableWrap } from "@/components/ui/table";
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
import type { Service, ServiceCategory } from "@/lib/types";
import { addDays, durationLabel, plnFormat, sum, uid } from "@/lib/utils";

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  hair: "Włosy",
  beard: "Broda",
  combo: "Combo",
  care: "Pielęgnacja",
  color: "Koloryzacja",
  kids: "Dzieci",
};

export default function ServicesPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-[13px] text-[var(--fg-muted)]">Wczytywanie…</div>}>
      <ServicesView />
    </React.Suspense>
  );
}

function ServicesView() {
  const params = useSearchParams();
  const { services, appointments, toggleService, today } = useStore();
  const [query, setQuery] = React.useState(params.get("q") ?? "");
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [creating, setCreating] = React.useState(false);

  const monthStart = addDays(today, -30);
  const stats = React.useMemo(() => {
    const done = appointments.filter((a) => a.status === "completed" && a.date >= monthStart);
    return new Map(
      services.map((s) => {
        const hits = done.filter((a) => a.serviceIds.includes(s.id));
        return [s.id, { count: hits.length, revenue: hits.length * s.price }];
      }),
    );
  }, [appointments, services, monthStart]);

  const filtered = services.filter((s) => {
    const q = query.trim().toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q);
  });

  const activeCount = services.filter((s) => s.active).length;
  const avgPrice = activeCount
    ? sum(services.filter((s) => s.active), (s) => s.price) / activeCount
    : 0;
  const monthRevenue = sum([...stats.values()], (s) => s.revenue);

  const exportRows = filtered.map((s) => ({
    Usluga: s.name,
    EN: s.nameEn,
    Kategoria: CATEGORY_LABEL[s.category],
    Czas_min: s.durationMin,
    Cena_PLN: s.price,
    Aktywna: s.active ? "TAK" : "NIE",
    Wykonania_30d: stats.get(s.id)?.count ?? 0,
    Przychod_30d: stats.get(s.id)?.revenue ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Usługi"
        en="Services"
        description="Cennik, czasy trwania i mapowanie na identyfikatory usług w Booksy."
        actions={
          <>
            <ExportButtons filename="uslugi-brozone" rows={exportRows} />
            <Button variant="brass" size="sm" onClick={() => setCreating(true)}>
              <Plus /> Dodaj usługę
            </Button>
          </>
        }
      >
        <FilterBar>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj usługi…"
              className="h-8 w-64 pl-8 text-[12px]"
            />
          </div>
          <span className="ml-auto text-[11px] text-[var(--fg-subtle)]">
            {activeCount} aktywnych z {services.length}
          </span>
        </FilterBar>
      </PageHeader>

      <PageBody>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Usługi aktywne" en="Active" value={activeCount} index={0} />
          <KpiCard label="Średnia cena" en="Avg price" value={avgPrice} format="pln" color="var(--brass)" index={1} />
          <KpiCard label="Przychód 30 dni" en="Revenue" value={monthRevenue} format="pln" color="var(--ok)" index={2} />
          <KpiCard
            label="Zmapowane w Booksy"
            en="Mapped"
            value={services.filter((s) => s.booksyServiceId).length}
            color="var(--info)"
            index={3}
            hint={`${services.filter((s) => !s.booksyServiceId).length} bez mapowania`}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          {filtered.length === 0 ? (
            <EmptyState icon={Scissors} title="Brak usług" description="Dodaj pierwszą pozycję cennika." />
          ) : (
            <TableWrap>
              <Table>
                <THead>
                  <tr>
                    <th>Usługa</th>
                    <th>Kategoria</th>
                    <th className="text-right">Czas</th>
                    <th className="text-right">Cena</th>
                    <th className="text-right">Wykonania 30d</th>
                    <th className="text-right">Przychód 30d</th>
                    <th>Booksy ID</th>
                    <th className="text-center">Aktywna</th>
                    <th />
                  </tr>
                </THead>
                <TBody>
                  {filtered.map((s) => {
                    const st = stats.get(s.id);
                    return (
                      <tr key={s.id} className={s.active ? "" : "opacity-55"}>
                        <td>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-[11px] text-[var(--fg-subtle)]">
                            {s.nameEn}
                            {s.variants && s.variants.length > 1
                              ? ` · ${s.variants.map((v) => v.label).join(" / ")}`
                              : ""}
                          </div>
                        </td>
                        <td>
                          <Badge tone="outline" size="sm">
                            {CATEGORY_LABEL[s.category]}
                          </Badge>
                        </td>
                        <td className="text-right tabular">{durationLabel(s.durationMin)}</td>
                        <td className="whitespace-nowrap text-right tabular font-medium">
                          {s.variants && s.variants.length > 1 ? (
                            <>
                              {plnFormat(Math.min(...s.variants.map((v) => v.price)), {
                                compact: true,
                              })}
                              <span className="text-[var(--fg-subtle)]"> – </span>
                              {plnFormat(Math.max(...s.variants.map((v) => v.price)), {
                                compact: true,
                              })}
                            </>
                          ) : (
                            plnFormat(s.price, { compact: true })
                          )}
                        </td>
                        <td className="text-right tabular">{st?.count ?? 0}</td>
                        <td className="text-right tabular">
                          {plnFormat(st?.revenue ?? 0, { compact: true })}
                        </td>
                        <td>
                          {s.booksyServiceId ? (
                            <span className="font-mono text-[11px] text-[var(--fg-muted)]">
                              {s.booksyServiceId}
                            </span>
                          ) : (
                            <Badge tone="warn" size="sm">
                              brak mapowania
                            </Badge>
                          )}
                        </td>
                        <td className="text-center">
                          <Switch checked={s.active} onCheckedChange={() => toggleService(s.id)} />
                        </td>
                        <td className="text-right">
                          <Button variant="ghost" size="xs" onClick={() => setEditing(s)}>
                            <Pencil />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </TBody>
              </Table>
            </TableWrap>
          )}
        </div>
      </PageBody>

      <ServiceDialog
        open={creating || Boolean(editing)}
        onOpenChange={(v) => {
          if (!v) {
            setCreating(false);
            setEditing(null);
          }
        }}
        service={editing}
      />
    </>
  );
}

const emptyService = (): Service => ({
  id: uid("srv"),
  name: "",
  nameEn: "",
  category: "hair",
  durationMin: 45,
  price: 120,
  currency: "PLN",
  description: "",
  active: true,
  popularity: 0,
});

function ServiceDialog({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service?: Service | null;
}) {
  const { upsertService, toast } = useStore();
  const [draft, setDraft] = React.useState<Service>(service ?? emptyService());
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDraft(service ? { ...service } : emptyService());
      setError(null);
    }
  }, [open, service]);

  const submit = () => {
    if (!draft.name.trim()) return setError("Nazwa usługi jest wymagana.");
    if (draft.durationMin < 5) return setError("Czas trwania musi wynosić min. 5 minut.");
    upsertService(draft);
    toast({ title: service ? "Usługa zaktualizowana" : "Usługa dodana", tone: "ok" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,34rem)]">
        <DialogHeader>
          <DialogTitle>{service ? "Edytuj usługę" : "Nowa usługa"}</DialogTitle>
          <DialogDescription>
            Booksy ID pozwala dopasować rezerwacje przy imporcie.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nazwa (PL)">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Nazwa (EN)">
              <Input value={draft.nameEn} onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })} />
            </Field>
            <Field label="Kategoria">
              <NativeSelect
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as ServiceCategory })}
              >
                {(Object.keys(CATEGORY_LABEL) as ServiceCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Booksy service ID">
              <Input
                value={draft.booksyServiceId ?? ""}
                onChange={(e) => setDraft({ ...draft, booksyServiceId: e.target.value })}
                placeholder="bk_srv_…"
              />
            </Field>
            <Field label="Czas (min)">
              <Input
                type="number"
                min={5}
                step={5}
                value={draft.durationMin}
                onChange={(e) => setDraft({ ...draft, durationMin: Number(e.target.value) })}
              />
            </Field>
            <Field label="Cena (PLN)">
              <Input
                type="number"
                min={0}
                step={10}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
              />
            </Field>
          </div>

          <Field label="Opis">
            <Textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </Field>

          <div className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2">
            <span className="text-[12px]">Usługa aktywna w cenniku</span>
            <Switch
              checked={draft.active}
              onCheckedChange={(v) => setDraft({ ...draft, active: v })}
            />
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
