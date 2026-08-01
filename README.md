# BroZone — landing page

Jednostronicowy, scroll-driven landing dla barbershopu BroZone (Targ Rybny 4, Szczecin).
Czysty HTML/CSS/JS. Zero zależności, zero builda, zero CDN poza Google Fonts.

```
index.html          cała struktura + JSON-LD (HairSalon)
css/styles.css      tokeny → komponenty → sekcje → RWD → reduced-motion
js/main.js          wszystkie interakcje (jedna pętla rAF na scroll)
assets/             sloty na zdjęcia i wideo — patrz assets/README.md
```

## Uruchomienie

```bash
python3 -m http.server 4321
```

Potem `http://localhost:4321`. Otwarcie `index.html` przez `file://` też działa,
ale wideo w hero może się nie odtworzyć.

Deploy: wrzuć katalog na dowolny statyczny hosting (Netlify, Vercel, Cloudflare Pages, zwykły nginx).

## Do uzupełnienia przed publikacją

Wszystko w jednym miejscu — góra `js/main.js`:

```js
const BOOKSY_URL = 'https://booksy.com/pl-pl/287574_brozone_barber-shop_18078_szczecin';
const PHONE      = '';   // pusty → przycisk "Zadzwoń" znika sam
```

`BOOKSY_URL` wskazuje na prawdziwy profil BroZone i ustawia wszystkie CTA
na stronie naraz (`[data-booksy]`, 11 sztuk). Zostaje do uzupełnienia tylko `PHONE`.

Dane z Booksy (stan: sierpień 2026): 4.9 / 146 opinii, codziennie 10:00–20:00,
ceny w widełkach junior / barber / senior — 80–100, 120–150, 70–90 zł.

Zdjęcia i wideo: nazwy plików w `assets/README.md`. Dopóki pliku nie ma,
w kadrze widać ciemny placeholder z nazwą slotu — nic się nie rozjeżdża.

## Sekcje

1. Hero — wideo w tle, parallax na scroll, split-text na „BROZONE", trust row
2. Proces — sticky, 4 karty nasuwają się na siebie w miarę scrolla
3. Usługi — lista z cenami, hover odsłania zdjęcie podążające za kursorem
4. Zespół — poziomy scroll ze snapem, strzałki + drag myszką
5. Efekty — suwak przed/po + masonry (3 kolumny → 2 → 1)
6. Opinie — 4.9 z licznikiem, marquee zatrzymywany na hover
7. Lokalizacja — mapa, udogodnienia, przyciski kontaktu
8. Finalne CTA + stopka

## Zachowanie

- **Rezerwacja zostaje w Booksy.** Strona nigdzie nie udaje systemu rezerwacji.
- `prefers-reduced-motion` → sticky-scroll zamienia się w zwykłą listę,
  marquee i parallax znikają, zostają delikatne przejścia.
  Do testów: `?motion=on` wymusza pełne animacje, `?motion=off` wymusza wersję spokojną.
- Bez JS strona nadal jest w pełni czytelna — stany startowe animacji siedzą
  pod klasą `.js`, a loader ma zapasowe zniknięcie w czystym CSS.
- Brak przewijania w poziomie od 320 px w górę.

## Sprawdzone

- 375 px i 948 px — zero horizontal overflow (`scrollWidth === innerWidth`)
- pierwszy ekran na 375×812: logo, nagłówek, oba CTA i trust row bez ucinania
- suwak przed/po trzyma piksel w piksel przy każdej szerokości (clip-path, nie resize)
- brak błędów w konsoli
