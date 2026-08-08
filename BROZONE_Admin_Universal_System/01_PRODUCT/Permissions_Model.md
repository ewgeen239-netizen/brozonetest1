# Macierz uprawnień

Legenda: ✅ pełny dostęp · 🟡 tylko swoje · 👁 tylko podgląd · ❌ brak dostępu

## Rezerwacje

| Działanie | Admin | Recepcja | Barber | Tatuator | Masażysta | Podgląd |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| Lista wszystkich wizyt | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 👁 |
| Tworzenie wizyty | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Zmiana terminu | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Potwierdzenie wizyty | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ❌ |
| Oznaczenie „wykonana" | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ❌ |
| Oznaczenie „nieobecność" | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ❌ |
| Anulowanie wizyty | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Usunięcie wizyty | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Notatka po wizycie | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ❌ |

## Dane wrażliwe

| Dane | Admin | Recepcja | Barber | Tatuator | Masażysta | Podgląd |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| Telefon / e-mail klienta | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ❌ |
| Szczegóły projektu tatuażu | ✅ | ✅ | ❌ | 🟡 | ❌ | ❌ |
| Przeciwwskazania zdrowotne | ✅ | 🟡 | ❌ | ❌ | 🟡 | ❌ |
| Notatki wewnętrzne o kliencie | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Kwoty i zadatki | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ❌ |

🟡 przy danych wrażliwych = **wyłącznie w kontekście własnej wizyty**. Barber nie ma ekranu
z listą telefonów; widzi telefon klienta, który jest zapisany do niego na dziś.

## Klienci

| Działanie | Admin | Recepcja | Barber | Tatuator | Masażysta | Podgląd |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| Baza klientów | ✅ | ✅ | ❌ | ❌ | ❌ | 👁 |
| Dodanie klienta | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edycja klienta | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Historia wizyt klienta | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 👁 |
| Eksport bazy (RODO) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Pracownicy i usługi

| Działanie | Admin | Recepcja | Barber | Tatuator | Masażysta | Podgląd |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| Lista pracowników | ✅ | ✅ | 👁 | 👁 | 👁 | 👁 |
| Dodanie pracownika | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edycja pracownika | ✅ | ❌ | 🟡¹ | 🟡¹ | 🟡¹ | ❌ |
| Archiwizacja pracownika | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Godziny pracy / dni wolne | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 👁 |
| Cennik usług | ✅ | 👁 | 👁 | 👁 | 👁 | 👁 |
| Dodanie / edycja usługi | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Prowizje | ✅ | ❌ | 🟡 | 🟡 | 🟡 | ❌ |

¹ tylko własne zdjęcie, opis i portfolio.

## System

| Działanie | Admin | Recepcja | Barber | Tatuator | Masażysta | Podgląd |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| Zarządzanie uprawnieniami | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ustawienia salonu | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Synchronizacja Google Sheets | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Log synchronizacji | ✅ | 👁 | ❌ | ❌ | ❌ | ❌ |
| Eksport danych | ✅ | 🟡² | ❌ | ❌ | ❌ | ❌ |

² recepcja eksportuje listę wizyt, nie całą bazę klientów.

## Reguła bezpieczeństwa

Uprawnienia sprawdzane są **na serwerze przy każdym zapytaniu**, nie tylko przez ukrywanie
przycisków. Ukryty przycisk nie jest zabezpieczeniem — jest wygodą.
