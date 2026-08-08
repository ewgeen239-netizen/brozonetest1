# Strony usług — publiczne

## Struktura

```
/uslugi                 wszystkie kategorie
/uslugi/barber          cennik barberski
/uslugi/tattoo          tatuaże
/uslugi/massage         masaże
```

Dane pochodzą z arkusza `services` — właściciel zmienia cenę w Google Sheets
i strona aktualizuje się bez programisty.

## Układ strony kategorii

1. **Nagłówek** — nazwa kategorii, jedno zdanie opisu, zdjęcie.
2. **Lista usług** — karty: nazwa, czas, cena, krótki opis, przycisk „Umów wizytę".
3. **Specjaliści** — kto wykonuje usługi z tej kategorii, z odnośnikami do profili.
4. **Najczęstsze pytania** — 3–5 pytań właściwych dla kategorii.
5. **Wezwanie do działania** — „Umów wizytę" z wybraną kategorią.

## Pytania per kategoria (przykłady)

**Barber**
- Czy trzeba się umawiać? — Tak, pracujemy na rezerwacje.
- Ile trwa strzyżenie? — Od 30 do 90 minut.

**Tattoo**
- Czy konsultacja jest płatna? — Nie, konsultacja jest bezpłatna.
- Czy potrzebny jest zadatek? — Tak, przy sesjach. Kwota widoczna przy usłudze.
- Od jakiego wieku? — Od 18 lat, z dokumentem.

**Massage**
- Co zabrać? — Nic, wszystko zapewniamy.
- Czy masaż jest wskazany przy kontuzji? — Napisz o tym w zgłoszeniu, masażysta oceni.

## Ceny „od"

Jeśli usługa ma widełki (`price_from` ≠ `price_to`), pokazujemy „od 300 zł"
i dopisek: „Ostateczna cena po konsultacji". Bez ukrywania cen — to buduje zaufanie.

## SEO

- tytuł: „Masaż sportowy Szczecin — BROZONE",
- dane strukturalne `Service` + `Offer` z ceną,
- każda kategoria ma własny adres i własny opis (nie kopiujemy tekstów).
