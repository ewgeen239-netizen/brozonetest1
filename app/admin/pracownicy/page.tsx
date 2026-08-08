"use client";

import * as React from "react";
import { Check, Loader2, Pencil, Plus, UserSquare2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/misc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/misc";
import { FilterBar, PageBody, PageHeader } from "@/components/admin/shared";
import { CategoryFilter } from "@/components/admin/universal/category-filter";
import { CategoryTag } from "@/components/admin/universal/badges";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  type Category,
  type MassageSpecialization,
  type Staff,
  type TattooStyle,
} from "@/lib/booking/types";
import { saveStaff, useStaff } from "@/lib/booking/use-api";
import { cn, initials } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Jedna lista, trzy typy specjalistów. Formularz dopasowuje się do typu —
   tatuator nie ma prowizji od strzyżenia, masażysta ma numer gabinetu.
-------------------------------------------------------------------------- */

const WEEKDAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];

export default function StaffPage() {
  const [category, setCategory] = React.useState("all");
  const [editing, setEditing] = React.useState<Staff | null>(null);
  const [creating, setCreating] = React.useState(false);

  const { data, loading, error, reload } = useStaff(category);
  const crew = data ?? [];

  return (
    <>
      <PageHeader
        title="Pracownicy"
        en="Staff"
        description="Barberzy, tatuatorzy i masażyści. Godziny pracy sterują wolnymi terminami na stronie."
        actions={
          <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
            <Plus /> Dodaj pracownika
          </Button>
        }
      >
        <FilterBar>
          <CategoryFilter value={category} onChange={setCategory} id="staff" />
          <span className="ml-auto text-[11px] text-[var(--fg-subtle)]">{crew.length} osób</span>
        </FilterBar>
      </PageHeader>

      <PageBody>
        {loading && !data ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            <EmptyState
              title="Nie udało się wczytać pracowników"
              description={error}
              action={
                <Button variant="outline" size="sm" onClick={reload}>
                  Spróbuj ponownie
                </Button>
              }
            />
          </div>
        ) : crew.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            <EmptyState
              icon={UserSquare2}
              title="Nie masz jeszcze nikogo w tej kategorii."
              description="Bez pracowników klienci nie mogą się zapisać."
              action={
                <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
                  <Plus /> Dodaj pracownika
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {crew.map((person) => (
              <article
                key={person.staffId}
                className={cn(
                  "relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]",
                  !person.active && "opacity-60",
                )}
              >
                <span
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ background: CATEGORY_COLOR[person.category] }}
                />

                <div className="flex items-start gap-3 p-4">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-lg text-[13px] font-bold"
                    style={{
                      background: `color-mix(in oklab, ${CATEGORY_COLOR[person.category]} 18%, var(--panel-muted))`,
                      color: `color-mix(in oklab, ${CATEGORY_COLOR[person.category]} 85%, white)`,
                    }}
                  >
                    {initials(person.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[14px] font-semibold">{person.name}</h3>
                      {!person.active ? (
                        <Badge tone="outline" size="sm">
                          archiwum
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-[var(--fg-muted)]">
                      {describe(person)}
                    </p>
                    <div className="mt-1.5">
                      <CategoryTag category={person.category} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 px-4">
                  {person.workingHours.map((h) => (
                    <span
                      key={h.weekday}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px]",
                        h.enabled
                          ? "border border-[var(--border-strong)] bg-[var(--panel-muted)]"
                          : "text-[var(--fg-subtle)] opacity-50",
                      )}
                    >
                      {WEEKDAYS[h.weekday - 1]}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-[var(--border)] px-4 py-2.5">
                  <span className="text-[11px] text-[var(--fg-subtle)]">
                    {person.workingHours.find((h) => h.enabled)?.start ?? "—"}–
                    {person.workingHours.find((h) => h.enabled)?.end ?? "—"}
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="ml-auto"
                    onClick={() => setEditing(person)}
                  >
                    <Pencil /> Edytuj
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </PageBody>

      <StaffDialog
        key={editing?.staffId ?? "new"}
        open={creating || Boolean(editing)}
        staff={editing}
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

function describe(person: Staff) {
  if (person.category === "barber") return person.specialization || "Barber";
  if (person.category === "tattoo") return `Styl: ${person.style}`;
  return `${person.specialization}${person.roomNumber ? ` · gabinet ${person.roomNumber}` : ""}`;
}

/* -------------------------------- formularz ------------------------------ */

const TATTOO_STYLES: TattooStyle[] = [
  "fine line",
  "realism",
  "blackwork",
  "lettering",
  "color",
  "inny",
];
const MASSAGE_SPECS: MassageSpecialization[] = [
  "sportowy",
  "relaksacyjny",
  "klasyczny",
  "leczniczy",
  "inny",
];

function emptyStaff(category: Category): Staff {
  const base = {
    staffId: `stf_${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    workingHours: Array.from({ length: 7 }, (_, i) => ({
      weekday: (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      start: "10:00",
      end: "20:00",
      enabled: i < 5,
    })),
    daysOff: [],
    calendarColor: CATEGORY_COLOR[category],
    active: true,
    showOnWebsite: true,
  };
  if (category === "tattoo") {
    return {
      ...base,
      category: "tattoo",
      style: "fine line",
      consultationRequired: true,
      minPrice: 300,
      depositRequired: 200,
    };
  }
  if (category === "massage") {
    return { ...base, category: "massage", specialization: "klasyczny", serviceIds: [] };
  }
  return { ...base, category: "barber", specialization: "", serviceIds: [], commissionPercent: 40 };
}

function StaffDialog({
  open,
  staff,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  staff: Staff | null;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = React.useState<Staff>(staff ?? emptyStaff("barber"));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDraft(staff ?? emptyStaff("barber"));
      setError(null);
    }
  }, [open, staff]);

  const patch = (p: Partial<Staff>) => setDraft((d) => ({ ...d, ...p }) as Staff);

  const submit = async () => {
    if (!draft.name.trim()) return setError("Wpisz imię i nazwisko.");
    setSaving(true);
    setError(null);
    try {
      await saveStaff(draft);
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
      <DialogContent className="w-[min(94vw,42rem)]">
        <DialogHeader>
          <DialogTitle>{staff ? "Edytuj pracownika" : "Dodaj pracownika"}</DialogTitle>
          <DialogDescription>
            Wymagane jest tylko imię i kategoria — resztę uzupełnisz później.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[62vh] space-y-4 overflow-y-auto p-5">
          {!staff ? (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
                Kim jest ta osoba?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["barber", "tattoo", "massage"] as Category[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setDraft(emptyStaff(c))}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-[13px] font-medium transition-colors",
                      draft.category === c
                        ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]"
                        : "border-[var(--border)] hover:border-[var(--border-strong)]",
                    )}
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{ background: CATEGORY_COLOR[c] }}
                    />
                    {CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Imię i nazwisko">
              <Input value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
            <Field label="Telefon" hint="Niepubliczny">
              <Input value={draft.phone ?? ""} onChange={(e) => patch({ phone: e.target.value })} />
            </Field>

            {draft.category === "barber" ? (
              <>
                <Field label="Specjalizacja">
                  <Input
                    value={draft.specialization}
                    onChange={(e) => patch({ specialization: e.target.value } as Partial<Staff>)}
                    placeholder="Fade & classic"
                  />
                </Field>
                <Field label="Prowizja (%)">
                  <Input
                    type="number"
                    value={draft.commissionPercent}
                    onChange={(e) =>
                      patch({ commissionPercent: Number(e.target.value) } as Partial<Staff>)
                    }
                  />
                </Field>
              </>
            ) : null}

            {draft.category === "tattoo" ? (
              <>
                <Field label="Styl">
                  <select
                    value={draft.style}
                    onChange={(e) => patch({ style: e.target.value as TattooStyle } as Partial<Staff>)}
                    className="h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] px-3 text-sm"
                  >
                    {TATTOO_STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Instagram">
                  <Input
                    value={draft.instagram ?? ""}
                    onChange={(e) => patch({ instagram: e.target.value } as Partial<Staff>)}
                    placeholder="@nazwa"
                  />
                </Field>
                <Field label="Cena minimalna (zł)">
                  <Input
                    type="number"
                    value={draft.minPrice}
                    onChange={(e) => patch({ minPrice: Number(e.target.value) } as Partial<Staff>)}
                  />
                </Field>
                <Field label="Zadatek (zł)">
                  <Input
                    type="number"
                    value={draft.depositRequired}
                    onChange={(e) =>
                      patch({ depositRequired: Number(e.target.value) } as Partial<Staff>)
                    }
                  />
                </Field>
                <div className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 sm:col-span-2">
                  <span className="text-[12px]">Wymagana konsultacja przed sesją</span>
                  <Switch
                    checked={draft.consultationRequired}
                    onCheckedChange={(v) =>
                      patch({ consultationRequired: v } as Partial<Staff>)
                    }
                  />
                </div>
              </>
            ) : null}

            {draft.category === "massage" ? (
              <>
                <Field label="Specjalizacja">
                  <select
                    value={draft.specialization}
                    onChange={(e) =>
                      patch({
                        specialization: e.target.value as MassageSpecialization,
                      } as Partial<Staff>)
                    }
                    className="h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] px-3 text-sm"
                  >
                    {MASSAGE_SPECS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Numer gabinetu">
                  <Input
                    value={draft.roomNumber ?? ""}
                    onChange={(e) => patch({ roomNumber: e.target.value } as Partial<Staff>)}
                  />
                </Field>
              </>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
              Godziny pracy
            </p>
            <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
              {draft.workingHours.map((h, i) => (
                <div key={h.weekday} className="flex items-center gap-3 px-3 py-2">
                  <span className="w-10 text-[12px] font-medium">{WEEKDAYS[h.weekday - 1]}</span>
                  <Switch
                    checked={h.enabled}
                    onCheckedChange={(v) => {
                      const next = [...draft.workingHours];
                      next[i] = { ...h, enabled: v };
                      patch({ workingHours: next });
                    }}
                  />
                  <Input
                    type="time"
                    value={h.start}
                    disabled={!h.enabled}
                    onChange={(e) => {
                      const next = [...draft.workingHours];
                      next[i] = { ...h, start: e.target.value };
                      patch({ workingHours: next });
                    }}
                    className="h-8 w-28 text-[12px]"
                  />
                  <span className="text-[var(--fg-subtle)]">–</span>
                  <Input
                    type="time"
                    value={h.end}
                    disabled={!h.enabled}
                    onChange={(e) => {
                      const next = [...draft.workingHours];
                      next[i] = { ...h, end: e.target.value };
                      patch({ workingHours: next });
                    }}
                    className="h-8 w-28 text-[12px]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2">
              <span className="text-[12px]">Przyjmuje rezerwacje</span>
              <Switch checked={draft.active} onCheckedChange={(v) => patch({ active: v })} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2">
              <span className="text-[12px]">Widoczny na stronie</span>
              <Switch
                checked={draft.showOnWebsite}
                onCheckedChange={(v) => patch({ showOnWebsite: v })}
              />
            </div>
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
