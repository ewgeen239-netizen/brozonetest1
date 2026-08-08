"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background,color,box-shadow,transform] duration-200 focus-ring disabled:pointer-events-none disabled:opacity-45 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--fg)] text-[var(--bg)] hover:bg-[color-mix(in_oklab,var(--fg)_88%,var(--accent))]",
        accent:
          "bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] text-[#0b0c0d] font-semibold shadow-[0_6px_20px_-8px_var(--accent-glow)] hover:brightness-110",
        outline:
          "border border-[var(--border-strong)] bg-transparent hover:bg-[var(--panel-muted)] hover:border-[var(--accent)]",
        ghost: "hover:bg-[var(--panel-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]",
        subtle: "bg-[var(--panel-muted)] text-[var(--fg)] hover:bg-[var(--bg-sunken)]",
        danger:
          "bg-[color-mix(in_oklab,var(--danger)_16%,transparent)] text-[var(--danger)] border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] hover:bg-[color-mix(in_oklab,var(--danger)_26%,transparent)]",
        link: "text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3.5",
        sm: "h-8 px-2.5 text-[13px]",
        xs: "h-7 px-2 text-xs rounded-sm [&_svg]:size-3.5",
        lg: "h-11 px-6 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
