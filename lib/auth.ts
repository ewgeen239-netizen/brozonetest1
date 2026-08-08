/**
 * Minimal session auth for the admin panel.
 *
 * A login issues an HMAC-SHA256 signed cookie; middleware verifies it on every
 * /admin request. Everything here uses Web Crypto only, so the same code runs
 * in the Edge middleware runtime and in Node server actions.
 *
 * Secrets come from the environment and are never sent to the client:
 *   ADMIN_PASSWORD — the owner's password
 *   AUTH_SECRET    — random 32+ byte string used to sign sessions
 */

export const SESSION_COOKIE = "brozone_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // one shift

const encoder = new TextEncoder();

export interface SessionPayload {
  sub: string;
  email: string;
  role: string;
  staffId?: string;
  iat: number;
  exp: number;
}

/* ------------------------------- base64url -------------------------------- */

function toBase64Url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/* --------------------------------- HMAC ----------------------------------- */

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(data: string, secret: string) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(sig));
}

/* -------------------------------- session --------------------------------- */

export async function createSessionToken(
  secret: string,
  identity: { email: string; role: string; staffId?: string } = {
    email: "wlasciciel@brozone.pl",
    role: "admin",
  },
) {
  const now = Date.now();
  const payload: SessionPayload = {
    sub: identity.email,
    email: identity.email,
    role: identity.role,
    staffId: identity.staffId,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${body}.${await sign(body, secret)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret) return false;
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  let valid = false;
  try {
    const key = await hmacKey(secret);
    valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      encoder.encode(body),
    );
  } catch {
    return false;
  }
  if (!valid) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

/** Zwraca dane sesji tylko wtedy, gdy podpis i termin ważności się zgadzają. */
export async function readSessionPayload(
  token: string | undefined,
  secret: string | undefined,
): Promise<SessionPayload | null> {
  if (!(await verifySessionToken(token, secret))) return null;
  try {
    const [body] = token!.split(".");
    return JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
  } catch {
    return null;
  }
}

/* ------------------------------ password check ---------------------------- */

/**
 * Compares by HMAC digest instead of raw strings so the comparison time does
 * not leak how many leading characters matched.
 */
export async function passwordMatches(
  candidate: string,
  expected: string,
  secret: string,
): Promise<boolean> {
  const [a, b] = await Promise.all([sign(candidate, secret), sign(expected, secret)]);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** guards against open redirects — only in-app admin paths are accepted */
export function safeRedirect(target: string | undefined | null) {
  if (!target) return "/admin";
  if (!target.startsWith("/admin")) return "/admin";
  if (target.startsWith("//")) return "/admin";
  return target;
}
