"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SALON } from "@/lib/mock-data";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Portfolio published by the shop on its Booksy profile.
 * Grid is asymmetric on desktop (first tile spans two columns and rows) and a
 * horizontal snap rail on mobile; clicking any tile opens a lightbox that
 * shares the layout id with its thumbnail.
 */
export function GallerySection() {
  const { t } = useLang();
  const photos = SALON.gallery;
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const close = React.useCallback(() => setOpenIndex(null), []);
  const step = React.useCallback(
    (delta: number) =>
      setOpenIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  React.useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, step]);

  return (
    <section id="realizacje" className="relative py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              {t.gallery.eyebrow}
            </p>
            <h2 className="mt-2 text-[clamp(1.8rem,4vw,2.75rem)] font-bold leading-tight tracking-tight">
              {t.gallery.title}
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={SALON.booksyUrl} target="_blank" rel="noreferrer">
              {t.gallery.action} <ArrowUpRight />
            </a>
          </Button>
        </div>

        {/* mobile: snap rail — desktop: asymmetric grid */}
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {photos.map((src, i) => (
            <motion.button
              key={src}
              layoutId={`shot-${i}`}
              onClick={() => setOpenIndex(i)}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 4) * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "group relative w-64 shrink-0 snap-start overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-sunken)] sm:w-auto",
                i === 0 ? "aspect-[4/5] sm:col-span-2 sm:row-span-2 sm:aspect-auto" : "aspect-square",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${SALON.name} — ${t.gallery.eyebrow} ${i + 1}`}
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-30" />
              <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
            </motion.button>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-[var(--fg-subtle)]">{t.gallery.note}</p>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {openIndex !== null ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/88 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
          >
            <motion.img
              key={photos[openIndex]}
              layoutId={`shot-${openIndex}`}
              src={photos[openIndex]}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className="max-h-[86vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            />

            <button
              onClick={close}
              aria-label={t.gallery.close}
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X className="size-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label={t.gallery.prev}
              className="absolute left-3 grid size-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:left-6"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label={t.gallery.next}
              className="absolute right-3 grid size-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:right-6"
            >
              <ChevronRight className="size-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[11px] tabular text-white/70">
              {openIndex + 1} / {photos.length}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
