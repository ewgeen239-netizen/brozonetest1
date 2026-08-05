/* ---------------------------------------------------------------------------
   BROZONE OS — domain model
   All entities are plain, serialisable objects so the mock layer can be swapped
   for a real API (Prisma / Supabase / Booksy adapter) without touching the UI.
--------------------------------------------------------------------------- */

export type ID = string;

/** ISO date, no time. e.g. "2026-08-05" */
export type ISODate = string;
/** "HH:mm" in salon local time */
export type ClockTime = string;

export type Currency = "PLN";

/* ------------------------------- Barber ---------------------------------- */

export type BarberStatus = "active" | "archived";

export interface WorkingHours {
  /** 1 = Monday … 7 = Sunday (ISO weekday) */
  weekday: number;
  start: ClockTime;
  end: ClockTime;
  /** null = day off */
  enabled: boolean;
}

export interface Barber {
  id: ID;
  name: string;
  nickname?: string;
  photoUrl: string;
  specialization: string;
  /** service ids the barber is allowed to perform */
  serviceIds: ID[];
  workingHours: WorkingHours[];
  /** ISO dates the barber is off (holiday, sick) */
  daysOff: ISODate[];
  /** 0–100 */
  commissionPct: number;
  /** hex used across the calendar */
  color: string;
  booksyProfileUrl?: string;
  phone: string;
  email: string;
  hiredAt: ISODate;
  status: BarberStatus;
  rating: number;
}

/* ------------------------------- Service --------------------------------- */

export type ServiceCategory = "hair" | "beard" | "combo" | "care" | "color" | "kids";

/**
 * Booksy prices one service per barber tier or hair length, so a service is a
 * range of variants. `price` / `durationMin` on Service hold the entry-level
 * variant, which is what the price list and the calendar default to.
 */
export interface ServiceVariant {
  label: string;
  price: number;
  durationMin: number;
}

export interface Service {
  id: ID;
  name: string;
  nameEn: string;
  category: ServiceCategory;
  durationMin: number;
  price: number;
  currency: Currency;
  description: string;
  active: boolean;
  /** how often booked, used for sorting / insights */
  popularity: number;
  booksyServiceId?: string;
  /** per-barber / per-length pricing as published on Booksy */
  variants?: ServiceVariant[];
}

/* ------------------------------- Client ---------------------------------- */

export type ClientTier = "new" | "regular" | "vip" | "risk";

export interface Client {
  id: ID;
  name: string;
  phone: string;
  email?: string;
  createdAt: ISODate;
  visits: number;
  noShows: number;
  totalSpent: number;
  lastVisitAt?: ISODate;
  favoriteBarberId?: ID;
  favoriteServiceId?: ID;
  tier: ClientTier;
  notes?: string;
  marketingConsent: boolean;
}

/* ----------------------------- Appointment ------------------------------- */

export type AppointmentSource = "booksy" | "website" | "manual" | "walkin";
export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";
export type PaymentMethod = "cash" | "card" | "transfer" | "unpaid";

export interface Appointment {
  id: ID;
  clientId: ID;
  barberId: ID;
  serviceIds: ID[];
  date: ISODate;
  start: ClockTime;
  /** derived from services but stored so manual overrides stick */
  durationMin: number;
  status: AppointmentStatus;
  source: AppointmentSource;
  price: number;
  paymentMethod: PaymentMethod;
  tip?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  /** present when the record originated in / is mirrored to Booksy */
  booksyId?: string;
  /** set when local + remote diverge and need resolution */
  conflict?: AppointmentConflict;
}

export interface AppointmentConflict {
  detectedAt: string;
  field: keyof Appointment | "multiple";
  local: Record<string, unknown>;
  remote: Record<string, unknown>;
  resolved: boolean;
}

/* ------------------------------ WorkShift -------------------------------- */

export type ShiftKind = "work" | "vacation" | "sick" | "off" | "training";

