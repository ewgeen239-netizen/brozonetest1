# Synchronizacja z Google Sheets — specyfikacja

## Zasada

Google Sheets jest **źródłem prawdy**. Panel czyta z arkusza i zapisuje do arkusza.
Nie ma drugiej bazy, która mogłaby się rozjechać.

## Kierunki

```
Strona WWW  ──zapis──▶  Google Sheets  ◀──zapis/odczyt──  Panel admina
                              │
                              └──odczyt──▶ Strona WWW (usługi, pracownicy, wolne terminy)
```

## Co widzi administrator

Na dole każdego ekranu jest jeden pasek:

```
● Dane z Google Sheets · zaktualizowane 3 minuty temu · [ Odśwież ]
```

| Kropka | Znaczenie | Tekst obok |
| --- | --- | --- |
| 🟢 zielona | wszystko zapisane | „zaktualizowane X minut temu" |
| 🟡 żółta | trwa zapis | „zapisywanie…" |
| 🔴 czerwona | błąd zapisu | „Nie udało się zapisać. [Spróbuj ponownie]" |

Administrator nie widzi słów: API, endpoint, quota, token, webhook.

## Zapis (panel → arkusz)

1. Użytkownik klika np. „Potwierdź".
2. Interfejs **od razu** pokazuje nowy status (optymistycznie) i żółtą kropkę.
3. W tle leci zapis do arkusza.
4. Sukces → zielona kropka. Błąd → status wraca do poprzedniego, czerwona kropka
   i komunikat: „Nie udało się zapisać zmiany. Sprawdź połączenie i spróbuj ponownie."

## Odczyt (arkusz → panel)

- automatycznie co 60 sekund, gdy panel jest otwarty,
- przy każdym wejściu na ekran,
- ręcznie przyciskiem „Odśwież".

Dane trzymane są w pamięci przeglądarki przez 60 s, żeby nie przekroczyć limitów Google.

## Konflikty

Dwie osoby edytujące tę samą wizytę: wygrywa zapis późniejszy, ale system to wykrywa
przez pole `updated_at` i pokazuje:

> **Ktoś zmienił tę wizytę przed chwilą.**
> Recepcja zmieniła status na „Potwierdzona" o 14:32.
> `[ Zobacz aktualną wersję ]` `[ Nadpisz moją zmianą ]`

## Log synchronizacji (arkusz `sync_log`)

Każda operacja zapisu tworzy wiersz: czas, typ operacji, ID rekordu, użytkownik, wynik, błąd.
Właściciel widzi go w Ustawieniach → „Historia zapisów". Recepcja tylko podgląd.

## Limity i co robić, gdy Google odmawia

| Sytuacja | Zachowanie systemu | Komunikat |
| --- | --- | --- |
| Przekroczony limit zapytań | ponowienie po 2, 4, 8 s | „Google chwilowo nas ogranicza. Dane zapiszą się za chwilę." |
| Brak internetu | zapis do kolejki w przeglądarce | „Brak połączenia. Zmiany zapiszą się, gdy internet wróci." |
| Zły format w arkuszu | zapis odrzucony | „W arkuszu jest błąd w wierszu 42. Sprawdź datę." |
| Ktoś usunął kolumnę | odczyt zatrzymany | „Arkusz ma zmienioną strukturę. Skontaktuj się z administratorem." |

## Booksy — uczciwie

Booksy **nie ma** publicznego API do zapisu rezerwacji. Dlatego:

- rezerwacje z Booksy trafiają do systemu przez **import CSV** (eksport z Booksy Biz)
  albo przez ręczne przepisanie,
- zmiana statusu w panelu **nie wraca** do Booksy — trzeba ją powtórzyć w aplikacji Booksy,
- strona WWW może przekierowywać do Booksy (widget), ale wtedy taka wizyta nie pojawi się
  w panelu, dopóki jej nie zaimportujesz.

To ograniczenie Booksy, nie systemu. Jest opisane wprost w panelu, żeby nikt nie liczył
na automat, którego nie ma.
