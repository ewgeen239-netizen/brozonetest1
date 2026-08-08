import { getBookings, createBooking } from "@/lib/data/repository";
import { requireSession } from "@/lib/booking/session";
import { can, redactBooking, scopeBookings } from "@/lib/booking/permissions";
import { fail, fromError, ok } from "@/app/api/_lib";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const params = new URL(request.url).searchParams;

    const all = await getBookings({
      from: params.get("from") ?? undefined,
      to: params.get("to") ?? undefined,
      category: params.get("category") ?? undefined,
      status: params.get("status") ?? undefined,
      staffId: params.get("staffId") ?? undefined,
    });

    // zakres wg roli nakładamy na serwerze — cudze wizyty nie opuszczają serwera
    const visible = scopeBookings(session, all).map((b) => redactBooking(session, b));
    return ok(visible);
  } catch (err) {
    return fromError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!can(session, "booking:create")) {
      return fail("FORBIDDEN", "Nie masz dostępu do tej funkcji.", 403);
    }
    const body = await request.json();
    const booking = await createBooking({
      ...body,
      status: body.status ?? "confirmed",
      source: body.source ?? "manual",
      user: session.email,
    });
    return ok(booking);
  } catch (err) {
    return fromError(err);
  }
}
