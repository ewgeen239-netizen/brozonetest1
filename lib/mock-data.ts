import type {
  Appointment,
  AppointmentSource,
  AppointmentStatus,
  Barber,
  BooksyConfig,
  BooksySyncLog,
  CashOperation,
  CashReport,
  Client,
  PaymentMethod,
  ProductUsageEntry,
  Review,
  Service,
  TimeEntry,
  WorkShift,
} from "./types";
import {
  addDays,
  addMinutes,
  clockFromMinutes,
  hoursBetween,
  isoWeekday,
  minutesFromClock,
  seeded,
  sum,
  toISODate,
} from "./utils";

/* --------------------------------------------------------------------------
   Deterministic mock dataset. Everything hangs off TODAY so the demo always
   looks live; a seeded PRNG keeps SSR and client renders identical.
-------------------------------------------------------------------------- */

export const TODAY = toISODate(new Date());
const rnd = seeded(20260805);
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
const between = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));

/**
 * Real Booksy profile of the shop.
 * The widget loader is the snippet Booksy generates for business 287574.
 */
export const BOOKSY = {
  businessId: "287574",
  country: "pl",
  /** widget UI language — "pl" | "uk" | "en" … */
  lang: "pl",
  profileUrl:
    "https://booksy.com/pl-pl/287574_brozone_barber-shop_18078_szczecin",
  get widgetScriptUrl() {
    return `https://booksy.com/widget/code.js?id=${this.businessId}&country=${this.country}&lang=${this.lang}`;
  },
};

export const SALON = {
  name: "BROZONE",
  tagline: "Barber Shop · Szczecin",
  // adres z wizytówki Booksy; telefon / e-mail / NIP do uzupełnienia
  street: "Targ Rybny 4",
  city: "70-535 Szczecin",
  phone: "",
  email: "",
  nip: "",
  mapsUrl: "https://maps.google.com/?q=Targ+Rybny+4,+70-535+Szczecin",
  booksyUrl: BOOKSY.profileUrl,
  openHours: [
    { day: "Poniedziałek – Sobota", hours: "10:00 – 20:00" },
    { day: "Niedziela", hours: "10:00 – 19:00" },
  ],
  company: "Brozone sp. z o.o.",
  instagram: "https://www.instagram.com/brozone.szczecin/",
  facebook: "https://www.facebook.com/brozoneszczecin",
  rating: 4.9,
  reviewCount: 150,
  geo: { lat: 53.42495, lng: 14.56196 },
  /** zdjęcia z profilu Booksy */
  logoUrl:
    "https://d375139ucebi94.cloudfront.net/region2/pl/287574/logo/fafa11d906764a40a8cef545c5f4c3-brozone-logo-8aaf68c5a93e4cfcaacd41fc4ed24c-booksy.jpeg",
  photoUrl:
    "https://d375139ucebi94.cloudfront.net/region2/pl/287574/biz_photo/4298b5559a4147f394e0d3a1d1858a-brozone-biz-photo-b92347d677b641dfb5a64294b0bb5a-booksy.jpeg",
  /** galeria realizacji z profilu Booksy */
  gallery: [
    "https://d375139ucebi94.cloudfront.net/region2/pl/287574/inspiration/2bbbfddb6a7c46d88d0a3e5cb49a55-brozone-inspiration-5ce2bcd09999484eaba906828e22f4-booksy.jpeg",
    "https://d375139ucebi94.cloudfront.net/region2/pl/287574/inspiration/a12dc29d02804d6c92eba149f1ca67-brozone-inspiration-f4d80834214c4e1786d9956df2c389-booksy.jpeg",
    "https://d375139ucebi94.cloudfront.net/region2/pl/287574/inspiration/a9a6437474494f3d911ca52406912f-brozone-inspiration-2d6154b8cf7d4b4b98fad6f9704ffd-booksy.jpeg",
    "https://d375139ucebi94.cloudfront.net/region2/pl/287574/inspiration/be07a54612ed466491ece806d75c9b-brozone-inspiration-c30817faea7745a8b5ae5865816335-booksy.jpeg",
    "https://d375139ucebi94.cloudfront.net/region2/pl/287574/inspiration/c002f21d5b484be9884127624d8624-brozone-inspiration-2f4ac26891344e7694ae87e11cf011-booksy.jpeg",
    "https://d375139ucebi94.cloudfront.net/region2/pl/287574/inspiration/d1bc57d751004e3e97280391b1dc19-brozone-inspiration-546c1c7ee89f4c98a11700471532e8-booksy.jpeg",
    "https://d375139ucebi94.cloudfront.net/region2/pl/287574/inspiration/d89a3a92e34e473b939d705f52dfa8-brozone-inspiration-56588e57e7f9420c89df35598ce3f3-booksy.jpeg",
    "https://d375139ucebi94.cloudfront.net/region2/pl/287574/inspiration/df2e98f4ce554bda889e191b4ac09b-brozone-inspiration-9dbeefa491bc48ff9d2e7d9cb49ebe-booksy.jpeg",
  ],
};

/** address line that skips the blanks until real data is filled in */
export const salonAddress = [SALON.street, SALON.city].filter(Boolean).join(", ");

