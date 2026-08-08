import { getStaff, upsertStaff } from "@/lib/data/repository";
import { requireSession } from "@/lib/booking/session";
import { can } from "@/lib/booking/permissions";
import { fail, fromError, ok } from "@/app/api/_lib";

export async function GET(request: Request) {
  try {
    await requireSession();
    const category = new URL(request.url).searchParams.get("category") ?? undefined;
    return ok(await getStaff(category));
  } catch (err) {
    return fromError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!can(session, "staff:write")) {
      return fail("FORBIDDEN", "Tylko właściciel może zmieniać dane pracowników.", 403);
    }
    return ok(await upsertStaff(await request.json()));
  } catch (err) {
    return fromError(err);
  }
}
