"use client";

import * as React from "react";
import type {
  Appointment,
  Barber,
  BooksyConfig,
  BooksyMode,
  CashReport,
  Client,
  ProductUsageEntry,
  Service,
  TimeEntry,
  WorkShift,
  BooksySyncLog,
} from "./types";
import {
  appointments as seedAppointments,
  barbers as seedBarbers,
  booksyConfig as seedConfig,
  cashReports as seedCash,
  clients as seedClients,
  productUsage as seedUsage,
  services as seedServices,
  syncLogs as seedLogs,
  timeEntries as seedTime,
  workShifts as seedShifts,
  TODAY,
} from "./mock-data";
import { uid } from "./utils";

/* --------------------------------------------------------------------------
   In-memory store. Mutations are local-only (mock backend); every writer is
   shaped like the eventual API call so swapping in fetch() is mechanical.
-------------------------------------------------------------------------- */

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: "default" | "ok" | "warn" | "danger";
}

interface StoreValue {
  today: string;
  appointments: Appointment[];
  barbers: Barber[];
  services: Service[];
  clients: Client[];
  shifts: WorkShift[];
  cashReports: CashReport[];
  productUsage: ProductUsageEntry[];
  timeEntries: TimeEntry[];
  syncLogs: BooksySyncLog[];
  booksy: BooksyConfig;
  syncing: boolean;
  toasts: Toast[];

  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  moveAppointment: (id: string, barberId: string, date: string, start: string) => void;
  createAppointment: (a: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => void;
  resolveConflict: (id: string, keep: "local" | "remote") => void;

  upsertBarber: (b: Barber) => void;
  archiveBarber: (id: string) => void;

  upsertService: (s: Service) => void;
  toggleService: (id: string) => void;

  upsertShift: (s: WorkShift) => void;
  approveTimeEntry: (id: string, approved: boolean) => void;
  upsertTimeEntry: (t: TimeEntry) => void;

  addUsageEntry: (e: Omit<ProductUsageEntry, "id">) => void;
  removeUsageEntry: (id: string) => void;

  closeCashDay: (date: string, countedCash: number, note?: string) => void;
  approveCashReport: (date: string) => void;

  setBooksyMode: (mode: BooksyMode) => void;
  updateBooksy: (patch: Partial<BooksyConfig>) => void;
  runSync: () => Promise<void>;

  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = React.createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = React.useState<Appointment[]>(seedAppointments);
  const [barbers, setBarbers] = React.useState<Barber[]>(seedBarbers);
  const [services, setServices] = React.useState<Service[]>(seedServices);
  const [clients] = React.useState<Client[]>(seedClients);
  const [shifts, setShifts] = React.useState<WorkShift[]>(seedShifts);
  const [cashReports, setCashReports] = React.useState<CashReport[]>(seedCash);
  const [productUsage, setProductUsage] = React.useState<ProductUsageEntry[]>(seedUsage);
  const [timeEntries, setTimeEntries] = React.useState<TimeEntry[]>(seedTime);
  const [syncLogs, setSyncLogs] = React.useState<BooksySyncLog[]>(seedLogs);
  const [booksy, setBooksy] = React.useState<BooksyConfig>(seedConfig);
  const [syncing, setSyncing] = React.useState(false);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = uid("toast");
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = React.useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const updateAppointment = React.useCallback((id: string, patch: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a)),
    );
  }, []);

  const moveAppointment = React.useCallback(
    (id: string, barberId: string, date: string, start: string) => {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, barberId, date, start, updatedAt: new Date().toISOString() } : a,
        ),
      );
    },
    [],
  );

  const createAppointment = React.useCallback(
    (a: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      setAppointments((prev) => [...prev, { ...a, id: uid("apt"), createdAt: now, updatedAt: now }]);
    },
    [],
  );

  const resolveConflict = React.useCallback((id: string, keep: "local" | "remote") => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id !== id || !a.conflict) return a;
        const patch = keep === "remote" ? (a.conflict.remote as Partial<Appointment>) : {};
        return {
          ...a,
          ...patch,
          conflict: { ...a.conflict, resolved: true },
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, []);

  const upsertBarber = React.useCallback((b: Barber) => {
    setBarbers((prev) => {
      const exists = prev.some((x) => x.id === b.id);
      return exists ? prev.map((x) => (x.id === b.id ? b : x)) : [...prev, b];
    });
  }, []);

  const archiveBarber = React.useCallback((id: string) => {
    setBarbers((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: b.status === "active" ? "archived" : "active" } : b,
      ),
    );
  }, []);

  const upsertService = React.useCallback((s: Service) => {
    setServices((prev) => {
      const exists = prev.some((x) => x.id === s.id);
      return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s];
    });
  }, []);

  const toggleService = React.useCallback((id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  }, []);

  const upsertShift = React.useCallback((s: WorkShift) => {
    setShifts((prev) => {
      const exists = prev.some((x) => x.id === s.id);
      return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s];
    });
  }, []);

  const approveTimeEntry = React.useCallback((id: string, approved: boolean) => {
    setTimeEntries((prev) => prev.map((t) => (t.id === id ? { ...t, approved } : t)));
  }, []);

  const upsertTimeEntry = React.useCallback((t: TimeEntry) => {
    setTimeEntries((prev) => {
      const exists = prev.some((x) => x.id === t.id);
      return exists ? prev.map((x) => (x.id === t.id ? t : x)) : [t, ...prev];
    });
  }, []);

  const addUsageEntry = React.useCallback((e: Omit<ProductUsageEntry, "id">) => {
    setProductUsage((prev) => [{ ...e, id: uid("pu") }, ...prev]);
  }, []);

  const removeUsageEntry = React.useCallback((id: string) => {
    setProductUsage((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const closeCashDay = React.useCallback(
    (date: string, countedCash: number, note?: string) => {
      setCashReports((prev) =>
        prev.map((r) => {
          if (r.date !== date) return r;
          const expected = r.openingCash + r.cashIncome - r.payouts;
          return {
            ...r,
            closingCash: countedCash,
            difference: Math.round((countedCash - expected) * 100) / 100,
            status: "closed",
            note: note ?? r.note,
          };
        }),
      );
      toast({ title: "Dzień zamknięty", description: `Raport kasowy ${date} zapisany.`, tone: "ok" });
    },
    [toast],
  );

  const approveCashReport = React.useCallback(
    (date: string) => {
      setCashReports((prev) =>
        prev.map((r) =>
          r.date === date
            ? {
                ...r,
                status: "approved",
                approvedBy: "Biuro rachunkowe",
                approvedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
      toast({ title: "Raport zatwierdzony", tone: "ok" });
    },
    [toast],
  );

  const setBooksyMode = React.useCallback(
    (mode: BooksyMode) => {
      setBooksy((prev) => ({
        ...prev,
        mode,
        connectionState: mode === "manual" ? "disconnected" : prev.connectionState,
      }));
      toast({
        title: "Tryb Booksy zmieniony",
        description:
          mode === "widget"
            ? "Widget Mode — klienci rezerwują w Booksy."
            : mode === "import"
              ? "Import Mode — rezerwacje pobierane do BROZONE OS."
              : "Manual Mode — grafik prowadzony ręcznie.",
        tone: "default",
      });
    },
    [toast],
  );

  const updateBooksy = React.useCallback((patch: Partial<BooksyConfig>) => {
    setBooksy((prev) => ({ ...prev, ...patch }));
  }, []);

  const runSync = React.useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    const startedAt = new Date().toISOString();
    const runningId = uid("sync");
    setSyncLogs((prev) => [
      {
        id: runningId,
        startedAt,
        mode: booksy.mode,
        trigger: "manual",
        imported: 0,
        updated: 0,
        skipped: 0,
        conflicts: 0,
        errors: 0,
        status: "running",
        message: "Łączenie z Booksy…",
      },
      ...prev,
    ]);

    await new Promise((r) => setTimeout(r, 1800));

    if (booksy.mode === "manual") {
      setSyncLogs((prev) =>
        prev.map((l) =>
          l.id === runningId
            ? {
                ...l,
                status: "error",
                finishedAt: new Date().toISOString(),
                errors: 1,
                message: "Tryb Manual — synchronizacja wyłączona. Zmień tryb na Import.",
              }
            : l,
        ),
      );
      setSyncing(false);
      toast({ title: "Sync niedostępny", description: "Aktywny tryb Manual.", tone: "warn" });
      return;
    }

    const imported = 2 + Math.floor(Math.random() * 5);
    const updated = Math.floor(Math.random() * 3);
    const conflicts = Math.random() > 0.6 ? 1 : 0;

    setSyncLogs((prev) =>
      prev.map((l) =>
        l.id === runningId
          ? {
              ...l,
              status: conflicts ? "partial" : "success",
              finishedAt: new Date().toISOString(),
              imported,
              updated,
              skipped: 38 + Math.floor(Math.random() * 12),
              conflicts,
              message: conflicts
                ? `Zaimportowano ${imported} rezerwacji. ${conflicts} konflikt do rozwiązania.`
                : `Zaimportowano ${imported} rezerwacji, zaktualizowano ${updated}.`,
              lines: [
                `GET /v1/businesses/48812/appointments?from=${TODAY} → 200`,
                `insert ${imported} · update ${updated} · skip ${38 + updated}`,
                conflicts ? "conflict detected → wymaga decyzji" : "no conflicts",
              ],
            }
          : l,
      ),
    );
    setBooksy((prev) => ({ ...prev, lastSyncAt: new Date().toISOString() }));
    setSyncing(false);
    toast({
      title: "Synchronizacja zakończona",
      description: `${imported} nowych rezerwacji z Booksy.`,
      tone: conflicts ? "warn" : "ok",
    });
  }, [booksy.mode, syncing, toast]);

  const value: StoreValue = {
    today: TODAY,
    appointments,
    barbers,
    services,
    clients,
    shifts,
    cashReports,
    productUsage,
    timeEntries,
    syncLogs,
    booksy,
    syncing,
    toasts,
    updateAppointment,
    moveAppointment,
    createAppointment,
    resolveConflict,
    upsertBarber,
    archiveBarber,
    upsertService,
    toggleService,
    upsertShift,
    approveTimeEntry,
    upsertTimeEntry,
    addUsageEntry,
    removeUsageEntry,
    closeCashDay,
    approveCashReport,
    setBooksyMode,
    updateBooksy,
    runSync,
    toast,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/* ------------------------------ selectors -------------------------------- */

export function useBarberMap() {
  const { barbers } = useStore();
  return React.useMemo(() => new Map(barbers.map((b) => [b.id, b])), [barbers]);
}

export function useServiceMap() {
  const { services } = useStore();
  return React.useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
}

export function useClientMap() {
  const { clients } = useStore();
  return React.useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
}