/* ------------------------------- services -------------------------------- */

export const services: Service[] = [
  {
    id: "srv_strzyzenie_krotkie_wlosy",
    name: "Strzyżenie krótkie włosy 💈 Mens Haircut",
    nameEn: "Mens haircut",
    category: "hair",
    durationMin: 60,
    price: 80,
    currency: "PLN",
    description: "Męskie strzyżenie w trzech poziomach doświadczenia: junior, barber, senior.",
    active: true,
    popularity: 98,
    variants: [
      { label: "Ilia", price: 80, durationMin: 60 },
      { label: "MAX & OLGA", price: 100, durationMin: 60 },
      { label: "OLA & WALERA", price: 90, durationMin: 60 },
    ],
  },
  {
    id: "srv_strzyzenie_dlugie_wlosy",
    name: "Strzyżenie długie włosy",
    nameEn: "Long hair cut",
    category: "hair",
    durationMin: 70,
    price: 120,
    currency: "PLN",
    description: "Strzyżenie i modelowanie dłuższych męskich włosów.",
    active: true,
    popularity: 44,
    variants: [
      { label: "Standard", price: 120, durationMin: 70 },
    ],
  },
  {
    id: "srv_trymowanie_brody",
    name: "Trymowanie brody",
    nameEn: "Beard trim",
    category: "beard",
    durationMin: 40,
    price: 70,
    currency: "PLN",
    description: "Profesjonalne trymowanie brody dopasowane do kształtu twarzy.",
    active: true,
    popularity: 86,
    variants: [
      { label: "OLA & WALERA", price: 80, durationMin: 40 },
      { label: "Illia", price: 70, durationMin: 40 },
      { label: "MAX & OLGA", price: 90, durationMin: 40 },
    ],
  },
  {
    id: "srv_combo_haircut_and",
    name: "COMBO 💈 Haircut and beard",
    nameEn: "Cut + beard",
    category: "combo",
    durationMin: 90,
    price: 120,
    currency: "PLN",
    description: "Strzyżenie włosów plus pełna pielęgnacja zarostu — 2 w 1.",
    active: true,
    popularity: 94,
    variants: [
      { label: "OLA & WALERA", price: 135, durationMin: 90 },
      { label: "Illia", price: 120, durationMin: 90 },
      { label: "MAX & OLGA", price: 150, durationMin: 90 },
    ],
  },
  {
    id: "srv_combo_na_lyso",
    name: "COMBO na Łyso",
    nameEn: "Head shave combo",
    category: "combo",
    durationMin: 60,
    price: 130,
    currency: "PLN",
    description: "Golenie głowy golarką lub brzytwą wraz z pielęgnacją brody.",
    active: true,
    popularity: 62,
    variants: [
      { label: "Z golarką", price: 130, durationMin: 60 },
      { label: "Z brzytwą", price: 180, durationMin: 90 },
    ],
  },
  {
    id: "srv_combo_cover",
    name: "COMBO + COVER",
    nameEn: "Cut, beard + grey cover",
    category: "combo",
    durationMin: 120,
    price: 180,
    currency: "PLN",
    description: "Strzyżenie, broda i kamuflaż siwizny w jednej wizycie.",
    active: true,
    popularity: 55,
    variants: [
      { label: "OLA & WALERA & ILLIA", price: 180, durationMin: 120 },
      { label: "MAX & OLGA", price: 210, durationMin: 120 },
    ],
  },
  {
    id: "srv_farbowanie_w_jeden",
    name: "Farbowanie w jeden kolor",
    nameEn: "Single colour",
    category: "color",
    durationMin: 90,
    price: 280,
    currency: "PLN",
    description: "Koloryzacja męska w jednym odcieniu.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 280, durationMin: 90 },
    ],
  },
  {
    id: "srv_trwala_ondulacja_meska",
    name: "Trwała ondulacja męska krótkie (8cm-15cm)",
    nameEn: "Mens perm — short",
    category: "care",
    durationMin: 150,
    price: 290,
    currency: "PLN",
    description: "Trwała ondulacja męska krótkie (8cm-15cm) — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 290, durationMin: 150 },
    ],
  },
  {
    id: "srv_trwala_ondulacja_dluga",
    name: "Trwała ondulacja męska włosy długie (od 15 cm)",
    nameEn: "Mens perm — long",
    category: "care",
    durationMin: 150,
    price: 350,
    currency: "PLN",
    description: "Trwała ondulacja męska włosy długie (od 15 cm) — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 350, durationMin: 150 },
    ],
  },
  {
    id: "srv_tonowanie_wlosow_cover",
    name: "Tonowanie włosów (COVER)",
    nameEn: "Grey cover toning",
    category: "color",
    durationMin: 40,
    price: 90,
    currency: "PLN",
    description: "Tonowanie, które odświeża kolor i maskuje siwiznę.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 90, durationMin: 40 },
    ],
  },
  {
    id: "srv_pasemka",
    name: "Pasemka",
    nameEn: "Highlights",
    category: "color",
    durationMin: 160,
    price: 350,
    currency: "PLN",
    description: "Pasemka — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 350, durationMin: 160 },
    ],
  },
  {
    id: "srv_dekoloryzacja_tonowanie",
    name: "Dekoloryzacja + Tonowanie",
    nameEn: "Bleach + toning",
    category: "color",
    durationMin: 240,
    price: 400,
    currency: "PLN",
    description: "Dekoloryzacja + Tonowanie — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 400, durationMin: 240 },
    ],
  },
  {
    id: "srv_konsultacja_probna_pasma",
    name: "Konsultacja+Próbna pasma dekoloryzacja",
    nameEn: "Bleach consultation",
    category: "color",
    durationMin: 60,
    price: 70,
    currency: "PLN",
    description: "Konsultacja+Próbna pasma dekoloryzacja — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 70, durationMin: 60 },
    ],
  },
  {
    id: "srv_konsultacja_probna_trwala",
    name: "Konsultacja+Próbna pasma trwała",
    nameEn: "Perm consultation",
    category: "care",
    durationMin: 60,
    price: 70,
    currency: "PLN",
    description: "Konsultacja+Próbna pasma trwała — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 70, durationMin: 60 },
    ],
  },
  {
    id: "srv_strzyzenie_damskie",
    name: "Strzyżenie damskie",
    nameEn: "Womens cut",
    category: "hair",
    durationMin: 60,
    price: 130,
    currency: "PLN",
    description: "Damskie strzyżenie i modelowanie.",
    active: true,
    popularity: 48,
    variants: [
      { label: "Olga", price: 140, durationMin: 60 },
      { label: "Walera", price: 130, durationMin: 60 },
    ],
  },
  {
    id: "srv_farbowanie_wlosow_w",
    name: "Farbowanie włosów w jeden kolor (bez strzyżenia)",
    nameEn: "Colour, no cut",
    category: "color",
    durationMin: 150,
    price: 360,
    currency: "PLN",
    description: "Farbowanie włosów w jeden kolor (bez strzyżenia) — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Krótkie włosy", price: 360, durationMin: 150 },
      { label: "Średnie włosy", price: 400, durationMin: 150 },
      { label: "Długi włosy", price: 470, durationMin: 180 },
    ],
  },
  {
    id: "srv_farbowanie_kolor_strzyzenie",
    name: "Farbowanie w jeden color + Strzyżenie",
    nameEn: "Colour + cut",
    category: "color",
    durationMin: 180,
    price: 450,
    currency: "PLN",
    description: "Farbowanie w jeden color + Strzyżenie — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Krótkie włosy", price: 450, durationMin: 180 },
      { label: "Średnie włosy", price: 480, durationMin: 180 },
      { label: "Długi włosy", price: 520, durationMin: 210 },
    ],
  },
  {
    id: "srv_tonowanie_odswiezenie_koloru",
    name: "Tonowanie (odświeżenie koloru)",
    nameEn: "Toning refresh",
    category: "color",
    durationMin: 60,
    price: 170,
    currency: "PLN",
    description: "Tonowanie (odświeżenie koloru) — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Krótkie włosy (do 35cm)", price: 170, durationMin: 60 },
      { label: "Długi włosy ( powyżej 35cm)", price: 250, durationMin: 90 },
    ],
  },
  {
    id: "srv_pasemka_bez_strzyzenia",
    name: "Pasemka (bez strzyżenia)",
    nameEn: "Highlights, no cut",
    category: "color",
    durationMin: 180,
    price: 420,
    currency: "PLN",
    description: "Pasemka (bez strzyżenia) — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Krótkie włosy (do 20cm)", price: 420, durationMin: 180 },
      { label: "Średnie włosy (20-35cm)", price: 480, durationMin: 180 },
      { label: "Długi włosy ( powyżej 35cm)", price: 530, durationMin: 210 },
    ],
  },
  {
    id: "srv_dekoloryzacja_tylko_po",
    name: "Dekoloryzacja ( tylko po konsultacji)",
    nameEn: "Bleaching",
    category: "color",
    durationMin: 210,
    price: 350,
    currency: "PLN",
    description: "Dekoloryzacja ( tylko po konsultacji) — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Dekoloryzacja odrosty (2-3cm) + tonowanie", price: 350, durationMin: 210 },
      { label: "Krótkie włosy (do 25cm)", price: 450, durationMin: 300 },
      { label: "Długi włosy (powyżej 25cm, zależy od długości i gęstości)", price: 600, durationMin: 360 },
    ],
  },
  {
    id: "srv_technika_airtach_balejag",
    name: "Technika Airtach\\Balejag\\Ombre (bez strzyżenia)",
    nameEn: "Airtouch / balayage / ombre",
    category: "color",
    durationMin: 300,
    price: 600,
    currency: "PLN",
    description: "Technika Airtach\\Balejag\\Ombre (bez strzyżenia) — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 600, durationMin: 300 },
    ],
  },
  {
    id: "srv_trwala_ondulacja_tylko",
    name: "Trwała ondulacja (tylko po konsultacji)",
    nameEn: "Perm",
    category: "care",
    durationMin: 150,
    price: 290,
    currency: "PLN",
    description: "Trwała ondulacja (tylko po konsultacji) — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Średnie włosy (15-35cm)", price: 360, durationMin: 150 },
      { label: "Krótkie włosy (do 15cm)", price: 290, durationMin: 150 },
      { label: "Długi włosy ( powyżej 35cm, cena zależy od długości i gęstości a także od technik kręcenia)", price: 450, durationMin: 240 },
    ],
  },
  {
    id: "srv_modelowanie_wlosow",
    name: "Modelowanie włosów",
    nameEn: "Blow-dry styling",
    category: "hair",
    durationMin: 30,
    price: 80,
    currency: "PLN",
    description: "Modelowanie włosów — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Krótkie\\Średnie", price: 80, durationMin: 30 },
      { label: "Długi włosy", price: 110, durationMin: 45 },
    ],
  },
  {
    id: "srv_regeneracja_wlosow_egobond",
    name: "Regeneracja włosów EgoBond",
    nameEn: "EgoBond treatment",
    category: "care",
    durationMin: 30,
    price: 50,
    currency: "PLN",
    description: "Regeneracja włosów EgoBond — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "EgoBond + do farby", price: 50, durationMin: 30 },
      { label: "Osobny zabieg", price: 200, durationMin: 90 },
    ],
  },
  {
    id: "srv_darsonwalizacja_na_wlosy",
    name: "Darsonwalizacja na włosy",
    nameEn: "Darsonval scalp therapy",
    category: "care",
    durationMin: 30,
    price: 50,
    currency: "PLN",
    description: "Darsonwalizacja na włosy — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Bez mycia głowy", price: 50, durationMin: 30 },
      { label: "Mycie+Darsonwalizacja", price: 90, durationMin: 60 },
    ],
  },
  {
    id: "srv_modelowanie_lokowka_prostownica",
    name: "Modelowanie lokówka\\prostownica",
    nameEn: "Curling / straightening",
    category: "hair",
    durationMin: 90,
    price: 200,
    currency: "PLN",
    description: "Modelowanie lokówka\\prostownica — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 200, durationMin: 90 },
    ],
  },
  {
    id: "srv_afroloki_lokowka",
    name: "Afroloki (lokówka)",
    nameEn: "Afro curls",
    category: "hair",
    durationMin: 180,
    price: 300,
    currency: "PLN",
    description: "Afroloki (lokówka) — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 300, durationMin: 180 },
    ],
  },
  {
    id: "srv_fryzura_wieczorowa_po",
    name: "Fryzura wieczorowa ( po konsultacji)",
    nameEn: "Evening updo",
    category: "care",
    durationMin: 90,
    price: 200,
    currency: "PLN",
    description: "Fryzura wieczorowa ( po konsultacji) — usługa z cennika BROZONE.",
    active: true,
    popularity: 25,
    variants: [
      { label: "Standard", price: 200, durationMin: 90 },
    ],
  },
];

