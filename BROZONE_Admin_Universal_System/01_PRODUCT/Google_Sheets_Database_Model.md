# Model bazy danych w Google Sheets

Jeden plik Google Sheets = cała baza. Siedem zakładek (arkuszy).

```
BROZONE_Database.xlsx
├── bookings      wizyty (rosnie najszybciej)
├── clients       klienci
├── staff         pracownicy wszystkich kategorii
├── services      cennik wszystkich kategorii
├── permissions   kto ma jaką rolę
├── sync_log      historia synchronizacji i błędów
└── settings      ustawienia salonu (klucz → wartość)
```

## Zasady, których trzeba się trzymać

1. **Pierwszy wiersz to nagłówki.** Nigdy ich nie zmieniaj ani nie przestawiaj kolumn —
   system szuka kolumn po nazwie nagłówka, nie po pozycji.
2. **Nie usuwaj wierszy.** Zamiast tego zmień status na `cancelled` albo `archived`.
   Usunięcie wiersza psuje powiązania (np. wizyta wskazująca na nieistniejącego pracownika).
3. **ID nadaje system.** Kolumny `booking_id`, `client_id`, `staff_id`, `service_id`
   wypełniają się automatycznie. Ręcznie wpisuj je tylko przy pierwszym uzupełnianiu danych.
4. **Daty w formacie `RRRR-MM-DD`**, godziny `GG:MM`. Ustaw format kolumny na „zwykły tekst",
   inaczej Google zamieni to na swój format i import się posypie.
5. **Jeden plik = jeden salon.** Nie mieszaj dwóch lokalizacji w jednym arkuszu.

## Relacje między arkuszami

```
services.service_id ──┐
                      ├──▶ bookings.service_id
staff.staff_id ───────┤    bookings.staff_id
clients.client_id ────┘    bookings.client_id

staff.staff_id ──▶ permissions.staff_id   (barber widzi swoje wizyty)
services.assigned_staff_ids ──▶ staff.staff_id  (kto wykonuje daną usługę)
```

## Kopie zapasowe

Google Sheets trzyma historię zmian (Plik → Historia wersji), ale to nie jest backup.
**Raz w tygodniu** zrób: Plik → Pobierz → Microsoft Excel (.xlsx) i zapisz na dysku.
Panel dodatkowo eksportuje `bookings` do CSV z poziomu listy rezerwacji.

## Limity, o których trzeba wiedzieć

| Limit | Wartość | Co znaczy w praktyce |
| --- | --- | --- |
| Komórki w pliku | 10 mln | ok. 200 000 rezerwacji — wystarczy na lata |
| Zapytania API | ~60 / min / użytkownika | przy 3–5 osobach w panelu bez problemu |
| Czas działania Apps Script | 6 min na wywołanie | operacje masowe dziel na paczki |
| Realistyczna wydajność | ~10 000 wierszy | powyżej arkusz zauważalnie zwalnia |
