# Komunikaty do klienta

Wszystkie teksty, które klient widzi lub dostaje. Ton: rzeczowy, uprzejmy, bez „Szanowny Kliencie".

## Na stronie po wysłaniu formularza

```
Zgłoszenie przyjęte

{imię}, dziękujemy! Skontaktujemy się telefonicznie, żeby potwierdzić termin.

{usługa}
{data}, {godzina}
{specjalista}

Numer zgłoszenia: {numer}
```

Wariant z zadatkiem (tatuaż):
> Termin rezerwujemy po wpłacie zadatku {kwota} zł. Szczegóły podamy przy potwierdzeniu.

Wariant z konsultacją:
> To zgłoszenie na bezpłatną konsultację. Termin sesji ustalimy po rozmowie z tatuatorem.

## SMS — gotowe wzory

Do wysłania ręcznie z telefonu recepcji albo przez zewnętrzną bramkę.
System ich sam nie wysyła (patrz: Product_Overview).

**Potwierdzenie**
```
BROZONE: potwierdzamy wizytę {data} o {godzina}, {usługa}, {specjalista}.
Targ Rybny 4, Szczecin. Do zobaczenia!
```

**Przypomnienie (dzień wcześniej)**
```
BROZONE: przypominamy o jutrzejszej wizycie {godzina}, {specjalista}.
Gdyby coś się zmieniło, daj znać: {telefon}.
```

**Prośba o potwierdzenie**
```
BROZONE: mamy Twoje zgłoszenie na {data} {godzina}. Potwierdzasz?
Odpisz TAK albo zadzwoń: {telefon}.
```

**Odwołanie przez salon**
```
BROZONE: niestety musimy przełożyć wizytę {data} {godzina}.
Zadzwonimy, żeby ustalić nowy termin. Przepraszamy.
```

**Po wizycie (opcjonalnie)**
```
BROZONE: dziękujemy za wizytę! Jeśli chcesz, zostaw opinię: {link}.
```

## E-mail — potwierdzenie

Temat: `BROZONE — potwierdzenie wizyty {data}`

```
Cześć {imię},

potwierdzamy wizytę:

  {usługa}
  {data}, {godzina}
  {specjalista}
  {cena} zł

Adres: Targ Rybny 4, 70-535 Szczecin
Telefon: {telefon salonu}

Jeśli nie możesz przyjść, daj znać najpóźniej dzień wcześniej.

Do zobaczenia,
BROZONE
```

## Teksty przy nieobecnościach

Klient z dwiema nieobecnościami — recepcja widzi ostrzeżenie i może powiedzieć:
> „Przy poprzednich dwóch wizytach nie udało się dojść do skutku. Poprosimy o potwierdzenie
> dzień wcześniej — inaczej termin zwolnimy."
