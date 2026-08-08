# Struktura arkuszy Google Sheets

Plik: **BROZONE_Database**. Siedem zakładek. Pierwszy wiersz = nagłówki (nie ruszać).

---

## 1. `bookings`

| Kolumna | Typ | Przykład | Uwagi |
| --- | --- | --- | --- |
| booking_id | tekst | BZ-2026-0312-007 | nadaje system |
| date | data | 2026-03-12 | format RRRR-MM-DD |
| time_start | godzina | 10:30 | GG:MM |
| time_end | godzina | 11:30 | liczone z czasu usługi |
| category | lista | massage | barber / tattoo / massage |
| service_id | tekst | srv_mas_klas_60 | → services |
| service_name | tekst | Masaż klasyczny 60 min | kopia nazwy na moment rezerwacji |
| staff_id | tekst | stf_ola | → staff |
| staff_name | tekst | Ola Wizard | kopia nazwy |
| client_id | tekst | cli_000123 | → clients |
| client_name | tekst | Anna Kowalska | |
| client_phone | tekst | +48600100200 | klucz rozpoznawania klienta |
| client_email | tekst | anna@mail.pl | opcjonalnie |
| price | liczba | 180 | zł |
| deposit | liczba | 0 | zadatek, 0 = brak |
| status | lista | new | new / confirmed / completed / cancelled / no_show |
| source | lista | website | website / manual / booksy / instagram / phone / walk_in |
| notes | tekst | | notatka wewnętrzna |
| tattoo_idea | tekst | | tylko tattoo |
| tattoo_placement | tekst | przedramię | tylko tattoo |
| tattoo_size | tekst | 10–20 cm | tylko tattoo |
| tattoo_reference | tekst | https://… | tylko tattoo |
| massage_pressure | lista | średni | lekki / średni / mocny |
| massage_focus | lista | plecy | plecy / szyja / nogi / całe ciało |
| massage_contraindications | tekst | | dane wrażliwe |
| consent_rodo | tak/nie | tak | wymagane |
| consent_marketing | tak/nie | nie | |
| created_at | data i czas | 2026-03-11 18:42 | |
| updated_at | data i czas | 2026-03-12 09:15 | do wykrywania konfliktów |
| sync_status | lista | synced | synced / pending / error |

---

## 2. `clients`

| Kolumna | Typ | Uwagi |
| --- | --- | --- |
| client_id | tekst | cli_000123 |
| name | tekst | |
| phone | tekst | unikalny — klucz główny w praktyce |
| email | tekst | |
| tags | tekst | rozdzielone przecinkami: barber,VIP |
| last_visit | data | aktualizowane automatycznie |
| total_visits | liczba | licznik wizyt `completed` |
| no_shows | liczba | licznik nieobecności |
| notes | tekst | wewnętrzne |
| consent_marketing | tak/nie | |
| consent_rodo | tak/nie | |
| created_at | data | |

---

## 3. `staff`

| Kolumna | Typ | Dotyczy |
| --- | --- | --- |
| staff_id | tekst | wszyscy |
| name | tekst | wszyscy |
| category | lista | barber / tattoo / massage |
| photo_url | tekst | wszyscy |
| active | tak/nie | wszyscy |
| calendar_color | tekst | #C8A55B |
| working_hours | tekst | `pn-sb 10:00-20:00; nd wolne` |
| days_off | tekst | daty po przecinku |
| phone | tekst | niepubliczne |
| email | tekst | niepubliczne |
| specialization | tekst | barber, massage |
| services | tekst | ID usług po przecinku |
| commission_percent | liczba | barber |
| booksy_profile_link | tekst | barber |
| style | tekst | tattoo: fine line / realism / … |
| portfolio_link | tekst | tattoo |
| instagram | tekst | tattoo |
| consultation_required | tak/nie | tattoo |
| min_price | liczba | tattoo |
| deposit_required | liczba | tattoo |
| room_number | tekst | massage |
| show_on_website | tak/nie | wszyscy |

---

## 4. `services`

| Kolumna | Typ | Uwagi |
| --- | --- | --- |
| service_id | tekst | srv_bar_strzyz |
| category | lista | barber / tattoo / massage |
| name | tekst | |
| description | tekst | widoczny na stronie |
| duration_minutes | liczba | steruje slotami |
| price_from | liczba | |
| price_to | liczba | równe price_from = cena stała |
| deposit_required | liczba | 0 = bez zadatku |
| active | tak/nie | nie = ukryta na stronie |
| assigned_staff_ids | tekst | puste = wszyscy z kategorii |
| sort_order | liczba | kolejność na stronie |

---

## 5. `permissions`

| Kolumna | Typ | Uwagi |
| --- | --- | --- |
| email | tekst | login |
| role | lista | admin / recepcja / barber / tattoo / massage / viewer |
| staff_id | tekst | wymagane dla ról pracowniczych |
| active | tak/nie | |
| added_at | data | |

---

## 6. `sync_log`

| Kolumna | Typ | Uwagi |
| --- | --- | --- |
| log_id | tekst | |
| timestamp | data i czas | |
| operation | tekst | create_booking / update_status / … |
| entity | tekst | booking / client / staff / service |
| entity_id | tekst | |
| user | tekst | e-mail |
| result | lista | ok / error |
| message | tekst | treść błędu |

Log czyszczony automatycznie po 90 dniach.

---

## 7. `settings`

Dwie kolumny: `key` i `value`.

| key | przykładowa wartość | opis |
| --- | --- | --- |
| salon_name | BROZONE | |
| salon_phone | +48 000 000 000 | |
| salon_address | Targ Rybny 4, 70-535 Szczecin | |
| booking_min_hours_ahead | 2 | blokada rezerwacji „na już" |
| booking_max_days_ahead | 60 | jak daleko w przód |
| vip_visits_threshold | 10 | od ilu wizyt znacznik VIP |
| require_deposit_tattoo | tak | |
| sms_reminder_enabled | nie | |
| timezone | Europe/Warsaw | |
