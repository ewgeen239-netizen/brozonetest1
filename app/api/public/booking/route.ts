import { createBooking } from "@/lib/data/repository";
import { normalizePhone } from "@/lib/booking/types";
import { fail, fromError, ok } from "@/app/api/_lib";

/* Publiczny formularz — brak sesji, więc walidacja jest tu najostrzejsza. */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const attempts = new Map<string, { count: number; first: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return fail(
      "RATE_LIMIT",
      "Wysłałeś już kilka zgłoszeń. Odczekaj chwilę albo zadzwoń do nas.",
      429,
    );
  }

  try {
    const body = await request.json();

    // honeypot — wypełniają go tylko boty
    if (body.website) return ok({ bookingId: "ok" });

    if (!body.consentRodo) {
      return fail(
        "VALIDATION_ERROR",
        "Bez zgody na przetwarzanie danych nie możemy przyjąć zgłoszenia.",
      );
    }
    if (!body.clientName?.trim()) {
      return fail("VALIDATION_ERROR", "Wpisz imię i nazwisko.");
    }
    if (normalizePhone(body.clientPhone ?? "").length < 9) {
      return fail("VALIDATION_ERROR", "Numer wygląda na niepełny — potrzebujemy 9 cyfr.");
    }

    // status i źródło ustawia serwer — klient nie może ich podać
    const booking = await createBooking({
      date: body.date,
      timeStart: body.timeStart,
      serviceId: body.serviceId,
      staffId: body.staffId,
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail,
      notes: body.notes,
      tattoo: body.tattoo,
      massage: body.massage,
      consentRodo: true,
      consentMarketing: Boolean(body.consentMarketing),
      status: "new",
      source: "website",
      user: "website",
    });

    return ok(booking);
  } catch (err) {
    return fromError(err);
  }
}
