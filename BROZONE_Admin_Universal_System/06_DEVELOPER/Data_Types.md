# Typy danych

Pełne definicje TypeScript: `code/types.ts`. Poniżej opis dla ludzi.

## Kategoria — oś całego systemu

```ts
type Category = 'barber' | 'tattoo' | 'massage';
```

Każda rezerwacja, usługa i pracownik ma kategorię. To ona decyduje o kolorze,
o polach w formularzu i o tym, kto co widzi.

## Booking

Jeden typ dla wszystkich kategorii. Pola specyficzne są opcjonalne i zgrupowane:

```ts
interface Booking {
  bookingId: string;          // BZ-2026-0312-007
  date: string;               // 2026-03-12
  timeStart: string;          // 10:30
  timeEnd: string;            // 11:30
  category: Category;
  serviceId: string;
  serviceName: string;        // kopia na moment rezerwacji
  staffId: string;
  staffName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  price: number;
  deposit: number;
  status: BookingStatus;
  source: BookingSource;
  notes?: string;
  tattoo?: TattooDetails;     // tylko category === 'tattoo'
  massage?: MassageDetails;   // tylko category === 'massage'
  consentRodo: boolean;
  consentMarketing: boolean;
  createdAt: string;
  updatedAt: string;          // klucz wykrywania konfliktów
  syncStatus: 'synced' | 'pending' | 'error';
}
```

**Dlaczego `serviceName` i `staffName` są kopiowane:** cennik się zmienia, a wizyta sprzed
pół roku ma pokazywać nazwę i cenę z tamtego dnia.

## Staff — unia rozłączna

```ts
type Staff = BarberStaff | TattooStaff | MassageStaff;
```

Wspólna baza (`id`, `name`, `category`, `workingHours`, `daysOff`, `calendarColor`, `active`)
plus pola właściwe dla typu. TypeScript pilnuje, żeby `roomNumber` istniał tylko u masażysty,
a `style` tylko u tatuatora.

## Service

```ts
interface Service {
  serviceId: string;
  category: Category;
  name: string;
  description: string;
  durationMinutes: number;
  priceFrom: number;
  priceTo: number;            // równe priceFrom = cena stała
  depositRequired: number;    // 0 = bez zadatku
  active: boolean;
  assignedStaffIds: string[]; // puste = wszyscy z kategorii
}
```

## Client

Wspólny dla wszystkich kategorii. Klucz praktyczny to **znormalizowany numer telefonu**
(ostatnie 9 cyfr) — po nim rozpoznajemy powracającego klienta.

## Role i uprawnienia

```ts
type Role = 'admin' | 'recepcja' | 'barber' | 'tattoo' | 'massage' | 'viewer';

interface Session {
  email: string;
  role: Role;
  staffId?: string;   // wymagane dla ról pracowniczych
}
```

Funkcje sprawdzające (`code/permissions.ts`):

```ts
can(session, 'booking:create')            // czy w ogóle wolno
canSeeBooking(session, booking)           // czy ta konkretna wizyta
scopeBookings(session, bookings)          // filtr listy
canSeeSensitive(session, booking)         // dane zdrowotne / projektowe
```

## Konwersja z arkusza

Arkusz trzyma wszystko jako tekst i `snake_case`. Warstwa mapująca (`code/sheets-mapper.ts`)
zamienia to na typowany obiekt `camelCase` i z powrotem. Konwersje:

| Arkusz | TypeScript |
| --- | --- |
| `tak` / `nie` | `true` / `false` |
| `""` (pusty) | `undefined` |
| `"180"` | `180` |
| `"a,b,c"` | `['a','b','c']` |
| `2026-03-12` | `string` (bez Date — unikamy stref czasowych) |

**Daty trzymamy jako tekst.** `Date` w JavaScripcie przy strefach czasowych potrafi przesunąć
wizytę o dobę. Format `RRRR-MM-DD` i `GG:MM` porównuje się leksykalnie i to wystarcza.
