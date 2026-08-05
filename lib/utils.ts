import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClockTime, ISODate } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------- money ----------------------------------- */

export function plnFormat(value: number, opts: { compact?: boolean; sign?: boolean } = {}) {
  const formatted = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: opts.compact ? 0 : 2,
    minimumFractionDigits: opts.compact ? 0 : 2,
    notation: opts.compact ? "compact" : "standard",
  }).format(value);
  return opts.sign && value > 0 ? `+${formatted}` : formatted;
}

export function numberFormat(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

export function pctFormat(value: number, fractionDigits = 0) {
  return `${value > 0 ? "+" : ""}${numberFormat(value, fractionDigits)}%`;
}

/* -------------------------------- time ----------------------------------- */

export const WEEKDAYS_PL = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
export const WEEKDAYS_PL_LONG = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];
export const MONTHS_PL = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień",
];

/** local-safe ISO date (no UTC shift) */
export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISODate(s: ISODate): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: ISODate, days: number): ISODate {
  const d = fromISODate(date);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** ISO weekday: 1 = Monday … 7 = Sunday */
export function isoWeekday(date: ISODate): number {
  const wd = fromISODate(date).getDay();
  return wd === 0 ? 7 : wd;
}

export function startOfWeek(date: ISODate): ISODate {
  return addDays(date, -(isoWeekday(date) - 1));
}

export function weekDates(date: ISODate): ISODate[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthMatrix(date: ISODate): ISODate[] {
  const d = fromISODate(date);
  const first = toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
  const gridStart = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function formatDatePL(date: ISODate, style: "short" | "long" | "day" = "short") {
  const d = fromISODate(date);
  if (style === "day") return `${d.getDate()}`;
  if (style === "long")
    return `${WEEKDAYS_PL_LONG[isoWeekday(date) - 1]}, ${d.getDate()} ${MONTHS_PL[d.getMonth()]} ${d.getFullYear()}`;
  return `${`${d.getDate()}`.padStart(2, "0")}.${`${d.getMonth() + 1}`.padStart(2, "0")}.${d.getFullYear()}`;
}

export function minutesFromClock(t: ClockTime): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function clockFromMinutes(min: number): ClockTime {
  const m = ((min % 1440) + 1440) % 1440;
  return `${`${Math.floor(m / 60)}`.padStart(2, "0")}:${`${m % 60}`.padStart(2, "0")}`;
}

export function addMinutes(t: ClockTime, min: number): ClockTime {
  return clockFromMinutes(minutesFromClock(t) + min);
}

export function durationLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function hoursBetween(start: ClockTime, end: ClockTime, breakMin = 0) {
  const raw = minutesFromClock(end) - minutesFromClock(start) - breakMin;
  return Math.max(0, Math.round((raw / 60) * 100) / 100);
}

export function relativeTimePL(iso: string, now = new Date()) {
  const diff = (now.getTime() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "przed chwilą";
  if (diff < 3600) return `${Math.floor(diff / 60)} min temu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`;
  const days = Math.floor(diff / 86400);
  return days === 1 ? "1 dzień temu" : `${days} dni temu`;
}

/* ------------------------------ misc ------------------------------------- */

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function sum<T>(items: T[], get: (item: T) => number) {
  return items.reduce((acc, item) => acc + get(item), 0);
}

export function groupBy<T, K extends string>(items: T[], key: (item: T) => K) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** deterministic pseudo-random so SSR and client agree */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* --------------------------- CSV / export -------------------------------- */

export function toCSV(rows: Record<string, string | number>[], headers?: string[]) {
  if (!rows.length) return "";
  const cols = headers ?? Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(";"), ...rows.map((r) => cols.map((c) => escape(r[c])).join(";"))].join("\n");
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
