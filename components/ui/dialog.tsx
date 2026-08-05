"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "anim-overlay fixed inset-0 z-50 bg-black/55 backdrop-blur-[3px]",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean }
>(({ className, children, hideClose, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "anim-dialog fixed left-1/2 top-1/2 z-50 w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl outline-none",
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute right-3 top-3 rounded-sm p-1 text-[var(--fg-subtle)] transition-colors hover:bg-[var(--panel-muted)] hover:text-[var(--fg)] focus-ring">
          <X className="size-4" />
          <span className="sr-only">Zamknij</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-[var(--border)] px-5 py-4", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-3.5",
        className,
      )}
      {...props}
    />
  );
}

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("mt-1 text-xs text-[var(--fg-muted)]", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

/* ------------------------------- Drawer ---------------------------------- */

export function Drawer({
  open,
  onOpenChange,
  children,
  title,
  description,
  width = "30rem",
  footer,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          style={{ width }}
          className={cn(
            "anim-drawer fixed right-0 top-0 z-50 flex h-dvh max-w-[94vw] flex-col border-l border-[var(--border)] bg-[var(--panel)] shadow-2xl outline-none",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-sm font-semibold tracking-tight">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-0.5 text-xs text-[var(--fg-muted)]">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close className="rounded-sm p-1 text-[var(--fg-subtle)] transition-colors hover:bg-[var(--panel-muted)] hover:text-[var(--fg)] focus-ring">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-3.5">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
