import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral:
          "border-[var(--border-strong)] bg-[var(--panel-muted)] text-[var(--fg-muted)]",
        accent:
          "border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--accent)]",
        info: "border-[color-mix(in_oklab,var(--info)_40%,transparent)] bg-[color-mix(in_oklab,var(--info)_12%,transparent)] text-[var(--info)]",
        ok: "border-[color-mix(in_oklab,var(--ok)_40%,transparent)] bg-[color-mix(in_oklab,var(--ok)_12%,transparent)] text-[var(--ok)]",
        warn: "border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-[color-mix(in_oklab,var(--warn)_12%,transparent)] text-[var(--warn)]",
        danger:
          "border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-[var(--danger)]",
        outline: "border-[var(--border-strong)] text-[var(--fg-muted)]",
      },
      size: {
        default: "",
        sm: "px-1.5 py-0 text-[10px]",
      },
    },
    defaultVariants: { tone: "neutral", size: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

export function Dot({ className, color }: { className?: string; color?: string }) {
  return (
    <span
      className={cn("inline-block size-1.5 rounded-full", className)}
      style={color ? { background: color } : undefined}
    />
  );
}
