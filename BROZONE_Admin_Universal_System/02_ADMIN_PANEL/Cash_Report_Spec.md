# Raport kasowy — specyfikacja

Ekran: `/admin/raport-kasowy`. Odpowiada na jedno pytanie: **ile gotówki
powinno leżeć w szufladzie i czy się zgadza**.

Widzą go: właściciel i recepcja. Barber, tatuażysta i masażysta **nie mają
do niego dostępu** — API zwraca `FORBIDDEN`, a pozycja znika z menu.

## 1. Skąd biorą się pieniądze

Gotówka nie jest wpisywana ręcznie. Powstaje z wizyt:

1. Pracownik oznacza wizytę jako **Wykonane**.
2. Panel pyta: *Jak klient zapłacił?* → Gotówka / Karta / Przelew (+ napiwek).
3. Płatność gotówką ląduje w raporcie dnia jako operacja `income`.

Wizyta wykonana bez wskazanej płatności trafia do licznika
**„wykonanych wizyt bez sposobu zapłaty"** — dopóki jest niezerowy, kasa się
nie zgodzi i ekran o tym mówi wprost.

Anulowanie i „nie przyszedł" zawsze zerują płatność (`unpaid`).

## 2. Wzór

```
powinno być w kasie = stan otwarcia + gotówka od klientów − wypłaty z kasy
różnica             = policzono − powinno być
```

Nic z tego nie jest zapisywane w bazie. Liczy to `lib/data/cash.ts`
z operacji dnia — dzięki temu żadna liczba nie może się rozjechać z listą.

Karta, przelew i napiwki są pokazane **osobno**: nie wpływają do szuflady.

## 3. Stan otwarcia

Stan otwarcia nowego dnia = *policzono* z ostatniego zamkniętego dnia.
Przy pierwszym uruchomieniu: 500 zł (`DEFAULT_OPENING_CASH`).
Dopóki dzień jest otwarty, właściciel może go poprawić („zmień").

## 4. Ruchy gotówki

Przycisk **Wypłata z kasy** dodaje ręczną operację:

| Rodzaj | Znak | Przykład |
|---|---|---|
| `payout` — wypłata z kasy | zawsze ujemna | zakup ręczników, zaliczka |
| `deposit` — wpłata do kasy | dodatnia | rozmienienie, dołożenie bilonu |

Pole „numer paragonu / faktury" jest opcjonalne, ale to jedyny ślad
dokumentu — warto je wypełniać.

Operacje pochodzące z wizyt (`bookingId`) **nie dają się skasować** z tego
ekranu. Poprawia się je na wizycie.

## 5. Zamknięcie dnia

Jeden zielony przycisk **Zamknij dzień**:

1. Osoba liczy gotówkę i wpisuje kwotę.
2. Panel od razu pokazuje różnicę.
3. Różnica ≠ 0 → **komentarz jest wymagany**, inaczej przycisk zostaje
   nieaktywny.

Po zamknięciu:

- dzień jest tylko do odczytu, dopisanie operacji zwraca `DAY_CLOSED`;
- widoczne jest kto i kiedy zamknął oraz komentarz;
- **otworzyć zamknięty dzień może wyłącznie właściciel**
  (`Tylko właściciel może otworzyć zamknięty dzień.`).

## 6. API

| Metoda | Ścieżka | Działanie |
|---|---|---|
| GET | `/api/cash?date=YYYY-MM-DD` | raport, podsumowanie, lista operacji |
| POST | `/api/cash` | dodaj wypłatę / wpłatę |
| DELETE | `/api/cash` | usuń ręczną operację |
| POST | `/api/cash/close` | zamknij dzień (`countedCash`, `note`) |
| DELETE | `/api/cash/close` | otwórz ponownie — tylko admin |
| POST | `/api/cash/opening` | ustaw stan otwarcia |

Każde sprawdzenie uprawnień odbywa się na serwerze. Ukrycie przycisku
w interfejsie to wygoda, nie zabezpieczenie.
