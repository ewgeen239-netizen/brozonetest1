/* --------------------------------------------------------------------------
   BROZONE — przykładowe trasy Next.js (App Router).
   Każdy blok kopiuj do osobnego pliku wskazanego w komentarzu.
-------------------------------------------------------------------------- */

/* ═══════════════ app/api/public/booking/route.ts ═══════════════
   Publiczny formularz. Bez sesji, więc walidacja jest tu najostrzejsza.
*/

import { NextResponse } from "next/server";
import * as sheets from "@/lib/sheets/client";
import { humanError } from "@/lib/sheets/client";
import { normalizePhone } from "@/lib/booking/types";

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW = 10 * 60 * 1000;
const MAX = 3;

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.first > WINDOW) {
    attempts.set(ip, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMIT", message: "Wysłałeś już kilka zgłoszeń. Odczekaj chwilę albo zadzwoń." },
      { status: 429 },
    );
  }

  const body = await request.json();

  // honeypot — wypełniają go tylko boty
  if (body.website) return NextResponse.json({ ok: true, data: { bookingId: "ok" } });

  if (!body.consentRodo) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR", message: "Bez zgody na przetwarzanie danych nie możemy przyjąć zgłoszenia." },
      { status: 400 },
    );
  }
  if (normalizePhone(body.clientPhone ?? "").length < 9) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR", message: "Numer wygląda na niepełny — potrzebujemy 9 cyfr." },
      { status: 400 },
    );
  }

  try {
    // status i źródło ustawia serwer — klient nie może ich podać
    const booking = await sheets.createBooking({
      ...body,
      status: "new",
      source: "website",
      user: "website",
    });
    return NextResponse.json({ ok: true, data: booking });
  } catch (err) {
    const code = (err as { code?: string }).code ?? "SERVER_ERROR";
    const status = code === "BOOKING_CONFLICT" ? 409 : 502;
    return NextResponse.json({ ok: false, error: code, message: humanError(code) }, { status });
  }
}

/* ═══════════════ app/api/bookings/route.ts ═══════════════
   Lista dla panelu. Zakres danych zawęża rola — na serwerze.
*/

// import { requireSession } from "@/lib/auth";
// import { scopeBookings, redactBooking } from "@/lib/booking/permissions";
//
// export async function GET(request: Request) {
//   const session = await requireSession();
//   const { searchParams } = new URL(request.url);
//
//   const all = await sheets.getBookings({
//     from: searchParams.get("from") ?? new Date().toISOString().slice(0, 10),
//     to: searchParams.get("to") ?? "9999-12-31",
//     category: searchParams.get("category") ?? undefined,
//     status: searchParams.get("status") ?? undefined,
//   });
//
//   const visible = scopeBookings(session, all).map((b) => redactBooking(session, b));
//   return NextResponse.json({ ok: true, data: visible });
// }

/* ═══════════════ app/api/bookings/[id]/status/route.ts ═══════════════
   Zmiana statusu. Sprawdza uprawnienie ORAZ czy wizyta należy do tej osoby.
*/

// export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
//   const session = await requireSession();
//   const { id } = await params;
//   const { status, updatedAt, note } = await request.json();
//
//   const current = (await sheets.getBookings({ from: "0000-01-01", to: "9999-12-31" }))
//     .find((b) => b.bookingId === id);
//   if (!current) return NextResponse.json({ ok: false, error: "NOT_FOUND", message: "Nie znaleziono tej wizyty." }, { status: 404 });
//
//   if (!canChangeStatus(session, current)) {
//     return NextResponse.json({ ok: false, error: "FORBIDDEN", message: "Nie masz dostępu do tej funkcji." }, { status: 403 });
//   }
//   if (!STATUS_FLOW[current.status].includes(status)) {
//     return NextResponse.json({ ok: false, error: "VALIDATION_ERROR", message: "Nie można zmienić statusu w ten sposób." }, { status: 400 });
//   }
//
//   const updated = await sheets.updateBookingStatus({ bookingId: id, status, updatedAt, note, user: session.email });
//   return NextResponse.json({ ok: true, data: updated });
// }

/* ═══════════════ app/api/public/slots/route.ts ═══════════════ */

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const slots = await sheets.getAvailableSlots({
//     date: searchParams.get("date")!,
//     serviceId: searchParams.get("serviceId")!,
//     staffId: searchParams.get("staffId") ?? undefined,
//   });
//   return NextResponse.json({ ok: true, data: slots });
// }
