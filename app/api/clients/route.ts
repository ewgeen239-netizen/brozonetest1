import { getClients, upsertClient } from "@/lib/data/repository";
import { requireSession } from "@/lib/booking/session";
import { can } from "@/lib/booking/permissions";
import { fail, fromError, ok } from "@/app/api/_lib";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (!can(session, "client:read")) {
      return fail("FORBIDDEN", "Nie masz dostępu do bazy klientów.", 403);
    }
    const query = new URL(request.url).searchParams.get("query") ?? undefined;
    return ok(await getClients(query));
  } catch (err) {
    return fromError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!can(session, "client:write")) {
      return fail("FORBIDDEN", "Nie masz dostępu do tej funkcji.", 403);
    }
    return ok(await upsertClient(await request.json()));
  } catch (err) {
    return fromError(err);
  }
}
