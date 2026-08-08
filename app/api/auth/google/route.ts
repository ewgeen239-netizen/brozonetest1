import { NextResponse } from "next/server";
import {
  GOOGLE_STATE_COOKIE,
  authorizeUrl,
  googleConfigured,
  randomState,
} from "@/lib/auth-google";

/** Start logowania: zapisujemy stan i odsyłamy na ekran zgody Google. */
export async function GET(request: Request) {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_off", request.url));
  }

  const state = randomState();
  const response = NextResponse.redirect(authorizeUrl({ request, state }));
  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
