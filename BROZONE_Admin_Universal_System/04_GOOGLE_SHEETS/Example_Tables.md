# Przykładowe dane startowe

Do skopiowania wprost do arkusza przy pierwszym uruchomieniu.

## `services`

```
service_id,category,name,duration_minutes,price_from,price_to,deposit_required,active
srv_bar_strzyz,barber,Strzyżenie męskie,45,80,100,0,tak
srv_bar_broda,barber,Broda,30,70,90,0,tak
srv_bar_combo,barber,Combo włosy + broda,90,120,150,0,tak
srv_bar_fade,barber,Skin fade,45,100,100,0,tak
srv_bar_kids,barber,Strzyżenie dziecięce,30,60,60,0,tak
srv_tat_konsul,tattoo,Konsultacja tatuażu,30,0,0,0,tak
srv_tat_maly,tattoo,Mały tatuaż,60,300,600,100,tak
srv_tat_2h,tattoo,Sesja tattoo 2h,120,600,600,200,tak
srv_tat_4h,tattoo,Sesja tattoo 4h,240,1200,1200,300,tak
srv_tat_projekt,tattoo,Projekt indywidualny,60,0,0,200,tak
srv_mas_klas,massage,Masaż klasyczny 60 min,60,180,180,0,tak
srv_mas_sport,massage,Masaż sportowy 60 min,60,200,200,0,tak
srv_mas_relaks,massage,Masaż relaksacyjny 60 min,60,180,180,0,tak
srv_mas_plecy,massage,Masaż pleców 30 min,30,110,110,0,tak
```

## `staff`

```
staff_id,name,category,active,calendar_color,working_hours,specialization,commission_percent
stf_max,Max Siwy,barber,tak,#C8A55B,pn-sb 10:00-20:00,Fade & classic,50
stf_ilia,Ilia,barber,tak,#E0C07A,śr-nd 12:00-20:00,Junior barber,32
stf_walera,Walera,tattoo,tak,#4CC2FF,wt-sb 11:00-19:00,,
stf_ola,Ola Wizard,massage,tak,#3EA98C,pn-pt 09:00-18:00,relaksacyjny,
```

Kolumny właściwe dla tattoo (`style`, `portfolio_link`, `consultation_required`, `min_price`,
`deposit_required`) i massage (`room_number`) wypełnia się osobno — nie mieszczą się w jednym
przykładzie CSV, ale muszą istnieć w arkuszu.

## `permissions`

```
email,role,staff_id,active
wlasciciel@brozone.pl,admin,,tak
recepcja@brozone.pl,recepcja,,tak
max@brozone.pl,barber,stf_max,tak
walera@brozone.pl,tattoo,stf_walera,tak
ola@brozone.pl,massage,stf_ola,tak
ksiegowa@brozone.pl,viewer,,tak
```

## `bookings` — trzy przykłady

```
booking_id,date,time_start,time_end,category,service_id,service_name,staff_id,staff_name,client_name,client_phone,price,deposit,status,source
BZ-2026-0312-001,2026-03-12,10:00,10:45,barber,srv_bar_strzyz,Strzyżenie męskie,stf_max,Max Siwy,Marek Nowak,+48600111222,100,0,confirmed,website
BZ-2026-0312-002,2026-03-12,10:30,11:30,massage,srv_mas_klas,Masaż klasyczny 60 min,stf_ola,Ola Wizard,Anna Kowalska,+48600100200,180,0,new,website
BZ-2026-0312-003,2026-03-12,13:00,15:00,tattoo,srv_tat_2h,Sesja tattoo 2h,stf_walera,Walera,Piotr Zieliński,+48600333444,600,200,confirmed,phone
```

## `settings`

```
key,value
salon_name,BROZONE
salon_phone,+48 000 000 000
salon_address,Targ Rybny 4 70-535 Szczecin
booking_min_hours_ahead,2
booking_max_days_ahead,60
vip_visits_threshold,10
require_deposit_tattoo,tak
sms_reminder_enabled,nie
timezone,Europe/Warsaw
```
