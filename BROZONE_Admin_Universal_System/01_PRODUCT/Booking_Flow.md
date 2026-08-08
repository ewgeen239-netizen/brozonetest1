# Ścieżka rezerwacji — od klienta do wykonanej wizyty

## 1. Klient na stronie

```
Kategoria  →  Usługa  →  Specjalista  →  Termin  →  Dane  →  Zgody  →  Wyślij
```

Formularz różni się w zależności od kategorii:

- **Barber** — najprostszy: usługa, barber, termin, imię, telefon.
- **Tattoo** — dodatkowo: opis pomysłu, miejsce na ciele, przybliżony rozmiar, link do inspiracji.
  Przy niektórych usługach konsultacja jest obowiązkowa i zamiast terminu sesji klient
  rezerwuje konsultację.
- **Massage** — dodatkowo: siła nacisku (lekki / średni / mocny), obszar
  (plecy / szyja / nogi / całe ciało), pole na przeciwwskazania (opcjonalne).

Po wysłaniu klient widzi ekran potwierdzenia: „Zgłoszenie przyjęte. Odezwiemy się, żeby
potwierdzić termin."

**Ważne:** zgłoszenie ze strony to jeszcze nie potwierdzona wizyta. Status = `new`.

## 2. Zapis do bazy

Formularz wysyła dane do Google Sheets (arkusz `bookings`), status `new`, źródło `website`.
Jeśli zapis się nie uda, zgłoszenie ląduje w kolejce ponowień i wraca błąd z prośbą
o kontakt telefoniczny.

## 3. Recepcja w panelu

Nowe zgłoszenie pokazuje się na dashboardzie w kafelku **„Wymagają potwierdzenia"**.
Recepcja otwiera rezerwację i ma cztery duże przyciski:

| Przycisk | Co robi |
| --- | --- |
| **Potwierdź** | status → `confirmed`, klient dostaje potwierdzenie |
| **Zmień termin** | wybór nowej daty i godziny, status bez zmian |
| **Anuluj** | status → `cancelled`, slot wraca do puli |
| **Oznacz jako wykonane** | status → `completed` |

## 4. Dzień wizyty

Wizyta widoczna w kalendarzu w kolorze swojej kategorii. Po wizycie pracownik albo recepcja
klika **Wykonane**. Jeśli klient się nie pojawił — **Nieobecność (no-show)**.

## 5. Statusy — pełna lista

| Status | Po polsku w panelu | Kiedy |
| --- | --- | --- |
| `new` | Nowa | zgłoszenie ze strony, nikt jeszcze nie potwierdził |
| `confirmed` | Potwierdzona | recepcja potwierdziła termin |
| `completed` | Wykonana | wizyta się odbyła |
| `cancelled` | Anulowana | klient lub salon odwołał |
| `no_show` | Nieobecność | klient nie przyszedł i nie odwołał |

Dozwolone przejścia:

```
new ──▶ confirmed ──▶ completed
 │           │
 │           ├──▶ no_show
 ▼           ▼
cancelled  cancelled
```

Ze stanu `completed` nie wraca się do żadnego innego — poprawia się tylko przez właściciela.

## 6. Zadatek (tattoo)

Przy tatuażach usługa może wymagać zadatku. Wtedy:
1. status zostaje `new`, dopóki zadatek nie wpłynie,
2. recepcja wpisuje kwotę w polu **Zadatek** i klika **Potwierdź**,
3. w kalendarzu wizyta z opłaconym zadatkiem ma znacznik „Zadatek OK".

Zadatek nie jest płatnością online — to notatka księgowa, że pieniądze wpłynęły.