export const serviceById = (id: string) => services.find((s) => s.id === id);

/* -------------------------------- barbers -------------------------------- */

/** salon is open 7 days: Mon–Sat 10:00–20:00, Sun 10:00–19:00 */
const stdHours = (from: string, to: string, offDays: number[] = []) =>
  Array.from({ length: 7 }, (_, i) => ({
    weekday: i + 1,
    start: from,
    end: i + 1 === 7 ? "19:00" : to,
    enabled: !offDays.includes(i + 1),
  }));

/**
 * Real BROZONE team as published on the Booksy profile.
 * Booksy prices per tier: JUNIOR 80 zł · BARBER 90 zł · SENIOR 100 zł.
 * No staff photos are published, so the UI falls back to initials avatars.
 */

const MENS = [
  "srv_strzyzenie_krotkie_wlosy",
  "srv_strzyzenie_dlugie_wlosy",
  "srv_trymowanie_brody",
  "srv_combo_haircut_and",
  "srv_combo_na_lyso",
  "srv_combo_cover",
];

const COLOR = [
  "srv_farbowanie_w_jeden",
  "srv_tonowanie_wlosow_cover",
  "srv_pasemka",
  "srv_dekoloryzacja_tonowanie",
  "srv_konsultacja_probna_pasma",
  "srv_farbowanie_wlosow_w",
  "srv_farbowanie_kolor_strzyzenie",
  "srv_tonowanie_odswiezenie_koloru",
  "srv_pasemka_bez_strzyzenia",
  "srv_dekoloryzacja_tylko_po",
  "srv_technika_airtach_balejag",
];

