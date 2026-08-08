"use client";

import { RefreshCcw } from "lucide-react";
import { useSyncInfo } from "@/lib/booking/use-api";
import { cn } from "@/lib/utils";

/**
 * Pasek stanu danych. Administrator nie widzi słów API, quota ani webhook —
 * tylko kolor kropki i jedno zdanie.
 */
export function SyncBar({ onRefresh }: { onRefresh?: () => void }) {
  const { data, loading, error, reload } = useSyncInfo();

  const last = data?.log?.[0];
  const sheets = data?.source === "sheets";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-2 text-[11px] text-[var(--fg-muted)]">
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          error ? "bg-[var(--danger)]" : loading ? "bg-[var(--warn)]" : "bg-[var(--ok)]",
        )}
      />
      {error ? (
        <span className="text-[var(--danger)]">Nie udało się sprawdzić stanu danych.</span>
      ) : sheets ? (
        <span>Dane z Google Sheets</span>
      ) : (
        <span>
          Dane demonstracyjne — podłącz Google Sheets w{" "}
          <span className="text-[var(--fg)]">Ustawieniach</span>, żeby pracować na prawdziwych.
        </span>
      )}

      {last ? <span className="text-[var(--fg-subtle)]">· ostatni zapis {last.timestamp}</span> : null}

      <button
        onClick={() => {
          reload();
          onRefresh?.();
        }}
        className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-[var(--panel)] hover:text-[var(--fg)]"
      >
        <RefreshCcw className={cn("size-3", loading && "animate-spin")} /> Odśwież
      </button>
    </div>
  );
}
