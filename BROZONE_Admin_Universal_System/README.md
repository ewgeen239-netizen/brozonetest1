# BROZONE — Admin Universal System

Dokumentacja i kontrakty dla panelu obsługującego trzy usługi: **Barber · Tattoo · Massage**.
Baza danych: Google Sheets (rozwiązanie startowe). Język interfejsu: polski.

## Od czego zacząć

| Jesteś… | Czytaj w tej kolejności |
| --- | --- |
| **właścicielem** | `01_PRODUCT/Product_Overview.md` → `04_GOOGLE_SHEETS/Sheets_Structure.md` → `06_DEVELOPER/Implementation_Plan.md` |
| **projektantem / autorem tekstów** | `02_ADMIN_PANEL/Simple_UX_Rules.md` → `05_COPY_PL/*` |
| **programistą** | `06_DEVELOPER/Data_Types.md` → `06_DEVELOPER/API_Routes.md` → `04_GOOGLE_SHEETS/Apps_Script_API.md` |

## Zawartość

```
01_PRODUCT/        po co to jest, role, ścieżka rezerwacji, model bazy, uprawnienia
02_ADMIN_PANEL/    specyfikacja każdego ekranu + zasady prostego interfejsu
03_WEBSITE/        rezerwacja na stronie, strony usług i specjalistów, teksty formularza
04_GOOGLE_SHEETS/  struktura arkuszy, dane startowe, gotowy Apps Script, logika synchronizacji
05_COPY_PL/        wszystkie teksty: panel, wiadomości do klienta, błędy, puste ekrany
06_DEVELOPER/      plan wdrożenia, typy TypeScript, trasy API, bezpieczeństwo
```

## Trzy zasady, które rządzą całością

1. **Jeden ekran = jedno zadanie.** Recepcja ma rozumieć ekran w pięć sekund.
2. **Google Sheets jest źródłem prawdy.** Panel nie ma drugiej bazy, która mogłaby się rozjechać.
3. **Uprawnienia sprawdza serwer.** Ukryty przycisk to wygoda, nie zabezpieczenie.

## Czego system nie obiecuje

Booksy nie ma publicznego API do zapisu rezerwacji. Synchronizacja z Booksy działa
wyłącznie jednostronnie i ręcznie (eksport CSV). Wszystko inne w tej dokumentacji
da się zbudować w opisanym kształcie.
