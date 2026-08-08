/* --------------------------------------------------------------------------
   BROZONE — wspólny model danych dla trzech kategorii usług.
   Kopiuj do projektu jako lib/booking/types.ts
-------------------------------------------------------------------------- */

export type Category = "barber" | "tattoo" | "massage";

export const CATEGORY_LABEL: Record<Category, string> = {
  barber: "Barber",
  tattoo: "Tatuaż",
  massage: "Masaż",
};

export const CATEGORY_COLOR: Record<Category, string> = {
  barber: "#C8A55B",
  tattoo: "#4CC2FF",
  massage: "#3EA98C",
};

/* --------------------------------- status -------------------------------- */

export type BookingStatus = "new" | "confirmed" | "completed" | "cancelled" | "no_show";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  new: "Nowa",
  confirmed: "Potwierdzona",
  completed: "Wykonana",
  cancelled: "Anulowana",
  no_show: "Nie przyszedł",
};

/** dozwolone przejścia — pilnowane na serwerze */
export const STATUS_FLOW: Record<BookingStatus, BookingStatus[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export type BookingSource =
  | "website"
  | "manual"
  | "phone"
  | "walk_in"
  | "booksy"
  | "instagram";

export const SOURCE_LABEL: Record<BookingSource, string> = {
  website: "Strona",
  manual: "Recepcja",
  phone: "Telefon",
  walk_in: "Z ulicy",
  booksy: "Booksy",
  instagram: "Instagram",
};

/* -------------------------------- booking -------------------------------- */

export interface TattooDetails {
  idea: string;
  placement: string;
  size: string;
  reference?: string;
  consultationDone?: boolean;
}

export interface MassageDetails {
  pressure: "lekki" | "średni" | "mocny";
  focus: "plecy" | "szyja" | "nogi" | "całe ciało";
  /** dane wrażliwe — widzi tylko masażysta wizyty i właściciel */
  contraindications?: string;
}

export interface Booking {
  bookingId: string;
  date: string;      // RRRR-MM-DD
  timeStart: string; // GG:MM
  timeEnd: string;   // GG:MM
  category: Category;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  price: number;
  deposit: number;
  status: BookingStatus;
  source: BookingSource;
  notes?: string;
  tattoo?: TattooDetails;
  massage?: MassageDetails;
  consentRodo: boolean;
  consentMarketing: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: "synced" | "pending" | "error";
}

/* --------------------------------- staff --------------------------------- */

export interface WorkingDay {
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = poniedziałek
  start: string;
  end: string;
  enabled: boolean;
}

interface StaffBase {
  staffId: string;
  name: string;
  photoUrl?: string;
  workingHours: WorkingDay[];
  daysOff: string[];
  calendarColor: string;
  active: boolean;
  showOnWebsite: boolean;
  phone?: string;
  email?: string;
}

export interface BarberStaff extends StaffBase {
  category: "barber";
  specialization: string;
  serviceIds: string[];
  commissionPercent: number;
  booksyProfileLink?: string;
}

export type TattooStyle =
  | "fine line"
  | "realism"
  | "blackwork"
  | "lettering"
  | "color"
  | "inny";

export interface TattooStaff extends StaffBase {
  category: "tattoo";
  style: TattooStyle;
  portfolioLink?: string;
  instagram?: string;
  consultationRequired: boolean;
  minPrice: number;
  depositRequired: number;
}

export type MassageSpecialization =
  | "sportowy"
  | "relaksacyjny"
  | "klasyczny"
  | "leczniczy"
  | "inny";

export interface MassageStaff extends StaffBase {
  category: "massage";
  specialization: MassageSpecialization;
  serviceIds: string[];
  roomNumber?: string;
}

export type Staff = BarberStaff | TattooStaff | MassageStaff;

export const isBarber = (s: Staff): s is BarberStaff => s.category === "barber";
export const isTattoo = (s: Staff): s is TattooStaff => s.category === "tattoo";
export const isMassage = (s: Staff): s is MassageStaff => s.category === "massage";

/* -------------------------------- service -------------------------------- */

export interface Service {
  serviceId: string;
  category: Category;
  name: string;
  description: string;
  durationMinutes: number;
  priceFrom: number;
  priceTo: number;
  depositRequired: number;
  active: boolean;
  assignedStaffIds: string[];
  sortOrder?: number;
}

/** „180 zł" albo „od 300 zł" */
export function priceLabel(s: Pick<Service, "priceFrom" | "priceTo">): string {
  if (!s.priceFrom && !s.priceTo) return "wycena";
  if (s.priceTo && s.priceTo !== s.priceFrom) return `od ${s.priceFrom} zł`;
  return `${s.priceFrom} zł`;
}

/* --------------------------------- client -------------------------------- */

export type ClientTag = "barber" | "tattoo" | "massage" | "VIP" | "nowy" | "uwaga";

export interface Client {
  clientId: string;
  name: string;
  phone: string;
  email?: string;
  tags: ClientTag[];
  lastVisit?: string;
  totalVisits: number;
  noShows: number;
  notes?: string;
  consentMarketing: boolean;
  consentRodo: boolean;
  createdAt: string;
}

/** klucz rozpoznawania klienta — ostatnie 9 cyfr numeru */
export const normalizePhone = (phone: string) =>
  phone.replace(/\D/g, "").slice(-9);

/* --------------------------------- sesja --------------------------------- */

export type Role = "admin" | "recepcja" | "barber" | "tattoo" | "massage" | "viewer";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Właściciel",
  recepcja: "Recepcja",
  barber: "Barber",
  tattoo: "Tatuator",
  massage: "Masażysta",
  viewer: "Podgląd",
};

export interface Session {
  email: string;
  role: Role;
  /** wymagane dla ról pracowniczych */
  staffId?: string;
}

/* ------------------------------ sloty / API ------------------------------ */

export interface Slot {
  time: string;
  staffId: string;
  staffName: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message: string };
