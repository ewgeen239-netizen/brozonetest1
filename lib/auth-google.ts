import "server-only";

/* --------------------------------------------------------------------------
   Logowanie przez Google — ręczna implementacja OAuth 2.0 (Authorization Code).
   Bez dodatkowej biblioteki: to ~100 linii i pełna kontrola nad tym,
   co trafia do sesji.

   Konfiguracja (.env.local):
     GOOGLE_CLIENT_ID
     GOOGLE_CLIENT_SECRET
     APP_URL            np. https://brozone.pl (do zbudowania redirect_uri)
-------------------------------------------------------------------------- */

export const GOOGLE_STATE_COOKIE = "brozone_oauth_state";

export const googleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export function redirectUri(request: Request) {
  const base = process.env.APP_URL ?? new URL(request.url).origin;
  return `${base.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function authorizeUrl(p: { request: Request; state: string }) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(p.request),
    response_type: "code",
    scope: "openid email profile",
    state: p.state,
    // pytamy o konto za każdym razem — w salonie jeden komputer bywa wspólny
    prompt: "select_account",
    access_type: "online",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface GoogleIdentity {
  email: string;
  name?: string;
  emailVerified: boolean;
}

/** Wymiana kodu na token i odczytanie adresu e-mail z id_token. */
export async function exchangeCode(p: {
  code: string;
  request: Request;
}): Promise<GoogleIdentity> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: p.code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(p.request),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Google odrzucił logowanie (${res.status}).`);
  }

  const json = (await res.json()) as { id_token?: string };
  if (!json.id_token) throw new Error("Google nie zwrócił danych konta.");

  /*
   * id_token przyszedł bezpośrednio z serwera Google po TLS, w odpowiedzi na
   * nasz sekret — dlatego odczytujemy payload bez weryfikacji podpisu.
   * To zalecany skrót właśnie dla przepływu z wymianą kodu po stronie serwera.
   */
  const [, payload] = json.id_token.split(".");
  const decoded = JSON.parse(
    Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
  ) as { email?: string; name?: string; email_verified?: boolean };

  if (!decoded.email) throw new Error("Konto Google nie ma adresu e-mail.");

  return {
    email: decoded.email.toLowerCase(),
    name: decoded.name,
    emailVerified: decoded.email_verified !== false,
  };
}

export const randomState = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
