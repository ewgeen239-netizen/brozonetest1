"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Archive, ArrowUpRight, Pencil, Plus, Search, UserSquare2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, Progress } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { FilterBar, PageBody, PageHeader, SegmentedControl } from "@/components/admin/shared";
import { BarberFormDialog } from "@/components/admin/barber-form";
import { useStore } from "@/lib/store";
import { occupancyFor } from "@/lib/availability";
import type { Barber } from "@/lib/types";
import { addDays, plnFormat, sum, WEEKDAYS_PL } from "@/lib/utils";

export default function BarbersPage() {
  const { barbers, appointments, today, archiveBarber } = useStore();
  const [filter, setFilter] = React.useState<"active" | "archived" | "all">("active");
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<Barber | null>(null);
  const [creating, setCreating] = React.useState(false);

  const list = barbers.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || b.name.toLowerCase().includes(q) || b.specialization.toLowerCase().includes(q);
  });

  const monthStart = addDays(today, -30);

  return (
    <>
      <PageHeader
        title="Barberzy"
        en="Barbers"
        description="Zespół, prowizje, godziny pracy i kolory w kalendarzu."
        actions={
          <Button variant="brass" size="sm" onClick={() => setCreating(true)}>
            <Plus /> Dodaj barbera
          </Button>
        }
      >
        <FilterBar>
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={[
              { value: "active", label: "Aktywni" },
              { value: "archived", label: "Archiwum" },
              { value: "all", label: "Wszyscy" },
            ]}
          />
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj barbera…"
              className="h-8 w-56 pl-8 text-[12px]"
            />
          </div>
          <span className="ml-auto text-[11px] text-[var(--fg-subtle)]">{list.length} osób</span>
        </FilterBar>
      </PageHeader>

      <PageBody>
        {list.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
            <EmptyState
              icon={UserSquare2}
              title="Brak barberów"
              description="Dodaj pierwszego barbera, aby zacząć planować grafik i rezerwacje."
              action={
                <Button variant="brass" size="sm" onClick={() => setCreating(true)}>
                  <Plus /> Dodaj barbera
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((b, i) => {
              const mine = appointments.filter((a) => a.barberId === b.id);
              const monthDone = mine.filter((a) => a.status === "completed" && a.date >= monthStart);
              const revenue = sum(monthDone, (a) => a.price);
              const noShow = mine.filter((a) => a.status === "no_show" && a.date >= monthStart).length;
              const occ = occupancyFor({ barber: b, date: today, appointments });

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] transition-colors hover:border-[var(--border-strong)]"
                >
                  <div className="flex items-start gap-3 p-4">
                    <Avatar
                      src={b.photoUrl}
                      name={b.name}
                      ring={b.color}
                      className="size-12 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/barberzy/${b.id}`}
                          className="truncate text-[14px] font-semibold hover:text-[var(--brass)]"
                        >
                          {b.name}
                        </Link>
                        {b.status === "archived" ? (
                          <Badge tone="outline" size="sm">
                            archiwum
                          </Badge>
                        ) : null}
                      </div>
                      <p className="truncate text-[12px] text-[var(--fg-muted)]">
                        {b.specialization}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <Badge tone="brass" size="sm">
                          {b.commissionPct}% prowizji
                        </Badge>
                        <Badge tone="outline" size="sm">
                          ★ {b.rating}
                        </Badge>
                        <Badge tone="outline" size="sm">
                          {b.serviceIds.length} usług
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-y border-[var(--border)] bg-[var(--panel-muted)]">
                    <Metric label="Przychód 30 dni" value={plnFormat(revenue, { compact: true })} />
                    <Metric label="Wizyty" value={String(monthDone.length)} />
                    <Metric label="No-show" value={String(noShow)} tone={noShow > 2 ? "danger" : undefined} />
                  </div>

                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between text-[11px] text-[var(--fg-muted)]">
                      <span>Obłożenie dzisiaj</span>
                      <span className="tabular">{occ.pct}%</span>
                    </div>
                    <Progress value={occ.pct} color={b.color} />

                    <div className="flex flex-wrap gap-1 pt-1">
                      {b.workingHours.map((h) => (
                        <span
                          key={h.weekday}
                          className={
                            h.enabled
                              ? "rounded border border-[var(--border-strong)] bg-[var(--panel-muted)] px-1.5 py-0.5 text-[10px]"
                              : "rounded border border-transparent px-1.5 py-0.5 text-[10px] text-[var(--fg-subtle)] opacity-50"
                          }
                        >
                          {WEEKDAYS_PL[h.weekday - 1]}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-[var(--border)] px-4 py-2.5">
                    <Button asChild variant="ghost" size="xs">
                      <Link href={`/admin/barberzy/${b.id}`}>
                        Profil <ArrowUpRight />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => setEditing(b)}>
                      <Pencil /> Edytuj
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="ml-auto"
                      onClick={() => archiveBarber(b.id)}
                    >
                      <Archive /> {b.status === "active" ? "Archiwizuj" : "Przywróć"}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </PageBody>

      <BarberFormDialog
        open={creating || Boolean(editing)}
        onOpenChange={(v) => {
          if (!v) {
            setCreating(false);
            setEditing(null);
          }
        }}
        barber={editing}
      />
    </>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger";
}) {
  return (
    <div className="px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">{label}</div>
      <div
        className="mt-0.5 text-[14px] font-semibold tabular"
        style={tone === "danger" ? { color: "var(--danger)" } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
