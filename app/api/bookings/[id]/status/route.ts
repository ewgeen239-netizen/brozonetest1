import { getBookings, updateBookingStatus } from "@/lib/data/repository";
import { requireSession } from "@/lib/booking/session";
import { canChangeStatus } from "@/lib/booking/permissions";
import { STATUS_FLOW, type BookingStatus, type PaymentMethod } from "@/lib/booking/types";
import { fail, fromError, ok } from "@/app/api/_lib";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;
    const { status, note, paymentMethod, tip } = (await request.json()) as {
      status: BookingStatus;
      note?: string;
      paymentMethod?: PaymentMethod;
      tip?: number;
    };

    const current = (await getBookings()).find((b) => b.bookingId === id);
    if (!current) return fail("NOT_FOUND", "Nie znaleziono tej wizyty.", 404);

    if (!canChangeStatus(session, current)) {
      return fail("FORBIDDEN", "Nie masz dostępu do tej wizyty.", 403);
    }
    if (status !== current.status && !STATUS_FLOW[current.status].includes(status)) {
      return fail("VALIDATION_ERROR", "Nie można zmienić statusu w ten sposób.");
    }

    return ok(
      await updateBookingStatus({
        bookingId: id,
        status,
        note,
        paymentMethod,
        tip,
        user: session.email,
      }),
    );
  } catch (err) {
    return fromError(err);
  }
}
