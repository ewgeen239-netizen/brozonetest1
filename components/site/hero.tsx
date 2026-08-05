"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Particles } from "./particles";
import { ChromeMark } from "./chrome-mark";
import { SALON, salonAddress } from "@/lib/mock-data";
import { useLang } from "@/lib/i18n";

/**
 * Neutralne zdjęcie wnętrza (stock) — zdjęcie profilowe z Booksy to sam
 * znak firmowy, a galeria to portrety klientów, których nie publikujemy tu
 * bez zgody. Podmień na własne zdjęcie lokalu przed startem.
 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=2000&q=80";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  const { t } = useLang();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      className="noise relative flex min-h-[100svh] items-center overflow-hidden bg-[#05070a] pt-16"
    >
      {/* cinematic backdrop */}
      <motion.div style={{ y: imgY }} className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt="Wnętrze barbershopu BROZONE"
          className="size-full scale-110 object-cover opacity-[0.62] grayscale-[0.25]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070a]/85 via-[#05070a]/40 to-[#05070a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070a] via-[#05070a]/25 to-[#05070a]/60" />
        <div className="spotlight absolute inset-0" />
      </motion.div>

      <Particles className="absolute inset-0 z-0 size-full" density={54} />

      <motion.div
        style={{ y: contentY, opacity: fade }}
        className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24"
      >
        <div>
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--brass)_35%,transparent)] bg-[color-mix(in_oklab,var(--brass)_10%,transparent)] px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-[var(--brass-soft)]"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--brass)] opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[var(--brass)]" />
            </span>
            {t.hero.badge}
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="relative mt-6 text-[clamp(3.4rem,13vw,9rem)] font-black leading-[0.86] tracking-[-0.03em] text-[#f5f1ea]"
          >
            <span className="relative inline-block overflow-hidden">
              BROZONE
              <span className="animate-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-5 max-w-lg text-balance text-[15px] leading-relaxed text-[#b9c0c7] sm:text-base"
          >
            {t.hero.lead}
            <span className="block text-[13px] text-[#7f878f]">{t.hero.sub}</span>
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild variant="brass" size="lg" className="animate-pulse-ring h-12 px-7 text-[15px]">
              <a href="#rezerwacja">{t.hero.cta}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-white/20 px-6 text-[#e8e4dc] hover:bg-white/5"
            >
              <a href={SALON.mapsUrl} target="_blank" rel="noreferrer">
                <MapPin /> {salonAddress}
              </a>
            </Button>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-[#8d959c]"
          >
            <Stat
              value={String(SALON.rating)}
              label={`${SALON.reviewCount} ${t.hero.statReviews}`}
              icon
            />
            <Stat value="10–20" label={t.hero.statOpen} />
            <Stat value="4" label={t.hero.statBarbers} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="hidden justify-center lg:flex"
        >
          <ChromeMark size={360} />
        </motion.div>
      </motion.div>

      <a
        href="#rezerwacja"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-[#767d84] transition-colors hover:text-[var(--brass)]"
      >
        {t.hero.scroll}
        <ArrowDown className="size-3.5 animate-bounce" />
      </a>
    </section>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-2xl font-bold tracking-tight text-[#f5f1ea]">
        {icon ? <Star className="size-4 fill-[var(--brass)] text-[var(--brass)]" /> : null}
        {value}
      </div>
      <div className="mt-0.5 text-[11px] tracking-wide">{label}</div>
    </div>
  );
}
