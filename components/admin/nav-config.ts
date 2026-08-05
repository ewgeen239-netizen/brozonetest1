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
  Users,
  UserSquare2,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  en: string;
  icon: React.ElementType;
  group: "operacje" | "zespół" | "finanse" | "system";
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", en: "Overview", icon: LayoutDashboard, group: "operacje" },
  {
    href: "/admin/rezerwacje",
    label: "Rezerwacje",
    en: "Appointments",
    icon: CalendarDays,
    group: "operacje",
  },
  { href: "/admin/klienci", label: "Klienci", en: "Clients", icon: Users, group: "operacje" },
  { href: "/admin/uslugi", label: "Usługi", en: "Services", icon: Scissors, group: "operacje" },

  {
    href: "/admin/barberzy",
    label: "Barberzy",
    en: "Barbers",
    icon: UserSquare2,
    group: "zespół",
  },
  {
    href: "/admin/grafik",
    label: "Grafik pracy",
    en: "Schedule",
    icon: CalendarRange,
    group: "zespół",
  },
  {
    href: "/admin/ewidencja",
    label: "Ewidencja czasu pracy",
    en: "Time evidence",
    icon: Clock4,
    group: "zespół",
  },

  {
    href: "/admin/raport-kasowy",
    label: "Raport kasowy",
    en: "Cash report",
    icon: Banknote,
    group: "finanse",
  },
  {
    href: "/admin/raport-zuzycia",
    label: "Raport zużycia",
    en: "Product usage",
    icon: Package,
    group: "finanse",
  },

  {
    href: "/admin/booksy",
    label: "Booksy Sync",
    en: "Integration",
    icon: RefreshCcw,
    group: "system",
  },
  {
    href: "/admin/ustawienia",
    label: "Ustawienia",
    en: "Settings",
    icon: Settings,
    group: "system",
  },
];

export const NAV_GROUPS: { key: NavItem["group"]; label: string }[] = [
  { key: "operacje", label: "Operacje" },
  { key: "zespół", label: "Zespół" },
  { key: "finanse", label: "Finanse" },
  { key: "system", label: "System" },
];
