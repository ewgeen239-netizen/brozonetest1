# Bezpieczeństwo

## Sekrety

| Zmienna | Gdzie | Uwagi |
| --- | --- | --- |
| `SHEETS_API_URL` | tylko serwer | adres wdrożenia Apps Script |
| `SHEETS_API_SECRET` | tylko serwer | min. 32 znaki, losowe |
| `AUTH_SECRET` | tylko serwer | podpis sesji |
| `ADMIN_PASSWORD` | tylko serwer | hasło właściciela |

**Żaden z nich nie może mieć przedrostka `NEXT_PUBLIC_`.** To wysłałoby go do przeglądarki.

`.env.local` jest w `.gitignore`. W repozytorium leży wyłącznie `.env.example` z pustymi polami.

## Uwierzytelnianie

Obecnie: hasło właściciela + podpisane ciasteczko HMAC-SHA256, ważność 8 godzin,
`httpOnly`, `sameSite=lax`, `secure` na produkcji. Middleware chroni `/admin/**`.

**Docelowo (przy wielu rolach):** logowanie Google (OAuth) z dopasowaniem adresu e-mail
do arkusza `permissions`. Nie budujemy własnej bazy haseł — to niepotrzebne ryzyko.

## Autoryzacja

Sprawdzanie uprawnień odbywa się **na serwerze przy każdym zapytaniu**. Ukrycie przycisku
w interfejsie to wygoda, nie zabezpieczenie.

```ts
// każda trasa modyfikująca dane zaczyna się tak
const session = await requireSession();
if (!can(session, 'booking:cancel')) return forbidden();
```

## Dane wrażliwe

| Dane | Kto widzi |
| --- | --- |
| Przeciwwskazania zdrowotne | masażysta przy swojej wizycie + właściciel |
| Szczegóły projektu tatuażu | tatuator przy swojej wizycie + właściciel + recepcja |
| Telefon / e-mail klienta | admin, recepcja; pracownik tylko przy swojej wizycie |
| Notatki wewnętrzne o kliencie | admin, recepcja |

Dane zdrowotne to w RODO **szczególna kategoria** (art. 9). Dlatego:
- pole jest opcjonalne, z wyjaśnieniem, po co pytamy,
- widzi je wyłącznie osoba wykonująca usługę,
- nie trafia do eksportów innych niż eksport na żądanie klienta.

## Formularz publiczny

- honeypot (ukryte pole),
- limit 3 zgłoszenia / IP / 10 minut,
- walidacja telefonu i długości pól po stronie serwera,
- brak możliwości ustawienia `status`, `price`, `staffId` spoza dozwolonej listy,
- brak przesyłania plików w MVP (tylko link do inspiracji) — upload to osobne ryzyko.

## RODO — obowiązki

1. Zgoda na przetwarzanie zbierana przy rezerwacji, z datą.
2. Zgoda marketingowa osobno i dobrowolnie.
3. Prawo wglądu — eksport danych klienta na żądanie (właściciel).
4. Prawo do usunięcia — anonimizacja: dane osobowe znikają, wizyty zostają bez nich.
5. Google Sheets to podmiot przetwarzający — trzeba mieć umowę powierzenia z Google
   (jest w warunkach Google Workspace).
6. Dostęp do arkusza tylko dla właściciela; panel łączy się przez Apps Script,
   nie przez udostępnianie pliku pracownikom.

## Czego nie robić

- nie udostępniać arkusza „każdemu z linkiem" — nawet do odczytu,
- nie wklejać `SHEETS_API_SECRET` do kodu po stronie przeglądarki,
- nie logować pełnych danych klienta w `sync_log` (tylko ID),
- nie przechowywać haseł pracowników — logowanie ma iść przez Google.

## Kopie zapasowe

Cotygodniowy eksport arkusza do `.xlsx` na dysk właściciela. Google trzyma historię wersji,
ale przypadkowe usunięcie kolumny łatwiej odkręcić z własnej kopii.
