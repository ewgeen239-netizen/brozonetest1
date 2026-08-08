# Apps Script — API arkusza

Kod: `apps-script/Code.gs`. To jedyny most między panelem/stroną a Google Sheets.

## Instalacja (10 minut, robi to właściciel raz)

1. Otwórz plik **BROZONE_Database** w Google Sheets.
2. Menu **Rozszerzenia → Apps Script**.
3. Wklej zawartość `Code.gs`, zapisz.
4. W kodzie ustaw `API_SECRET` na własne długie hasło (min. 32 znaki).
5. **Wdróż → Nowe wdrożenie → Aplikacja internetowa**:
   - Wykonaj jako: **Ja**
   - Kto ma dostęp: **Wszyscy**
6. Skopiuj adres wdrożenia (`https://script.google.com/macros/s/…/exec`).
7. Wklej adres i sekret do pliku `.env.local` w projekcie:

```
SHEETS_API_URL=https://script.google.com/macros/s/AKfycb.../exec
SHEETS_API_SECRET=twoj-dlugi-sekret
```

> Po każdej zmianie kodu trzeba zrobić **nowe wdrożenie** — inaczej działa stara wersja.

## Protokół

Jeden adres, wszystko przez `POST` z polem `action`. `GET` obsługuje tylko odczyt.

```
POST /exec
{
  "secret": "…",
  "action": "createBooking",
  "payload": { … }
}
```

Odpowiedź zawsze w tej samej formie:

```json
{ "ok": true,  "data": { … } }
{ "ok": false, "error": "BOOKING_CONFLICT", "message": "Ten termin jest już zajęty." }
```

## Dostępne akcje

| Akcja | Payload | Zwraca |
| --- | --- | --- |
| `getBookings` | `{ from, to, category?, staffId?, status? }` | lista rezerwacji |
| `createBooking` | pełny obiekt rezerwacji | utworzona rezerwacja z `booking_id` |
| `updateBookingStatus` | `{ bookingId, status, updatedAt, note? }` | zaktualizowana rezerwacja |
| `rescheduleBooking` | `{ bookingId, date, timeStart, updatedAt }` | zaktualizowana rezerwacja |
| `getServices` | `{ category? }` | lista usług |
| `getStaff` | `{ category?, activeOnly? }` | lista pracowników |
| `getAvailableSlots` | `{ date, serviceId, staffId? }` | lista wolnych godzin |
| `getClients` | `{ query?, limit? }` | lista klientów |
| `upsertClient` | obiekt klienta | klient z `client_id` |
| `getSettings` | — | mapa klucz → wartość |
| `appendSyncLog` | `{ operation, entity, entityId, user, result, message }` | `{ ok: true }` |

## Kody błędów

| Kod | Znaczenie | Co pokazać administratorowi |
| --- | --- | --- |
| `UNAUTHORIZED` | zły sekret | „Brak dostępu do bazy. Skontaktuj się z administratorem." |
| `BOOKING_CONFLICT` | termin zajęty | „Ten termin jest już zajęty. Wybierz inny." |
| `STALE_UPDATE` | ktoś zmienił rekord wcześniej | „Ktoś zmienił tę wizytę przed chwilą." |
| `NOT_FOUND` | brak rekordu | „Nie znaleziono tej wizyty." |
| `VALIDATION_ERROR` | złe dane | konkretny komunikat z pola `message` |
| `SHEET_STRUCTURE` | brak kolumny w arkuszu | „Arkusz ma zmienioną strukturę." |

## Bezpieczeństwo

- **Sekret nigdy nie trafia do przeglądarki.** Strona i panel wołają własne API Next.js,
  a dopiero serwer Next.js woła Apps Script z sekretem.
- Publiczne wywołanie z formularza (`createBooking`) przechodzi walidację po stronie serwera:
  limit zgłoszeń na IP, sprawdzenie honeypota, weryfikacja telefonu.
- Apps Script zapisuje w `sync_log` każdą operację modyfikującą dane.

## Limity Apps Script

| Limit | Wartość |
| --- | --- |
| Czas jednego wywołania | 6 minut |
| Wywołania na dobę (konto darmowe) | 20 000 |
| Równoczesne wykonania | 30 |

Przy 100 rezerwacjach dziennie i 5 osobach w panelu wykorzystanie to ~2% limitu.
