import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

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
  if (await verifySessionToken(token, secret)) {
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
