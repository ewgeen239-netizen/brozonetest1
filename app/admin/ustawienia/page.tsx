"use client";

import * as React from "react";
import { Building2, Check, Palette, Receipt, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Switch, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/misc";
import { PageBody, PageHeader } from "@/components/admin/shared";
import { useStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { SALON } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { toast, booksy } = useStore();
  const { theme, toggle } = useTheme();
  const [salon, setSalon] = React.useState({
    name: SALON.name,
    street: SALON.street,
    city: SALON.city,
    phone: SALON.phone,
    email: SALON.email,
    nip: SALON.nip,
  });
  const [notif, setNotif] = React.useState({
    smsReminder: true,
    emailSummary: true,
    noShowAlert: true,
    dailyCashReminder: true,
  });
  const [fiscal, setFiscal] = React.useState({
    vatRate: 23,
    cashRegister: "Posnet Thermal HD",
    accountantEmail: "biuro@ksiegowosc-warszawa.pl",
    autoCloseHour: "22:00",
  });

  return (
    <>
      <PageHeader
        title="Ustawienia"
        en="Settings"
        description="Dane salonu, powiadomienia, parametry księgowe i wygląd panelu."
      />

      <PageBody>
        <Tabs defaultValue="salon">
          <TabsList>
            <TabsTrigger value="salon">Salon</TabsTrigger>
            <TabsTrigger value="powiadomienia">Powiadomienia</TabsTrigger>
            <TabsTrigger value="ksiegowosc">Księgowość</TabsTrigger>
            <TabsTrigger value="wyglad">Wygląd</TabsTrigger>
          </TabsList>

          <TabsContent value="salon" className="mt-4">
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-3.5 text-[var(--accent)]" /> Dane salonu
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Field label="Nazwa">
                  <Input value={salon.name} onChange={(e) => setSalon({ ...salon, name: e.target.value })} />
                </Field>
                <Field label="NIP">
                  <Input value={salon.nip} onChange={(e) => setSalon({ ...salon, nip: e.target.value })} />
                </Field>
                <Field label="Ulica">
                  <Input value={salon.street} onChange={(e) => setSalon({ ...salon, street: e.target.value })} />
                </Field>
                <Field label="Miasto">
                  <Input value={salon.city} onChange={(e) => setSalon({ ...salon, city: e.target.value })} />
                </Field>
                <Field label="Telefon">
                  <Input value={salon.phone} onChange={(e) => setSalon({ ...salon, phone: e.target.value })} />
                </Field>
                <Field label="E-mail">
                  <Input value={salon.email} onChange={(e) => setSalon({ ...salon, email: e.target.value })} />
                </Field>
                <div className="sm:col-span-2">
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => toast({ title: "Dane salonu zapisane", tone: "ok" })}
                  >
                    <Check /> Zapisz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="powiadomienia" className="mt-4">
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5 text-[var(--accent)]" /> Powiadomienia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <ToggleRow
                  label="Przypomnienia SMS dla klientów"
                  hint="Obsługiwane po stronie Booksy dla rezerwacji z Booksy."
                  checked={notif.smsReminder}
                  onChange={(v) => setNotif({ ...notif, smsReminder: v })}
                />
                <ToggleRow
                  label="Dzienne podsumowanie e-mail"
                  hint="Wysyłane właścicielowi po zamknięciu dnia."
                  checked={notif.emailSummary}
                  onChange={(v) => setNotif({ ...notif, emailSummary: v })}
                />
                <ToggleRow
                  label="Alert no-show"
                  hint="Powiadomienie, gdy klient nie pojawi się na wizycie."
                  checked={notif.noShowAlert}
                  onChange={(v) => setNotif({ ...notif, noShowAlert: v })}
                />
                <ToggleRow
                  label="Przypomnienie o raporcie kasowym"
                  hint="Jeśli RK nie zostanie zamknięty do godziny zamknięcia salonu."
                  checked={notif.dailyCashReminder}
                  onChange={(v) => setNotif({ ...notif, dailyCashReminder: v })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ksiegowosc" className="mt-4">
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="size-3.5 text-[var(--accent)]" /> Parametry księgowe
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Field label="Stawka VAT (%)">
                  <Input
                    type="number"
                    value={fiscal.vatRate}
                    onChange={(e) => setFiscal({ ...fiscal, vatRate: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Kasa fiskalna">
                  <Input
                    value={fiscal.cashRegister}
                    onChange={(e) => setFiscal({ ...fiscal, cashRegister: e.target.value })}
                  />
                </Field>
                <Field label="E-mail biura rachunkowego">
                  <Input
                    value={fiscal.accountantEmail}
                    onChange={(e) => setFiscal({ ...fiscal, accountantEmail: e.target.value })}
                  />
                </Field>
                <Field label="Automatyczne zamknięcie dnia" hint="Godzina blokady edycji raportu.">
                  <Input
                    type="time"
                    value={fiscal.autoCloseHour}
                    onChange={(e) => setFiscal({ ...fiscal, autoCloseHour: e.target.value })}
                  />
                </Field>

                <Separator className="sm:col-span-2" />

                <div className="space-y-2 sm:col-span-2">
                  <p className="text-[12px] font-medium">Eksporty przekazywane księgowości</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="outline">Raport kasowy (RK)</Badge>
                    <Badge tone="outline">Raport zużycia kosmetyków</Badge>
                    <Badge tone="outline">Ewidencja czasu pracy</Badge>
                    <Badge tone="outline">Zestawienie prowizji</Badge>
                  </div>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => toast({ title: "Ustawienia księgowe zapisane", tone: "ok" })}
                  >
                    <Check /> Zapisz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wyglad" className="mt-4">
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="size-3.5 text-[var(--accent)]" /> Wygląd panelu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2.5">
                  <div>
                    <div className="text-[12px] font-medium">Motyw ciemny</div>
                    <div className="text-[11px] text-[var(--fg-subtle)]">
                      Domyślny dla BROZONE OS. Jasny wariant zoptymalizowany pod druk raportów.
                    </div>
                  </div>
                  <Switch checked={theme === "dark"} onCheckedChange={() => toggle()} />
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
                    Paleta marki
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Graphite", value: "#14171a" },
                      { name: "Black", value: "#08090a" },
                      { name: "Steel", value: "#5d646c" },
                      { name: "Warm white", value: "#f2efe9" },
                      { name: "Brass", value: "#c8a55b" },
                      { name: "Electric", value: "#4cc2ff" },
                    ].map((c) => (
                      <div key={c.name} className="flex items-center gap-2 rounded-md border border-[var(--border)] px-2 py-1.5">
                        <span
                          className={cn("size-5 rounded", c.value === "#f2efe9" && "border border-[var(--border)]")}
                          style={{ background: c.value }}
                        />
                        <div>
                          <div className="text-[11px] font-medium">{c.name}</div>
                          <div className="font-mono text-[10px] text-[var(--fg-subtle)]">{c.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3 text-[11px] text-[var(--fg-muted)]">
                  Wersja: BROZONE OS 1.0 · Integracja Booksy w trybie{" "}
                  <span className="font-medium text-[var(--fg)]">{booksy.mode}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3 last:border-0">
      <div className="min-w-0">
        <div className="text-[12px] font-medium">{label}</div>
        <div className="text-[11px] text-[var(--fg-muted)]">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
