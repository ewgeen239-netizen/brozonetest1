import { closeCashDay, reopenCashDay } from "@/lib/data/repository";
import { requireSession } from "@/lib/booking/session";
import { can } from "@/lib/booking/permissions";
import { fail, fromError, ok } from "@/app/api/_lib";
import { cashDay } from "../_shared";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!can(session, "booking:read:all")) {
      return fail("FORBIDDEN", "Nie masz dostępu do raportu kasowego.", 403);
    }
    const { date, countedCash, note } = await request.json();
    if (countedCash === undefined || countedCash === null || countedCash === "") {
      return fail("VALIDATION_ERROR", "Wpisz, ile gotówki jest w kasie.");
    }
    const report = await closeCashDay({
      date,
      countedCash: Number(countedCash),
      note,
      user: session.email,
    });
    return ok(await cashDay(date, report));
  } catch (err) {
    return fromError(err);
  }
}

/** Ponowne otwarcie dnia — tylko właściciel. */
export async function DELETE(request: Request) {
  try {
    const session = await requireSession();
    if (session.role !== "admin") {
      return fail("FORBIDDEN", "Tylko właściciel może otworzyć zamknięty dzień.", 403);
    }
    const { date } = await request.json();
    const report = await reopenCashDay({ date, user: session.email });
    return ok(await cashDay(date, report));
  } catch (err) {
    return fromError(err);
  }
}
