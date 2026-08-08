import "server-only";

import type {
  Booking,
  BookingStatus,
  CashOperation,
  CashReport,
  Client,
  PaymentMethod,
  Role,
  Service,
  Session,
  Slot,
  Staff,
} from "@/lib/booking/types";
import { normalizePhone } from "@/lib/booking/types";
import * as sheets from "@/lib/sheets/client";
import {
  TODAY,
  buildDemoBookings,
  demoClients,
  demoPermissions,
  demoServices,
  demoStaff,
  type PermissionRow,
} from "./demo-data";
import { DEFAULT_OPENING_CASH } from "./cash";

/* --------------------------------------------------------------------------
   Warstwa dostępu do danych.

   Jeśli w środowisku jest SHEETS_API_URL — czyta i zapisuje do Google Sheets.
   Jeśli nie — działa na danych demonstracyjnych w pamięci procesu, żeby panel
   dało się uruchomić i pokazać bez zakładania arkusza.

   Interfejs jest identyczny, więc reszta aplikacji nie wie, z czego korzysta.
-------------------------------------------------------------------------- */

export const usingSheets = Boolean(process.env.SHEETS_API_URL && process.env.SHEETS_API_SECRET);

export interface SyncLogEntry {
  timestamp: string;
  operation: string;
  entityId: string;
  user: string;
  result: "ok" | "error";
  message?: string;
}

interface MemoryDb {
  bookings: Booking[];
  clients: Client[];
  staff: Staff[];
  services: Service[];
  permissions: PermissionRow[];
  cash: CashReport[];
  log: SyncLogEntry[];
}

/** przetrwa hot reload w trybie deweloperskim */
const globalDb = globalThis as unknown as { __brozoneDb?: MemoryDb };

function db(): MemoryDb {
  if (!globalDb.__brozoneDb) {
    globalDb.__brozoneDb = {
      bookings: buildDemoBookings(),
      clients: [...demoClients],
      staff: [...demoStaff],
      services: [...demoServices],
      permissions: [...demoPermissions],
      cash: [],
      log: [
        {
          timestamp: `${TODAY} 08:00:00`,
          operation: "start",
          entityId: "—",
          user: "system",
          result: "ok",
          message: "Uruchomiono na danych demonstracyjnych.",
        },
      ],
    };
  }
  return globalDb.__brozoneDb;
}

