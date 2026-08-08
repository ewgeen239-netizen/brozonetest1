import {
  addCashOperation,
  getCashReport,
  removeCashOperation,
} from "@/lib/data/repository";
import { requireSession } from "@/lib/booking/session";
import { can } from "@/lib/booking/permissions";
import type { CashOperationKind } from "@/lib/booking/types";
import { fail, fromError, ok } from "@/app/api/_lib";
import { cashDay } from "./_shared";

/** Raport kasowy widzą właściciel i recepcja — nie pracownicy. */
async function guard() {
  const session = await requireSession();
  if (!can(session, "booking:read:all")) {
    throw Object.assign(new Error("Nie masz dostępu do raportu kasowego."), { code: "FORBIDDEN" });
  }
  return session;
}

export async function GET(request: Request) {
  try {
    await guard();
    const date = new URL(request.url).searchParams.get("date");
    if (!date) return fail("VALIDATION_ERROR", "Wybierz dzień.");
    return ok(await cashDay(date, await getCashReport(date)));
  } catch (err) {
    return fromError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await guard();
    const body = (await request.json()) as {
      date: string;
      kind: CashOperationKind;
      title: string;
      amount: number;
      document?: string;
    };

    const report = await addCashOperation({
      date: body.date,
      kind: body.kind,
      title: body.title,
      amount: Number(body.amount),
      document: body.document,
      user: session.email,
    });
    return ok(await cashDay(body.date, report));
  } catch (err) {
    return fromError(err);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await guard();
    const { date, operationId } = await request.json();
    const report = await removeCashOperation({ date, operationId, user: session.email });
    return ok(await cashDay(date, report));
  } catch (err) {
    return fromError(err);
  }
}
