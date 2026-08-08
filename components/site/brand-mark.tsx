"use client";

import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Official BROZONE marks from the brand kit (public/logo). Both colour
   versions ship and swap with the theme, so the logotype is never recoloured
   or re-drawn in CSS.
-------------------------------------------------------------------------- */

export function BrozoneWordmark({
  className,
  variant = "auto",
}: {
  className?: string;
  /** "auto" swaps with the theme, otherwise force one of the brand versions */
  variant?: "auto" | "white" | "black";
}) {
  const alt = "BROZONE";
  if (variant !== "auto") {
    /* eslint-disable-next-line @next/next/no-img-element */
    return (
      <img
        src={`/logo/brozone-wordmark-${variant}.svg`}
        alt={alt}
        className={cn("h-auto w-auto select-none", className)}
        draggable={false}
      />
    );
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/brozone-wordmark-black.svg"
        alt={alt}
        className={cn("h-auto w-auto select-none dark:hidden", className)}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/brozone-wordmark-white.svg"
        alt=""
        aria-hidden
        className={cn("hidden h-auto w-auto select-none dark:block", className)}
        draggable={false}
      />
    </>
  );
}

export function BrozoneSymbol({
  className,
  variant = "auto",
}: {
  className?: string;
  variant?: "auto" | "white" | "black";
}) {
  const alt = "BROZONE";
  if (variant !== "auto") {
    /* eslint-disable-next-line @next/next/no-img-element */
    return (
      <img
        src={`/logo/brozone-symbol-${variant}.svg`}
        alt={alt}
        className={cn("select-none", className)}
        draggable={false}
      />
    );
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/brozone-symbol-black.svg"
        alt={alt}
        className={cn("select-none dark:hidden", className)}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/brozone-symbol-white.svg"
        alt=""
        aria-hidden
        className={cn("hidden select-none dark:block", className)}
        draggable={false}
      />
    </>
  );
}
