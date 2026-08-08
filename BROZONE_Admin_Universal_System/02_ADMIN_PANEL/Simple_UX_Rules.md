# Zasady prostego interfejsu

Dokument nadrzędny. Jeśli inny dokument jest z nim sprzeczny — wygrywa ten.

## 1. Jeden ekran = jedno zadanie

Każdy ekran odpowiada na jedno pytanie:

| Ekran | Pytanie |
| --- | --- |
| Dashboard | Co się dzieje dzisiaj? |
| Rezerwacje | Kto i kiedy przychodzi? |
| Kalendarz | Czy mamy wolne miejsce? |
| Klienci | Kto to jest i kiedy był ostatnio? |
| Pracownicy | Kto u nas pracuje i kiedy? |
| Usługi | Ile to kosztuje i ile trwa? |

Jeśli ekran odpowiada na dwa pytania — trzeba go podzielić.

## 2. Główne działanie zawsze widoczne

Na każdym ekranie jest **jeden zielony przycisk** w prawym górnym rogu. Nigdy dwa.
Reszta działań jest szara albo schowana pod „trzema kropkami".

## 3. Język przycisków

Piszemy tak, jak mówi recepcjonistka do klienta:

| ❌ Nie tak | ✅ Tak |
| --- | --- |
| Zapisz zmiany w rekordzie | Zapisz |
| Zmień status rezerwacji na potwierdzoną | Potwierdź |
| Utwórz nową encję klienta | Dodaj klienta |
| Wykonaj synchronizację danych | Pobierz dane z arkusza |
| Anuluj operację | Wróć |

Bez słów: rekord, encja, obiekt, instancja, endpoint, sync (samodzielnie), commit, deploy.

## 4. Statusy — kolor plus słowo

Sam kolor nie wystarcza (10% mężczyzn ma zaburzenia rozpoznawania barw, a to salon męski).
Zawsze kolor **i** tekst:

| Status | Kolor | Napis |
| --- | --- | --- |
| Nowa | szary | Nowa |
| Potwierdzona | niebieski | Potwierdzona |
| Wykonana | zielony | Wykonana |
| Anulowana | jasnoszary, przekreślona | Anulowana |
| Nieobecność | czerwony | Nie przyszedł |

## 5. Puste ekrany uczą

Pusty ekran nigdy nie pokazuje samego „Brak danych". Zawsze: co to za miejsce,
dlaczego jest puste, i jeden przycisk, co zrobić dalej.

> **Nie masz jeszcze żadnych wizyt na dziś.**
> Wizyty ze strony pojawią się tutaj automatycznie.
> `[ Dodaj wizytę ręcznie ]`

## 6. Błędy po ludzku

| ❌ Nie tak | ✅ Tak |
| --- | --- |
| Error 500: Internal Server Error | Coś poszło nie tak po naszej stronie. Spróbuj jeszcze raz za chwilę. |
| Request failed with status 429 | Za dużo zapytań naraz. Odczekaj minutę. |
| Validation error: phone invalid | Numer telefonu wygląda na niepełny. Sprawdź, czy ma 9 cyfr. |
| Sheets API quota exceeded | Google chwilowo nas ogranicza. Dane zapiszą się za chwilę same. |

Szczegóły techniczne chowamy pod „Pokaż szczegóły" — dla właściciela i dla programisty.

## 7. Maksymalnie 5 filtrów

Na liście rezerwacji: Dziś · Jutro · Tydzień · Kategoria · Status. Nic więcej.
Wszystko inne to wyszukiwarka po nazwisku lub telefonie.

## 8. Bez konfiguracji — gotowe scenariusze

Zamiast „skonfiguruj regułę powiadomień" dajemy przełączniki:

- „Przypominaj klientom SMS-em dzień wcześniej" — włącz / wyłącz
- „Wymagaj zadatku przy tatuażach" — włącz / wyłącz
- „Blokuj rezerwacje online na mniej niż 2 godziny przed" — włącz / wyłącz

## 9. Dwa kliknięcia do celu

Potwierdzenie wizyty: klik w wizytę → klik „Potwierdź". Koniec. Bez okien
z pytaniem „czy na pewno" przy działaniach odwracalnych.

Okno potwierdzenia pokazujemy tylko przy: anulowaniu wizyty, usunięciu klienta,
archiwizacji pracownika.

## 10. Pracownik widzi mniej

Barber po zalogowaniu widzi jeden ekran: **swoje wizyty na dziś**. Bez menu bocznego,
bez cennika, bez bazy klientów. Trzy przyciski przy wizycie: Potwierdź · Wykonane · Nie przyszedł.

## 11. Rozmiary i klikalność

- minimalna wysokość przycisku: 40 px (recepcja klika w biegu, czasem na tablecie),
- minimalny rozmiar tekstu: 13 px, statusy 12 px pogrubione,
- odstęp między działaniami: minimum 8 px, żeby nie kliknąć „Anuluj" zamiast „Potwierdź",
- „Anuluj" nigdy nie stoi obok „Potwierdź" — zawsze po przeciwnej stronie okna.

## 12. Test pięciu sekund

Przed wdrożeniem ekranu: pokaż go osobie, która nie zna systemu, na 5 sekund i zapytaj,
co tu można zrobić. Jeśli nie potrafi odpowiedzieć — ekran jest za trudny.
