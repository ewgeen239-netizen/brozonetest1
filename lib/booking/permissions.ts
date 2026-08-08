/* --------------------------------------------------------------------------
   BROZONE — uprawnienia. Jedno źródło prawdy dla serwera i interfejsu.
   Kopiuj do projektu jako lib/booking/permissions.ts

   UWAGA: sprawdzenie MUSI odbywać się na serwerze. Ukrycie przycisku
   w interfejsie to wygoda, nie zabezpieczenie.
-------------------------------------------------------------------------- */

import type { Booking, Category, Role, Session } from "./types";

export type Permission =
  | "booking:read:all"
  | "booking:read:own"
  | "booking:create"
  | "booking:reschedule"
  | "booking:status"
  | "booking:cancel"
  | "booking:delete"
  | "booking:note"
  | "client:read"
  | "client:write"
  | "client:export"
  | "staff:read"
  | "staff:write"
  | "staff:archive"
  | "service:read"
  | "service:write"
  | "settings:read"
  | "settings:write"
  | "permissions:write"
  | "sync:run"
  | "sync:log";

const STAFF_PERMISSIONS: Permission[] = [
  "booking:read:own",
  "booking:status",
  "booking:note",
  "staff:read",
  "service:read",
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "booking:read:all", "booking:create", "booking:reschedule", "booking:status",
    "booking:cancel", "booking:delete", "booking:note",
    "client:read", "client:write", "client:export",
    "staff:read", "staff:write", "staff:archive",
    "service:read", "service:write",
    "settings:read", "settings:write", "permissions:write",
    "sync:run", "sync:log",
  ],
  recepcja: [
    "booking:read:all", "booking:create", "booking:reschedule", "booking:status",
    "booking:cancel", "booking:note",
    "client:read", "client:write",
    "staff:read", "service:read",
    "sync:run", "sync:log",
  ],
  barber: STAFF_PERMISSIONS,
  tattoo: STAFF_PERMISSIONS,
  massage: STAFF_PERMISSIONS,
  viewer: ["booking:read:all", "client:read", "staff:read", "service:read"],
};

/** kategoria, którą obsługuje dana rola pracownicza */
const ROLE_CATEGORY: Partial<Record<Role, Category>> = {
  barber: "barber",
  tattoo: "tattoo",
  massage: "massage",
};

export function can(session: Session, permission: Permission): boolean {
  return ROLE_PERMISSIONS[session.role].includes(permission);
}

/** Czy ta konkretna wizyta jest widoczna dla tej sesji. */
export function canSeeBooking(session: Session, booking: Booking): boolean {
  if (can(session, "booking:read:all")) return true;
  const category = ROLE_CATEGORY[session.role];
  if (!category || !session.staffId) return false;
  return booking.category === category && booking.staffId === session.staffId;
}

/** Filtr listy — zawsze na serwerze, przed wysłaniem do przeglądarki. */
export function scopeBookings(session: Session, bookings: Booking[]): Booking[] {
  if (can(session, "booking:read:all")) return bookings;
  return bookings.filter((b) => canSeeBooking(session, b));
}

/** Czy wolno zmienić status tej wizyty. */
export function canChangeStatus(session: Session, booking: Booking): boolean {
  if (!can(session, "booking:status")) return false;
  return canSeeBooking(session, booking);
}

/**
 * Dane wrażliwe: przeciwwskazania zdrowotne i szczegóły projektu tatuażu.
 * Widzi je właściciel oraz osoba wykonująca daną usługę.
 * Recepcja widzi tattoo (musi umówić konsultację), ale nie dane zdrowotne.
 */
export function canSeeSensitive(session: Session, booking: Booking): boolean {
  if (session.role === "admin") return true;
  if (session.role === "recepcja") return booking.category === "tattoo";
  return canSeeBooking(session, booking);
}

/** Usuwa z rezerwacji pola, których dana sesja nie powinna zobaczyć. */
export function redactBooking(session: Session, booking: Booking): Booking {
  if (canSeeSensitive(session, booking)) return booking;
  const copy: Booking = { ...booking };
  if (copy.massage) copy.massage = { ...copy.massage, contraindications: undefined };
  if (copy.tattoo) copy.tattoo = { ...copy.tattoo, idea: "", reference: undefined };
  if (!can(session, "client:read")) copy.notes = undefined;
  return copy;
}

/**
 * Ekrany widoczne w menu dla danej roli. Klucze odpowiadają polu `section`
 * w components/admin/nav-config.ts.
 */
export function visibleSections(role: Role): string[] {
  switch (role) {
    case "admin":
      return [
        "dashboard", "rezerwacje", "kalendarz", "klienci",
        "pracownicy", "uslugi", "grafik", "ewidencja",
        "raport-kasowy", "raport-zuzycia", "booksy", "ustawienia",
      ];
    case "recepcja":
      // recepcja prowadzi kasę dnia, ale nie zmienia cennika ani ustawień
      return [
        "dashboard", "rezerwacje", "kalendarz", "klienci",
        "pracownicy", "uslugi", "grafik", "raport-kasowy", "booksy",
      ];
    case "viewer":
      return ["kalendarz", "rezerwacje"];
    default:
      return ["moje-wizyty"];
  }
}
