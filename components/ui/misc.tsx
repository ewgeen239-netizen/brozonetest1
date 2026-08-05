"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn, initials } from "@/lib/utils";

/* --------------------------------- Tabs ---------------------------------- */

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-0.5",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "rounded-[5px] px-2.5 py-1 text-xs font-medium text-[var(--fg-muted)] transition-all focus-ring",
      "hover:text-[var(--fg)] data-[state=active]:bg-[var(--panel)] data-[state=active]:text-[var(--fg)] data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = TabsPrimitive.Content;

/* -------------------------------- Switch --------------------------------- */

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-[var(--border-strong)] transition-colors focus-ring",
      "data-[state=checked]:border-[var(--brass)] data-[state=checked]:bg-[var(--brass)] data-[state=unchecked]:bg-[var(--panel-muted)]",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-3.5 rounded-full bg-[var(--fg)] shadow transition-transform",
        "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-[#0b0c0d] data-[state=unchecked]:translate-x-0.5",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

/* ------------------------------ Separator -------------------------------- */

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-[var(--border)]",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

/* -------------------------------- Avatar --------------------------------- */

export function Avatar({
  src,
  name,
  className,
  ring,
}: {
  src?: string;
  name: string;
  className?: string;
  ring?: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-[var(--panel-muted)]",
        className,
      )}
      style={ring ? { boxShadow: `0 0 0 1.5px ${ring}` } : undefined}
    >
      {src ? (
        <AvatarPrimitive.Image
          src={src}
          alt={name}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : null}
      <AvatarPrimitive.Fallback className="text-[11px] font-semibold text-[var(--fg-muted)]">
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

/* ------------------------------- Tooltip --------------------------------- */

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="anim-pop z-50 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-[11px] text-[var(--fg)] shadow-lg"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/* ------------------------------- Dropdown -------------------------------- */

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownPrimitive.Portal>
    <DropdownPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "anim-pop z-50 min-w-44 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-xl",
        className,
      )}
      {...props}
    />
  </DropdownPrimitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item> & { danger?: boolean }
>(({ className, danger, ...props }, ref) => (
  <DropdownPrimitive.Item
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center gap-2 rounded-[5px] px-2 py-1.5 text-[13px] outline-none transition-colors",
      "data-[highlighted]:bg-[var(--panel-muted)] [&_svg]:size-3.5 [&_svg]:text-[var(--fg-subtle)]",
      danger && "text-[var(--danger)] [&_svg]:text-[var(--danger)]",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-subtle)]",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator() {
  return <DropdownPrimitive.Separator className="my-1 h-px bg-[var(--border)]" />;
}

/* ------------------------------ Skeleton --------------------------------- */

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-md", className)} {...props} />;
}

/* ------------------------------ Progress --------------------------------- */

export function Progress({
  value,
  className,
  color,
}: {
  value: number;
  className?: string;
  color?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-sunken)]", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: color ?? "var(--brass)",
        }}
      />
    </div>
  );
}
