"use client";

import * as React from "react";
import { Check, Loader2, Pencil, Plus, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Switch, Skeleton } from "@/components/ui/misc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { FilterBar, PageBody, PageHeader } from "@/components/admin/shared";
import { CategoryFilter } from "@/components/admin/universal/category-filter";
import { CATEGORY_COLOR, priceLabel, type Category, type Service } from "@/lib/booking/types";
import { saveService, useServices } from "@/lib/booking/use-api";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Cennik, z którego korzysta jednocześnie panel i strona — jedno miejsce prawdy.
-------------------------------------------------------------------------- */

export default function ServicesPage() {
  const [category, setCategory] = React.useState("all");
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);

  const { data, loading, error, reload } = useServices(category);
  const services = data ?? [];

  const toggle = async (service: Service) => {
    setBusy(service.serviceId);
    try {
      await saveService({ ...service, active: !service.active });
      reload();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Usługi i ceny"
        en="Services"
        description="Cennik widoczny na stronie. Ukryta usługa znika ze strony, ale zostaje w historii."
        actions={
          <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
            <Plus /> Dodaj usługę
          </Button>
        }
      >
        <FilterBar>
          <CategoryFilter value={category} onChange={setCategory} id="services" />
          <span className="ml-auto text-[11px] text-[var(--fg-subtle)]">
            {services.filter((s) => s.active).length} aktywnych z {services.length}
          </span>
        </FilterBar>
      </PageHeader>

      <PageBody>
        {loading && !data ? (
          <Skeleton className="h-72 w-full" />
        ) : error ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            <EmptyState
              title="Nie udało się wczytać cennika"
              description={error}
              action={
                <Button variant="outline" size="sm" onClick={reload}>
                  Spróbuj ponownie
                </Button>
              }
            />
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            <EmptyState
              icon={Scissors}
              title="Nie masz jeszcze żadnych usług w tej kategorii."
              description="Bez usług klienci nie mogą się zapisać przez stronę."
              action={
                <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
                  <Plus /> Dodaj pierwszą usługę
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            <ul className="divide-y divide-[var(--border)]">
              {services.map((service) => (
                <li
                  key={service.serviceId}
                  className={cn("relative", !service.active && "opacity-55")}
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ background: CATEGORY_COLOR[service.category] }}
                  />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 pl-4 pr-3">
                    <div className="min-w-[12rem] flex-1">
                      <div className="text-[13px] font-medium">{service.name}</div>
                      <div className="truncate text-[11px] text-[var(--fg-subtle)]">
                        {service.description || "—"}
                      </div>
                    </div>

                    <span className="w-20 shrink-0 text-right text-[12px] tabular text-[var(--fg-muted)]">
                      {service.durationMinutes} min
                    </span>
                    <span className="w-24 shrink-0 whitespace-nowrap text-right text-[14px] font-semibold tabular">
                      {priceLabel(service)}
                    </span>
                    {service.depositRequired > 0 ? (
                      <Badge tone="warn" size="sm">
                        zadatek {service.depositRequired} zł
                      </Badge>
                    ) : null}

                    <div className="flex shrink-0 items-center gap-2">
                      {busy === service.serviceId ? (
                        <Loader2 className="size-4 animate-spin text-[var(--fg-subtle)]" />
                      ) : (
                        <Switch
                          checked={service.active}
                          onCheckedChange={() => toggle(service)}
                          aria-label="Widoczna na stronie"
                        />
                      )}
                      <Button variant="ghost" size="xs" onClick={() => setEditing(service)}>
                        <Pencil />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageBody>

      <ServiceDialog
        key={editing?.serviceId ?? "new"}
        open={creating || Boolean(editing)}
        service={editing}
        onOpenChange={(v) => {
          if (!v) {
            setCreating(false);
            setEditing(null);
          }
        }}
        onSaved={reload}
      />
    </>
  );
}

function emptyService(): Service {
  return {
    serviceId: `srv_${Math.random().toString(36).slice(2, 8)}`,
    category: "barber",
    name: "",
    description: "",
    durationMinutes: 45,
    priceFrom: 100,
    priceTo: 100,
    depositRequired: 0,
    active: true,
    assignedStaffIds: [],
  };
}

function ServiceDialog({
  open,
  service,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  service: Service | null;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = React.useState<Service>(service ?? emptyService());
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDraft(service ?? emptyService());
      setError(null);
    }
  }, [open, service]);

  const patch = (p: Partial<Service>) => setDraft((d) => ({ ...d, ...p }));

  const submit = async () => {
    if (!draft.name.trim()) return setError("Wpisz nazwę usługi.");
    if (draft.durationMinutes < 5) return setError("Podaj, ile trwa usługa.");
    setSaving(true);
    setError(null);
    try {
      await saveService({ ...draft, priceTo: draft.priceTo || draft.priceFrom });
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
      <DialogContent className="w-[min(94vw,34rem)]">
        <DialogHeader>
          <DialogTitle>{service ? "Edytuj usługę" : "Dodaj usługę"}</DialogTitle>
          <DialogDescription>
            Czas trwania steruje długością wizyty w kalendarzu i wolnymi godzinami na stronie.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-5">
          <div className="grid grid-cols-3 gap-2">
            {(["barber", "tattoo", "massage"] as Category[]).map((c) => (
              <button
                key={c}
                onClick={() => patch({ category: c })}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors",
                  draft.category === c
                    ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]"
                    : "border-[var(--border)] hover:border-[var(--border-strong)]",
                )}
              >
                <span className="size-2.5 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
                {c === "barber" ? "Barber" : c === "tattoo" ? "Tatuaż" : "Masaż"}
              </button>
            ))}
          </div>

          <Field label="Nazwa">
            <Input value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Czas (min)">
              <Input
                type="number"
                min={5}
                step={5}
                value={draft.durationMinutes}
                onChange={(e) => patch({ durationMinutes: Number(e.target.value) })}
              />
            </Field>
            <Field label="Cena od (zł)">
              <Input
                type="number"
                value={draft.priceFrom}
                onChange={(e) => patch({ priceFrom: Number(e.target.value) })}
              />
            </Field>
            <Field label="Cena do (zł)" hint="Zostaw równe, jeśli stała">
              <Input
                type="number"
                value={draft.priceTo}
                onChange={(e) => patch({ priceTo: Number(e.target.value) })}
              />
            </Field>
          </div>

          <Field label="Opis" hint="Widoczny na stronie">
            <Textarea
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </Field>

          <Field label="Zadatek (zł)" hint="0 = bez zadatku">
            <Input
              type="number"
              value={draft.depositRequired}
              onChange={(e) => patch({ depositRequired: Number(e.target.value) })}
            />
          </Field>

          <div className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2">
            <span className="text-[12px]">Widoczna na stronie</span>
            <Switch checked={draft.active} onCheckedChange={(v) => patch({ active: v })} />
          </div>

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