const CARE = [
  "srv_trwala_ondulacja_meska",
  "srv_trwala_ondulacja_dluga",
  "srv_trwala_ondulacja_tylko",
  "srv_konsultacja_probna_trwala",
  "srv_regeneracja_wlosow_egobond",
  "srv_darsonwalizacja_na_wlosy",
];

const STYLING = [
  "srv_strzyzenie_damskie",
  "srv_modelowanie_wlosow",
  "srv_modelowanie_lokowka_prostownica",
  "srv_afroloki_lokowka",
  "srv_fryzura_wieczorowa_po",
];

export const barbers: Barber[] = [
  {
    id: "brb_max",
    name: "Max Siwy",
    nickname: "SENIOR",
    photoUrl: "",
    specialization: "Senior barber · fade & broda",
    serviceIds: MENS,
    workingHours: stdHours("10:00", "20:00", [7]),
    daysOff: [addDays(TODAY, 9), addDays(TODAY, 10)],
    commissionPct: 50,
    color: "#c8a55b",
    booksyProfileUrl: BOOKSY.profileUrl,
    phone: "",
    email: "",
    hiredAt: "2021-06-01",
    status: "active",
    rating: 4.9,
  },
  {
    id: "brb_olga",
    name: "Olga Wizard",
    nickname: "SENIOR",
    photoUrl: "",
    specialization: "Senior stylist · koloryzacja & trwała",
    serviceIds: [...MENS, ...COLOR, ...CARE, ...STYLING],
    workingHours: stdHours("10:00", "20:00", [1]),
    daysOff: [],
    commissionPct: 50,
    color: "#9d7bff",
    booksyProfileUrl: BOOKSY.profileUrl,
    phone: "",
    email: "",
    hiredAt: "2021-06-01",
    status: "active",
    rating: 4.9,
  },
  {
    id: "brb_walera",
    name: "Walera",
    nickname: "BARBER",
    photoUrl: "",
    specialization: "Barber · strzyżenie & koloryzacja",
    serviceIds: [...MENS, ...STYLING, "srv_farbowanie_w_jeden", "srv_tonowanie_wlosow_cover"],
    workingHours: stdHours("10:00", "20:00", [7]),
    daysOff: [addDays(TODAY, 3)],
    commissionPct: 40,
    color: "#4cc2ff",
    booksyProfileUrl: BOOKSY.profileUrl,
    phone: "",
    email: "",
    hiredAt: "2022-09-01",
    status: "active",
    rating: 4.8,
  },
  {
    id: "brb_ilia",
    name: "Ilia",
    nickname: "JUNIOR",
    photoUrl: "",
    specialization: "Junior barber",
    serviceIds: [
      "srv_strzyzenie_krotkie_wlosy",
      "srv_trymowanie_brody",
      "srv_combo_haircut_and",
      "srv_combo_na_lyso",
      "srv_combo_cover",
    ],
    workingHours: stdHours("10:00", "20:00", [2]),
    daysOff: [],
    commissionPct: 32,
    color: "#3ecf8e",
    booksyProfileUrl: BOOKSY.profileUrl,
    phone: "",
    email: "",
    hiredAt: "2024-03-01",
    status: "active",
    rating: 4.8,
  },
];

