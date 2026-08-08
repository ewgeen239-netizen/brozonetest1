/* --------------------------------------------------------------------------
   BROZONE — klient Apps Script. TYLKO po stronie serwera.
   Kopiuj do projektu jako lib/sheets/client.ts

   Sekret nigdy nie może trafić do przeglądarki — dlatego ten plik
   nie ma dyrektywy "use client" i wolno go importować wyłącznie
   z tras /api oraz komponentów serwerowych.
-------------------------------------------------------------------------- */

import type { ApiResult, Booking, Client, Service, Slot, Staff } from "@/lib/booking/types";

const URL = process.env.SHEETS_API_URL;
const SECRET = process.env.SHEETS_API_SECRET;

class SheetsError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

async function call<T>(action: string, payload: unknown = {}): Promise<T> {
  if (!URL || !SECRET) {
    throw new SheetsError("CONFIG", "Brak konfiguracji połączenia z arkuszem.");
  }

  const attempt = async (): Promise<T> => {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: SECRET, action, payload }),
      cache: "no-store",
    });
    if (!res.ok) throw new SheetsError("HTTP_" + res.status, "Arkusz nie odpowiada.");

    const json = (await res.json()) as ApiResult<T>;
    if (!json.ok) throw new SheetsError(json.error, json.message);
    return json.data;
  };

  // ponowienia tylko dla błędów przejściowych
  const RETRYABLE = ["HTTP_429", "HTTP_500", "HTTP_502", "HTTP_503"];
  let lastError: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      return await attempt();
    } catch (err) {
      lastError = err;
      const code = err instanceof SheetsError ? err.code : "";
      if (!RETRYABLE.includes(code)) throw err;
      await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
    }
  }
  throw lastError;
}

/* ------------------------------ odczyt ----------------------------------- */

export const getBookings = (p: {
  from: string;
  to: string;
  category?: string;
  staffId?: string;
  status?: string;
}) => call<Booking[]>("getBookings", p);

export const getServices = (p: { category?: string; activeOnly?: boolean } = {}) =>
  call<Service[]>("getServices", p);

export const getStaff = (p: { category?: string; activeOnly?: boolean } = {}) =>
  call<Staff[]>("getStaff", p);

export const getAvailableSlots = (p: {
  date: string;
  serviceId: string;
  staffId?: string;
}) => call<Slot[]>("getAvailableSlots", p);

export const getClients = (p: { query?: string; limit?: number } = {}) =>
  call<Client[]>("getClients", p);

export const getSettings = () => call<Record<string, string>>("getSettings");

/* ------------------------------- zapis ----------------------------------- */

export const createBooking = (booking: Partial<Booking> & { user?: string }) =>
  call<Booking>("createBooking", booking);

export const updateBookingStatus = (p: {
  bookingId: string;
  status: string;
  updatedAt: string;
  note?: string;
  user?: string;
}) => call<Booking>("updateBookingStatus", p);

export const rescheduleBooking = (p: {
  bookingId: string;
  date: string;
  timeStart: string;
  updatedAt: string;
  user?: string;
}) => call<Booking>("rescheduleBooking", p);

export const upsertClient = (client: Partial<Client>) =>
  call<Client>("upsertClient", client);

export const appendSyncLog = (p: {
  operation: string;
  entity: string;
  entityId: string;
  user: string;
  result: "ok" | "error";
  message?: string;
}) => call<{ ok: true }>("appendSyncLog", p);

/* --------------------------- komunikaty błędów --------------------------- */

/** Zamienia kod błędu na zdanie gotowe do pokazania administratorowi. */
export function humanError(code: string): string {
  const map: Record<string, string> = {
    CONFIG: "Brak połączenia z bazą. Skontaktuj się z administratorem.",
    UNAUTHORIZED: "Brak dostępu do bazy. Skontaktuj się z administratorem.",
    BOOKING_CONFLICT: "Ten termin jest już zajęty. Wybierz inny.",
    STALE_UPDATE: "Ktoś zmienił tę wizytę przed chwilą.",
    NOT_FOUND: "Nie znaleziono tej wizyty.",
    VALIDATION_ERROR: "Sprawdź wpisane dane.",
    SHEET_STRUCTURE: "Arkusz ma zmienioną strukturę. Skontaktuj się z administratorem.",
    HTTP_429: "Google chwilowo nas ogranicza. Dane zapiszą się za chwilę.",
  };
  return map[code] ?? "Coś poszło nie tak. Spróbuj jeszcze raz za chwilę.";
}
