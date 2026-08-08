import {
  Banknote,
  CalendarDays,
  CalendarRange,
  Clock4,
  LayoutDashboard,
  Package,
  RefreshCcw,
  Scissors,
  Settings,
  UserRound,
  Users,
  UserSquare2,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  en: string;
  icon: React.ElementType;
  group: "codzienne" | "zespół" | "finanse" | "system";
  /** klucz sekcji — decyduje, czy rola widzi pozycję (permissions.visibleSections) */
  section: string;
}

/**
 * Menu panelu. Kolejność odpowiada temu, jak często recepcja klika:
 * najpierw praca z wizytami, potem zespół, na końcu rzeczy właściciela.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin/moje-wizyty",
    label: "Moje wizyty",
    en: "Today",
    icon: UserRound,
    group: "codzienne",
    section: "moje-wizyty",
  },
  {
    href: "/admin",
    label: "Dashboard",
    en: "Dzisiaj",
    icon: LayoutDashboard,
    group: "codzienne",
    section: "dashboard",
  },
  {
    href: "/admin/rezerwacje",
    label: "Rezerwacje",
    en: "Bookings",
    icon: CalendarDays,
    group: "codzienne",
    section: "rezerwacje",
  },
  {
    href: "/admin/kalendarz",
    label: "Kalendarz",
    en: "Calendar",
    icon: CalendarRange,
    group: "codzienne",
    section: "kalendarz",
  },
  {
    href: "/admin/klienci",
    label: "Klienci",
    en: "Clients",
    icon: Users,
    group: "codzienne",
    section: "klienci",
  },

  {
    href: "/admin/pracownicy",
    label: "Pracownicy",
    en: "Staff",
    icon: UserSquare2,
    group: "zespół",
    section: "pracownicy",
  },
  {
    href: "/admin/uslugi",
    label: "Usługi i ceny",
    en: "Services",
    icon: Scissors,
    group: "zespół",
    section: "uslugi",
  },
  {
    href: "/admin/grafik",
    label: "Grafik pracy",
    en: "Schedule",
    icon: CalendarRange,
    group: "zespół",
    section: "grafik",
  },
  {
    href: "/admin/ewidencja",
    label: "Ewidencja czasu",
    en: "Time",
    icon: Clock4,
    group: "zespół",
    section: "ewidencja",
  },

  {
    href: "/admin/raport-kasowy",
    label: "Raport kasowy",
    en: "Cash",
    icon: Banknote,
    group: "finanse",
    section: "raport-kasowy",
  },
  {
    href: "/admin/raport-zuzycia",
    label: "Raport zużycia",
    en: "Products",
    icon: Package,
    group: "finanse",
    section: "raport-zuzycia",
  },

  {
    href: "/admin/booksy",
    label: "Booksy — import",
    en: "Import",
    icon: RefreshCcw,
    group: "system",
    section: "booksy",
  },
  {
    href: "/admin/ustawienia",
    label: "Ustawienia",
    en: "Settings",
    icon: Settings,
    group: "system",
    section: "ustawienia",
  },
];

export const NAV_GROUPS: { key: NavItem["group"]; label: string }[] = [
  { key: "codzienne", label: "Codzienna praca" },
  { key: "zespół", label: "Zespół i oferta" },
  { key: "finanse", label: "Finanse" },
  { key: "system", label: "System" },
];
