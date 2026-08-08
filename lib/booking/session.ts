import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionPayload } from "@/lib/auth";
import type { Role, Session } from "./types";

/* --------------------------------------------------------------------------
   Sesja panelu.

   Rola siedzi w podpisanym ciasteczku i pochodzi z listy uprawnień
   (arkusz `permissions`). Właściciel może dodatkowo włączyć podgląd
   „jako pracownik" — wtedy serwer ogranicza dane dokładnie tak, jak zobaczy
   je ta osoba.
-------------------------------------------------------------------------- */

export const VIEW_AS_COOKIE = "brozone_viewas";

const ROLES: Role[] = ["admin", "recepcja", "barber", "tattoo", "massage", "viewer"];

/** rola pracownicza → konkretna osoba w danych demonstracyjnych */
const DEMO_STAFF_BY_ROLE: Partial<Record<Role, string>> = {
  barber: "stf_max",
  tattoo: "stf_walera",
  massage: "stf_ola",
};

export class AuthError extends Error {
  constructor(
    public code: "UNAUTHORIZED" | "FORBIDDEN",
    message: string,
  ) {
    super(message);
  }
}

/**
 * Prawdziwa tożsamość z podpisanego ciasteczka — bez podglądu „jako".
 * Tego używa wszystko, co decyduje o samym podglądzie (żeby właściciel
 * zawsze mógł do siebie wrócić).
 */
export async function getRealSession(): Promise<Session | null> {
  const store = await cookies();
  const payload = await readSessionPayload(
    store.get(SESSION_COOKIE)?.value,
    process.env.AUTH_SECRET,
  );
  if (!payload) return null;

  // Ciasteczka wystawione przed rolami mają tylko `sub: "owner"`. Podpisać je
  // mógł wyłącznie ktoś, kto znał hasło właściciela, więc to admin.
  const legacyOwner = !payload.role && payload.sub === "owner";
  const role = (
    legacyOwner ? "admin" : ROLES.includes(payload.role as Role) ? payload.role : "viewer"
  ) as Role;

  return {
    email: payload.email ?? payload.sub,
    role,
    staffId: payload.staffId,
  };
}

/** Rola, na którą właściciel przełączył podgląd (albo null). */
export async function getViewAs(): Promise<Role | null> {
  const real = await getRealSession();
  if (real?.role !== "admin") return null;
  const store = await cookies();
  const viewAs = store.get(VIEW_AS_COOKIE)?.value as Role | undefined;
  if (!viewAs || !ROLES.includes(viewAs) || viewAs === "admin") return null;
  return viewAs;
}

export async function getSession(): Promise<Session | null> {
  const session = await getRealSession();
  if (!session) return null;

  const viewAs = await getViewAs();
  if (viewAs) {
    return { email: session.email, role: viewAs, staffId: DEMO_STAFF_BY_ROLE[viewAs] };
  }

  return session;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new AuthError("UNAUTHORIZED", "Sesja wygasła. Zaloguj się ponownie.");
  return session;
}

/** true, jeśli rola widzi tylko własne wizyty (uproszczony ekran pracownika) */
export const isStaffRole = (role: Role) =>
  role === "barber" || role === "tattoo" || role === "massage";
