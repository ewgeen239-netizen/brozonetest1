import { getBookings, getCashReport } from "@/lib/data/repository";
import { operationRows, summarize } from "@/lib/data/cash";
import type { CashReport } from "@/lib/booking/types";

/** Raport + wyliczenia + gotowa lista operacji dla jednego dnia. */
export async function cashDay(date: string, report?: CashReport) {
  const current = report ?? (await getCashReport(date));
  const bookings = await getBookings({ from: date, to: date });
  return {
    report: current,
    summary: summarize(current, bookings),
    rows: operationRows(current, bookings),
  };
}
