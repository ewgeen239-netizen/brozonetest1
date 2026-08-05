import type { Appointment, BooksyConfig, BooksyMode, ID } from "./types";

/* --------------------------------------------------------------------------
   Booksy adapter
   --------------------------------------------------------------------------
   Booksy has no public self-serve booking API for third-party salon systems.
   What is realistically available:

     widget  — deep link / embedded widget. The client finishes the booking on
               Booksy. Nothing flows back automatically. Always works.
     import  — one-way pull into BROZONE OS. Requires a partner API key, a
               scheduled CSV export, or a webhook endpoint. Read-only.
     manual  — no integration; the owner keeps the calendar in BROZONE OS.

   Every mode is expressed through the same interface so the UI never branches
   on transport details, and a real HTTP client can replace MockBooksyAdapter
   without touching a single component.
-------------------------------------------------------------------------- */

export interface BookingIntent {
  serviceId: ID;
  barberId?: ID;
  date?: string;
  time?: string;
  booksyServiceId?: string;
  booksyStafferUrl?: string;
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  conflicts: ConflictCandidate[];
  errors: string[];
  raw?: unknown;
}

export interface ConflictCandidate {
  appointmentId: ID;
  booksyId: string;
  fields: { field: string; local: unknown; remote: unknown }[];
}

export interface BooksyAdapter {
  readonly mode: BooksyMode;
  /** true when the mode can pull data at all */
  canImport(): boolean;
  /** deep link opened by the public site CTA */
  buildBookingUrl(intent: BookingIntent): string;
  /** pull remote appointments; throws on transport failure */
  importAppointments(range: { from: string; to: string }): Promise<ImportResult>;
  /** parse a Booksy CSV export into appointment drafts */
  parseCSV(csv: string): Partial<Appointment>[];
}

export class MockBooksyAdapter implements BooksyAdapter {
  constructor(private config: BooksyConfig) {}

  get mode() {
    return this.config.mode;
  }

  canImport() {
    return this.config.mode === "import" && this.config.connectionState !== "disconnected";
  }

  buildBookingUrl(intent: BookingIntent) {
    const base = intent.booksyStafferUrl ?? this.config.businessUrl;
    const params = new URLSearchParams();
    if (intent.booksyServiceId) params.set("service_id", intent.booksyServiceId);
    if (intent.date) params.set("date", intent.date);
    if (intent.time) params.set("time", intent.time);
    params.set("utm_source", "brozone.pl");
    params.set("utm_medium", "website");
    params.set("utm_campaign", "booking_block");
    return `${base}?${params.toString()}`;
  }

  async importAppointments({ from, to }: { from: string; to: string }): Promise<ImportResult> {
    if (!this.canImport()) {
      return {
        imported: 0,
        updated: 0,
        skipped: 0,
        conflicts: [],
        errors: [
          this.config.mode === "manual"
            ? "Tryb Manual — import wyłączony."
            : "Tryb Widget — Booksy nie udostępnia rezerwacji do pobrania.",
        ],
      };
    }
    // real implementation: GET {api}/businesses/{id}/appointments?from&to
    await new Promise((r) => setTimeout(r, 900));
    return {
      imported: 0,
      updated: 0,
      skipped: 0,
      conflicts: [],
      errors: [],
      raw: { from, to },
    };
  }

  parseCSV(csv: string): Partial<Appointment>[] {
    const [head, ...rows] = csv.trim().split(/\r?\n/);
    if (!head) return [];
    const sep = head.includes(";") ? ";" : ",";
    const cols = head.split(sep).map((c) => c.trim().toLowerCase());
    const idx = (name: string) => cols.indexOf(name);

    return rows
      .filter(Boolean)
      .map((row) => {
        const cells = row.split(sep);
        const get = (name: string) => {
          const i = idx(name);
          return i >= 0 ? cells[i]?.trim() : undefined;
        };
        return {
          booksyId: get("booking_id"),
          date: get("date"),
          start: get("time"),
          durationMin: Number(get("duration") ?? 0) || undefined,
          price: Number((get("price") ?? "0").replace(",", ".")) || undefined,
          source: "booksy" as const,
          note: get("note"),
        };
      })
      .filter((a) => a.date && a.start);
  }
}

export const BOOKSY_MODE_INFO: Record<
  BooksyMode,
  { label: string; en: string; description: string; capabilities: string[]; limits: string[] }
> = {
  widget: {
    label: "Widget Mode",
    en: "Deep link / embed",
    description:
      "Strona BROZONE przekierowuje klienta do Booksy. Rezerwacja powstaje po stronie Booksy.",
    capabilities: [
      "Działa bez klucza API",
      "Zero konfiguracji, natychmiastowy start",
      "Parametry UTM i wstępny wybór usługi",
    ],
    limits: [
      "Brak automatycznego zwrotu danych do panelu",
      "Kalendarz w BROZONE OS trzeba uzupełniać importem lub ręcznie",
    ],
  },
  import: {
    label: "Import Mode",
    en: "One-way pull",
    description:
      "Rezerwacje pobierane do BROZONE OS przez API partnerskie, eksport CSV lub webhook.",
    capabilities: [
      "Kalendarz i raporty zasilane danymi z Booksy",
      "Wykrywanie konfliktów lokalne ↔ zdalne",
      "Harmonogram co 15 min lub webhook",
    ],
    limits: [
      "Wymaga dostępu partnerskiego Booksy lub eksportu CSV",
      "Kierunek jednostronny — zmiany w panelu nie wracają do Booksy",
      "Limity API (429) obsługiwane przez backoff",
    ],
  },
  manual: {
    label: "Manual Mode",
    en: "Local calendar",
    description: "Pełna kontrola w BROZONE OS. Booksy używane tylko jako kanał marketingowy.",
    capabilities: [
      "Brak zależności od zewnętrznego API",
      "Rezerwacje telefoniczne i walk-in w jednym miejscu",
    ],
    limits: ["Rezerwacje z Booksy trzeba przepisać ręcznie"],
  },
};
