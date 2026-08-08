# Rezerwacja na stronie — ścieżka klienta

## Zasada

Sześć kroków, jeden ekran, widoczny postęp. Klient nie zakłada konta i nie płaci online.

```
[1 Kategoria] → [2 Usługa] → [3 Specjalista] → [4 Termin] → [5 Dane] → [6 Potwierdzenie]
```

## Krok 1 — Kategoria

Trzy duże kafelki z ikoną i kolorem:

| Kafelek | Podpis |
| --- | --- |
| **Barber** | Strzyżenie, broda, brzytwa |
| **Tattoo** | Konsultacje i sesje tatuażu |
| **Massage** | Masaż klasyczny, sportowy, relaksacyjny |

Wybór kategorii zmienia kolor akcentu na całej dalszej ścieżce.

## Krok 2 — Usługa

Lista usług z tej kategorii: nazwa, czas, cena. Przy usługach z zadatkiem od razu widać
„Zadatek 200 zł". Usługi nieaktywne w panelu tu nie występują.

## Krok 3 — Specjalista

Karty z imieniem, zdjęciem i specjalizacją. Zawsze na górze opcja **„Dowolny specjalista"**
— wybiera pierwszy wolny termin.

Przy tatuatorach dodatkowo styl (fine line, realism, blackwork) i link do portfolio.
Przy masażystach — specjalizacja i numer gabinetu.

## Krok 4 — Termin

Pasek 14 dni do przodu, pod nim wolne godziny jako klikalne kafelki.
Zajęte godziny są wyszarzone, nie da się ich kliknąć.

Godziny liczone są z: godzin pracy specjalisty − istniejące wizyty − dni wolne
− czas trwania wybranej usługi.

## Krok 5 — Dane i pola zależne od kategorii

**Wspólne:** imię i nazwisko, telefon, e-mail (opcjonalny), komentarz.

**Tattoo — dodatkowo:**
- Opis pomysłu (obowiązkowe)
- Miejsce na ciele (lista: ramię / przedramię / plecy / klatka / noga / dłoń / szyja / inne)
- Przybliżony rozmiar (do 5 cm / 5–10 cm / 10–20 cm / powyżej 20 cm)
- Link do inspiracji (opcjonalny)
- Informacja: „Przy tej usłudze wymagana jest konsultacja" — jeśli tatuator tak ustawił

**Massage — dodatkowo:**
- Siła nacisku: lekki / średni / mocny
- Obszar: plecy / szyja / nogi / całe ciało
- Przeciwwskazania (opcjonalne, pole tekstowe z informacją, po co pytamy)

**Barber:** nic dodatkowego.

## Krok 6 — Zgody i wysyłka

- ☑️ **obowiązkowa:** „Zgadzam się na przetwarzanie moich danych w celu realizacji rezerwacji."
- ☐ opcjonalna: „Chcę dostawać informacje o promocjach."

Przycisk: **„Wyślij zgłoszenie"** (nie „Zarezerwuj" — to jeszcze nie potwierdzona wizyta).

## Po wysłaniu

```
✅ Zgłoszenie przyjęte

Anna, dziękujemy! Skontaktujemy się telefonicznie,
żeby potwierdzić termin.

Masaż klasyczny 60 min
12 marca 2026, 10:30
Ola Wizard

Numer zgłoszenia: BZ-2026-0312-007
```

Rezerwacja trafia do Google Sheets ze statusem `new` i źródłem `website`.

## Jeśli zapis się nie uda

```
⚠️ Nie udało się wysłać zgłoszenia

Coś poszło nie tak po naszej stronie. Zadzwoń do nas: +48 000 000 000
albo spróbuj jeszcze raz za chwilę.

[ Spróbuj ponownie ]
```

Dane formularza zostają wypełnione — klient nie wpisuje wszystkiego od nowa.

## Ochrona przed spamem

- honeypot (ukryte pole, które wypełniają tylko boty),
- limit: 3 zgłoszenia z jednego adresu IP na 10 minut,
- walidacja telefonu: 9 cyfr, opcjonalnie z prefiksem +48.

Bez CAPTCHA — psuje konwersję, a przy tej skali nie jest potrzebna.
