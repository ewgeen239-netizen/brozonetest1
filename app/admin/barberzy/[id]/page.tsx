"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, Pencil, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, Progress } from "@/components/ui/misc";
import { MiniBars, Donut } from "@/components/ui/data-viz";
import { Table, TBody, THead, TableWrap } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { KpiCard, PageBody, PageHeader, StatusBadge } from "@/components/admin/shared";
import { BarberFormDialog } from "@/components/admin/barber-form";
import { useStore } from "@/lib/store";
import { occupancyFor } from "@/lib/availability";
import {
  addDays,
  formatDatePL,
  isoWeekday,
  plnFormat,
  sum,
  WEEKDAYS_PL,
} from "@/lib/utils";

export default function BarberProfilePage() {
  const params = useParams<{ id: string }>();
  const { barbers, appointments, services, clients, timeEntries, today } = useStore();
  const [editing, setEditing] = React.useState(false);

  const barber = barbers.find((b) => b.id === params.id);

  if (!barber) {
    return (
      <PageBody>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <EmptyState
            title="Nie znaleziono barbera"
            description="Rekord mógł zostać usunięty lub link jest nieaktualny."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/barberzy">
                  <ArrowLeft /> Wróć do listy
                </Link>
              </Button>
            }
          />
        </div>
      </PageBody>
    );
  }

  const monthStart = addDays(today, -30);
  const mine = appointments.filter((a) => a.barberId === barber.id);
  const monthApts = mine.filter((a) => a.date >= monthStart && a.date <= today);
  const done = monthApts.filter((a) => a.status === "completed");
  const revenue = sum(done, (a) => a.price);
  const commission = (revenue * barber.commissionPct) / 100;
  const noShow = monthApts.filter((a) => a.status === "no_show").length;
  const tips = sum(done, (a) => a.tip ?? 0);

  const hours = timeEntries
    .filter((t) => t.barberId === barber.id && t.date >= monthStart)
    .reduce((acc, t) => acc + t.totalHours, 0);

  const last14 = Array.from({ length: 14 }, (_, i) => addDays(today, -13 + i));
  const dailyRevenue = last14.map((d) =>
    sum(mine.filter((a) => a.date === d && a.status === "completed"), (a) => a.price),
  );

  const serviceCounts = services
    .map((s) => ({
      service: s,
      count: done.filter((a) => a.serviceIds.includes(s.id)).length,
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const palette = ["var(--brass)", "var(--info)", "#9d7bff", "var(--ok)", "var(--warn)"];

  const recent = [...mine]
    .filter((a) => a.date <= today)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 12);

  const occ = occupancyFor({ barber, date: today, appointments });

  return (
    <>
      <PageHeader
        title={barber.name}
        en="Barber profile"
        description={`${barber.specialization} · w zespole od ${formatDatePL(barber.hiredAt)}`}
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/barberzy">
                <ArrowLeft /> Zespół
              </Link>
            </Button>
            {barber.booksyProfileUrl ? (
              <Button asChild variant="outline" size="sm">
                <a href={barber.booksyProfileUrl} target="_blank" rel="noreferrer">
                  Booksy <ExternalLink />
                </a>
              </Button>
            ) : null}
            <Button variant="brass" size="sm" onClick={() => setEditing(true)}>
              <Pencil /> Edytuj
            </Button>
          </>
        }
      />

      <PageBody>
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          {/* profile card */}
          <Card className="h-fit">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={barber.photoUrl}
                  name={barber.name}
                  ring={barber.color}
                  className="size-14 rounded-lg"
                />
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold">{barber.name}</div>
                  <div className="truncate text-[12px] text-[var(--fg-muted)]">
                    {barber.nickname ? `„${barber.nickname}” · ` : ""}
                    {barber.specialization}
                  </div>
                  <Badge tone={barber.status === "active" ? "ok" : "outline"} size="sm" className="mt-1">
                    {barber.status === "active" ? "Aktywny" : "Archiwum"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5 text-[12px]">
                <a href={`tel:${barber.phone}`} className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--brass)]">
                  <Phone className="size-3.5" /> {barber.phone}
                </a>
                <a href={`mailto:${barber.email}`} className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--brass)]">
                  <Mail className="size-3.5" /> {barber.email}
                </a>
              </div>

              <div className="space-y-2 border-t border-[var(--border)] pt-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[var(--fg-muted)]">Obłożenie dzisiaj</span>
                  <span className="tabular font-medium">{occ.pct}%</span>
                </div>
                <Progress value={occ.pct} color={barber.color} />
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                  Godziny pracy
                </p>
                <div className="space-y-1">
                  {barber.workingHours.map((h) => (
                    <div key={h.weekday} className="flex items-center justify-between text-[11px]">
                      <span className={h.enabled ? "" : "text-[var(--fg-subtle)]"}>
                        {WEEKDAYS_PL[h.weekday - 1]}
                      </span>
                      <span className="tabular text-[var(--fg-muted)]">
                        {h.enabled ? `${h.start}–${h.end}` : "wolne"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {barber.daysOff.length ? (
                <div className="border-t border-[var(--border)] pt-3">
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                    Zaplanowane dni wolne
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {barber.daysOff.map((d) => (
                      <Badge key={d} tone="outline" size="sm">
                        {formatDatePL(d)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <KpiCard label="Przychód 30 dni" en="Revenue" value={revenue} format="pln" spark={dailyRevenue.slice(-7)} index={0} />
              <KpiCard label="Wizyty" en="Bookings" value={done.length} index={1} hint={`${monthApts.length} łącznie`} />
              <KpiCard label="Prowizja" en="Commission" value={commission} format="pln" color="var(--ok)" index={2} hint={`${barber.commissionPct}% · napiwki ${plnFormat(tips, { compact: true })}`} />
              <KpiCard label="No-show" en="Missed" value={noShow} color="var(--danger)" index={3} hint={`${hours.toFixed(1)} h przepracowanych`} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Przychód dzienny — 14 dni</CardTitle>
                  <span className="text-[11px] tabular text-[var(--fg-subtle)]">
                    {plnFormat(sum(dailyRevenue, (v) => v), { compact: true })}
                  </span>
                </CardHeader>
                <CardContent>
                  <MiniBars
                    data={dailyRevenue}
                    labels={last14.map((d) => WEEKDAYS_PL[isoWeekday(d) - 1])}
                    color={barber.color}
                    valueFormat={(v) => plnFormat(v, { compact: true })}
                    height={140}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ulubione usługi</CardTitle>
                </CardHeader>
                <CardContent>
                  {serviceCounts.length ? (
                    <div className="flex items-center gap-4">
                      <Donut
                        segments={serviceCounts.slice(0, 5).map((s, i) => ({
                          value: s.count,
                          color: palette[i % palette.length],
                          label: s.service.name,
                        }))}
                        center={
                          <div className="text-center">
                            <div className="text-[18px] font-semibold tabular leading-none">
                              {done.length}
                            </div>
                            <div className="text-[9px] uppercase tracking-wide text-[var(--fg-subtle)]">
                              wizyt
                            </div>
                          </div>
                        }
                      />
                      <ul className="min-w-0 flex-1 space-y-1.5">
                        {serviceCounts.slice(0, 5).map((s, i) => (
                          <li key={s.service.id} className="flex items-center gap-2 text-[12px]">
                            <span
                              className="size-2 shrink-0 rounded-full"
                              style={{ background: palette[i % palette.length] }}
                            />
                            <span className="truncate">{s.service.name}</span>
                            <span className="ml-auto tabular text-[var(--fg-muted)]">{s.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <EmptyState title="Brak zrealizowanych wizyt" className="py-8" />
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Ostatnie wizyty</CardTitle>
              </CardHeader>
              <TableWrap>
                <Table>
                  <THead>
                    <tr>
                      <th>Data</th>
                      <th>Godzina</th>
                      <th>Klient</th>
                      <th>Usługa</th>
                      <th>Status</th>
                      <th className="text-right">Kwota</th>
                    </tr>
                  </THead>
                  <TBody>
                    {recent.map((a) => (
                      <tr key={a.id}>
                        <td className="tabular">{formatDatePL(a.date)}</td>
                        <td className="tabular">{a.start}</td>
                        <td>{clients.find((c) => c.id === a.clientId)?.name}</td>
                        <td className="text-[var(--fg-muted)]">
                          {a.serviceIds.map((id) => services.find((s) => s.id === id)?.name).join(" + ")}
                        </td>
                        <td>
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="text-right tabular font-medium">
                          {plnFormat(a.price, { compact: true })}
                        </td>
                      </tr>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            </Card>
          </div>
        </div>
      </PageBody>

      <BarberFormDialog open={editing} onOpenChange={setEditing} barber={barber} />
    </>
  );
}
