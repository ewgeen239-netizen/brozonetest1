# API — trasy Next.js

Przeglądarka nigdy nie łączy się z Google bezpośrednio. Zawsze przez własny serwer,
bo tylko tam może leżeć sekret do Apps Script.

```
Przeglądarka ──▶ /api/... (Next.js, serwer) ──▶ Apps Script ──▶ Google Sheets
```

## Publiczne (bez logowania)

| Metoda | Trasa | Do czego |
| --- | --- | --- |
| GET | `/api/public/services?category=` | cennik na stronę |
| GET | `/api/public/staff?category=` | specjaliści na stronę |
| GET | `/api/public/slots?date=&serviceId=&staffId=` | wolne godziny |
| POST | `/api/public/booking` | zgłoszenie z formularza |

`POST /api/public/booking` ma dodatkowo: limit 3 zgłoszeń / IP / 10 min, honeypot,
walidację telefonu i wymuszoną zgodę RODO. Zawsze zapisuje `status: 'new'`,
`source: 'website'` — klient nie może ustawić tych pól sam.

## Panel (wymaga sesji)

| Metoda | Trasa | Rola |
| --- | --- | --- |
| GET | `/api/bookings?from=&to=&category=&status=` | wszystkie (zakres wg roli) |
| POST | `/api/bookings` | admin, recepcja |
| PATCH | `/api/bookings/[id]/status` | wszystkie (swoje wg roli) |
| PATCH | `/api/bookings/[id]/reschedule` | admin, recepcja |
| GET | `/api/clients?query=` | admin, recepcja, viewer |
| POST | `/api/clients` | admin, recepcja |
| PATCH | `/api/clients/[id]` | admin, recepcja |
| GET | `/api/staff` | wszystkie |
| POST/PATCH | `/api/staff` | admin |
| GET | `/api/services` | wszystkie |
| POST/PATCH | `/api/services` | admin |
| GET | `/api/settings` | admin |
| POST | `/api/sync/refresh` | admin, recepcja |
| GET | `/api/sync/log` | admin, recepcja (podgląd) |

## Kształt odpowiedzi

Jednakowy dla wszystkich tras:

```json
{ "ok": true,  "data": … }
{ "ok": false, "error": "BOOKING_CONFLICT", "message": "Ten termin jest już zajęty." }
```

`message` jest **po polsku i gotowe do pokazania** — interfejs go nie tłumaczy.

## Zakres danych wg roli

Każda trasa GET nakłada filtr **na serwerze**:

```ts
// pseudokod w /api/bookings
const all = await sheets.getBookings(range);
return scopeBookings(session, all);   // barber dostanie tylko swoje
```

Rola pracownicza nigdy nie dostaje z serwera cudzych wizyt — nie chodzi o ukrycie
w interfejsie, tylko o to, żeby dane nie opuściły serwera.

## Kody HTTP

| Kod | Kiedy |
| --- | --- |
| 200 | ok |
| 400 | błąd walidacji |
| 401 | brak sesji |
| 403 | rola bez uprawnień |
| 404 | nie ma takiego rekordu |
| 409 | konflikt terminu lub nieaktualna wersja |
| 429 | za dużo zapytań |
| 502 | Apps Script nie odpowiada |

## Cache

`services`, `staff`, `settings` — cache po stronie serwera na 5 minut
(`revalidate`). `bookings` bez cache. Każdy zapis czyści cache swojej encji.
