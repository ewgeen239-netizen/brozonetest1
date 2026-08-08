# Kalendarz — specyfikacja

## Cel

Szybko zobaczyć, **kto, kiedy i co robi** — oraz gdzie jest wolne miejsce.
To nie jest kalendarz korporacyjny: bez powtarzalnych wydarzeń, zaproszeń i stref czasowych.

## Widoki

| Widok | Do czego |
| --- | --- |
| **Dzień** | domyślny — kolumny = specjaliści, wiersze = godziny |
| **Tydzień** | planowanie z wyprzedzeniem, 7 kolumn = dni |
| **Lista** | do drukowania i na telefon |

Przełącznik widoków to trzy przyciski w jednym rzędzie. Bez rozwijanych list.

## Widok dnia

```
        │ Max Siwy   │ Ola Wizard │ Walera     │ Ilia       │
        │ Barber     │ Massage    │ Tattoo     │ Barber     │
────────┼────────────┼────────────┼────────────┼────────────┤
 10:00  │ ▌Marek N.  │            │            │ ▌Jan K.    │
 10:30  │ ▌Strzyż.   │ ▌Anna K.   │            │ ▌Broda     │
 11:00  │            │ ▌Masaż 60  │ ▌Piotr Z.  │            │
 11:30  │            │            │ ▌Sesja 2h  │            │
```

- Kolorowy pasek po lewej stronie bloczka = kategoria.
- W bloczku: godzina, imię klienta, skrócona nazwa usługi.
- Blok krótszy niż 30 min pokazuje tylko godzinę i imię.
- Czerwona pozioma linia = aktualna godzina.
- Dni wolne pracownika: kolumna zakreskowana, podpis „Wolne".

## Kolory kategorii

| Kategoria | Kolor | Hex |
| --- | --- | --- |
| Barber | złoty / brass | `#C8A55B` |
| Tattoo | electric blue | `#4CC2FF` |
| Massage | teal / zieleń | `#3EA98C` |

Statusy pokazywane są dodatkowo: wizyta anulowana jest wyblakła i przekreślona,
nieobecność ma czerwoną kropkę, niepotwierdzona ma przerywaną ramkę.

## Interakcje

- **Klik w wizytę** → panel boczny (ten sam co w Rezerwacjach).
- **Klik w puste miejsce** → „Dodaj wizytę" z wypełnioną datą, godziną i specjalistą.
- **Przeciągnięcie wizyty** → zmiana terminu, zawsze z pytaniem:
  „Przenieść wizytę Anny Kowalskiej na 12:00? [Przenieś] [Anuluj]".
- Przeciąganie jest wyłączone dla ról pracowniczych.

## Filtry

Jeden rząd: `[ Wszystkie ] [ Barber ] [ Tattoo ] [ Massage ]` plus wybór osoby.
Domyślnie widać wszystkich — właśnie po to jest kalendarz.

## Czego tu nie ma

- widoku miesiąca w formie siatki z kropkami (mało czytelny przy 3 kategoriach),
- nakładania się wizyt w jednej kolumnie (jeden specjalista = jedna wizyta na raz),
- integracji z Google Calendar (osobny temat, poza MVP).

## Wydruk

Widok listy ma przycisk „Drukuj" — kartka na recepcję z godzinami, klientami i telefonami.
