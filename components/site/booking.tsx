"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Scissors, Sparkles, User, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { LanguageSwitcher } from "./language-switcher";
import { useLang } from "@/lib/i18n";
import { CATEGORY_COLOR, priceLabel, type Category, type Service, type Staff } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Rezerwacja na stronie: kategoria → usługa → specjalista → termin → dane.
   Zgłoszenie leci do /api/public/booking i ląduje w bazie ze statusem „nowa".
-------------------------------------------------------------------------- */

const CATEGORIES: { value: Category; icon: React.ElementType; hint: Record<string, string> }[] = [
  { value: "barber", icon: Scissors, hint: { pl: "Strzyżenie, broda, brzytwa", ru: "Стрижка, борода, бритва", en: "Cuts, beard, razor" } },
  { value: "tattoo", icon: Sparkles, hint: { pl: "Konsultacje i sesje tatuażu", ru: "Консультации и сессии тату", en: "Consultations and sessions" } },
  { value: "massage", icon: Waves, hint: { pl: "Klasyczny, sportowy, relaks", ru: "Классический, спортивный, релакс", en: "Classic, sport, relax" } },
];

const CATEGORY_TITLE: Record<Category, Record<string, string>> = {
  barber: { pl: "Barber", ru: "Барбер", en: "Barber" },
  tattoo: { pl: "Tatuaż", ru: "Тату", en: "Tattoo" },
  massage: { pl: "Masaż", ru: "Массаж", en: "Massage" },
};

const PLACEMENTS = ["ramię", "przedramię", "plecy", "klatka", "noga", "dłoń", "szyja", "inne"];
const SIZES = ["do 5 cm", "5–10 cm", "10–20 cm", "powyżej 20 cm"];
const PRESSURES = ["lekki", "średni", "mocny"] as const;
const FOCUS = ["plecy", "szyja", "nogi", "całe ciało"] as const;

