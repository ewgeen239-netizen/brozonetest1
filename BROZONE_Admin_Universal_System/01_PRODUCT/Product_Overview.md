# BROZONE — Product Overview

## Czym jest system

BROZONE OS to prosty panel do prowadzenia salonu z trzema usługami pod jednym dachem:

| Kategoria | Kto pracuje | Kolor w systemie |
| --- | --- | --- |
| **Barber** | barberzy | złoto / brass |
| **Tattoo** | tatuatorzy | niebieski / electric blue |
| **Massage** | masażyści | zielony / teal |

System składa się z trzech części:

1. **Strona WWW** — klient wybiera kategorię, usługę, osobę i termin, wysyła zgłoszenie.
2. **Panel administratora** — recepcja i właściciel widzą zgłoszenia, potwierdzają, prowadzą kalendarz.
3. **Google Sheets** — jedna wspólna baza danych. Wszystko, co widać w panelu, leży w arkuszu.

## Dla kogo

Panel obsługuje osoba **bez wiedzy technicznej**. Recepcjonistka ma rozumieć ekran w 5 sekund:
duże statusy, jasne przyciski po polsku, jedno główne działanie na ekranie.

## Co system robi

- przyjmuje zgłoszenia ze strony i zapisuje je w Google Sheets,
- pokazuje wizyty na dziś / jutro / tydzień,
- pozwala potwierdzić, przełożyć, zamknąć lub anulować wizytę w dwóch kliknięciach,
- prowadzi bazę klientów wspólną dla wszystkich trzech kategorii,
- trzyma cennik i listę pracowników, z których korzysta strona WWW,
- rozdziela dostęp: barber widzi tylko swoje wizyty, recepcja widzi wszystko.

## Czego system NIE robi (świadomie)

- **nie synchronizuje się na żywo z Booksy** — Booksy nie udostępnia publicznego API do zapisu.
  Booksy zostaje jako osobny kanał; rezerwacje stamtąd przepisuje się ręcznie albo importem CSV.
- nie liczy podatków ani nie wystawia faktur,
- nie wysyła SMS-ów samodzielnie (to osobna usługa, do podłączenia później),
- nie zastępuje księgowości.

## Dlaczego Google Sheets

To wybór na start (MVP), nie rozwiązanie docelowe:

**Plusy**
- właściciel widzi i poprawia dane bez programisty,
- zero kosztów i zero serwera bazodanowego,
- łatwy eksport i kopia zapasowa.

**Minusy — trzeba je znać**
- limit ~5–10 zapytań na sekundę, przy 20+ osobach naraz zrobi się wolno,
- brak transakcji: dwie osoby edytujące ten sam wiersz mogą się nadpisać,
- brak prawdziwych typów danych — wszystko jest tekstem,
- przy ~10 000 rezerwacji arkusz zaczyna zwalniać.

**Kiedy migrować na prawdziwą bazę:** powyżej ~300 rezerwacji miesięcznie albo gdy pracuje
więcej niż 5 osób jednocześnie. Model danych jest przygotowany tak, żeby przenieść go do
Postgresa bez zmiany interfejsu.

## Główne wskaźniki sukcesu

1. Recepcja obsługuje nową rezerwację w mniej niż 20 sekund.
2. Zero „zgubionych" zgłoszeń ze strony (każde ma status i widać je na dashboardzie).
3. Właściciel wie na koniec dnia, ile było wizyt i ile nieodwołanych nieobecności.
