"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  passwordMatches,
  safeRedirect,
} from "@/lib/auth";
import { VIEW_AS_COOKIE } from "@/lib/booking/session";

/* --------------------------- brute-force throttle -------------------------- */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; first: number }>();

function clientKey(forwarded: string | null) {
  return forwarded?.split(",")[0]?.trim() || "local";
}

function throttled(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 0, first: now });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function registerFailure(key: string) {
  const entry = attempts.get(key) ?? { count: 0, first: Date.now() };
  entry.count += 1;
  attempts.set(key, entry);
}

/* --------------------------------- login ---------------------------------- */

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const secret = process.env.AUTH_SECRET;
  const expected = process.env.ADMIN_PASSWORD;

  if (!secret || !expected) {
    return {
      error:
        "Brak konfiguracji serwera: ustaw ADMIN_PASSWORD i AUTH_SECRET w pliku .env.local i zrestartuj aplikację.",
    };
  }

  const headerList = await headers();
  const key = clientKey(headerList.get("x-forwarded-for"));

  if (throttled(key)) {
    return { error: "Zbyt wiele prób logowania. Spróbuj ponownie za 10 minut." };
  }

  const password = String(formData.get("password") ?? "");
  const next = safeRedirect(String(formData.get("next") ?? ""));

  if (!password) return { error: "Podaj hasło." };

  if (!(await passwordMatches(password, expected, secret))) {
    registerFailure(key);
    // uniform delay so a wrong password is not measurably faster
    await new Promise((r) => setTimeout(r, 350));
    return { error: "Nieprawidłowe hasło." };
  }

  attempts.delete(key);

  const store = await cookies();
  const token = await createSessionToken(secret, {
    email: process.env.OWNER_EMAIL?.toLowerCase() ?? "wlasciciel@brozone.pl",
    role: "admin",
  });
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  // świeże logowanie zawsze zaczyna od widoku właściciela
  store.delete(VIEW_AS_COOKIE);

  redirect(next);
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(VIEW_AS_COOKIE);
  redirect("/login");
}
