# Rezerwacje — specyfikacja

Wspólna lista dla wszystkich trzech kategorii. Jeden ekran zamiast trzech osobnych.

## Pasek filtrów (jeden rząd, maksymalnie 5 elementów)

```
[ Dziś ] [ Jutro ] [ Tydzień ]   [ Kategoria ▾ ]   [ Status ▾ ]   🔍 Szukaj
```

- **Zakres dat** — trzy przyciski, domyślnie „Dziś". Czwarta opcja „Wybierz daty" otwiera kalendarzyk.
- **Kategoria** — Wszystkie / Barber / Tattoo / Massage.
- **Status** — Wszystkie / Nowe / Potwierdzone / Wykonane / Anulowane / Nieobecność.
- **Szukaj** — po nazwisku, telefonie lub numerze rezerwacji.

Aktywne filtry pokazują się jako usuwalne żetony pod paskiem, z linkiem „Wyczyść wszystko".

## Tabela

| Kolumna | Uwagi |
| --- | --- |
| ▌ | kolorowy pasek kategorii (złoty / niebieski / zielony) |
| Data i godzina | „dziś 14:00" zamiast „2026-03-12 14:00" dla dzisiejszych |
| Klient | imię i nazwisko, pod spodem telefon |
| Usługa | nazwa z cennika |
| Specjalista | imię |
| Status | duży kolorowy znacznik |
| Kwota | cena, obok „zadatek OK" jeśli wpłacony |
| ⋯ | menu: Potwierdź / Zmień termin / Wykonane / Anuluj |

Na telefonie tabela zamienia się w karty — jedna wizyta = jedna karta.

## Panel boczny (po kliknięciu w wizytę)

Otwiera się z prawej strony, nie zasłania całego ekranu.

```
┌─────────────────────────────────────┐
│ Anna Kowalska            [Nowa]     │
│ 12 marca 2026, 10:30–11:30          │
├─────────────────────────────────────┤
│ [ Potwierdź ]  ← duży, zielony      │
│ [Zmień termin] [Wykonane] [Anuluj]  │
├─────────────────────────────────────┤
│ KLIENT                              │
│ +48 600 100 200 · anna@mail.pl      │
│ 4 wizyty · ostatnia 8 lutego        │
├─────────────────────────────────────┤
│ USŁUGA                              │
│ Masaż klasyczny 60 min · 180 zł     │
│ Ola Wizard · pokój 2                │
├─────────────────────────────────────┤
│ SZCZEGÓŁY (zależne od kategorii)    │
├─────────────────────────────────────┤
│ NOTATKA                             │
│ [pole tekstowe]                     │
├─────────────────────────────────────┤
│ Źródło: strona WWW · 11 marca 18:42 │
└─────────────────────────────────────┘
```

### Sekcja „Szczegóły" zależnie od kategorii

**Barber** — nic dodatkowego.

**Tattoo**
- Opis pomysłu (tekst klienta)
- Miejsce na ciele
- Przybliżony rozmiar
- Link do inspiracji
- Konsultacja: odbyta / wymagana
- Zadatek: kwota + status

**Massage**
- Siła nacisku: lekki / średni / mocny
- Obszar: plecy / szyja / nogi / całe ciało
- Przeciwwskazania (jeśli klient podał) — z żółtą ramką i ikoną ostrzeżenia

## Pola rezerwacji (pełny zestaw)

```
booking_id · date · time_start · time_end · category · service_id · service_name
staff_id · staff_name · client_name · client_phone · client_email
price · deposit · status · source · notes · created_at · updated_at
```

Plus pola dodatkowe zależne od kategorii (`tattoo_*`, `massage_*`) — opis w Data_Types.md.

## Dodawanie wizyty ręcznie

Formularz w trzech krokach, jeden ekran:

1. **Kto** — wyszukiwarka klienta po telefonie; jeśli nie ma, jednym klikiem „Nowy klient".
2. **Co** — kategoria → usługa → specjalista (lista zawęża się sama).
3. **Kiedy** — data i wolne godziny jako klikalne kafelki. Zajęte są wyszarzone.

Przycisk „Zapisz wizytę" aktywny dopiero, gdy wszystkie trzy kroki są wypełnione.
Status nowej wizyty dodanej ręcznie: `confirmed` (recepcja rozmawia z klientem na żywo).

## Zasady biznesowe

- Nie da się zapisać dwóch wizyt na tego samego specjalistę w tym samym czasie —
  system pokaże: „Ten termin jest już zajęty. Wybierz inny."
- Nie da się zapisać wizyty w dniu wolnym pracownika.
- Wizyta w przeszłości wymaga potwierdzenia: „Ta data już minęła. Zapisać mimo to?"
- Zmiana terminu zapisuje się w historii wizyty (kto i kiedy zmienił).

## Stan pusty

> **Brak wizyt dla wybranych filtrów.**
> Zmień zakres dat albo wyczyść filtry.
> `[ Wyczyść filtry ]`