export const activeBarbers = barbers.filter((b) => b.status === "active");
export const barberById = (id: string) => barbers.find((b) => b.id === id);

/* -------------------------------- clients -------------------------------- */

const firstNames = [
  "Adam", "Bartosz", "Cezary", "Damian", "Emil", "Filip", "Grzegorz", "Hubert",
  "Igor", "Jakub", "Kamil", "Łukasz", "Michał", "Norbert", "Oskar", "Paweł",
  "Radosław", "Sebastian", "Tomasz", "Wojciech", "Zbigniew", "Artur", "Krystian",
  "Maciej", "Patryk", "Szymon", "Konrad", "Mateusz",
];
const lastNames = [
  "Kowalski", "Nowak", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski",
  "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Jankowski",
  "Mazur", "Krawczyk", "Piotrowski", "Grabowski", "Pawłowski", "Michalski",
  "Adamczyk", "Dudek", "Zając", "Wieczorek", "Jabłoński", "Król", "Majewski",
];

export const clients: Client[] = Array.from({ length: 64 }, (_, i) => {
  const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 7) % lastNames.length]}`;
  const visits = between(1, 42);
  const noShows = rnd() > 0.82 ? between(1, 3) : 0;
  const tier =
    noShows >= 2 ? "risk" : visits > 24 ? "vip" : visits > 5 ? "regular" : "new";
  return {
    id: `cli_${(i + 1).toString().padStart(3, "0")}`,
    name,
    phone: `+48 ${between(500, 799)} ${between(100, 999)} ${between(100, 999)}`,
    email: rnd() > 0.25 ? `${name.split(" ")[0].toLowerCase()}.${i}@mail.pl` : undefined,
    createdAt: addDays(TODAY, -between(20, 900)),
    visits,
    noShows,
    totalSpent: visits * between(90, 190),
    lastVisitAt: addDays(TODAY, -between(0, 120)),
    favoriteBarberId: pick(activeBarbers).id,
    favoriteServiceId: pick(services.filter((s) => s.active)).id,
    tier: tier as Client["tier"],
    notes: rnd() > 0.85 ? "Uczulenie na olejek cytrusowy." : undefined,
    marketingConsent: rnd() > 0.35,
  };
});

export const clientById = (id: string) => clients.find((c) => c.id === id);

/* ------------------------------ appointments ----------------------------- */

const sourceWeights: AppointmentSource[] = [
  "booksy", "booksy", "booksy", "booksy", "booksy",
  "website", "website", "website",
  "manual", "manual",
  "walkin",
];

/**
 * "Now" rounded down to the full hour. Rounding keeps the value identical
 * between the server render and hydration, so today's statuses never mismatch.
 */
const NOW_MIN = new Date().getHours() * 60;

function statusForDate(offsetDays: number, endMin: number): AppointmentStatus {
  if (offsetDays < 0) {
    const r = rnd();
    if (r > 0.94) return "no_show";
    if (r > 0.88) return "cancelled";
    return "completed";
  }
  if (offsetDays === 0) {
    // everything already finished today is settled, the rest is still ahead
    if (endMin <= NOW_MIN) {
      const r = rnd();
      if (r > 0.94) return "no_show";
      if (r > 0.9) return "cancelled";
      return "completed";
    }
    const r = rnd();
    if (r > 0.93) return "cancelled";
    if (r > 0.55) return "confirmed";
    return "booked";
  }
  return rnd() > 0.6 ? "confirmed" : "booked";
}

function buildAppointments(): Appointment[] {
  const list: Appointment[] = [];
  for (let offset = -21; offset <= 21; offset++) {
    const date = addDays(TODAY, offset);
    const wd = isoWeekday(date);
    if (wd === 7) continue;
    for (const barber of activeBarbers) {
      const hours = barber.workingHours.find((h) => h.weekday === wd);
      if (!hours?.enabled || barber.daysOff.includes(date)) continue;
      let cursor = minutesFromClock(hours.start) + between(0, 40);
      const endOfDay = minutesFromClock(hours.end);
      const load = wd === 6 ? 0.92 : wd === 5 ? 0.88 : 0.74;
      while (cursor < endOfDay - 45) {
        if (rnd() > load) {
          cursor += 30;
          continue;
        }
        const service = pick(services.filter((s) => s.active && barber.serviceIds.includes(s.id)));
        const withAddon = rnd() > 0.82 && service.category !== "combo";
        const addon = withAddon ? serviceById("srv_trymowanie_brody")! : undefined;
        const serviceIds = addon ? [service.id, addon.id] : [service.id];
        const duration = service.durationMin + (addon?.durationMin ?? 0);
        if (cursor + duration > endOfDay) break;
        const status = statusForDate(offset, cursor + duration);
        const client = pick(clients);
        const price = service.price + (addon?.price ?? 0);
        const paid: PaymentMethod =
          status === "completed" ? (rnd() > 0.52 ? "card" : "cash") : "unpaid";
        list.push({
          id: `apt_${date}_${barber.id}_${clockFromMinutes(cursor)}`.replace(/[:]/g, ""),
          clientId: client.id,
          barberId: barber.id,
          serviceIds,
          date,
          start: clockFromMinutes(cursor),
          durationMin: duration,
          status,
          source: pick(sourceWeights),
          price,
          paymentMethod: paid,
          tip: status === "completed" && rnd() > 0.6 ? between(1, 5) * 10 : undefined,
          note: rnd() > 0.9 ? "Klient prosi o krótsze boki." : undefined,
          createdAt: new Date(Date.now() - between(1, 30) * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - between(0, 5) * 86400000).toISOString(),
          booksyId: rnd() > 0.4 ? `BK-${between(100000, 999999)}` : undefined,
        });
        cursor += duration + (rnd() > 0.7 ? 15 : 0);
      }
    }
  }
  return list;
}

export const appointments: Appointment[] = buildAppointments();

/* two seeded conflicts so the resolver has something real to show */
const conflictTargets = appointments.filter((a) => a.date === addDays(TODAY, 1)).slice(0, 2);
conflictTargets.forEach((a, i) => {
  a.conflict = {
    detectedAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    field: i === 0 ? "start" : "multiple",
    local: i === 0 ? { start: a.start } : { start: a.start, barberId: a.barberId, price: a.price },
    remote:
      i === 0
        ? { start: addMinutes(a.start, 30) }
        : {
            start: addMinutes(a.start, -60),
            barberId: activeBarbers[(activeBarbers.findIndex((b) => b.id === a.barberId) + 1) % activeBarbers.length].id,
            price: a.price + 20,
          },
    resolved: false,
  };
  a.booksyId ??= `BK-${between(100000, 999999)}`;
});

/* ------------------------------- shifts ---------------------------------- */

export const workShifts: WorkShift[] = (() => {
  const list: WorkShift[] = [];
  for (let offset = -14; offset <= 21; offset++) {
    const date = addDays(TODAY, offset);
    const wd = isoWeekday(date);
    for (const barber of activeBarbers) {
      const hours = barber.workingHours.find((h) => h.weekday === wd);
      const isOff = !hours?.enabled;
      const vacation = barber.daysOff.includes(date);
      list.push({
        id: `shf_${date}_${barber.id}`,
        barberId: barber.id,
        date,
        kind: vacation ? "vacation" : isOff ? "off" : rnd() > 0.97 ? "sick" : "work",
        start: hours?.start ?? "00:00",
        end: hours?.end ?? "00:00",
        breakMin: isOff || vacation ? 0 : 30,
      });
    }
  }
  return list;
})();

/* ----------------------------- cash reports ------------------------------ */

function buildCashReport(date: string, offset: number): CashReport {
  const dayAppointments = appointments.filter(
    (a) => a.date === date && a.status === "completed",
  );
  const cashIncome = sum(
    dayAppointments.filter((a) => a.paymentMethod === "cash"),
    (a) => a.price,
  );
  const cardIncome = sum(
    dayAppointments.filter((a) => a.paymentMethod === "card"),
    (a) => a.price,
  );
  const tips = sum(dayAppointments, (a) => a.tip ?? 0);
  const payouts = between(0, 3) * 50;
  const openingCash = 500;
  const difference = offset === -2 ? -20 : offset === -6 ? 10 : 0;
  const closingCash = openingCash + cashIncome - payouts + difference;

  const operations: CashOperation[] = [
    {
      id: `op_${date}_open`,
      time: "09:45",
      kind: "deposit",
      title: "Pogotowie kasowe — stan otwarcia",
      amount: openingCash,
      method: "cash",
    },
    ...dayAppointments.slice(0, 14).map<CashOperation>((a) => ({
      id: `op_${a.id}`,
      time: a.start,
      kind: "income",
      title: `${serviceById(a.serviceIds[0])?.name ?? "Usługa"} — ${clientById(a.clientId)?.name ?? ""}`,
      amount: a.price,
      method: a.paymentMethod === "unpaid" ? "cash" : a.paymentMethod,
      barberId: a.barberId,
      appointmentId: a.id,
    })),
    ...(payouts
      ? [
          {
            id: `op_${date}_payout`,
            time: "16:20",
            kind: "payout" as const,
            title: "Zakup ręczników / drogeria",
            amount: -payouts,
            method: "cash" as const,
            document: `FV/${between(100, 999)}/${date.slice(0, 7)}`,
          },
        ]
      : []),
    ...(tips
      ? [
          {
            id: `op_${date}_tips`,
            time: "20:55",
            kind: "tip" as const,
            title: "Napiwki — pula dzienna",
            amount: tips,
            method: "cash" as const,
          },
        ]
      : []),
  ];

  // today's book is still open — nothing may be registered ahead of the clock
  const visibleOperations =
    offset === 0 ? operations.filter((o) => minutesFromClock(o.time) <= NOW_MIN) : operations;
  const effPayouts =
    offset === 0
      ? -sum(visibleOperations.filter((o) => o.kind === "payout"), (o) => o.amount)
      : payouts;
  const effTips =
    offset === 0 ? sum(visibleOperations.filter((o) => o.kind === "tip"), (o) => o.amount) : tips;

  return {
    id: `rk_${date}`,
    date,
    openingCash,
    cashIncome,
    cardIncome,
    transferIncome: 0,
    payouts: effPayouts,
    tips: effTips,
    closingCash: offset === 0 ? openingCash + cashIncome - effPayouts : closingCash,
    difference,
    responsiblePersonId: offset % 2 === 0 ? "brb_max" : "brb_olga",
    status: offset === 0 ? "open" : offset >= -2 ? "closed" : "approved",
    approvedBy: offset < -2 ? "Biuro rachunkowe" : undefined,
    approvedAt: offset < -2 ? new Date(Date.now() + offset * 86400000).toISOString() : undefined,
    operations: visibleOperations,
    note: offset === -2 ? "Różnica -20 zł: brak paragonu za kawę dla klienta." : undefined,
  };
}

export const cashReports: CashReport[] = Array.from({ length: 21 }, (_, i) =>
  buildCashReport(addDays(TODAY, -i), -i),
).filter((r) => isoWeekday(r.date) !== 7);

/* --------------------------- product usage ------------------------------- */

const products = [
  { name: "Reuzel Fiber Pomade", category: "styling" as const, unit: "g" as const, unitCost: 0.42 },
  { name: "American Crew Forming Cream", category: "styling" as const, unit: "g" as const, unitCost: 0.36 },
  { name: "Proraso Shave Cream", category: "shave" as const, unit: "ml" as const, unitCost: 0.28 },
  { name: "Olejek do brody BROZONE", category: "care" as const, unit: "ml" as const, unitCost: 0.9 },
  { name: "Szampon Depot No.101", category: "care" as const, unit: "ml" as const, unitCost: 0.22 },
  { name: "Kamuflaż Depot 606", category: "color" as const, unit: "ml" as const, unitCost: 1.4 },
  { name: "Żyletki Feather", category: "disposable" as const, unit: "szt" as const, unitCost: 2.6 },
  { name: "Ręcznik jednorazowy", category: "disposable" as const, unit: "szt" as const, unitCost: 0.85 },
  { name: "Barbicide koncentrat", category: "cleaning" as const, unit: "ml" as const, unitCost: 0.11 },
  { name: "Rękawiczki nitrylowe", category: "disposable" as const, unit: "para" as const, unitCost: 0.55 },
];

export const productUsage: ProductUsageEntry[] = (() => {
  const list: ProductUsageEntry[] = [];
  for (let offset = -30; offset <= 0; offset++) {
    const date = addDays(TODAY, offset);
    if (isoWeekday(date) === 7) continue;
    const count = between(3, 7);
    for (let i = 0; i < count; i++) {
      const product = pick(products);
      const amount =
        product.unit === "szt" || product.unit === "para" ? between(2, 18) : between(15, 140);
      list.push({
        id: `pu_${date}_${i}`,
        date,
        productName: product.name,
        category: product.category,
        amount,
        unit: product.unit,
        cost: Math.round(amount * product.unitCost * 100) / 100,
        barberId: pick(activeBarbers).id,
        serviceId: pick(services.filter((s) => s.active)).id,
        note: rnd() > 0.9 ? "Zużycie zbiorcze — dzień" : undefined,
      });
    }
  }
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
})();

/* --------------------------- time evidence ------------------------------- */

export const timeEntries: TimeEntry[] = workShifts
  .filter((s) => s.date <= TODAY && s.kind !== "off")
  .map((s) => {
    const overtime = rnd() > 0.86 ? Math.round(rnd() * 15) / 10 : 0;
    const end = s.kind === "work" ? addMinutes(s.end, overtime * 60) : s.end;
    const totalHours = s.kind === "work" ? hoursBetween(s.start, end, s.breakMin) : 8;
    return {
      id: `te_${s.id}`,
      barberId: s.barberId,
      date: s.date,
      start: s.kind === "work" ? s.start : "—",
      end: s.kind === "work" ? end : "—",
      breakMin: s.breakMin,
      totalHours,
      overtimeHours: overtime,
      kind: s.kind,
      approved: s.date < addDays(TODAY, -3),
      source: rnd() > 0.9 ? "manual" : "auto",
    } satisfies TimeEntry;
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

/* ------------------------------ booksy ----------------------------------- */

export const booksyConfig: BooksyConfig = {
  mode: "widget",
  businessUrl: SALON.booksyUrl,
  widgetUrl: BOOKSY.widgetScriptUrl,
  apiKeyMasked: "bk_live_••••••••••••4f21",
  webhookUrl: "https://brozone.pl/api/booksy/webhook",
  autoSyncEnabled: true,
  autoSyncIntervalMin: 15,
  lastSyncAt: new Date(Date.now() - 8 * 60000).toISOString(),
  connectionState: "connected",
};

export const syncLogs: BooksySyncLog[] = [
  {
    id: "sync_001",
    startedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    finishedAt: new Date(Date.now() - 8 * 60000 + 4200).toISOString(),
    mode: "import",
    trigger: "scheduled",
    imported: 6,
    updated: 3,
    skipped: 41,
    conflicts: 2,
    errors: 0,
    status: "partial",
    message: "Zaimportowano 6 nowych rezerwacji. 2 konflikty wymagają decyzji.",
    lines: [
      "GET /v1/businesses/48812/appointments?from=2026-08-05 → 200 (52 records)",
      "match by booksy_id … 41 unchanged",
      "insert apt_BK-482910, apt_BK-482915, apt_BK-482930 …",
      "conflict: apt_BK-471004 start differs (local 14:00 / remote 14:30)",
      "conflict: apt_BK-471190 barber + price differ",
    ],
  },
  {
    id: "sync_002",
    startedAt: new Date(Date.now() - 23 * 60000).toISOString(),
    finishedAt: new Date(Date.now() - 23 * 60000 + 3100).toISOString(),
    mode: "import",
    trigger: "scheduled",
    imported: 2,
    updated: 1,
    skipped: 48,
    conflicts: 0,
    errors: 0,
    status: "success",
    message: "Synchronizacja zakończona bez konfliktów.",
  },
  {
    id: "sync_003",
    startedAt: new Date(Date.now() - 62 * 60000).toISOString(),
    finishedAt: new Date(Date.now() - 62 * 60000 + 9000).toISOString(),
    mode: "import",
    trigger: "manual",
    imported: 0,
    updated: 0,
    skipped: 0,
    conflicts: 0,
    errors: 1,
    status: "error",
    message: "429 Too Many Requests — limit API Booksy. Ponowna próba za 15 min.",
    lines: ["GET /v1/businesses/48812/appointments → 429", "backoff scheduled +900s"],
  },
  {
    id: "sync_004",
    startedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    finishedAt: new Date(Date.now() - 5 * 3600000 + 15000).toISOString(),
    mode: "import",
    trigger: "csv",
    imported: 128,
    updated: 0,
    skipped: 4,
    conflicts: 0,
    errors: 0,
    status: "success",
    message: "Import pliku booksy-export-2026-07.csv (132 wiersze).",
  },
];

/* ------------------------------- reviews --------------------------------- */

/**
 * No invented reviews for a real business: the site shows the aggregate rating
 * straight from the Booksy profile and links out to the real ones.
 */
export const reviews: Review[] = [];

/* --------------------------- derived helpers ----------------------------- */

export function appointmentsOn(date: string) {
  return appointments
    .filter((a) => a.date === date)
    .sort((a, b) => minutesFromClock(a.start) - minutesFromClock(b.start));
}

export function revenueOn(date: string) {
  return sum(
    appointments.filter((a) => a.date === date && a.status === "completed"),
    (a) => a.price,
  );
}
