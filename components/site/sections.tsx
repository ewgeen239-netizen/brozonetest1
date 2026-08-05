"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Clock, Mail, MapPin, Phone, Quote, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RazorDivider } from "./chrome-mark";
import { SALON, salonAddress } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { priceForBarber, servicesForBarber } from "@/lib/pricing";
import type { Barber, Service } from "@/lib/types";
import { cn, durationLabel, initials, plnFormat } from "@/lib/utils";

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-[clamp(1.8rem,4vw,2.75rem)] font-bold leading-tight tracking-tight">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------- services -------------------------------- */

export function ServicesSection() {
  const { t } = useLang();
  const { services, barbers } = useStore();
  const crew = barbers.filter((b) => b.status === "active");

  return (
    <section id="uslugi" className="relative py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHead
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          action={
            <p className="max-w-xs text-[12px] leading-relaxed text-[var(--fg-subtle)]">
              {t.services.priceNote}
            </p>
          }
        />

        <div className="grid gap-3 lg:grid-cols-2">
          {crew.map((barber, i) => (
            <BarberPriceCard key={barber.id} barber={barber} services={services} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** price list of one barber: two headline services, the rest behind an arrow */
function BarberPriceCard({
  barber,
  services,
  index,
}: {
  barber: Barber;
  services: Service[];
  index: number;
}) {
  const { t } = useLang();
  const [open, setOpen] = React.useState(false);
  const mine = servicesForBarber(services, barber);
  const visible = mine.slice(0, 2);
  const hidden = mine.slice(2);

  return (
    <motion.article
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] transition-colors hover:border-[color-mix(in_oklab,var(--brass)_35%,transparent)]"
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${barber.color}, transparent)` }}
      />

      <header className="flex items-center gap-3 border-b border-[var(--border)] p-4">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-lg text-[13px] font-black"
          style={{
            background: `color-mix(in oklab, ${barber.color} 18%, var(--panel-muted))`,
            color: `color-mix(in oklab, ${barber.color} 85%, white)`,
          }}
        >
          {initials(barber.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold tracking-tight">{barber.name}</h3>
          <p className="truncate text-[12px] text-[var(--fg-muted)]">{barber.specialization}</p>
        </div>
        <span className="shrink-0 text-[11px] tabular text-[var(--fg-subtle)]">
          {mine.length} {t.services.servicesCount}
        </span>
      </header>

      <ul className="divide-y divide-[var(--border)]">
        {visible.map((s) => (
          <ServiceRow key={s.id} service={s} barber={barber} highlight />
        ))}
      </ul>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            key="rest"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="divide-y divide-[var(--border)] overflow-hidden border-t border-[var(--border)]"
          >
            {hidden.map((s) => (
              <ServiceRow key={s.id} service={s} barber={barber} />
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>

      {hidden.length ? (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-center gap-1.5 border-t border-[var(--border)] bg-[var(--panel-muted)] px-4 py-2.5 text-[12px] font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--brass)]"
        >
          {open ? t.services.less : `${t.services.more} (${hidden.length})`}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="size-4" />
          </motion.span>
        </button>
      ) : null}
    </motion.article>
  );
}

function ServiceRow({
  service,
  barber,
  highlight,
}: {
  service: Service;
  barber: Barber;
  highlight?: boolean;
}) {
  const { t } = useLang();
  const { price, durationMin, exact } = priceForBarber(service, barber);

  return (
    <li className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--panel-muted)]">
      <div className="min-w-0 flex-1">
        <div className={cn("truncate text-[13px]", highlight ? "font-semibold" : "font-medium")}>
          {service.name}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--fg-subtle)]">
          <span className="flex items-center gap-1">
            <Clock className="size-3" /> {durationLabel(durationMin)}
          </span>
          <span>· {service.nameEn}</span>
          {highlight && service.popularity > 85 ? (
            <Badge tone="brass" size="sm">
              {t.services.popular}
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="shrink-0 whitespace-nowrap text-right">
        <div className="text-[15px] font-bold tabular text-[var(--brass)]">
          {exact ? "" : `${t.services.from} `}
          {plnFormat(price, { compact: true })}
        </div>
      </div>
    </li>
  );
}

/* -------------------------------- barbers -------------------------------- */

export function BarbersSection() {
  const { t } = useLang();
  const { barbers } = useStore();
  const list = barbers.filter((b) => b.status === "active");

  return (
    <section id="barberzy" className="relative overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-x-0 top-0 mx-auto max-w-6xl">
        <RazorDivider />
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHead eyebrow={t.barbers.eyebrow} title={t.barbers.title} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((b, i) => (
            <motion.div
              key={b.id}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg-sunken)]">
                {b.photoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={b.photoUrl}
                    alt={b.name}
                    className="size-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    loading="lazy"
                  />
                ) : (
                  /* Booksy nie publikuje zdjęć zespołu — monogram zamiast pustego kadru */
                  <div
                    className="grid size-full place-items-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      background: `radial-gradient(120% 120% at 30% 20%, color-mix(in oklab, ${b.color} 26%, var(--bg-sunken)), var(--bg-sunken))`,
                    }}
                  >
                    <span
                      className="text-[clamp(2.5rem,7vw,3.5rem)] font-black tracking-tight"
                      style={{ color: `color-mix(in oklab, ${b.color} 85%, white)` }}
                    >
                      {initials(b.name)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--panel)] via-transparent to-transparent" />
                <div
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: b.color }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[15px] font-semibold tracking-tight">{b.name}</h3>
                  <span className="flex items-center gap-1 text-[12px] tabular text-[var(--fg-muted)]">
                    <Star className="size-3 fill-[var(--brass)] text-[var(--brass)]" />
                    {b.rating}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-[var(--fg-muted)]">{b.specialization}</p>
                {b.booksyProfileUrl ? (
                  <a
                    href={b.booksyProfileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[12px] text-[var(--brass)] hover:underline"
                  >
                    {t.barbers.profile} <ArrowUpRight className="size-3" />
                  </a>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- reviews -------------------------------- */

export function ReviewsSection() {
  const { t } = useLang();
  const stars = Math.round(SALON.rating);
  return (
    <section id="opinie" className="relative py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHead
          eyebrow={t.reviews.eyebrow}
          title={t.reviews.title}
          action={
            <Button asChild variant="outline" size="sm">
              <a href={SALON.booksyUrl} target="_blank" rel="noreferrer">
                {t.reviews.action} <ArrowUpRight />
              </a>
            </Button>
          }
        />

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-3 md:grid-cols-[1fr_1.4fr]"
        >
          <div className="flex flex-col items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--brass)_35%,transparent)] bg-[color-mix(in_oklab,var(--brass)_7%,var(--panel))] px-6 py-8 text-center">
            <div className="text-[clamp(3rem,8vw,4.5rem)] font-black leading-none brass-text">
              {SALON.rating.toFixed(1)}
            </div>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4",
                    i < stars
                      ? "fill-[var(--brass)] text-[var(--brass)]"
                      : "text-[var(--border-strong)]",
                  )}
                />
              ))}
            </div>
            <p className="mt-3 text-[13px] text-[var(--fg-muted)]">
              {SALON.reviewCount} {t.reviews.caption}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FactTile icon={Quote} title={t.reviews.fact1Title} body={t.reviews.fact1Body} />
            <FactTile icon={Clock} title={t.reviews.fact2Title} body={t.reviews.fact2Body} />
            <FactTile icon={MapPin} title={t.reviews.fact3Title} body={`${salonAddress} — ${t.reviews.fact3Body}`} />
            <FactTile icon={ArrowUpRight} title={t.reviews.fact4Title} body={t.reviews.fact4Body} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FactTile({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <Icon className="size-4 text-[var(--brass)]" />
      <h3 className="mt-3 text-[13px] font-semibold">{title}</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--fg-muted)]">{body}</p>
    </div>
  );
}

/* -------------------------------- contact -------------------------------- */

export function ContactSection() {
  const { t } = useLang();
  return (
    <section id="kontakt" className="relative py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHead eyebrow={t.contact.eyebrow} title={SALON.street} />

        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-3">
            <InfoRow icon={MapPin} label={t.contact.address}>
              {salonAddress}
            </InfoRow>
            {SALON.phone ? (
              <InfoRow icon={Phone} label={t.contact.phone}>
                <a
                  href={`tel:${SALON.phone.replace(/\s/g, "")}`}
                  className="hover:text-[var(--brass)]"
                >
                  {SALON.phone}
                </a>
              </InfoRow>
            ) : null}
            {SALON.email ? (
              <InfoRow icon={Mail} label={t.contact.email}>
                <a href={`mailto:${SALON.email}`} className="hover:text-[var(--brass)]">
                  {SALON.email}
                </a>
              </InfoRow>
            ) : null}
            <InfoRow icon={Clock} label={t.contact.hours}>
              <ul className="space-y-0.5">
                <li className="flex justify-between gap-4">
                  <span>{t.contact.weekdays}</span>
                  <span className="tabular text-[var(--fg-subtle)]">10:00 – 20:00</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>{t.contact.sunday}</span>
                  <span className="tabular text-[var(--fg-subtle)]">10:00 – 19:00</span>
                </li>
              </ul>
            </InfoRow>
          </div>

          <div className="relative min-h-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel-muted)]">
            <iframe
              title="Mapa BROZONE"
              src="https://www.openstreetmap.org/export/embed.html?bbox=14.550%2C53.422%2C14.572%2C53.433&layer=mapnik&marker=53.4276%2C14.5601"
              className="size-full min-h-64 opacity-90 grayscale-[0.6] contrast-110 dark:invert dark:hue-rotate-180"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--border)]" />
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)]/92 px-3 py-2 backdrop-blur">
              <span className="text-[12px] font-medium">
                {SALON.name} — {salonAddress}
              </span>
              <Button asChild size="xs" variant="brass">
                <a href={SALON.mapsUrl} target="_blank" rel="noreferrer">
                  {t.contact.navigate} <ArrowUpRight />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] text-[var(--brass)]">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
          {label}
        </div>
        <div className="mt-1 text-[13px] leading-relaxed text-[var(--fg-muted)]">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------- footer --------------------------------- */

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-sunken)] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-[6px] bg-gradient-to-b from-[var(--brass-soft)] to-[var(--brass)] text-[12px] font-black text-[#0b0c0d]">
              B
            </span>
            <span className="text-[14px] font-bold tracking-[0.22em]">BROZONE</span>
          </div>
          <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-[var(--fg-subtle)]">
            {SALON.tagline} · {SALON.company}.{SALON.nip ? ` NIP ${SALON.nip}.` : ""}{" "}
            {t.footer.booking}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={SALON.booksyUrl} target="_blank" rel="noreferrer">
              Booksy <ArrowUpRight />
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href={SALON.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href={SALON.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          </Button>
          <Button asChild variant="subtle" size="sm">
            <Link href="/admin">BROZONE OS — panel właściciela</Link>
          </Button>
        </div>
      </div>
      <div className={cn("mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6")}>
        <div className="border-t border-[var(--border)] pt-4 text-[11px] text-[var(--fg-subtle)]">
          © {new Date().getFullYear()} BROZONE. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
