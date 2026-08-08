import { NextResponse } from "next/server";
import { getRealSession, VIEW_AS_COOKIE } from "@/lib/booking/session";
import { fail, ok } from "@/app/api/_lib";

/** Podgląd panelu oczami pracownika — tylko dla właściciela. */
export async function POST(request: Request) {
  const session = await getRealSession();
  if (!session) return fail("UNAUTHORIZED", "Sesja wygasła. Zaloguj się ponownie.", 401);
  if (session.role !== "admin") {
    return fail("FORBIDDEN", "Tylko właściciel może przełączać widok.", 403);
  }

  const { role } = await request.json();
  const allowed = ["barber", "tattoo", "massage", "recepcja", "viewer"];

  const response = NextResponse.json({ ok: true, data: { role: role ?? null } });
  if (!role) {
    response.cookies.delete(VIEW_AS_COOKIE);
  } else if (allowed.includes(role)) {
    response.cookies.set(VIEW_AS_COOKIE, role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
  }
  return response;
}
