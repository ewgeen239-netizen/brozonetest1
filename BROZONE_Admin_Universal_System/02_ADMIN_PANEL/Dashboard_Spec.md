# Dashboard — specyfikacja

## Cel

Odpowiedź na jedno pytanie: **co się dzieje dzisiaj?** To nie jest ekran analityczny.
Żadnych wykresów słupkowych, konwersji ani porównań rok do roku.

## Układ (od góry)

### 1. Pasek dnia
```
Środa, 12 marca 2026        [ Wszystkie ▾ ]   [ + Dodaj wizytę ]
```
Filtr kategorii przełącza cały ekran: Wszystkie / Barber / Tattoo / Massage.

### 2. Sześć kafelków statusu

| Kafelek | Co pokazuje | Klik prowadzi do |
| --- | --- | --- |
| **Dzisiejsze wizyty** | liczba wizyt na dziś | lista, filtr „Dziś" |
| **Wymagają potwierdzenia** | status `new` | lista, filtr „Nowe" |
| **Najbliższe wizyty** | 3 kolejne godziny | kalendarz dnia |
| **Nowe rezerwacje** | zgłoszenia z ostatnich 24 h | lista, filtr „Ze strony" |
| **Anulowane dzisiaj** | status `cancelled` | lista |
| **Nieobecności** | status `no_show`, ostatnie 7 dni | lista |

Kafelek „Wymagają potwierdzenia" z liczbą > 0 świeci się na pomarańczowo — to jedyny
element na ekranie, który krzyczy.

Liczba jest duża (28 px), podpis mały. Bez procentów i strzałek trendu.

### 3. Lista „Dzisiaj" (główna część ekranu)

Prosta lista, nie kalendarz:

```
09:00  Marek Nowak      Strzyżenie męskie      Max Siwy      [Potwierdzona]
10:30  Anna Kowalska    Masaż klasyczny 60     Ola           [Nowa]        ← podświetlona
13:00  Piotr Zieliński  Sesja tattoo 2h        Walera        [Potwierdzona]
```

Kolorowy pasek po lewej stronie wiersza = kategoria. Klik otwiera panel boczny.

### 4. Szybkie przyciski (pod listą)

```
[ + Dodaj wizytę ]  [ + Dodaj klienta ]  [ + Dodaj usługę ]
[ Otwórz kalendarz ]  [ Pobierz dane z arkusza ]
```

Duże, z ikonami, w jednym rzędzie. To skróty — te same działania są w menu.

### 5. Pasek stanu arkusza (na dole, mały)

```
Dane z Google Sheets · zaktualizowane 3 minuty temu · [Odśwież]
```

Kolor kropki: zielona = zsynchronizowane, żółta = trwa zapis, czerwona = błąd.
Przy czerwonej pojawia się jedno zdanie po polsku i przycisk „Spróbuj ponownie".

## Czego tu NIE ma

- wykresów przychodu,
- porównań z zeszłym miesiącem,
- obłożenia pracowników w procentach,
- listy zadań, powiadomień systemowych, „aktywności".

Te rzeczy są w Raportach — osobnym ekranie dla właściciela.

## Wersja dla pracownika (barber / tatuator / masażysta)

Dashboard zamienia się w jedną listę: **moje wizyty na dziś**.
Bez kafelków, bez szybkich przycisków poza „Odśwież".
Przy każdej wizycie trzy przyciski: `Potwierdź` · `Wykonane` · `Nie przyszedł`.

## Stan pusty

> **Dzisiaj nie ma jeszcze żadnych wizyt.**
> Rezerwacje ze strony pojawią się tu automatycznie.
> `[ Dodaj wizytę ręcznie ]`
