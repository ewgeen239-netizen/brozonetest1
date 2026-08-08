# Logika synchronizacji

## Model danych

Google Sheets jest jedynym źródłem prawdy. Panel nie ma własnej bazy — ma tylko
krótkotrwały bufor (cache) w przeglądarce.

```
                  ┌──────────────────┐
   strona WWW ───▶│                  │
                  │  Apps Script API │◀─── panel admina
   panel admina ─▶│  (Web App URL)   │
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │  Google Sheets   │
                  └──────────────────┘
```

## Bufor (cache)

| Dane | Czas życia | Dlaczego |
| --- | --- | --- |
| `services` | 5 min | zmieniają się rzadko |
| `staff` | 5 min | jw. |
| `bookings` | 60 s | zmieniają się często |
| `settings` | 10 min | prawie nigdy |

Każdy zapis natychmiast unieważnia bufor dla swojej encji.

## Zapis optymistyczny

1. Kliknięcie → interfejs od razu pokazuje wynik, `sync_status = pending`.
2. Żądanie leci do Apps Script.
3. Sukces → `sync_status = synced`.
4. Błąd → cofnięcie zmiany w interfejsie + komunikat po polsku.

Dzięki temu panel działa szybko mimo tego, że Sheets odpowiada w 300–800 ms.

## Wykrywanie konfliktów

Każdy zapis wysyła `updated_at`, które klient widział. Apps Script porównuje:

```
jeśli updated_at_w_arkuszu > updated_at_od_klienta:
    zwróć 409 + aktualny wiersz
w przeciwnym razie:
    zapisz i ustaw nowe updated_at
```

Panel pokazuje wtedy okno wyboru: „Zobacz aktualną wersję" / „Nadpisz moją zmianą".

## Ponowienia

Błędy 429 (limit) i 500 (chwilowa awaria): 3 próby z odstępem 2 s, 4 s, 8 s.
Błędy 400 (złe dane) i 403 (brak uprawnień) — bez ponowień, od razu komunikat.

## Kolejka offline

Brak internetu → operacja ląduje w `localStorage`. Po powrocie połączenia panel wysyła
je po kolei i pokazuje: „Zapisano 3 zmiany, które czekały na połączenie."

Kolejka ma limit 50 operacji i wygasa po 24 godzinach.

## Blokada podwójnej rezerwacji

Sprawdzenie kolizji odbywa się **po stronie Apps Script**, nie w przeglądarce:

```
przy tworzeniu wizyty:
  pobierz wizyty tego staff_id na ten dzień
  odrzuć, jeśli nowy przedział czasu nachodzi na istniejący
      (pomijając statusy cancelled i no_show)
```

To jedyne miejsce, gdzie kolejność zapisów ma znaczenie — dlatego decyduje serwer.

## Numeracja

`booking_id` w formacie `BZ-RRRR-MMDD-NNN`, gdzie NNN to kolejny numer w danym dniu.
Nadawany przez Apps Script w momencie zapisu — nigdy przez przeglądarkę.
