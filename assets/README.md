# Materiały BroZone — stan i pochodzenie

Wszystkie sloty są **wypełnione**, strona wygląda kompletnie. Ale część plików to
materiał tymczasowy. Tabela niżej mówi dokładnie, co jest wasze, a co trzeba wymienić.

Legenda: **REAL** = wasz materiał · **TYMCZ** = zastępnik do wymiany · **CC** = licencja z warunkiem

## Sloty

| Plik | Skąd | Status |
|---|---|---|
| `hero-video.mp4` | Mixkit #357 „Barber cutting hair", 720p | TYMCZ |
| `hero-poster.jpg` | klatka z tego samego klipu | TYMCZ |
| `consultation-01.jpg` | `source-12` (stock) | TYMCZ |
| `fade-closeup.jpg` | wasz rolls IG, maszynka na karku | REAL |
| `beard-trim.jpg` | `source-14` (stock, gorący ręcznik) | TYMCZ |
| `finish-style.jpg` | `source-08` (stock) | TYMCZ |
| `service-haircut.jpg` | `source-03` (stock) | TYMCZ |
| `combo-service.jpg` | wasze zdjęcie z pelerynką BROZONE | REAL |
| `service-beard.jpg` | `source-13` (stock) | TYMCZ |
| `service-color.jpg` | `source-07` (stock) | TYMCZ |
| `service-women.jpg` | wasz kadr IG | REAL |
| `team-max.jpg` | wasze zdjęcie (Downloads/maks.jpg) | REAL |
| `team-olga.jpg` | wasze zdjęcie (Downloads/ola.jpg) | REAL |
| `team-walera.jpg` | wasze zdjęcie (Downloads/valera.jpg) | REAL |
| `team-ilia.jpg` | kadr z waszej rolki — brak osobnego zdjęcia | DOŚLIJ |
| `gallery-01..08.jpg` | stock (`source-02..13`) | TYMCZ |
| `ba-before.jpg` / `ba-after.jpg` | stock, **dwie różne osoby** — świadoma decyzja | TYMCZ |
| `atmosphere-01.jpg` | wasze wnętrze ze ścianą logo | REAL |
| `final-cta-bg.jpg` | `source-06` — puste fotele, ciemny kadr | TYMCZ |
| `location-visual.jpg` | **wasza witryna na Targ Rybny** (Wikimedia) | CC |
| `og-cover.jpg` | wasze zdjęcie | REAL |
| `favicon.svg` | rysunek ligatury O‑Z — przybliżenie | SPRAWDŹ |
| logo w nawigacji | SVG inline w `index.html` — przybliżenie znaku | SPRAWDŹ |

## Licencje — warunki, których trzeba dotrzymać

**`location-visual.jpg`** — kadr ze zdjęcia „Targ Rybny in Szczecin, 2025"
autorstwa [Szczecinolog](https://commons.wikimedia.org/wiki/User:Szczecinolog),
**CC BY‑SA 4.0**, Wikimedia Commons. Widać na nim waszą witrynę z dwoma barberpole'ami.
Wymaga podania autora — atrybucja **jest już w stopce strony, nie usuwać**.
CC BY‑SA działa też w drugą stronę: kadr jest utworem zależnym i sam pozostaje na CC BY‑SA 4.0.
Jeśli to problem — wystarczy zrobić własne zdjęcie witryny i podmienić plik, wtedy
całą linijkę atrybucji można skasować.

**Wideo i zdjęcia TYMCZ** — Mixkit Stock Video Free License (na stronie klipu widnieje
`videoFree`, nie `videoRestricted`) oraz stockowe zdjęcia z puli `source-*`.
Wolno używać komercyjnie bez atrybucji, nie wolno odsprzedawać samego pliku.

## Co wymienić w pierwszej kolejności

1. **`ba-before` / `ba-after`** — dwie różne osoby ze stocka, dobrane tak, by ujęcie
   i skala się zgadzały. Pod suwakiem jest dopisek „przykład poglądowy".
   Docelowo: jedna wasza metamorfoza, statyw nieruszany między ujęciami,
   zaznaczona pozycja stóp klienta. Wtedy dopisek do skasowania (`.ba__note`).
2. **`gallery-01..08`** — to nie wasze prace. Sekcja nazywa się „Efekt widać od razu".
   Potrzeba 8 kadrów: 2 fade, 2 combo, broda, kolor (praca Olgi), klasyka, makro detalu.
3. **`team-ilia.jpg`** — jedyny barber bez własnego zdjęcia, teraz kadr z rolki.
4. **`hero-video.mp4`** — najlepiej wasz rolls bez napisów, 8–12 s.

## Pliki źródłowe

`source-01..18.jpg` — pula stockowa, z niej cięte sloty TYMCZ.
`instagram-brozone/` — wasze oryginały z IG, z nich cięte sloty REAL.
`location-source.jpg` — pełne zdjęcie Targ Rybny z Wikimediów.
Można je zostawić (nie są linkowane ze strony) albo skasować przed deployem.

## Optymalizacja przed publikacją

```bash
mogrify -resize 1600x1600\> -quality 82 -strip assets/*.jpg
```
