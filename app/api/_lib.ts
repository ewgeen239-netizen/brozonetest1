import { NextResponse } from "next/server";
import { RepositoryError } from "@/lib/data/repository";

/** Jednolita odpowiedź sukcesu. */
export const ok = <T,>(data: T) => NextResponse.json({ ok: true, data });

/** Jednolita odpowiedź błędu — `message` jest po polsku i gotowe do pokazania. */
export const fail = (code: string, message: string, status = 400) =>
  NextResponse.json({ ok: false, error: code, message }, { status });

const STATUS_BY_CODE: Record<string, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BOOKING_CONFLICT: 409,
  STALE_UPDATE: 409,
  RATE_LIMIT: 429,
};

/** Zamienia wyjątek warstwy danych na odpowiedź HTTP. */
export function fromError(err: unknown) {
  if (err instanceof RepositoryError) {
    return fail(err.code, err.message, STATUS_BY_CODE[err.code] ?? 500);
  }
  const code = (err as { code?: string })?.code;
  if (code) {
    const message = (err as Error).message || "Coś poszło nie tak.";
    return fail(code, message, STATUS_BY_CODE[code] ?? 502);
  }
  console.error(err);
  return fail("SERVER_ERROR", "Coś poszło nie tak po naszej stronie. Spróbuj jeszcze raz.", 500);
}
