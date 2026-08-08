import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_MS, createSessionToken } from "@/lib/auth";
import { GOOGLE_STATE_COOKIE, exchangeCode, googleConfigured } from "@/lib/auth-google";
import { findPermission } from "@/lib/data/repository";
import { isStaffRole } from "@/lib/booking/session";

/** Powrót z Google: sprawdzamy stan, adres e-mail i listę uprawnień. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));

  if (!googleConfigured()) return fail("google_off");
  if (url.searchParams.get("error")) return fail("google_cancelled");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${GOOGLE_STATE_COOKIE}=`))
    ?.split("=")[1];

  if (!code || !state || !expected || state !== expected) return fail("google_state");

  let identity;
  try {
    identity = await exchangeCode({ code, request });
  } catch {
    return fail("google_failed");
  }

  if (!identity.emailVerified) return fail("google_unverified");

  // dostęp wyłącznie dla adresów z listy uprawnień
  const permission = await findPermission(identity.email);
  if (!permission) {
    return NextResponse.redirect(
      new URL(`/login?error=no_access&email=${encodeURIComponent(identity.email)}`, request.url),
    );
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) return fail("config");

  const token = await createSessionToken(secret, {
    email: permission.email,
    role: permission.role,
    staffId: permission.staffId,
  });

  const landing = isStaffRole(permission.role) ? "/admin/moje-wizyty" : "/admin";
  const response = NextResponse.redirect(new URL(landing, request.url));
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  response.cookies.delete(GOOGLE_STATE_COOKIE);
  return response;
}
