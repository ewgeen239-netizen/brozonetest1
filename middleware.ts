import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionPayload } from "@/lib/auth";

/**
 * Gate for BROZONE OS. Runs before every /admin request; an unsigned, expired
 * or missing session cookie is bounced to /login. Fails closed: if the server
 * is missing its secrets, nobody gets in.
 */
export async function middleware(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const password = process.env.ADMIN_PASSWORD;

  const loginUrl = new URL("/login", request.url);

  if (!secret || !password) {
    loginUrl.searchParams.set("error", "config");
    return NextResponse.redirect(loginUrl);
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = await readSessionPayload(token, secret);
  if (payload) {
    // pracownik ma jeden ekran — resztę panelu ma po prostu niedostępną
    const staffRole = ["barber", "tattoo", "massage"].includes(payload.role);
    const viewAs = request.cookies.get("brozone_viewas")?.value;
    const effectiveStaff = staffRole || ["barber", "tattoo", "massage"].includes(viewAs ?? "");

    if (effectiveStaff && !request.nextUrl.pathname.startsWith("/admin/moje-wizyty")) {
      return NextResponse.redirect(new URL("/admin/moje-wizyty", request.url));
    }

    const response = NextResponse.next();
    // the admin panel must never be cached by a shared proxy
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  const response = NextResponse.redirect(loginUrl);
  if (token) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
