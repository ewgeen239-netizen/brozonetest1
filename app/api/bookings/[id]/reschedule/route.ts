import { rescheduleBooking } from "@/lib/data/repository";
import { requireSession } from "@/lib/booking/session";
import { can } from "@/lib/booking/permissions";
import { fail, fromError, ok } from "@/app/api/_lib";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    if (!can(session, "booking:reschedule")) {
      return fail("FORBIDDEN", "Nie masz dostępu do tej funkcji.", 403);
    }
    const { id } = await ctx.params;
    const { date, timeStart } = await request.json();
    if (!date || !timeStart) return fail("VALIDATION_ERROR", "Wybierz datę i godzinę.");

    return ok(await rescheduleBooking({ bookingId: id, date, timeStart, user: session.email }));
  } catch (err) {
    return fromError(err);
  }
}
