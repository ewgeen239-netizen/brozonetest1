# Usługi — specyfikacja

## Cel

Cennik, z którego korzysta jednocześnie panel i strona WWW. Jedno miejsce prawdy.

## Widok

Trzy zakładki: **Barber** · **Tattoo** · **Massage**. W każdej lista usług.

```
Barber                                          [ + Dodaj usługę ]

Strzyżenie męskie              45 min   80–100 zł   ✅ aktywna   ⋯
Broda                          30 min   70–90 zł    ✅ aktywna   ⋯
Combo włosy + broda            90 min  120–150 zł   ✅ aktywna   ⋯
Skin fade                      45 min      100 zł   ✅ aktywna   ⋯
Strzyżenie dziecięce           30 min       60 zł   ⬜ ukryta    ⋯
```

Przełącznik „aktywna" działa od razu — usługa nieaktywna znika ze strony,
ale zostaje w historii wizyt.

## Pola

```
service_id · category · name · description · duration_minutes
price_from · price_to · deposit_required · active · assigned_staff_ids
```

- **price_from / price_to** — jeśli równe, pokazujemy jedną cenę. Jeśli różne — „od 80 zł".
- **assigned_staff_ids** — kto wykonuje usługę. Puste = wszyscy z tej kategorii.
- **deposit_required** — kwota zadatku, 0 = bez zadatku.

## Przykładowe usługi startowe

### Barber
| Nazwa | Czas | Cena |
| --- | --- | --- |
| Strzyżenie męskie | 45 min | 80–100 zł |
| Broda | 30 min | 70–90 zł |
| Combo włosy + broda | 90 min | 120–150 zł |
| Skin fade | 45 min | 100 zł |
| Strzyżenie dziecięce | 30 min | 60 zł |

### Tattoo
| Nazwa | Czas | Cena | Zadatek |
| --- | --- | --- | --- |
| Konsultacja tatuażu | 30 min | 0 zł | — |
| Mały tatuaż | 60 min | od 300 zł | 100 zł |
| Sesja tattoo 2h | 120 min | 600 zł | 200 zł |
| Sesja tattoo 4h | 240 min | 1200 zł | 300 zł |
| Projekt indywidualny | 60 min | wycena | 200 zł |

### Massage
| Nazwa | Czas | Cena |
| --- | --- | --- |
| Masaż klasyczny 60 min | 60 min | 180 zł |
| Masaż sportowy 60 min | 60 min | 200 zł |
| Masaż relaksacyjny 60 min | 60 min | 180 zł |
| Masaż pleców 30 min | 30 min | 110 zł |

## Formularz

Jeden ekran, sześć pól: nazwa, kategoria, czas, cena od, cena do, opis.
Pod spodem dwa przełączniki: „Widoczna na stronie" i „Wymaga zadatku" (z kwotą).
Na końcu lista pracowników z checkboxami — kto ją wykonuje.

## Zasady

- Usunięcie usługi jest możliwe tylko, gdy nie ma z nią żadnej wizyty. W przeciwnym razie
  system proponuje: „Ta usługa ma 34 wizyty w historii. Możesz ją ukryć zamiast usuwać."
- Zmiana ceny nie zmienia cen w wizytach już zapisanych.
- Czas trwania steruje długością bloku w kalendarzu i dostępnymi slotami na stronie.

## Stan pusty

> **Nie masz jeszcze żadnych usług w tej kategorii.**
> Bez usług klienci nie mogą się zapisać przez stronę.
> `[ Dodaj pierwszą usługę ]`