export interface WorkShift {
  id: ID;
  barberId: ID;
  date: ISODate;
  kind: ShiftKind;
  start: ClockTime;
  end: ClockTime;
  /** minutes */
  breakMin: number;
  note?: string;
}

/* ----------------------------- CashReport -------------------------------- */

export type CashOperationKind = "income" | "payout" | "tip" | "deposit" | "correction";

export interface CashOperation {
  id: ID;
  time: ClockTime;
  kind: CashOperationKind;
  title: string;
  amount: number;
  method: PaymentMethod;
  barberId?: ID;
  appointmentId?: ID;
  document?: string;
}

export type CashReportStatus = "open" | "closed" | "approved";

export interface CashReport {
  id: ID;
  date: ISODate;
  openingCash: number;
  cashIncome: number;
  cardIncome: number;
  transferIncome: number;
  payouts: number;
  tips: number;
  closingCash: number;
  /** counted − expected */
  difference: number;
  responsiblePersonId: ID;
  status: CashReportStatus;
  approvedBy?: string;
  approvedAt?: string;
  operations: CashOperation[];
  note?: string;
}

/* -------------------------- ProductUsageReport --------------------------- */

export type ProductCategory =
  | "styling"
  | "shave"
  | "care"
  | "color"
  | "disposable"
  | "cleaning";

export type ProductUnit = "ml" | "g" | "szt" | "para";

export interface ProductUsageEntry {
  id: ID;
  date: ISODate;
  productName: string;
  category: ProductCategory;
  amount: number;
  unit: ProductUnit;
  /** cost of the consumed amount, PLN */
  cost: number;
  barberId?: ID;
  serviceId?: ID;
  appointmentId?: ID;
  note?: string;
}

export interface ProductUsageReport {
  id: ID;
  periodFrom: ISODate;
  periodTo: ISODate;
  entries: ProductUsageEntry[];
  totalCost: number;
  status: "draft" | "closed";
}

/* ------------------------------ TimeReport ------------------------------- */

export interface TimeEntry {
  id: ID;
  barberId: ID;
  date: ISODate;
  start: ClockTime;
  end: ClockTime;
  breakMin: number;
  /** hours, 2 decimals */
  totalHours: number;
  overtimeHours: number;
  kind: ShiftKind;
  approved: boolean;
  source: "auto" | "manual";
  note?: string;
}

export interface TimeReport {
  id: ID;
  month: string; // "2026-08"
  entries: TimeEntry[];
  status: "open" | "submitted" | "approved";
}

/* --------------------------- Booksy integration -------------------------- */

export type BooksyMode = "widget" | "import" | "manual";

export type SyncLogStatus = "success" | "partial" | "error" | "running";

export interface BooksySyncLog {
  id: ID;
  startedAt: string;
  finishedAt?: string;
  mode: BooksyMode;
  trigger: "manual" | "scheduled" | "webhook" | "csv";
  imported: number;
  updated: number;
  skipped: number;
  conflicts: number;
  errors: number;
  status: SyncLogStatus;
  message: string;
  /** short machine log lines shown in the drawer */
  lines?: string[];
}

export interface BooksyConfig {
  mode: BooksyMode;
  businessUrl: string;
  widgetUrl: string;
  apiKeyMasked?: string;
  webhookUrl?: string;
  autoSyncEnabled: boolean;
  autoSyncIntervalMin: number;
  lastSyncAt?: string;
  /** null while never connected */
  connectionState: "connected" | "degraded" | "disconnected";
}

/* -------------------------------- Reviews -------------------------------- */

export interface Review {
  id: ID;
  author: string;
  rating: number;
  text: string;
  date: ISODate;
  barberId?: ID;
  source: "booksy" | "google";
}

/* --------------------------- View-model helpers -------------------------- */

export type LoadState = "idle" | "loading" | "error" | "empty" | "ready";

export interface KpiTrend {
  value: number;
  /** percentage change vs previous period */
  delta: number;
  /** 7 points, oldest → newest */
  spark: number[];
}
