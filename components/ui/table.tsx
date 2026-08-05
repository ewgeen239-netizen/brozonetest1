import * as React from "react";
import { cn } from "@/lib/utils";

export function TableWrap({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full overflow-x-auto", className)} {...props} />;
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full border-collapse text-left text-[13px]", className)}
      {...props}
    />
  );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-[var(--panel)] [&_th]:whitespace-nowrap",
        "[&_th]:border-b [&_th]:border-[var(--border)] [&_th]:px-3 [&_th]:py-2",
        "[&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.1em] [&_th]:text-[var(--fg-subtle)]",
        className,
      )}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        "[&_tr]:border-b [&_tr]:border-[var(--border)] [&_tr:last-child]:border-0",
        "[&_tr]:transition-colors [&_tr:hover]:bg-[var(--panel-muted)]",
        "[&_td]:px-3 [&_td]:py-2 [&_td]:align-middle",
        className,
      )}
      {...props}
    />
  );
}

export function TFoot({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn(
        "[&_td]:border-t [&_td]:border-[var(--border-strong)] [&_td]:bg-[var(--panel-muted)] [&_td]:px-3 [&_td]:py-2 [&_td]:font-semibold",
        className,
      )}
      {...props}
    />
  );
}
