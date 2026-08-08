import { getRealSession, getSession, getViewAs } from "@/lib/booking/session";
import { visibleSections } from "@/lib/booking/permissions";
import { fail, ok } from "@/app/api/_lib";

/** Kim jestem i co mogę zobaczyć — używane przez menu i widok pracownika. */
export async function GET() {
  const session = await getSession();
  if (!session) return fail("UNAUTHORIZED", "Sesja wygasła. Zaloguj się ponownie.", 401);

  const real = await getRealSession();
  const viewAs = await getViewAs();

  return ok({
    ...session,
    sections: visibleSections(session.role),
    // prawdziwa rola żyje obok podglądu, żeby dało się z niego wyjść
    realRole: real?.role ?? session.role,
    viewingAs: viewAs,
  });
}
