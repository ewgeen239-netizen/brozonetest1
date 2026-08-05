"use client";

import * as React from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Skeleton } from "./misc";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] text-[var(--fg-subtle)]">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-[var(--fg-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Nie udało się wczytać danych",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="grid size-11 place-items-center rounded-xl border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] text-[var(--danger)]">
        <AlertTriangle className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-[var(--fg-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw /> Spróbuj ponownie
        </Button>
      ) : null}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-[var(--border)]">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-3 px-3 py-2.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className="h-3.5"
              style={{ width: c === 0 ? "22%" : `${Math.max(8, 60 / cols)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4", className)}>
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-4 h-8 w-full" />
    </div>
  );
}

/** simulates an async fetch so the demo shows real loading/error states */
export function useMockFetch<T>(data: T, { delay = 450, failRate = 0 } = {}) {
  const [state, setState] = React.useState<"loading" | "ready" | "error">("loading");
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    setState("loading");
    const t = setTimeout(() => {
      setState(Math.random() < failRate ? "error" : "ready");
    }, delay);
    return () => clearTimeout(t);
  }, [delay, failRate, tick]);

  return {
    state,
    data: state === "ready" ? data : undefined,
    retry: () => setTick((t) => t + 1),
  };
}
