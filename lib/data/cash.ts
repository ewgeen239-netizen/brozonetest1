import type { Booking, CashReport, CashSummary } from "@/lib/booking/types";

/* --------------------------------------------------------------------------
   Raport kasowy liczymy zawsze z danych źródłowych: wizyt i operacji.
   W bazie trzymamy tylko to, czego nie da się wyliczyć — stan otwarcia,
   policzoną gotówkę i ręczne operacje (wypłaty, korekty).
-------------------------------------------------------------------------- */

export const DEFAULT_OPENING_CASH = 500;

export function summarize(report: CashReport, bookings: Booking[]): CashSummary {
  const done = bookings.filter((b) => b.date === report.date && b.status === "completed");

  const byMethod = (method: Booking["paymentMethod"]) =>
    done.filter((b) => b.paymentMethod === method).reduce((sum, b) => sum + b.price, 0);

  const cashIncome = byMethod("cash");
  const cardIncome = byMethod("card");
  const transferIncome = byMethod("transfer");
  const tipsFromVisits = done.reduce((sum, b) => sum + (b.tip ?? 0), 0);

  const manualCash = report.operations
    .filter((o) => o.kind !== "income")
    .reduce((sum, o) => sum + o.amount, 0);

  const payouts = Math.abs(
    report.operations.filter((o) => o.kind === "payout").reduce((sum, o) => sum + o.amount, 0),
  );

  const tipsManual = report.operations
    .filter((o) => o.kind === "tip")
    .reduce((sum, o) => sum + o.amount, 0);

  // stan otwarcia + gotówka z wizyt + ręczne operacje (wypłaty są ujemne)
  const expectedCash = report.openingCash + cashIncome + manualCash;

  return {
    cashIncome,
    cardIncome,
    transferIncome,
    tips: tipsFromVisits + tipsManual,
    payouts,
    expectedCash,
    countedCash: report.countedCash,
    difference:
      report.countedCash === undefined
        ? undefined
        : Math.round((report.countedCash - expectedCash) * 100) / 100,
    paidVisits: done.filter((b) => b.paymentMethod !== "unpaid").length,
    unpaidVisits: done.filter((b) => b.paymentMethod === "unpaid").length,
  };
}

/** operacje pokazywane na liście: ręczne + wpływy z wizyt gotówkowych */
export function operationRows(report: CashReport, bookings: Booking[]) {
  const fromVisits = bookings
    .filter(
      (b) =>
        b.date === report.date && b.status === "completed" && b.paymentMethod === "cash",
    )
    .map((b) => ({
      operationId: `visit_${b.bookingId}`,
      time: b.timeStart,
      kind: "income" as const,
      title: `${b.serviceName} — ${b.clientName}`,
      amount: b.price,
      bookingId: b.bookingId,
      createdBy: b.staffName,
      document: undefined as string | undefined,
    }));

  return [...report.operations, ...fromVisits].sort((a, b) => a.time.localeCompare(b.time));
}