function stamp() {
  const d = new Date();
  const p = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`;
}

function log(entry: Omit<SyncLogEntry, "timestamp">) {
  db().log.unshift({ ...entry, timestamp: stamp() });
  db().log = db().log.slice(0, 200);
}

export class RepositoryError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/* -------------------------------- odczyt --------------------------------- */

export interface BookingFilter {
  from?: string;
  to?: string;
  category?: string;
  staffId?: string;
  status?: string;
}

export async function getBookings(filter: BookingFilter = {}): Promise<Booking[]> {
  if (usingSheets) {
    return sheets.getBookings({
      from: filter.from ?? "0000-01-01",
      to: filter.to ?? "9999-12-31",
      category: filter.category,
      staffId: filter.staffId,
      status: filter.status,
    });
  }
  return db()
    .bookings.filter((b) => {
      if (filter.from && b.date < filter.from) return false;
      if (filter.to && b.date > filter.to) return false;
      if (filter.category && b.category !== filter.category) return false;
      if (filter.staffId && b.staffId !== filter.staffId) return false;
      if (filter.status && b.status !== filter.status) return false;
      return true;
    })
    .sort((a, b) =>
      a.date === b.date ? a.timeStart.localeCompare(b.timeStart) : a.date.localeCompare(b.date),
    );
}

export async function getServices(category?: string): Promise<Service[]> {
  if (usingSheets) return sheets.getServices({ category });
  return db().services.filter((s) => !category || s.category === category);
}

export async function getStaff(category?: string): Promise<Staff[]> {
  if (usingSheets) return sheets.getStaff({ category });
  return db().staff.filter((s) => !category || s.category === category);
}

export async function getClients(query?: string): Promise<Client[]> {
  if (usingSheets) return sheets.getClients({ query });
  const q = (query ?? "").trim().toLowerCase();
  return db().clients.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      normalizePhone(c.phone).includes(normalizePhone(q)),
  );
}

export async function getSyncLog(): Promise<SyncLogEntry[]> {
  return db().log;
}

/* --------------------------- wolne terminy ------------------------------- */

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toClock = (m: number) =>
  `${`${Math.floor(m / 60)}`.padStart(2, "0")}:${`${m % 60}`.padStart(2, "0")}`;

export async function getAvailableSlots(p: {
  date: string;
  serviceId: string;
  staffId?: string;
}): Promise<Slot[]> {
  if (usingSheets) return sheets.getAvailableSlots(p);

  const service = db().services.find((s) => s.serviceId === p.serviceId);
  if (!service) throw new RepositoryError("NOT_FOUND", "Nie znaleziono usługi.");

  const [y, m, d] = p.date.split("-").map(Number);
  const weekday = (((new Date(y, m - 1, d).getDay() + 6) % 7) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

  const crew = db().staff.filter((s) => {
    if (!s.active) return false;
    if (p.staffId) return s.staffId === p.staffId;
    return s.category === service.category;
  });

  const dayBookings = db().bookings.filter(
    (b) => b.date === p.date && b.status !== "cancelled" && b.status !== "no_show",
  );

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isToday = p.date === TODAY;

  const slots: Slot[] = [];
  for (const staff of crew) {
    if (staff.daysOff.includes(p.date)) continue;
    const hours = staff.workingHours.find((h) => h.weekday === weekday);
    if (!hours?.enabled) continue;

    const busy = dayBookings
      .filter((b) => b.staffId === staff.staffId)
      .map((b) => ({ from: toMin(b.timeStart), to: toMin(b.timeEnd) }));

    for (
      let t = toMin(hours.start);
      t + service.durationMinutes <= toMin(hours.end);
      t += 15
    ) {
      const end = t + service.durationMinutes;
      if (busy.some((x) => t < x.to && end > x.from)) continue;
      if (isToday && t < nowMin + 60) continue;
      slots.push({ time: toClock(t), staffId: staff.staffId, staffName: staff.name });
    }
  }
  return slots.sort((a, b) => a.time.localeCompare(b.time));
}

/* --------------------------------- zapis --------------------------------- */

function assertFree(staffId: string, date: string, start: number, end: number, ignore?: string) {
  const clash = db().bookings.some((b) => {
    if (b.staffId !== staffId || b.date !== date) return false;
    if (b.status === "cancelled" || b.status === "no_show") return false;
    if (ignore && b.bookingId === ignore) return false;
    return start < toMin(b.timeEnd) && end > toMin(b.timeStart);
  });
  if (clash) {
    throw new RepositoryError("BOOKING_CONFLICT", "Ten termin jest już zajęty. Wybierz inny.");
  }
}

export async function createBooking(
  input: Partial<Booking> & { user?: string },
): Promise<Booking> {
  if (usingSheets) return sheets.createBooking(input);

  const service = db().services.find((s) => s.serviceId === input.serviceId);
  if (!service) throw new RepositoryError("NOT_FOUND", "Nie znaleziono usługi.");
  if (!input.date || !input.timeStart || !input.staffId) {
    throw new RepositoryError("VALIDATION_ERROR", "Brakuje daty, godziny lub specjalisty.");
  }
  if (!input.clientPhone) {
    throw new RepositoryError("VALIDATION_ERROR", "Brakuje numeru telefonu.");
  }

  const start = toMin(input.timeStart);
  const end = start + service.durationMinutes;
  assertFree(input.staffId, input.date, start, end);

  const staff = db().staff.find((s) => s.staffId === input.staffId);
  const client = await upsertClient({
    name: input.clientName ?? "",
    phone: input.clientPhone,
    email: input.clientEmail,
    consentRodo: input.consentRodo ?? false,
    consentMarketing: input.consentMarketing ?? false,
    tags: service.category ? [service.category] : [],
  });

  const sameDay = db().bookings.filter((b) => b.date === input.date).length + 1;
  const booking: Booking = {
    bookingId: `BZ-${input.date.replace(/-/g, "")}-${`${sameDay}`.padStart(3, "0")}`,
    date: input.date,
    timeStart: input.timeStart,
    timeEnd: toClock(end),
    category: service.category,
    serviceId: service.serviceId,
    serviceName: service.name,
    staffId: input.staffId,
    staffName: staff?.name ?? "",
    clientId: client.clientId,
    clientName: input.clientName ?? client.name,
    clientPhone: input.clientPhone,
    clientEmail: input.clientEmail,
    price: input.price ?? service.priceFrom,
    deposit: input.deposit ?? service.depositRequired,
    paymentMethod: input.paymentMethod ?? "unpaid",
    status: (input.status as BookingStatus) ?? "new",
    source: input.source ?? "website",
    notes: input.notes,
    tattoo: input.tattoo,
    massage: input.massage,
    consentRodo: input.consentRodo ?? false,
    consentMarketing: input.consentMarketing ?? false,
    createdAt: stamp(),
    updatedAt: stamp(),
    syncStatus: "synced",
  };

  db().bookings.push(booking);
  log({
    operation: "createBooking",
    entityId: booking.bookingId,
    user: input.user ?? "website",
    result: "ok",
    message: `${booking.date} ${booking.timeStart} · ${booking.serviceName}`,
  });
  return booking;
}

function findBooking(bookingId: string) {
  const booking = db().bookings.find((b) => b.bookingId === bookingId);
  if (!booking) throw new RepositoryError("NOT_FOUND", "Nie znaleziono tej wizyty.");
  return booking;
}

export async function updateBookingStatus(p: {
  bookingId: string;
  status: BookingStatus;
  note?: string;
  paymentMethod?: PaymentMethod;
  tip?: number;
  user?: string;
}): Promise<Booking> {
  if (usingSheets) {
    return sheets.updateBookingStatus({ ...p, updatedAt: stamp() });
  }
  const booking = findBooking(p.bookingId);
  booking.status = p.status;
  if (p.note !== undefined) booking.notes = p.note;
  if (p.paymentMethod) booking.paymentMethod = p.paymentMethod;
  if (p.tip !== undefined) booking.tip = p.tip;
  // wizyta odwołana nie może zostać oznaczona jako opłacona
  if (p.status === "cancelled" || p.status === "no_show") booking.paymentMethod = "unpaid";
  booking.updatedAt = stamp();

  const client = db().clients.find((c) => c.clientId === booking.clientId);
  if (client) {
    if (p.status === "completed") {
      client.totalVisits += 1;
      client.lastVisit = booking.date;
    }
    if (p.status === "no_show") client.noShows += 1;
  }

  log({
    operation: "updateBookingStatus",
    entityId: booking.bookingId,
    user: p.user ?? "panel",
    result: "ok",
    message: p.status,
  });
  return booking;
}

export async function rescheduleBooking(p: {
  bookingId: string;
  date: string;
  timeStart: string;
  user?: string;
}): Promise<Booking> {
  if (usingSheets) return sheets.rescheduleBooking({ ...p, updatedAt: stamp() });

  const booking = findBooking(p.bookingId);
  const duration = toMin(booking.timeEnd) - toMin(booking.timeStart);
  const start = toMin(p.timeStart);
  assertFree(booking.staffId, p.date, start, start + duration, booking.bookingId);

  booking.date = p.date;
  booking.timeStart = p.timeStart;
  booking.timeEnd = toClock(start + duration);
  booking.updatedAt = stamp();

  log({
    operation: "rescheduleBooking",
    entityId: booking.bookingId,
    user: p.user ?? "panel",
    result: "ok",
    message: `${p.date} ${p.timeStart}`,
  });
  return booking;
}

export async function upsertClient(input: Partial<Client>): Promise<Client> {
  if (usingSheets) return sheets.upsertClient(input);

  const phone = normalizePhone(input.phone ?? "");
  if (!phone) throw new RepositoryError("VALIDATION_ERROR", "Brakuje numeru telefonu.");

  const existing = db().clients.find((c) => normalizePhone(c.phone) === phone);
  if (existing) {
    if (input.name && !existing.name) existing.name = input.name;
    if (input.email && !existing.email) existing.email = input.email;
    if (input.notes !== undefined) existing.notes = input.notes;
    for (const tag of input.tags ?? []) {
      if (!existing.tags.includes(tag)) existing.tags.push(tag);
    }
    return existing;
  }

  const client: Client = {
    clientId: `cli_${`${db().clients.length + 1}`.padStart(3, "0")}`,
    name: input.name ?? "",
    phone: input.phone ?? "",
    email: input.email,
    tags: [...(input.tags ?? []), "nowy"],
    totalVisits: 0,
    noShows: 0,
    notes: input.notes,
    consentMarketing: input.consentMarketing ?? false,
    consentRodo: input.consentRodo ?? false,
    createdAt: stamp(),
  };
  db().clients.push(client);
  log({ operation: "createClient", entityId: client.clientId, user: "panel", result: "ok" });
  return client;
}

export async function upsertStaff(input: Staff): Promise<Staff> {
  const index = db().staff.findIndex((s) => s.staffId === input.staffId);
  if (index >= 0) db().staff[index] = input;
  else db().staff.push(input);
  log({ operation: "upsertStaff", entityId: input.staffId, user: "panel", result: "ok" });
  return input;
}

export async function upsertService(input: Service): Promise<Service> {
  const index = db().services.findIndex((s) => s.serviceId === input.serviceId);
  if (index >= 0) db().services[index] = input;
  else db().services.push(input);
  log({ operation: "upsertService", entityId: input.serviceId, user: "panel", result: "ok" });
  return input;
}

/* ------------------------------ uprawnienia ------------------------------ */

/** Rola przypisana do adresu e-mail. Brak wpisu = brak dostępu. */
export async function findPermission(email: string): Promise<PermissionRow | null> {
  const wanted = email.trim().toLowerCase();
  const rows = db().permissions;
  return rows.find((r) => r.email.toLowerCase() === wanted && r.active) ?? null;
}

export async function getPermissions(): Promise<PermissionRow[]> {
  return db().permissions;
}

export async function upsertPermission(row: PermissionRow): Promise<PermissionRow> {
  const email = row.email.trim().toLowerCase();
  const index = db().permissions.findIndex((r) => r.email.toLowerCase() === email);
  const next = { ...row, email };
  if (index >= 0) db().permissions[index] = next;
  else db().permissions.push(next);
  log({ operation: "upsertPermission", entityId: email, user: "panel", result: "ok" });
  return next;
}

/* ------------------------------ raport kasowy ---------------------------- */

/** Raport dnia. Tworzony leniwie przy pierwszym wejściu. */
export async function getCashReport(date: string): Promise<CashReport> {
  let report = db().cash.find((r) => r.date === date);
  if (!report) {
    const previous = db()
      .cash.filter((r) => r.date < date && r.status === "closed")
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    report = {
      date,
      // stan otwarcia = to, co zostało w kasie po ostatnim zamknięciu
      openingCash: previous?.countedCash ?? DEFAULT_OPENING_CASH,
      status: "open",
      operations: [],
    };
    db().cash.push(report);
  }
  return report;
}

export async function addCashOperation(p: {
  date: string;
  kind: CashOperation["kind"];
  title: string;
  amount: number;
  document?: string;
  user: string;
}): Promise<CashReport> {
  const report = await getCashReport(p.date);
  if (report.status === "closed") {
    throw new RepositoryError("DAY_CLOSED", "Dzień jest już zamknięty. Otwórz go, żeby dopisać operację.");
  }
  if (!p.title.trim()) {
    throw new RepositoryError("VALIDATION_ERROR", "Napisz, czego dotyczy operacja.");
  }
  if (!p.amount) {
    throw new RepositoryError("VALIDATION_ERROR", "Podaj kwotę.");
  }

  const now = new Date();
  report.operations.push({
    operationId: `op_${Date.now()}`,
    time: `${`${now.getHours()}`.padStart(2, "0")}:${`${now.getMinutes()}`.padStart(2, "0")}`,
    kind: p.kind,
    title: p.title.trim(),
    // wypłata zawsze wychodzi z kasy, reszta wpływa
    amount: p.kind === "payout" ? -Math.abs(p.amount) : Math.abs(p.amount),
    document: p.document,
    createdBy: p.user,
  });

  log({ operation: "addCashOperation", entityId: p.date, user: p.user, result: "ok", message: p.title });
  return report;
}

export async function removeCashOperation(p: {
  date: string;
  operationId: string;
  user: string;
}): Promise<CashReport> {
  const report = await getCashReport(p.date);
  if (report.status === "closed") {
    throw new RepositoryError("DAY_CLOSED", "Dzień jest już zamknięty.");
  }
  report.operations = report.operations.filter((o) => o.operationId !== p.operationId);
  log({ operation: "removeCashOperation", entityId: p.date, user: p.user, result: "ok" });
  return report;
}

export async function closeCashDay(p: {
  date: string;
  countedCash: number;
  note?: string;
  user: string;
}): Promise<CashReport> {
  const report = await getCashReport(p.date);
  report.countedCash = p.countedCash;
  report.note = p.note;
  report.status = "closed";
  report.closedBy = p.user;
  report.closedAt = stamp();

  log({
    operation: "closeCashDay",
    entityId: p.date,
    user: p.user,
    result: "ok",
    message: `policzono ${p.countedCash} zł`,
  });
  return report;
}

export async function reopenCashDay(p: { date: string; user: string }): Promise<CashReport> {
  const report = await getCashReport(p.date);
  report.status = "open";
  report.closedBy = undefined;
  report.closedAt = undefined;
  log({ operation: "reopenCashDay", entityId: p.date, user: p.user, result: "ok" });
  return report;
}

export async function setOpeningCash(p: {
  date: string;
  amount: number;
  user: string;
}): Promise<CashReport> {
  const report = await getCashReport(p.date);
  if (report.status === "closed") {
    throw new RepositoryError("DAY_CLOSED", "Dzień jest już zamknięty.");
  }
  report.openingCash = p.amount;
  log({ operation: "setOpeningCash", entityId: p.date, user: p.user, result: "ok" });
  return report;
}
