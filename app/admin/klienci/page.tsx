"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Avatar, Separator } from "@/components/ui/misc";
import { Table, TBody, THead, TableWrap } from "@/components/ui/table";
import { Drawer } from "@/components/ui/dialog";
import { EmptyState, TableSkeleton } from "@/components/ui/states";
import {
  ExportButtons,
  FilterBar,
  KpiCard,
  PageBody,
  PageHeader,
  StatusBadge,
} from "@/components/admin/shared";
import { useStore } from "@/lib/store";
import type { Client, ClientTier } from "@/lib/types";
import { formatDatePL, plnFormat, sum } from "@/lib/utils";

const TIER_TONE: Record<ClientTier, "brass" | "info" | "neutral" | "danger"> = {
  vip: "brass",
  regular: "info",
  new: "neutral",
  risk: "danger",
};

const TIER_LABEL: Record<ClientTier, string> = {
  vip: "VIP",
  regular: "Stały",
  new: "Nowy",
  risk: "Ryzyko",
};

export default function ClientsPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-[13px] text-[var(--fg-muted)]">Wczytywanie…</div>}>
      <ClientsView />
    </React.Suspense>
  );
}

function ClientsView() {
  const params = useSearchParams();
  const { clients, appointments, barbers, services } = useStore();
  const [query, setQuery] = React.useState(params.get("q") ?? "");
  const [tier, setTier] = React.useState<string>("all");
  const [sort, setSort] = React.useState<"visits" | "spent" | "recent" | "name">("spent");
  const [selected, setSelected] = React.useState<Client | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = clients.filter((c) => {
      if (tier !== "all" && c.tier !== tier) return false;
      return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.includes(q);
    });
    return list.sort((a, b) => {
      if (sort === "visits") return b.visits - a.visits;
      if (sort === "spent") return b.totalSpent - a.totalSpent;
      if (sort === "name") return a.name.localeCompare(b.name, "pl");
      return (b.lastVisitAt ?? "").localeCompare(a.lastVisitAt ?? "");
    });
  }, [clients, query, tier, sort]);

  const vip = clients.filter((c) => c.tier === "vip").length;
  const risk = clients.filter((c) => c.tier === "risk").length;
  const ltv = clients.length ? sum(clients, (c) => c.totalSpent) / clients.length : 0;

  const exportRows = filtered.map((c) => ({
    Imie_nazwisko: c.name,
    Telefon: c.phone,
    Email: c.email ?? "",
    Wizyty: c.visits,
    No_show: c.noShows,
    Wydane_PLN: c.totalSpent,
    Ostatnia_wizyta: c.lastVisitAt ?? "",
    Segment: TIER_LABEL[c.tier],
    Zgoda_marketing: c.marketingConsent ? "TAK" : "NIE",
  }));

  return (
    <>
      <PageHeader
        title="Klienci"
        en="Clients"
        description="Baza klientów zbudowana z rezerwacji Booksy, strony i wizyt walk-in."
        actions={<ExportButtons filename="klienci-brozone" rows={exportRows} />}
      >
        <FilterBar>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nazwisko, telefon, e-mail…"
              className="h-8 w-64 pl-8 text-[12px]"
            />
          </div>
          <NativeSelect
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="h-8 w-36 text-[12px]"
          >
            <option value="all">Wszystkie segmenty</option>
            <option value="vip">VIP</option>
            <option value="regular">Stali</option>
            <option value="new">Nowi</option>
            <option value="risk">Ryzyko no-show</option>
          </NativeSelect>
          <NativeSelect
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-8 w-40 text-[12px]"
          >
            <option value="spent">Sortuj: wydatki</option>
            <option value="visits">Sortuj: wizyty</option>
            <option value="recent">Sortuj: ostatnia wizyta</option>
            <option value="name">Sortuj: nazwisko</option>
          </NativeSelect>
          <span className="ml-auto text-[11px] text-[var(--fg-subtle)]">{filtered.length} klientów</span>
        </FilterBar>
      </PageHeader>

      <PageBody>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Baza klientów" en="Total" value={clients.length} index={0} />
          <KpiCard label="Klienci VIP" en="VIP" value={vip} color="var(--brass)" index={1} />
          <KpiCard label="Ryzyko no-show" en="At risk" value={risk} color="var(--danger)" index={2} />
          <KpiCard label="Średnia wartość klienta" en="LTV" value={ltv} format="pln" color="var(--ok)" index={3} />
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          {loading ? (
            <TableSkeleton rows={8} cols={7} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Brak klientów spełniających kryteria"
              description="Zmień filtr segmentu albo wyczyść wyszukiwanie."
              action={
                <Button variant="outline" size="sm" onClick={() => { setQuery(""); setTier("all"); }}>
                  Wyczyść filtry
                </Button>
              }
            />
          ) : (
            <TableWrap className="max-h-[calc(100dvh-22rem)] overflow-y-auto">
              <Table>
                <THead>
                  <tr>
                    <th>Klient</th>
                    <th>Kontakt</th>
                    <th className="text-right">Wizyty</th>
                    <th className="text-right">No-show</th>
                    <th className="text-right">Wydane</th>
                    <th>Ostatnia wizyta</th>
                    <th>Segment</th>
                  </tr>
                </THead>
                <TBody>
                  {filtered.slice(0, 60).map((c) => (
                    <tr key={c.id} className="cursor-pointer" onClick={() => setSelected(c)}>
                      <td>
                        <span className="flex items-center gap-2">
                          <Avatar name={c.name} className="size-7" />
                          <span className="font-medium">{c.name}</span>
                        </span>
                      </td>
                      <td className="text-[var(--fg-muted)]">
                        <span className="block tabular">{c.phone}</span>
                        {c.email ? (
                          <span className="block text-[11px] text-[var(--fg-subtle)]">{c.email}</span>
                        ) : null}
                      </td>
                      <td className="text-right tabular">{c.visits}</td>
                      <td className="text-right tabular">
                        {c.noShows ? (
                          <span className="text-[var(--danger)]">{c.noShows}</span>
                        ) : (
                          <span className="text-[var(--fg-subtle)]">0</span>
                        )}
                      </td>
                      <td className="text-right tabular font-medium">
                        {plnFormat(c.totalSpent, { compact: true })}
                      </td>
                      <td className="tabular text-[var(--fg-muted)]">
                        {c.lastVisitAt ? formatDatePL(c.lastVisitAt) : "—"}
                      </td>
                      <td>
                        <Badge tone={TIER_TONE[c.tier]} size="sm">
                          {TIER_LABEL[c.tier]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </TableWrap>
          )}
        </div>
      </PageBody>

      <Drawer
        open={Boolean(selected)}
        onOpenChange={(v) => !v && setSelected(null)}
        title={selected?.name ?? ""}
        description={selected ? `Klient od ${formatDatePL(selected.createdAt)}` : undefined}
      >
        {selected ? (
          <div className="space-y-5 p-5">
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={TIER_TONE[selected.tier]}>{TIER_LABEL[selected.tier]}</Badge>
              <Badge tone="outline">{selected.visits} wizyt</Badge>
              <Badge tone="outline">{plnFormat(selected.totalSpent, { compact: true })}</Badge>
              {selected.marketingConsent ? <Badge tone="ok">zgoda marketing</Badge> : null}
            </div>

            <div className="space-y-1.5 text-[12px]">
              <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--brass)]">
                <Phone className="size-3.5" /> {selected.phone}
              </a>
              {selected.email ? (
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--brass)]">
                  <Mail className="size-3.5" /> {selected.email}
                </a>
              ) : null}
            </div>

            {selected.notes ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3 text-[12px] text-[var(--fg-muted)]">
                {selected.notes}
              </div>
            ) : null}

            <Separator />

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                Historia wizyt
              </p>
              {(() => {
                const history = appointments
                  .filter((a) => a.clientId === selected.id)
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .slice(0, 12);
                if (!history.length)
                  return <EmptyState title="Brak wizyt w systemie" className="py-8" />;
                return (
                  <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
                    {history.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 px-3 py-2 text-[12px]">
                        <span className="w-20 shrink-0 tabular text-[var(--fg-muted)]">
                          {formatDatePL(a.date)}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {a.serviceIds.map((id) => services.find((s) => s.id === id)?.name).join(" + ")}
                        </span>
                        <span className="hidden shrink-0 text-[11px] text-[var(--fg-subtle)] sm:block">
                          {barbers.find((b) => b.id === a.barberId)?.name}
                        </span>
                        <StatusBadge status={a.status} />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
