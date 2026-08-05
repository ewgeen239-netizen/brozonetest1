"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Rotating 3D BROZONE mark — a machined brass/chrome medallion built from
 * stacked CSS layers (no WebGL payload). Reacts to pointer position and keeps
 * a slow idle rotation, so the hero always has a live focal object.
 */
export function ChromeMark({ size = 320 }: { size?: number }) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [14, -14]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-22, 22]), { stiffness: 120, damping: 18 });

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      px.set((e.clientX - rect.left) / rect.width - 0.5);
      py.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py]);

  const depth = 14;

  return (
    <div
      ref={wrapRef}
      className="relative select-none"
      style={{ width: size, height: size, perspective: 1100 }}
      aria-hidden
    >
      {/* ambient glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, var(--brass-glow), transparent 62%)",
          transform: "scale(1.35)",
        }}
      />

      <motion.div
        className="animate-float relative size-full"
        style={{ transformStyle: "preserve-3d", rotateX: rx, rotateY: ry }}
      >
        <motion.div
          className="relative size-full"
          style={{ transformStyle: "preserve-3d" }}
          /* oscillate instead of a full spin — the face never turns away, so the
             brass rim and monogram stay readable while the chrome still moves */
          animate={{ rotateY: [-26, 26, -26] }}
          transition={{ duration: 14, ease: [0.45, 0, 0.55, 1], repeat: Infinity }}
        >
          {/* extruded body */}
          {Array.from({ length: depth }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                transform: `translateZ(${-i * 1.6}px)`,
                background: `conic-gradient(from ${i * 6}deg, #6b6f74, #d9d4c9, #8a8f95, #efe7d4, #5c6165, #cfc7b7, #6b6f74)`,
                opacity: i === 0 ? 1 : 0.9,
                filter: i > 0 ? "brightness(0.7)" : undefined,
              }}
            />
          ))}

          {/* brass rim */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              padding: 10,
              background:
                "conic-gradient(from 210deg, #6d5320, #e7ce96, #a9832f, #fff3d6, #7c5f27, #d6b877, #6d5320)",
              transform: "translateZ(1px)",
              boxShadow: "0 0 60px -12px var(--brass-glow)",
            }}
          >
            <div
              className="size-full rounded-full"
              style={{
                background:
                  "radial-gradient(120% 120% at 30% 22%, #22262a 0%, #0d1012 55%, #05070a 100%)",
                boxShadow:
                  "inset 0 2px 20px rgba(255,255,255,0.08), inset 0 -18px 34px rgba(0,0,0,0.7)",
              }}
            />
          </div>

          {/* engraved monogram */}
          <div
            className="absolute inset-0 grid place-items-center"
            style={{ transform: "translateZ(14px)" }}
          >
            <div className="text-center">
              <div
                className="text-[13px] font-semibold tracking-[0.42em] text-[var(--brass-soft)]"
                style={{ textShadow: "0 1px 0 rgba(0,0,0,.7)" }}
              >
                EST. 2019
              </div>
              <div
                className="mt-1 text-[clamp(2rem,6vw,3.25rem)] font-black leading-none tracking-[0.06em]"
                style={{
                  background:
                    "linear-gradient(180deg,#fff6e2 0%,#e7ce96 28%,#a9832f 52%,#f6ecd2 74%,#8a6a22 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,.6))",
                }}
              >
                BZ
              </div>
              <div className="mt-1.5 text-[9px] font-medium tracking-[0.3em] text-[var(--fg-subtle)]">
                SZCZECIN
              </div>
            </div>
          </div>

          {/* rotating sheen */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
            style={{ transform: "translateZ(16px)" }}
          >
            <div className="animate-sheen absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/22 to-transparent" />
          </div>
        </motion.div>
      </motion.div>

      {/* floor reflection */}
      <div
        className="absolute -bottom-6 left-1/2 h-8 w-2/3 -translate-x-1/2 rounded-[50%] blur-xl"
        style={{ background: "rgba(0,0,0,0.55)" }}
      />
    </div>
  );
}

/** thin animated razor line used as a section divider */
export function RazorDivider({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg viewBox="0 0 400 12" className="h-3 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="razor" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--brass)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--brass)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--brass)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="6" x2="400" y2="6" stroke="url(#razor)" strokeWidth="1" />
        <polygon points="196,2 204,6 196,10 199,6" fill="var(--brass)" opacity="0.85" />
      </svg>
    </div>
  );
}
