"use client";

import * as React from "react";
import { Check, Loader2, Mail, Phone, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Drawer } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, TableSkeleton } from "@/components/ui/states";
import { Separator } from "@/components/ui/misc";
import { FilterBar, PageBody, PageHeader } from "@/components/admin/shared";
import { CategoryBar, StatusPill } from "@/components/admin/universal/badges";
import type { Client } from "@/lib/booking/types";
import { formatDateShort, saveClient, useBookings, useClients } from "@/lib/booking/use-api";

/* --------------------------------------------------------------------------
   Jedna baza klientów dla trzech kategorii. Historia pokazuje wizyty
   ze wszystkich usług — to główna wartość wspólnej bazy.
-------------------------------------------------------------------------- */

export default function ClientsPage() {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Client | null>(null);
  const [creating, setCreating] = React.useState(false);

  const { data, loading, error, reload } = useClients(query);
  const clients = data ?? [];

  const sorted = React.useMemo(
    () => [...clients].sort((a, b) => (b.lastVisit ?? "").localeCompare(a.lastVisit ?? "")),
    [clients],
  );

  return (
    <>
      <PageHeader
        title="Klienci"
        en="Clients"
        description="Wspólna baza dla barbera, tatuażu i masażu."
        actions={
          <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
            <Plus /> Dodaj klienta
          </Button>
        }
      >
        <FilterBar>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj po nazwisku albo telefonie…"
              className="h-9 w-72 rounded-full pl-8 text-[12px]"
            />
          </div>
          <span className="ml-auto flex items-center gap-2 text-[11px] text-[var(--fg-subtle)]">
            {loading ? <Loader2 className="size-3 animate-spin" /> : null}
            {sorted.length} klientów
          </span>
        </FilterBar>
      </PageHeader>

      <PageBody>
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          {loading && !data ? (
            <TableSkeleton rows={8} cols={5} />
          ) : error ? (
            <EmptyState
              title="Nie udało się wczytać klientów"
              description={error}
              action={
                <Button variant="outline" size="sm" onClick={reload}>
                  Spróbuj ponownie
                </Button>
              }
            />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={Users}
              title={query ? `Nie znaleziono nikogo dla „${query}".` : "Nie masz jeszcze klientów."}
              description={
                query
                  ? "Sprawdź pisownię albo poszukaj po numerze telefonu."
                  : "Pojawią się tu automatycznie po pierwszej rezerwacji ze strony."
              }
              action={
                query ? (
                  <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                    Wyczyść wyszukiwanie
                  </Button>
                ) : (
                  <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
                    <Plus /> Dodaj klienta ręcznie
                  </Button>
                )
              }
            />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {sorted.map((client) => (
                <li key={client.clientId}>
                  <button
                    onClick={() => setSelected(client)}
                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-[var(--panel-muted)]"
                  >
                    <span className="min-w-[10rem] flex-1">
                      <span className="block truncate text-[13px] font-medium">{client.name}</span>
                      <span className="block truncate text-[11px] tabular text-[var(--fg-subtle)]">
                        {client.phone}
                      </span>
                    </span>

                    <span className="flex shrink-0 flex-wrap gap-1">
                      {client.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} tone={tag === "VIP" ? "accent" : "outline"} size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </span>

                    <span className="w-24 shrink-0 text-right text-[12px] tabular text-[var(--fg-muted)]">
                      {client.totalVisits} wizyt
                    </span>
                    <span className="w-24 shrink-0 text-right text-[12px] tabular text-[var(--fg-subtle)]">
                      {client.lastVisit ? formatDateShort(client.lastVisit) : "—"}
                    </span>
                    {client.noShows > 0 ? (
                      <Badge tone="danger" size="sm">
                        {client.noShows} nieobecności
                      </Badge>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageBody>

      <ClientDrawer
        client={selected}
        onOpenChange={(v) => !v && setSelected(null)}
        onSaved={reload}
      />
      <NewClientDialog open={creating} onOpenChange={setCreating} onSaved={reload} />
    </>
  );
}

function ClientDrawer({
  client,
  onOpenChange,
  onSaved,
}: {
  client: Client | null;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const history = useBookings({});

  React.useEffect(() => setNote(client?.notes ?? ""), [client?.clientId, client?.notes]);

  if (!client) return null;

  const visits = (history.data ?? [])
    .filter((b) => b.clientId === client.clientId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);

  return (
    <Drawer
      open
      onOpenChange={onOpenChange}
      title={client.name}
      description={`Klient od ${formatDateShort(client.createdAt.slice(0, 10))}`}
    >
      <div className="space-y-5 p-5">
        <div className="flex flex-wrap gap-1.5">
          {client.tags.map((tag) => (
            <Badge key={tag} tone={tag === "VIP" ? "accent" : "outline"}>
              {tag}
            </Badge>
          ))}
          <Badge tone="outline">{client.totalVisits} wizyt</Badge>
          {client.noShows > 0 ? (
            <Badge tone="danger">{client.noShows} nieobecności</Badge>
          ) : null}
        </div>

        <div className="space-y-1.5 text-[12px]">
          <a
            href={`tel:${client.phone}`}
            className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--accent)]"
          >
            <Phone className="size-3.5" /> {client.phone}
          </a>
          {client.email ? (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--accent)]"
            >
              <Mail className="size-3.5" /> {client.email}
            </a>
          ) : null}
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
            Historia wizyt
          </h3>
          {history.loading ? (
            <p className="text-[12px] text-[var(--fg-muted)]">Wczytywanie…</p>
          ) : visits.length ? (
            <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
              {visits.map((b) => (
                <li key={b.bookingId} className="relative">
                  <CategoryBar category={b.category} />
                  <div className="flex items-center gap-2 py-2 pl-4 pr-3 text-[12px]">
                    <span className="w-14 shrink-0 tabular text-[var(--fg-muted)]">
                      {formatDateShort(b.date)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{b.serviceName}</span>
                    <StatusPill status={b.status} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Ten klient nie ma jeszcze żadnych wizyt." className="py-8" />
          )}
        </div>

        <Field label="Notatka wewnętrzna">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Preferencje, uwagi, ustalenia…"
          />
          <Button
            variant="subtle"
            size="sm"
            className="mt-2"
            disabled={saving || note === (client.notes ?? "")}
            onClick={async () => {
              setSaving(true);
              try {
                await saveClient({ phone: client.phone, notes: note });
                onSaved();
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? <Loader2 className="animate-spin" /> : <Check />} Zapisz notatkę
          </Button>
        </Field>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3 text-[11px] text-[var(--fg-muted)]">
          Zgoda RODO: {client.consentRodo ? "tak" : "nie"} · Marketing:{" "}
          {client.consentMarketing ? "tak" : "nie"}
        </div>
      </div>
    </Drawer>
  );
}

function NewClientDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName("");
      setPhone("");
      setEmail("");
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    if (!name.trim()) return setError("Wpisz imię i nazwisko.");
    if (phone.replace(/\D/g, "").length < 9) {
      return setError("Numer wygląda na niepełny — potrzebujemy 9 cyfr.");
    }
    setSaving(true);
    setError(null);
    try {
      await saveClient({ name, phone, email: email || undefined, consentRodo: true });
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,30rem)]">
        <DialogHeader>
          <DialogTitle>Dodaj klienta</DialogTitle>
          <DialogDescription>Telefon jest wymagany — po nim rozpoznajemy klienta.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-5">
          <Field label="Imię i nazwisko">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Telefon">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="600 100 200" />
          </Field>
          <Field label="E-mail" hint="Opcjonalnie">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {error ? (
            <p className="rounded-md border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2 text-[12px] text-[var(--danger)]">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Wróć
          </Button>
          <Button variant="accent" size="sm" onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Check />} Zapisz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