export function BookingBlock() {
  const { t, lang } = useLang();

  const [category, setCategory] = React.useState<Category>("barber");
  const [services, setServices] = React.useState<Service[]>([]);
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [serviceId, setServiceId] = React.useState("");
  const [staffId, setStaffId] = React.useState("");
  const [date, setDate] = React.useState(todayIso());
  const [time, setTime] = React.useState("");
  const [slots, setSlots] = React.useState<{ time: string; staffId: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = React.useState(false);

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [tattoo, setTattoo] = React.useState({ idea: "", placement: PLACEMENTS[1], size: SIZES[1], reference: "" });
  const [massage, setMassage] = React.useState({ pressure: "średni", focus: "plecy", contraindications: "" });
  const [rodo, setRodo] = React.useState(false);
  const [marketing, setMarketing] = React.useState(false);
  const [honeypot, setHoneypot] = React.useState("");

  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<{ bookingId: string; serviceName: string; staffName: string } | null>(null);

  // katalog dla wybranej kategorii
  React.useEffect(() => {
    let alive = true;
    setServiceId("");
    setStaffId("");
    setTime("");
    Promise.all([
      fetch(`/api/public/services?category=${category}`).then((r) => r.json()),
      fetch(`/api/public/staff?category=${category}`).then((r) => r.json()),
    ])
      .then(([s, p]) => {
        if (!alive) return;
        setServices(s.ok ? s.data : []);
        setStaff(p.ok ? p.data : []);
      })
      .catch(() => alive && setServices([]));
    return () => {
      alive = false;
    };
  }, [category]);

  // wolne godziny
  React.useEffect(() => {
    if (!serviceId || !date) {
      setSlots([]);
      return;
    }
    let alive = true;
    setSlotsLoading(true);
    const query = new URLSearchParams({ date, serviceId });
    if (staffId) query.set("staffId", staffId);
    fetch(`/api/public/slots?${query}`)
      .then((r) => r.json())
      .then((json) => alive && setSlots(json.ok ? json.data : []))
      .catch(() => alive && setSlots([]))
      .finally(() => alive && setSlotsLoading(false));
    return () => {
      alive = false;
    };
  }, [serviceId, staffId, date]);

  const uniqueSlots = React.useMemo(() => {
    const map = new Map<string, { time: string; staffId: string }>();
    for (const slot of slots) if (!map.has(slot.time)) map.set(slot.time, slot);
    return [...map.values()];
  }, [slots]);

  const service = services.find((s) => s.serviceId === serviceId);
  const ready = Boolean(serviceId && time && name.trim() && phone.trim() && rodo);

  const submit = async () => {
    setSending(true);
    setError(null);
    try {
      const chosen = uniqueSlots.find((s) => s.time === time);
      const res = await fetch("/api/public/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: honeypot,
          date,
          timeStart: time,
          serviceId,
          staffId: staffId || chosen?.staffId,
          clientName: name,
          clientPhone: phone,
          clientEmail: email || undefined,
          notes: notes || undefined,
          consentRodo: rodo,
          consentMarketing: marketing,
          tattoo: category === "tattoo" ? tattoo : undefined,
          massage: category === "massage" ? massage : undefined,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      setDone({
        bookingId: json.data.bookingId,
        serviceName: json.data.serviceName,
        staffName: json.data.staffName,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const days = React.useMemo(
    () => Array.from({ length: 14 }, (_, i) => shiftIso(todayIso(), i)),
    [],
  );

  return (
    <section
      id="rezerwacja"
      className="relative border-y border-[var(--border)] bg-[var(--bg)] py-14 sm:py-20"
    >
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              {t.booking.eyebrow}
            </p>
            <h2 className="mt-2 text-[clamp(1.8rem,4vw,2.75rem)] font-bold leading-tight tracking-tight">
              {t.booking.title}
            </h2>
          </div>
          <LanguageSwitcher id="booking" tone="panel" variant="segmented" />
        </div>

        {done ? (
          <SuccessCard
            done={done}
            date={date}
            time={time}
            deposit={service?.depositRequired ?? 0}
            onReset={() => {
              setDone(null);
              setTime("");
              setName("");
              setPhone("");
              setEmail("");
              setNotes("");
              setRodo(false);
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-panel)]">
            {/* 1 — kategoria */}
            <div className="grid grid-cols-1 gap-2 border-b border-[var(--border)] p-4 sm:grid-cols-3">
              {CATEGORIES.map(({ value, icon: Icon, hint }) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
                    category === value
                      ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_9%,transparent)]"
                      : "border-[var(--border)] hover:border-[var(--border-strong)]",
                  )}
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg"
                    style={{
                      background: `color-mix(in oklab, ${CATEGORY_COLOR[value]} 18%, transparent)`,
                      color: CATEGORY_COLOR[value],
                    }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold">
                      {CATEGORY_TITLE[value][lang]}
                    </span>
                    <span className="block truncate text-[11px] text-[var(--fg-subtle)]">
                      {hint[lang]}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 divide-y divide-[var(--border)] lg:grid-cols-[1fr_1fr_1.2fr] lg:divide-x lg:divide-y-0">
              {/* 2 — usługa */}
              <Column index={2} title={t.booking.stepService} subtitle={t.booking.stepServiceEn}>
                <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                  {services.length === 0 ? (
                    <p className="px-1 py-6 text-center text-[12px] text-[var(--fg-subtle)]">
                      —
                    </p>
                  ) : (
                    services.map((s) => (
                      <button
                        key={s.serviceId}
                        onClick={() => {
                          setServiceId(s.serviceId);
                          setTime("");
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                          serviceId === s.serviceId
                            ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_9%,transparent)]"
                            : "border-transparent hover:border-[var(--border-strong)] hover:bg-[var(--panel-muted)]",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium">{s.name}</span>
                          <span className="block text-[11px] text-[var(--fg-subtle)]">
                            {s.durationMinutes} min
                            {s.depositRequired > 0 ? ` · zadatek ${s.depositRequired} zł` : ""}
                          </span>
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold tabular">
                          {priceLabel(s)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </Column>

              {/* 3 — specjalista */}
              <Column index={3} title={t.booking.stepBarber} subtitle={t.booking.stepBarberEn}>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setStaffId("");
                      setTime("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                      !staffId
                        ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_9%,transparent)]"
                        : "border-transparent hover:border-[var(--border-strong)]",
                    )}
                  >
                    <span className="grid size-8 place-items-center rounded-full border border-dashed border-[var(--border-strong)] text-[var(--fg-subtle)]">
                      <User className="size-3.5" />
                    </span>
                    <span>
                      <span className="block text-[13px] font-medium">{t.booking.anyBarber}</span>
                      <span className="block text-[11px] text-[var(--fg-subtle)]">
                        {t.booking.anyBarberHint}
                      </span>
                    </span>
                  </button>

                  {staff.map((person) => (
                    <button
                      key={person.staffId}
                      onClick={() => {
                        setStaffId(person.staffId);
                        setTime("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                        staffId === person.staffId
                          ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_9%,transparent)]"
                          : "border-transparent hover:border-[var(--border-strong)]",
                      )}
                    >
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold"
                        style={{
                          background: `color-mix(in oklab, ${person.calendarColor} 20%, transparent)`,
                          color: person.calendarColor,
                        }}
                      >
                        {person.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium">{person.name}</span>
                        <span className="block truncate text-[11px] text-[var(--fg-subtle)]">
                          {person.category === "tattoo"
                            ? person.style
                            : person.category === "massage"
                              ? person.specialization
                              : person.specialization}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </Column>

              {/* 4 — termin */}
              <Column index={4} title={t.booking.stepDate} subtitle={t.booking.stepDateEn}>
                <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        setDate(day);
                        setTime("");
                      }}
                      className={cn(
                        "flex min-w-13 shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2.5 py-2 transition-all",
                        date === day
                          ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]"
                          : "border-[var(--border)] hover:border-[var(--border-strong)]",
                      )}
                    >
                      <span className="text-[10px] uppercase tracking-wide text-[var(--fg-subtle)]">
                        {shortWeekday(day)}
                      </span>
                      <span className="text-[15px] font-semibold tabular leading-none">
                        {Number(day.slice(-2))}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 max-h-48 overflow-y-auto pr-1">
                  {!serviceId ? (
                    <p className="rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-8 text-center text-[12px] text-[var(--fg-muted)]">
                      {t.booking.stepService} →
                    </p>
                  ) : slotsLoading ? (
                    <p className="py-6 text-center text-[12px] text-[var(--fg-muted)]">…</p>
                  ) : uniqueSlots.length ? (
                    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 lg:grid-cols-4">
                      {uniqueSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setTime(slot.time)}
                          className={cn(
                            "rounded-md border px-1 py-1.5 text-[12px] tabular transition-all",
                            time === slot.time
                              ? "border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--brand-white)]"
                              : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--panel-muted)]",
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-8 text-center">
                      <p className="text-[13px] font-medium">{t.booking.noSchedule}</p>
                      <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
                        {t.booking.noScheduleHint}
                      </p>
                    </div>
                  )}
                </div>
              </Column>
            </div>

            {/* 5 — dane */}
            <div className="border-t border-[var(--border)] p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Imię i nazwisko *">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Telefon *">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="600 100 200"
                  />
                </Field>
                <Field label="E-mail">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
              </div>

              <AnimatePresence initial={false}>
                {category === "tattoo" ? (
                  <motion.div
                    key="tattoo"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <Field label="Opisz swój pomysł *" className="sm:col-span-3">
                        <Textarea
                          value={tattoo.idea}
                          onChange={(e) => setTattoo({ ...tattoo, idea: e.target.value })}
                          placeholder="Co chcesz wytatuować? Im więcej szczegółów, tym lepiej."
                        />
                      </Field>
                      <Field label="Miejsce na ciele">
                        <select
                          value={tattoo.placement}
                          onChange={(e) => setTattoo({ ...tattoo, placement: e.target.value })}
                          className="h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] px-3 text-sm"
                        >
                          {PLACEMENTS.map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Przybliżony rozmiar">
                        <select
                          value={tattoo.size}
                          onChange={(e) => setTattoo({ ...tattoo, size: e.target.value })}
                          className="h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] px-3 text-sm"
                        >
                          {SIZES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Link do inspiracji">
                        <Input
                          value={tattoo.reference}
                          onChange={(e) => setTattoo({ ...tattoo, reference: e.target.value })}
                        />
                      </Field>
                    </div>
                  </motion.div>
                ) : null}

                {category === "massage" ? (
                  <motion.div
                    key="massage"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <Field label="Siła nacisku">
                        <select
                          value={massage.pressure}
                          onChange={(e) => setMassage({ ...massage, pressure: e.target.value })}
                          className="h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] px-3 text-sm"
                        >
                          {PRESSURES.map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Na czym się skupić">
                        <select
                          value={massage.focus}
                          onChange={(e) => setMassage({ ...massage, focus: e.target.value })}
                          className="h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] px-3 text-sm"
                        >
                          {FOCUS.map((f) => (
                            <option key={f}>{f}</option>
                          ))}
                        </select>
                      </Field>
                      <Field
                        label="Przeciwwskazania"
                        hint="Trafia tylko do masażysty"
                      >
                        <Input
                          value={massage.contraindications}
                          onChange={(e) =>
                            setMassage({ ...massage, contraindications: e.target.value })
                          }
                          placeholder="Kontuzje, ciąża, choroby…"
                        />
                      </Field>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <Field label="Komentarz" className="mt-3">
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Coś, o czym powinniśmy wiedzieć?"
                />
              </Field>

              {/* honeypot — niewidoczny dla ludzi */}
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="pointer-events-none absolute size-0 opacity-0"
              />

              <div className="mt-4 space-y-2">
                <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed">
                  <input
                    type="checkbox"
                    checked={rodo}
                    onChange={(e) => setRodo(e.target.checked)}
                    className="mt-0.5 size-4 accent-[var(--accent)]"
                  />
                  <span>
                    Zgadzam się na przetwarzanie moich danych osobowych w celu obsługi rezerwacji. *
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-[var(--fg-muted)]">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-0.5 size-4 accent-[var(--accent)]"
                  />
                  <span>Chcę otrzymywać informacje o promocjach i nowościach.</span>
                </label>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="mt-3 rounded-md border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2 text-[12px] text-[var(--danger)]"
                >
                  {error}
                </p>
              ) : null}
            </div>

            {/* podsumowanie i wysyłka */}
            <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[12px] text-[var(--fg-muted)]">
                {service ? (
                  <>
                    <span className="font-medium text-[var(--fg)]">{service.name}</span> ·{" "}
                    {date} {time || t.booking.pickTime} ·{" "}
                    <span className="tabular">{priceLabel(service)}</span>
                  </>
                ) : (
                  t.booking.stepService
                )}
              </div>
              <Button
                variant="accent"
                size="lg"
                disabled={!ready || sending}
                onClick={submit}
                className="w-full sm:w-auto"
              >
                {sending ? <Loader2 className="animate-spin" /> : null}
                Wyślij zgłoszenie
              </Button>
            </div>
          </div>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-[var(--fg-subtle)]">
          {t.booking.note}
        </p>
      </div>
    </section>
  );
}

function SuccessCard({
  done,
  date,
  time,
  deposit,
  onReset,
}: {
  done: { bookingId: string; serviceName: string; staffName: string };
  date: string;
  time: string;
  deposit: number;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[color-mix(in_oklab,var(--ok)_40%,transparent)] bg-[color-mix(in_oklab,var(--ok)_8%,var(--panel))] p-6 text-center"
    >
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-[color-mix(in_oklab,var(--ok)_18%,transparent)] text-[var(--ok)]">
        <Check className="size-6" />
      </span>
      <h3 className="mt-4 text-[20px] font-bold">Zgłoszenie przyjęte</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-[var(--fg-muted)]">
        Dziękujemy! Skontaktujemy się telefonicznie, żeby potwierdzić termin.
      </p>

      <div className="mx-auto mt-4 max-w-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 text-left text-[13px]">
        <div className="font-medium">{done.serviceName}</div>
        <div className="mt-1 text-[var(--fg-muted)]">
          {date}, {time} · {done.staffName}
        </div>
        {deposit > 0 ? (
          <div className="mt-2 text-[12px] text-[var(--warn)]">
            Termin rezerwujemy po wpłacie zadatku {deposit} zł. Szczegóły podamy przy potwierdzeniu.
          </div>
        ) : null}
        <div className="mt-3 border-t border-[var(--border)] pt-2 text-[11px] text-[var(--fg-subtle)]">
          Numer zgłoszenia: <span className="font-mono">{done.bookingId}</span>
        </div>
      </div>

      <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
        Umów kolejną wizytę
      </Button>
    </motion.div>
  );
}

function Column({
  index,
  title,
  subtitle,
  children,
}: {
  index: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] text-[10px] font-bold tabular text-[var(--accent)]">
          {index}
        </span>
        <span className="text-[13px] font-semibold">{title}</span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
          {subtitle}
        </span>
      </div>
      {children}
    </div>
  );
}

/* --------------------------------- daty ---------------------------------- */

const pad = (n: number) => `${n}`.padStart(2, "0");

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function shiftIso(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

const WEEKDAYS_SHORT = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];

function shortWeekday(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return WEEKDAYS_SHORT[(new Date(y, m - 1, d).getDay() + 6) % 7];
}
