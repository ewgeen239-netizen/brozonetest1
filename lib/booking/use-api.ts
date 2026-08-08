"use client";

import * as React from "react";
import type {
  Booking,
  BookingStatus,
  CashReport,
  CashSummary,
  Client,
  PaymentMethod,
  Service,
  Staff,
} from "./types";

/* --------------------------------------------------------------------------
   Cienka warstwa nad /api. Bez zewnętrznych bibliotek — trzy stany
   (ładowanie / błąd / dane) i ręczne odświeżanie, tak jak opisuje
   02_ADMIN_PANEL/Google_Sheets_Sync_Spec.md.
-------------------------------------------------------------------------- */

export interface ApiState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(json?.message ?? "Coś poszło nie tak. Spróbuj jeszcze raz.");
  }
  return json.data as T;
}

function useFetch<T>(url: string | null): ApiState<T> {
  const [data, setData] = React.useState<T>();
  const [loading, setLoading] = React.useState(Boolean(url));
  const [error, setError] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!url) return;
    let alive = true;
    setLoading(true);
    setError(null);
    request<T>(url)
      .then((result) => alive && setData(result))
      .catch((err: Error) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [url, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}

/* ------------------------------- odczyt ---------------------------------- */

export function useBookings(filter: {
  from?: string;
  to?: string;
  category?: string;
  status?: string;
  staffId?: string;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value && value !== "all") query.set(key, value);
  }
  return useFetch<Booking[]>(`/api/bookings?${query.toString()}`);
}

export const useServices = (category?: string) =>
  useFetch<Service[]>(`/api/services${category && category !== "all" ? `?category=${category}` : ""}`);

export const useStaff = (category?: string) =>
  useFetch<Staff[]>(`/api/staff${category && category !== "all" ? `?category=${category}` : ""}`);

export const useClients = (query: string) =>
  useFetch<Client[]>(`/api/clients?query=${encodeURIComponent(query)}`);

export const useSyncInfo = () =>
  useFetch<{ source: "sheets" | "demo"; log: { timestamp: string; operation: string; entityId: string; message?: string }[] }>(
    "/api/sync",
  );

/* -------------------------------- zapis ---------------------------------- */

export const setBookingStatus = (
  bookingId: string,
  status: BookingStatus,
  extra?: { note?: string; paymentMethod?: PaymentMethod; tip?: number },
) =>
  request<Booking>(`/api/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...extra }),
  });

export const rescheduleBooking = (bookingId: string, date: string, timeStart: string) =>
  request<Booking>(`/api/bookings/${bookingId}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify({ date, timeStart }),
  });

export const createBooking = (payload: Record<string, unknown>) =>
  request<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(payload) });

export const saveClient = (payload: Partial<Client>) =>
  request<Client>("/api/clients", { method: "POST", body: JSON.stringify(payload) });

export const saveStaff = (payload: Staff) =>
  request<Staff>("/api/staff", { method: "POST", body: JSON.stringify(payload) });

export const saveService = (payload: Service) =>
  request<Service>("/api/services", { method: "POST", body: JSON.stringify(payload) });

export const fetchSlots = (params: { date: string; serviceId: string; staffId?: string }) => {
  const query = new URLSearchParams({ date: params.date, serviceId: params.serviceId });
  if (params.staffId) query.set("staffId", params.staffId);
  return request<{ time: string; staffId: string; staffName: string }[]>(
    `/api/public/slots?${query.toString()}`,
  );
};

/* ----------------------------- raport kasowy ----------------------------- */

export interface CashDay {
  report: CashReport;
  summary: CashSummary;
  rows: {
    operationId: string;
    time: string;
    kind: string;
    title: string;
    amount: number;
    document?: string;
    createdBy: string;
    bookingId?: string;
  }[];
}

export const useCashDay = (date: string) => useFetch<CashDay>(`/api/cash?date=${date}`);

export const addCashOperation = (payload: {
  date: string;
  kind: string;
  title: string;
  amount: number;
  document?: string;
}) => request<CashDay>("/api/cash", { method: "POST", body: JSON.stringify(payload) });

export const removeCashOperation = (date: string, operationId: string) =>
  request<CashDay>("/api/cash", {
    method: "DELETE",
    body: JSON.stringify({ date, operationId }),
  });

export const closeCashDay = (payload: { date: string; countedCash: number; note?: string }) =>
  request<CashDay>("/api/cash/close", { method: "POST", body: JSON.stringify(payload) });

export const reopenCashDay = (date: string) =>
  request<CashDay>("/api/cash/close", { method: "DELETE", body: JSON.stringify({ date }) });

export const setOpeningCash = (date: string, amount: number) =>
  request<CashDay>("/api/cash/opening", { method: "POST", body: JSON.stringify({ date, amount }) });

/* --------------------------------- sesja --------------------------------- */

export const useMe = () =>
  useFetch<{
    email: string;
    role: string;
    staffId?: string;
    sections: string[];
    realRole: string;
    viewingAs: string | null;
  }>("/api/me");

/* -------------------------------- daty ----------------------------------- */

const pad = (n: number) => `${n}`.padStart(2, "0");

export const isoToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const shiftDate = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

const MONTHS = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
];
const WEEKDAYS = [
  "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela",
];

export function formatDateLong(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const weekday = WEEKDAYS[(dt.getDay() + 6) % 7];
  return `${weekday}, ${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatDateShort(date: string) {
  const [, m, d] = date.split("-").map(Number);
  return `${pad(d)}.${pad(m)}`;
}

/** „dziś 14:00" dla dzisiejszej daty, inaczej „12.03 14:00" */
export function formatWhen(date: string, time: string) {
  if (date === isoToday()) return `dziś ${time}`;
  if (date === shiftDate(isoToday(), 1)) return `jutro ${time}`;
  return `${formatDateShort(date)} ${time}`;
}
