# Plan wdrożenia

## Punkt wyjścia — co już jest

Działający projekt Next.js 15 (React 19, TypeScript, Tailwind v4, Framer Motion):

- strona klienta: hero, rezerwacja, cennik per barber, zespół, galeria, kontakt, PL/RU/EN,
- panel `/admin`: 11 ekranów (dashboard, rezerwacje z kalendarzem i przeciąganiem, klienci,
  usługi, barberzy, grafik, ewidencja czasu, raport kasowy, raport zużycia, Booksy, ustawienia),
- logowanie hasłem + middleware chroniące `/admin/**`,
- dane w pamięci (`lib/mock-data.ts` + `lib/store.tsx`) — bez bazy,
- design system po brand booku (Bright White / Nebulosity / zielenie, Arial Bold + Montserrat).

**Czego brakuje do celu:** jednej kategorii mało (tylko barber), brak ról, brak prawdziwej bazy,
panel jest gęsty jak narzędzie dla właściciela, nie dla recepcji.

## Etapy

### Etap 1 — Fundament danych (2–3 dni)
1. Założyć arkusz **BROZONE_Database** z 7 zakładkami wg `Sheets_Structure.md`.
2. Wgrać `apps-script/Code.gs`, wdrożyć jako aplikację internetową, zapisać URL i sekret.
3. Wpisać dane startowe z `Example_Tables.md`.
4. Dodać do projektu: `lib/booking/types.ts`, `lib/booking/permissions.ts`,
   `lib/sheets/client.ts`, `lib/sheets/mapper.ts`.
5. Zrobić trasy `/api/public/*` i `/api/bookings`.

**Efekt:** formularz ze strony zapisuje rezerwację do arkusza.

### Etap 2 — Uniwersalne rezerwacje (3–4 dni)
1. Przebudować `/admin/rezerwacje`: wspólna lista trzech kategorii, filtry
   Dziś / Jutro / Tydzień / Kategoria / Status.
2. Panel boczny z czterema dużymi działaniami i sekcją zależną od kategorii.
3. Uprościć dashboard do sześciu kafelków + listy „dzisiaj".
4. Podłączyć dane z arkusza zamiast `mock-data`.

**Efekt:** recepcja obsługuje wizyty wszystkich trzech usług w jednym miejscu.

### Etap 3 — Pracownicy i usługi (2–3 dni)
1. `/admin/pracownicy` zamiast `/admin/barberzy` — trzy typy, formularz zależny od typu.
2. `/admin/uslugi` z zakładkami kategorii i widełkami cen.
3. Kalendarz: kolumny wszystkich specjalistów, kolory kategorii, widoki dzień / tydzień / lista.

**Efekt:** właściciel sam dodaje tatuatora i masaże, bez programisty.

### Etap 4 — Role (2 dni)
1. Logowanie Google + dopasowanie do arkusza `permissions`.
2. `scopeBookings` na serwerze przy każdym GET.
3. Uproszczony widok pracownika: jedna lista, trzy przyciski.

**Efekt:** barber loguje się i widzi tylko swoje wizyty.

### Etap 5 — Strona (2–3 dni)
1. Formularz rezerwacji w trzech wariantach (barber / tattoo / massage).
2. Strony `/uslugi/[kategoria]` i `/zespol/[id]` z danych z arkusza.
3. Ekran sukcesu i obsługa błędów wg `Booking_Form_Copy_PL.md`.

**Efekt:** klient rezerwuje wszystkie trzy usługi ze strony.

### Etap 6 — Dopieszczenie (2 dni)
Puste ekrany, komunikaty błędów, test pięciu sekund z prawdziwą recepcjonistką,
eksporty CSV, instrukcja dla właściciela.

**Razem: 13–18 dni roboczych.**

## Co zostaje z obecnego kodu

| Zostaje | Zmiana |
| --- | --- |
| Design system, komponenty UI | bez zmian |
| Strona klienta (hero, galeria, i18n) | dochodzi wybór kategorii |
| Logowanie + middleware | dochodzą role |
| Raport kasowy, zużycie, ewidencja | bez zmian, przenieść do sekcji „Właściciel" |
| Ekran Booksy | zostaje jako import CSV |
| `mock-data.ts` | zastąpione arkuszem, zostaje jako dane demo |

## Kolejność, gdyby był tylko tydzień

Etap 1 → Etap 2 → uproszczony Etap 5 (sam formularz, bez stron kategorii).
To daje działający obieg: klient rezerwuje → recepcja widzi i potwierdza.
Role i kalendarz można dołożyć później.
