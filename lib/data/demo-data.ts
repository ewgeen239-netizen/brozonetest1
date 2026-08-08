import type { Booking, Client, Role, Service, Staff } from "@/lib/booking/types";

/* --------------------------------------------------------------------------
   Dane demonstracyjne dla trzech kategorii.
   Używane, dopóki właściciel nie podłączy Google Sheets (SHEETS_API_URL).
   Kształt 1:1 z arkuszem — podmiana źródła nie zmienia niczego w interfejsie.
-------------------------------------------------------------------------- */

const pad = (n: number) => `${n}`.padStart(2, "0");
export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDays = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return isoDate(dt);
};

export const TODAY = isoDate(new Date());

const week = (start: string, end: string, off: number[] = []) =>
  Array.from({ length: 7 }, (_, i) => ({
    weekday: (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
    start,
    end: i + 1 === 7 ? "19:00" : end,
    enabled: !off.includes(i + 1),
  }));

/* -------------------------------- services ------------------------------- */

export const demoServices: Service[] = [
  // Barber
  s("srv_bar_strzyz", "barber", "Strzyżenie męskie", 45, 80, 100, "Strzyżenie maszynką i nożyczkami, mycie, stylizacja."),
  s("srv_bar_broda", "barber", "Broda", 30, 70, 90, "Modelowanie brody, gorący ręcznik, brzytwa."),
  s("srv_bar_combo", "barber", "Combo włosy + broda", 90, 120, 150, "Strzyżenie i pełna pielęgnacja zarostu."),
  s("srv_bar_fade", "barber", "Skin fade", 45, 100, 100, "Precyzyjny fade do skóry."),
  s("srv_bar_kids", "barber", "Strzyżenie dziecięce", 30, 60, 60, "Dla klientów do 12 lat."),
  // Tattoo
  s("srv_tat_konsul", "tattoo", "Konsultacja tatuażu", 30, 0, 0, "Bezpłatna rozmowa o projekcie.", 0),
  s("srv_tat_maly", "tattoo", "Mały tatuaż", 60, 300, 600, "Projekt do 10 cm.", 100),
  s("srv_tat_2h", "tattoo", "Sesja tattoo 2h", 120, 600, 600, "Dwugodzinna sesja.", 200),
  s("srv_tat_4h", "tattoo", "Sesja tattoo 4h", 240, 1200, 1200, "Całodniowa sesja.", 300),
  s("srv_tat_projekt", "tattoo", "Projekt indywidualny", 60, 0, 0, "Wycena po konsultacji.", 200),
  // Massage
  s("srv_mas_klas", "massage", "Masaż klasyczny 60 min", 60, 180, 180, "Klasyczny masaż całego ciała."),
  s("srv_mas_sport", "massage", "Masaż sportowy 60 min", 60, 200, 200, "Dla osób aktywnych, mocniejszy nacisk."),
  s("srv_mas_relaks", "massage", "Masaż relaksacyjny 60 min", 60, 180, 180, "Spokojne tempo, olejki."),
  s("srv_mas_plecy", "massage", "Masaż pleców 30 min", 30, 110, 110, "Krótka sesja na plecy i kark."),
];

function s(
  serviceId: string,
  category: Service["category"],
  name: string,
  durationMinutes: number,
  priceFrom: number,
  priceTo: number,
  description: string,
  depositRequired = 0,
): Service {
  return {
    serviceId,
    category,
    name,
    description,
    durationMinutes,
    priceFrom,
    priceTo,
    depositRequired,
    active: true,
    assignedStaffIds: [],
  };
}

/* --------------------------------- staff --------------------------------- */

export const demoStaff: Staff[] = [
  {
    staffId: "stf_max",
    name: "Max Siwy",
    category: "barber",
    specialization: "Fade & classic",
    serviceIds: ["srv_bar_strzyz", "srv_bar_broda", "srv_bar_combo", "srv_bar_fade"],
    commissionPercent: 50,
    workingHours: week("10:00", "20:00", [7]),
    daysOff: [],
    calendarColor: "#C8A55B",
    active: true,
    showOnWebsite: true,
  },
  {
    staffId: "stf_ilia",
    name: "Ilia",
    category: "barber",
    specialization: "Junior barber",
    serviceIds: ["srv_bar_strzyz", "srv_bar_broda", "srv_bar_combo", "srv_bar_kids"],
    commissionPercent: 32,
    workingHours: week("12:00", "20:00", [1, 2]),
    daysOff: [],
    calendarColor: "#E0C07A",
    active: true,
    showOnWebsite: true,
  },
  {
    staffId: "stf_walera",
    name: "Walera",
    category: "tattoo",
    style: "blackwork",
    instagram: "@brozone.tattoo",
    consultationRequired: true,
    minPrice: 300,
    depositRequired: 200,
    workingHours: week("11:00", "19:00", [1, 7]),
    daysOff: [],
    calendarColor: "#4CC2FF",
    active: true,
    showOnWebsite: true,
  },
  {
    staffId: "stf_nika",
    name: "Nika",
    category: "tattoo",
    style: "fine line",
    instagram: "@nika.ink",
    consultationRequired: false,
    minPrice: 250,
    depositRequired: 150,
    workingHours: week("12:00", "20:00", [1, 2]),
    daysOff: [],
    calendarColor: "#7FD4FF",
    active: true,
    showOnWebsite: true,
  },
  {
    staffId: "stf_ola",
    name: "Ola Wizard",
    category: "massage",
    specialization: "relaksacyjny",
    serviceIds: ["srv_mas_klas", "srv_mas_relaks", "srv_mas_plecy"],
    roomNumber: "1",
    workingHours: week("09:00", "18:00", [6, 7]),
    daysOff: [],
    calendarColor: "#3EA98C",
    active: true,
    showOnWebsite: true,
  },
  {
    staffId: "stf_tomek",
    name: "Tomek Bąk",
    category: "massage",
    specialization: "sportowy",
    serviceIds: ["srv_mas_sport", "srv_mas_klas", "srv_mas_plecy"],
    roomNumber: "2",
    workingHours: week("10:00", "19:00", [7]),
    daysOff: [],
    calendarColor: "#67C9AE",
    active: true,
    showOnWebsite: true,
  },
];

/* -------------------------------- clients -------------------------------- */

const CLIENT_NAMES = [
  "Marek Nowak", "Anna Kowalska", "Piotr Zieliński", "Kamil Wójcik", "Ewa Lewandowska",
  "Jakub Kamiński", "Michał Szymański", "Zofia Woźniak", "Tomasz Dąbrowski", "Natalia Kozłowska",
  "Bartosz Jankowski", "Ola Mazur", "Adam Krawczyk", "Julia Piotrowska", "Rafał Grabowski",
  "Karolina Nowicka", "Damian Pawłowski", "Weronika Michalska", "Sebastian Adamczyk", "Iga Dudek",
];

export const demoClients: Client[] = CLIENT_NAMES.map((name, i) => ({
  clientId: `cli_${pad(i + 1)}`,
  name,
  phone: `+4860${(i % 9) + 1}${pad(100 + i)}${pad(200 + i)}`,
  email: i % 3 === 0 ? `${name.split(" ")[0].toLowerCase()}${i}@mail.pl` : undefined,
  tags: i % 7 === 0 ? ["VIP"] : i < 4 ? ["nowy"] : [],
  totalVisits: (i * 3) % 14,
  noShows: i % 9 === 0 ? 1 : 0,
  lastVisit: addDays(TODAY, -((i * 5) % 60)),
  consentMarketing: i % 2 === 0,
  consentRodo: true,
  createdAt: addDays(TODAY, -((i * 17) % 400)),
}));

/* ------------------------------ uprawnienia ------------------------------ */

export interface PermissionRow {
  email: string;
  role: Role;
  staffId?: string;
  active: boolean;
}

/**
 * Kto ma dostęp do panelu. W wersji z Google Sheets to zakładka `permissions`.
 * Adres właściciela bierzemy z OWNER_EMAIL, żeby nie trzymać go w kodzie.
 */
export const demoPermissions: PermissionRow[] = [
  { email: (process.env.OWNER_EMAIL ?? "wlasciciel@brozone.pl").toLowerCase(), role: "admin", active: true },
  { email: "recepcja@brozone.pl", role: "recepcja", active: true },
  { email: "max@brozone.pl", role: "barber", staffId: "stf_max", active: true },
  { email: "ilia@brozone.pl", role: "barber", staffId: "stf_ilia", active: true },
  { email: "walera@brozone.pl", role: "tattoo", staffId: "stf_walera", active: true },
  { email: "nika@brozone.pl", role: "tattoo", staffId: "stf_nika", active: true },
  { email: "ola@brozone.pl", role: "massage", staffId: "stf_ola", active: true },
  { email: "tomek@brozone.pl", role: "massage", staffId: "stf_tomek", active: true },
];

/* ------------------------------- bookings -------------------------------- */

const STATUSES = ["confirmed", "confirmed", "new", "completed"] as const;
const SOURCES = ["website", "website", "phone", "manual", "walk_in"] as const;

function minutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function clock(min: number) {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

/** deterministyczny generator — ten sam wynik na serwerze i w przeglądarce */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function buildDemoBookings(): Booking[] {
  const rnd = rng(4242);
  const out: Booking[] = [];
  let counter = 0;

  for (let offset = -10; offset <= 14; offset++) {
    const date = addDays(TODAY, offset);
    const [y, m, d] = date.split("-").map(Number);
    const weekday = ((new Date(y, m - 1, d).getDay() + 6) % 7) + 1;

    for (const staff of demoStaff) {
      const hours = staff.workingHours.find((h) => h.weekday === weekday);
      if (!hours?.enabled) continue;

      const services = demoServices.filter(
        (s) => s.category === staff.category && s.active,
      );
      let cursor = minutes(hours.start) + Math.floor(rnd() * 3) * 30;
      const end = minutes(hours.end);

      while (cursor < end - 45) {
        if (rnd() > 0.62) {
          cursor += 30;
          continue;
        }
        const service = services[Math.floor(rnd() * services.length)];
        if (cursor + service.durationMinutes > end) break;

        const client = demoClients[Math.floor(rnd() * demoClients.length)];
        const status =
          offset < 0
            ? rnd() > 0.9
              ? "no_show"
              : "completed"
            : offset === 0
              ? STATUSES[Math.floor(rnd() * STATUSES.length)]
              : rnd() > 0.55
                ? "confirmed"
                : "new";

        counter += 1;
        out.push({
          bookingId: `BZ-${date.replace(/-/g, "")}-${pad(counter % 999)}`,
          date,
          timeStart: clock(cursor),
          timeEnd: clock(cursor + service.durationMinutes),
          category: staff.category,
          serviceId: service.serviceId,
          serviceName: service.name,
          staffId: staff.staffId,
          staffName: staff.name,
          clientId: client.clientId,
          clientName: client.name,
          clientPhone: client.phone,
          clientEmail: client.email,
          price: service.priceFrom,
          deposit: service.depositRequired,
          paymentMethod:
            status === "completed" ? (rnd() > 0.45 ? "cash" : "card") : "unpaid",
          tip: status === "completed" && rnd() > 0.75 ? Math.round(rnd() * 4 + 1) * 10 : undefined,
          status,
          source: SOURCES[Math.floor(rnd() * SOURCES.length)],
          notes: rnd() > 0.9 ? "Klient prosił o kontakt dzień wcześniej." : undefined,
          tattoo:
            staff.category === "tattoo"
              ? {
                  idea: "Geometryczny wzór na przedramieniu, czarno-biały.",
                  placement: "przedramię",
                  size: "10–20 cm",
                  consultationDone: rnd() > 0.5,
                }
              : undefined,
          massage:
            staff.category === "massage"
              ? {
                  pressure: (["lekki", "średni", "mocny"] as const)[Math.floor(rnd() * 3)],
                  focus: (["plecy", "szyja", "nogi", "całe ciało"] as const)[
                    Math.floor(rnd() * 4)
                  ],
                  contraindications: rnd() > 0.85 ? "Świeża kontuzja barku." : undefined,
                }
              : undefined,
          consentRodo: true,
          consentMarketing: rnd() > 0.5,
          createdAt: `${addDays(date, -Math.floor(rnd() * 10) - 1)} 12:00:00`,
          updatedAt: `${date} 08:00:00`,
          syncStatus: "synced",
        });

        cursor += service.durationMinutes + (rnd() > 0.7 ? 15 : 0);
      }
    }
  }
  return out;
}
