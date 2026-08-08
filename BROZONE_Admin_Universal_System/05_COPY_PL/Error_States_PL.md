# Komunikaty błędów

Zasada: **co się stało + co z tym zrobić**. Bez kodów błędów w głównym tekście.

## W panelu

| Sytuacja | Komunikat | Działanie |
| --- | --- | --- |
| Brak połączenia | Brak internetu. Zmiany zapiszą się, gdy połączenie wróci. | — |
| Nie udało się zapisać | Nie udało się zapisać zmiany. Spróbuj jeszcze raz. | Spróbuj ponownie |
| Limit Google | Google chwilowo nas ogranicza. Dane zapiszą się za chwilę. | — (samo się ponowi) |
| Termin zajęty | Ten termin jest już zajęty. Wybierz inny. | Pokaż wolne godziny |
| Ktoś zmienił rekord | Ktoś zmienił tę wizytę przed chwilą. | Zobacz aktualną wersję / Nadpisz |
| Brak uprawnień | Nie masz dostępu do tej funkcji. Poproś właściciela. | — |
| Błąd struktury arkusza | Arkusz ma zmienioną strukturę. Skontaktuj się z administratorem. | Pokaż szczegóły |
| Nie znaleziono wizyty | Nie znaleziono tej wizyty. Mogła zostać usunięta. | Odśwież listę |
| Sesja wygasła | Sesja wygasła. Zaloguj się ponownie. | Zaloguj się |

## Walidacja formularzy

| Pole | Komunikat |
| --- | --- |
| Puste imię | Wpisz imię i nazwisko. |
| Zły telefon | Numer wygląda na niepełny — potrzebujemy 9 cyfr. |
| Zły e-mail | Sprawdź adres e-mail. |
| Brak usługi | Wybierz usługę. |
| Brak specjalisty | Wybierz specjalistę. |
| Brak terminu | Wybierz datę i godzinę. |
| Data w przeszłości | Ta data już minęła. Zapisać mimo to? |
| Cena ujemna | Cena nie może być ujemna. |
| Czas usługi = 0 | Podaj, ile trwa usługa. |
| Godzina poza grafikiem | {imię} nie pracuje o tej godzinie. Wybierz inną. |
| Dzień wolny | {imię} ma tego dnia wolne. |

## Na stronie (klient)

| Sytuacja | Komunikat |
| --- | --- |
| Nie udało się wysłać | Nie udało się wysłać zgłoszenia. Zadzwoń do nas: {telefon} albo spróbuj za chwilę. |
| Termin właśnie zajęty | Ten termin właśnie ktoś zajął. Wybierz inny. |
| Brak wolnych terminów | W tym dniu nie ma wolnych godzin. Sprawdź inny dzień. |
| Za wcześnie | Rezerwacje przyjmujemy najpóźniej {X} godziny przed wizytą. Zadzwoń: {telefon}. |
| Za dużo prób | Wysłałeś już kilka zgłoszeń. Odczekaj chwilę albo zadzwoń. |

## Szczegóły techniczne

Pod każdym błędem w panelu jest link **„Pokaż szczegóły"**, który rozwija:

```
Kod: BOOKING_CONFLICT
Czas: 2026-03-12 14:32:07
Operacja: createBooking
```

To dla właściciela i programisty. Recepcja tego nie potrzebuje i domyślnie nie widzi.
