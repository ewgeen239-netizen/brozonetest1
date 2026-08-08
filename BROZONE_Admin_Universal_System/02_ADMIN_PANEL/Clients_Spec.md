# Klienci — specyfikacja

## Cel

Jedna baza dla wszystkich trzech kategorii. Klient, który strzyże się i chodzi na masaż,
to **jeden wpis**, nie dwa.

## Lista

```
🔍 Szukaj po nazwisku lub telefonie        [ Kategoria ▾ ]   [ + Dodaj klienta ]
```

| Kolumna | Uwagi |
| --- | --- |
| Imię i nazwisko | pogrubione |
| Telefon | klikalny na telefonie |
| Znaczniki | Barber / Tattoo / Massage / VIP / Nowy |
| Ostatnia wizyta | „8 lutego" albo „nigdy" |
| Liczba wizyt | razem, ze wszystkich kategorii |

Sortowanie domyślne: ostatnia wizyta malejąco. Bez zaawansowanych filtrów.

## Karta klienta (panel boczny)

```
┌──────────────────────────────────────┐
│ Anna Kowalska         [VIP] [Massage]│
│ +48 600 100 200 · anna@mail.pl       │
│ Klientka od marca 2024               │
├──────────────────────────────────────┤
│ 12 wizyt · ostatnia 8 lutego         │
│ 1 nieobecność                        │
├──────────────────────────────────────┤
│ [ + Umów wizytę ]  ← główne działanie│
├──────────────────────────────────────┤
│ HISTORIA WIZYT                       │
│ 08.02  Masaż klasyczny 60  Wykonana  │
│ 11.01  Masaż sportowy 60   Wykonana  │
│ 03.12  Strzyżenie męskie   Wykonana  │
├──────────────────────────────────────┤
│ NOTATKI (wewnętrzne)                 │
│ Woli mocny nacisk, nie lubi olejków. │
├──────────────────────────────────────┤
│ ZGODY                                │
│ RODO: tak (12.03.2024)               │
│ Marketing: nie                       │
└──────────────────────────────────────┘
```

Historia pokazuje wizyty **ze wszystkich kategorii** — to główna wartość wspólnej bazy.

## Pola

```
client_id · name · phone · email · tags · last_visit · total_visits
notes · consent_marketing · consent_rodo · created_at
```

## Znaczniki (tagi)

Nadawane automatycznie, można ręcznie dopisać:

| Znacznik | Kiedy |
| --- | --- |
| Barber / Tattoo / Massage | po pierwszej wizycie w danej kategorii |
| Nowy | mniej niż 2 wizyty |
| VIP | powyżej 10 wizyt (próg w ustawieniach) |
| Uwaga | 2 lub więcej nieobecności — recepcja widzi ostrzeżenie przy rezerwacji |

## RODO — co musi działać

1. **Zgoda przy rezerwacji** — checkbox obowiązkowy (przetwarzanie danych)
   i osobny opcjonalny (marketing). Data zgody zapisywana w bazie.
2. **Wgląd** — przycisk „Pobierz dane klienta" tworzy plik z całą historią. Tylko właściciel.
3. **Usunięcie** — „Usuń dane klienta" anonimizuje wpis: imię → „Klient usunięty",
   telefon i e-mail → puste. Wizyty zostają (potrzebne do księgowości), ale bez danych osobowych.
4. Numer telefonu jest kluczem — po nim system rozpoznaje powracającego klienta.

## Łączenie duplikatów

Jeśli ten sam telefon trafi dwa razy, system pokazuje: „Klient o tym numerze już istnieje.
Czy to ta sama osoba? [Połącz] [To ktoś inny]".

## Stan pusty

> **Nie masz jeszcze żadnych klientów.**
> Pojawią się tu automatycznie po pierwszej rezerwacji ze strony.
> `[ Dodaj klienta ręcznie ]`
