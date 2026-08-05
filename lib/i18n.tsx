"use client";

import * as React from "react";

/* --------------------------------------------------------------------------
   Site copy in three languages. Service and barber names stay as published on
   Booksy — only the interface around them is translated.
-------------------------------------------------------------------------- */

export const LANGS = ["pl", "ru", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABEL: Record<Lang, string> = {
  pl: "PL",
  ru: "RU",
  en: "EN",
};

const pl = {
  nav: {
    booking: "Rezerwacja",
    services: "Usługi",
    barbers: "Barberzy",
    gallery: "Realizacje",
    reviews: "Opinie",
    contact: "Kontakt",
    cta: "Zarezerwuj wizytę",
    panel: "BROZONE OS — panel właściciela",
    menu: "Menu",
    language: "Język",
  },
  hero: {
    badge: "BARBER SHOP · SZCZECIN · TARG RYBNY 4",
    lead: "Fade, broda, brzytwa. Precyzja bez pośpiechu, rezerwacja w 30 sekund.",
    sub: "Sharp cuts. Zero waiting. Book in 30 seconds.",
    cta: "Zarezerwuj wizytę",
    scroll: "Rezerwacja",
    statReviews: "opinii w Booksy",
    statOpen: "Otwarte 7 dni w tygodniu",
    statBarbers: "Barberów w zespole",
  },
  booking: {
    eyebrow: "Rezerwacja · Booking",
    title: "Zarezerwuj w trzech krokach",
    slotsFree: "wolnych terminów",
    stepService: "Usługa",
    stepServiceEn: "Service",
    stepBarber: "Barber",
    stepBarberEn: "Specialist",
    stepDate: "Termin",
    stepDateEn: "Date & time",
    anyBarber: "Dowolny barber",
    anyBarberHint: "Najszybszy termin",
    noSchedule: "Brak grafiku w tym dniu",
    noScheduleHint: "Wybierz inny dzień lub barbera.",
    pickTime: "wybierz godzinę",
    cta: "Rezerwuj przez Booksy",
    note:
      "Rezerwacja finalizowana w Booksy — tam potwierdzisz numer telefonu i otrzymasz przypomnienie SMS. Termin wybrany tutaj zostanie przekazany do formularza Booksy.",
  },
  services: {
    eyebrow: "Usługi · Services",
    title: "Cennik prosto z Booksy",
    from: "od",
    variants: "warianty ceny",
    popular: "Najczęściej wybierane",
    more: "Pokaż pozostałe usługi",
    less: "Zwiń usługi",
    servicesCount: "usług",
    priceNote: "Ceny i czasy zgodne z profilem Booksy.",
  },
  gallery: {
    eyebrow: "Realizacje · Work",
    title: "Prace z profilu Booksy",
    action: "Zobacz w Booksy",
    note: "Zdjęcia opublikowane przez salon na profilu Booksy.",
    prev: "Poprzednie zdjęcie",
    next: "Następne zdjęcie",
    close: "Zamknij",
  },
  barbers: {
    eyebrow: "Zespół · Crew",
    title: "Ludzie, nie fotele",
    profile: "Profil w Booksy",
  },
  reviews: {
    eyebrow: "Opinie · Reviews",
    title: "Oceny prosto z Booksy",
    action: "Przeczytaj opinie",
    caption: "zweryfikowanych opinii w Booksy",
    fact1Title: "Tylko realne opinie",
    fact1Body:
      "Ocena pochodzi z profilu Booksy — wystawiają ją klienci po zrealizowanej wizycie.",
    fact2Title: "Otwarte 7 dni",
    fact2Body: "Poniedziałek – sobota 10:00–20:00, niedziela 10:00–19:00.",
    fact3Title: "Ścisłe centrum",
    fact3Body: "Łasztownia, tuż przy Targu Rybnym.",
    fact4Title: "Rezerwacja w 30 sekund",
    fact4Body: "Wybierz usługę i termin powyżej, resztę dokończysz w Booksy.",
  },
  contact: {
    eyebrow: "Kontakt · Find us",
    address: "Adres",
    phone: "Telefon",
    email: "E-mail",
    hours: "Godziny",
    navigate: "Nawiguj",
    weekdays: "Poniedziałek – Sobota",
    sunday: "Niedziela",
  },
  footer: {
    booking: "Rezerwacje obsługiwane przez Booksy.",
    rights: "Wszelkie prawa zastrzeżone.",
  },
} as const;

/** widen the `as const` literals so translations only have to match the shape */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
type Dict = Widen<typeof pl>;

const ru: Dict = {
  nav: {
    booking: "Запись",
    services: "Услуги",
    barbers: "Барберы",
    gallery: "Работы",
    reviews: "Отзывы",
    contact: "Контакты",
    cta: "Записаться",
    panel: "BROZONE OS — панель владельца",
    menu: "Меню",
    language: "Язык",
  },
  hero: {
    badge: "BARBER SHOP · ЩЕЦИН · TARG RYBNY 4",
    lead: "Фейд, борода, бритва. Точность без спешки, запись за 30 секунд.",
    sub: "Sharp cuts. Zero waiting. Book in 30 seconds.",
    cta: "Записаться",
    scroll: "Запись",
    statReviews: "отзывов в Booksy",
    statOpen: "Работаем 7 дней в неделю",
    statBarbers: "Барбера в команде",
  },
  booking: {
    eyebrow: "Запись · Booking",
    title: "Запишитесь в три шага",
    slotsFree: "свободных слотов",
    stepService: "Услуга",
    stepServiceEn: "Service",
    stepBarber: "Барбер",
    stepBarberEn: "Specialist",
    stepDate: "Дата и время",
    stepDateEn: "Date & time",
    anyBarber: "Любой барбер",
    anyBarberHint: "Ближайшее время",
    noSchedule: "В этот день нет графика",
    noScheduleHint: "Выберите другой день или барбера.",
    pickTime: "выберите время",
    cta: "Записаться через Booksy",
    note:
      "Запись завершается в Booksy — там подтвердите номер телефона и получите SMS-напоминание. Выбранные здесь услуга и время передаются в форму Booksy.",
  },
  services: {
    eyebrow: "Услуги · Services",
    title: "Прайс прямо из Booksy",
    from: "от",
    variants: "варианта цены",
    popular: "Выбирают чаще всего",
    more: "Показать остальные услуги",
    less: "Свернуть услуги",
    servicesCount: "услуг",
    priceNote: "Цены и длительность соответствуют профилю Booksy.",
  },
  gallery: {
    eyebrow: "Работы · Work",
    title: "Работы из профиля Booksy",
    action: "Смотреть в Booksy",
    note: "Фотографии опубликованы салоном в профиле Booksy.",
    prev: "Предыдущее фото",
    next: "Следующее фото",
    close: "Закрыть",
  },
  barbers: {
    eyebrow: "Команда · Crew",
    title: "Люди, а не кресла",
    profile: "Профиль в Booksy",
  },
  reviews: {
    eyebrow: "Отзывы · Reviews",
    title: "Оценки прямо из Booksy",
    action: "Читать отзывы",
    caption: "проверенных отзывов в Booksy",
    fact1Title: "Только реальные отзывы",
    fact1Body: "Оценка берётся из профиля Booksy — её ставят клиенты после визита.",
    fact2Title: "Работаем 7 дней",
    fact2Body: "Понедельник – суббота 10:00–20:00, воскресенье 10:00–19:00.",
    fact3Title: "Самый центр",
    fact3Body: "Лаштовня, рядом с Рыбным рынком.",
    fact4Title: "Запись за 30 секунд",
    fact4Body: "Выберите услугу и время выше, остальное — в Booksy.",
  },
  contact: {
    eyebrow: "Контакты · Find us",
    address: "Адрес",
    phone: "Телефон",
    email: "E-mail",
    hours: "Часы работы",
    navigate: "Маршрут",
    weekdays: "Понедельник – суббота",
    sunday: "Воскресенье",
  },
  footer: {
    booking: "Запись обслуживается через Booksy.",
    rights: "Все права защищены.",
  },
};

const en: Dict = {
  nav: {
    booking: "Booking",
    services: "Services",
    barbers: "Barbers",
    gallery: "Work",
    reviews: "Reviews",
    contact: "Contact",
    cta: "Book a visit",
    panel: "BROZONE OS — owner panel",
    menu: "Menu",
    language: "Language",
  },
  hero: {
    badge: "BARBER SHOP · SZCZECIN · TARG RYBNY 4",
    lead: "Fade, beard, straight razor. Precision without the rush, booking in 30 seconds.",
    sub: "Sharp cuts. Zero waiting. Book in 30 seconds.",
    cta: "Book a visit",
    scroll: "Booking",
    statReviews: "Booksy reviews",
    statOpen: "Open 7 days a week",
    statBarbers: "Barbers on the team",
  },
  booking: {
    eyebrow: "Booking · Rezerwacja",
    title: "Book in three steps",
    slotsFree: "slots available",
    stepService: "Service",
    stepServiceEn: "Usługa",
    stepBarber: "Barber",
    stepBarberEn: "Specialist",
    stepDate: "Date & time",
    stepDateEn: "Termin",
    anyBarber: "Any barber",
    anyBarberHint: "Earliest slot",
    noSchedule: "No shift on this day",
    noScheduleHint: "Pick another day or barber.",
    pickTime: "pick a time",
    cta: "Book via Booksy",
    note:
      "Booking is completed in Booksy — you confirm your phone number there and get an SMS reminder. The service and slot picked here are passed to the Booksy form.",
  },
  services: {
    eyebrow: "Services · Usługi",
    title: "Price list straight from Booksy",
    from: "from",
    variants: "price tiers",
    popular: "Most booked",
    more: "Show remaining services",
    less: "Collapse services",
    servicesCount: "services",
    priceNote: "Prices and durations match the Booksy profile.",
  },
  gallery: {
    eyebrow: "Work · Realizacje",
    title: "Cuts from the Booksy profile",
    action: "See on Booksy",
    note: "Photos published by the shop on its Booksy profile.",
    prev: "Previous photo",
    next: "Next photo",
    close: "Close",
  },
  barbers: {
    eyebrow: "Crew · Zespół",
    title: "People, not chairs",
    profile: "Booksy profile",
  },
  reviews: {
    eyebrow: "Reviews · Opinie",
    title: "Ratings straight from Booksy",
    action: "Read the reviews",
    caption: "verified Booksy reviews",
    fact1Title: "Real reviews only",
    fact1Body: "The rating comes from the Booksy profile — clients leave it after a visit.",
    fact2Title: "Open 7 days",
    fact2Body: "Monday – Saturday 10:00–20:00, Sunday 10:00–19:00.",
    fact3Title: "City centre",
    fact3Body: "Łasztownia, right by the Fish Market.",
    fact4Title: "Booking in 30 seconds",
    fact4Body: "Pick a service and a slot above, finish in Booksy.",
  },
  contact: {
    eyebrow: "Contact · Kontakt",
    address: "Address",
    phone: "Phone",
    email: "E-mail",
    hours: "Opening hours",
    navigate: "Directions",
    weekdays: "Monday – Saturday",
    sunday: "Sunday",
  },
  footer: {
    booking: "Bookings handled by Booksy.",
    rights: "All rights reserved.",
  },
};

const DICTS: Record<Lang, Dict> = { pl, ru, en };

/** Booksy widget locale for each site language (Booksy has no ru UI) */
export const BOOKSY_LOCALE: Record<Lang, string> = { pl: "pl", ru: "uk", en: "en" };

interface LanguageValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const LanguageContext = React.createContext<LanguageValue>({
  lang: "pl",
  setLang: () => {},
  t: pl,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("pl");

  React.useEffect(() => {
    const stored = localStorage.getItem("brozone-lang") as Lang | null;
    if (stored && LANGS.includes(stored)) setLangState(stored);
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("brozone-lang", l);
    document.documentElement.lang = l;
  }, []);

  const value = React.useMemo(() => ({ lang, setLang, t: DICTS[lang] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => React.useContext(LanguageContext);
