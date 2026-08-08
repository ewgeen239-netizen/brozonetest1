import { setOpeningCash } from "@/lib/data/repository";
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
    const { date, amount } = await request.json();
    const report = await setOpeningCash({ date, amount: Number(amount), user: session.email });
    return ok(await cashDay(date, report));
  } catch (err) {
    return fromError(err);
  }
}
