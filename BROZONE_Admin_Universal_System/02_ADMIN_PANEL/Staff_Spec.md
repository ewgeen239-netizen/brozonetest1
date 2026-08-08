# Pracownicy — specyfikacja

## Cel

Jedna lista, trzy typy specjalistów. Formularz dopasowuje się do typu — tatuator nie ma
pola „prowizja od strzyżenia", masażysta ma numer pokoju.

## Lista

```
[ Wszyscy ] [ Barber ] [ Tattoo ] [ Massage ]      [ + Dodaj pracownika ]
```

Karty, nie tabela — przy 4–10 osobach karty czytają się szybciej:

```
┌────────────────────────────┐
│ ▌ [foto]  Max Siwy         │
│           Barber · Senior  │
│           6 usług          │
│  Pn–Sb 10:00–20:00         │
│  [ Edytuj ]  [ Grafik ]    │
└────────────────────────────┘
```

Kolorowy pasek = kategoria. Osoby zarchiwizowane są wyszarzone, na dole listy.

## Wspólne pola (wszystkie typy)

```
staff_id · name · photo · category · working_hours · days_off
calendar_color · active | archived · phone · email
```

## A. Barber — pola dodatkowe

| Pole | Typ | Uwagi |
| --- | --- | --- |
| specialization | tekst | „Fade & classic" |
| services | lista usług | z cennika kategorii Barber |
| commission_percent | liczba 0–100 | do rozliczeń |
| booksy_profile_link | URL | opcjonalny |

## B. Tatuator — pola dodatkowe

| Pole | Typ | Uwagi |
| --- | --- | --- |
| style | lista wyboru | fine line / realism / blackwork / lettering / color / inny |
| portfolio_link | URL | strona lub Behance |
| instagram | tekst | @nazwa |
| consultation_required | tak / nie | wymusza konsultację przed sesją |
| min_price | liczba | cena minimalna sesji |
| deposit_required | liczba | domyślna kwota zadatku |

## C. Masażysta — pola dodatkowe

| Pole | Typ | Uwagi |
| --- | --- | --- |
| specialization | lista wyboru | sportowy / relaksacyjny / klasyczny / leczniczy / inny |
| services | lista usług | z cennika kategorii Massage |
| room_number | tekst | numer gabinetu — ważne przy grafiku |

## Formularz dodawania

Krok 1: **Kim jest ta osoba?** — trzy duże kafelki: Barber / Tatuator / Masażysta.
Krok 2: formularz z polami właściwymi dla typu. Pola obowiązkowe: imię, kategoria, godziny pracy.

Wszystko inne można uzupełnić później — system nie blokuje zapisu z powodu braku zdjęcia.

## Godziny pracy

Prosty tygodniowy grafik: siedem wierszy, przełącznik „pracuje / wolne", godzina od–do.
Pod spodem lista dni wolnych (urlop, L4) z przyciskiem „Dodaj dzień wolny".

Godziny pracy sterują dostępnymi terminami na stronie — jeśli barber nie pracuje w poniedziałek,
klient nie zobaczy poniedziałkowych godzin.

## Archiwizacja zamiast usuwania

Pracownik, który odszedł, jest **archiwizowany**: znika z kalendarza i ze strony,
ale jego historyczne wizyty zostają. Usunięcie na stałe może tylko właściciel
i tylko dla osoby bez żadnych wizyt.

## Profil pracownika (widok szczegółów)

Zakładki: **Dane** · **Grafik** · **Wizyty** · **Wyniki**.

„Wyniki" (tylko właściciel): liczba wizyt w miesiącu, przychód, nieobecności, prowizja.
Bez wykresów — cztery liczby i tabela.
