"use client";

import * as React from "react";

/**
 * Lightweight canvas dust field — brass motes drifting through the hero
 * spotlight. Pauses when off-screen and honours prefers-reduced-motion.
 */
export function Particles({
  density = 46,
  className,
  color = "200, 165, 91",
}: {
  density?: number;
  className?: string;
  color?: string;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const particles = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.7 + 0.4,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -(Math.random() * 0.22 + 0.04),
      a: Math.random() * 0.5 + 0.12,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;
      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -8) {
            p.y = h + 8;
            p.x = Math.random() * w;
          }
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
        }
        const twinkle = 0.6 + 0.4 * Math.sin(t * 1.4 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.a * twinkle})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${color}, ${0.35 * twinkle})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      if (running) raf = requestAnimationFrame(draw);
    };
    draw();

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [density, color]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
