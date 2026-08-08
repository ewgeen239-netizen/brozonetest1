# Role użytkowników

Sześć ról. Każda widzi tylko to, czego naprawdę potrzebuje.

## A. Właściciel / Admin
Pełny dostęp. Zarządza usługami, pracownikami, prawami i ustawieniami.
Widzi wszystkie wizyty i wszystkich klientów, robi eksporty, ogląda log synchronizacji.

## B. Recepcja
Codzienna obsługa salonu. Tworzy i zmienia rezerwacje, zmienia statusy, edytuje dane klientów.
**Nie może:** zmieniać uprawnień, usuwać pracowników, ruszać ustawień systemowych.

## C. Barber
Widzi **tylko swoje** wizyty z kategorii Barber. Zmienia ich status na: potwierdzona, wykonana,
nieobecność. Dopisuje notatkę po wizycie. Widzi imię i telefon klienta swojej wizyty.
**Nie widzi** notatek z tatuażu i masażu.

## D. Tatuator
Widzi **tylko swoje** wizyty z kategorii Tattoo, razem ze szczegółami konsultacji
(opis pomysłu, miejsce na ciele, rozmiar, inspiracje). Prowadzi notatki projektowe.
**Nie widzi** wizyt barberskich ani masażu.

## E. Masażysta
Widzi **tylko swoje** wizyty z kategorii Massage, razem z preferencjami
(siła nacisku, obszar, przeciwwskazania). Dane zdrowotne widzi wyłącznie przy swojej wizycie.

## F. Podgląd / Viewer
Tylko czyta kalendarz i listę wizyt. Nic nie zmienia. Rola dla stażysty albo księgowej.

## Jak przypisać rolę

Rola siedzi w arkuszu `permissions`: jeden wiersz = jedna osoba (e-mail + rola + staff_id).
Właściciel dopisuje wiersz i osoba dostaje dostęp — bez programisty.

| e-mail | rola | staff_id | aktywny |
| --- | --- | --- | --- |
| wlasciciel@brozone.pl | admin | — | tak |
| recepcja@brozone.pl | recepcja | — | tak |
| max@brozone.pl | barber | stf_max | tak |

## Zasada nadrzędna

**Pracownik widzi wyłącznie swoje wizyty ze swojej kategorii.** Dane wrażliwe
(przeciwwskazania zdrowotne, notatki projektowe) nigdy nie wychodzą poza osobę,
która wykonuje daną usługę, oraz właściciela.
