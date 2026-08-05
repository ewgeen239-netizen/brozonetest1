import type { Appointment, Barber, ClockTime, ISODate, Service } from "./types";
import { addMinutes, clockFromMinutes, isoWeekday, minutesFromClock } from "./utils";

export interface Slot {
  time: ClockTime;
  available: boolean;
  reason?: "busy" | "closed" | "past";
}

const SLOT_STEP = 15;

export function barberDayWindow(barber: Barber, date: ISODate) {
  if (barber.daysOff.includes(date)) return null;
  const hours = barber.workingHours.find((h) => h.weekday === isoWeekday(date));
  if (!hours?.enabled) return null;
  return { start: hours.start, end: hours.end };
}

export function busyRanges(appointments: Appointment[], barberId: string, date: ISODate) {
  return appointments
    .filter(
      (a) =>
        a.barberId === barberId &&
        a.date === date &&
        a.status !== "cancelled" &&
        a.status !== "no_show",
    )
    .map((a) => ({
      from: minutesFromClock(a.start),
      to: minutesFromClock(a.start) + a.durationMin,
    }));
}

export function slotsFor({
  barber,
  date,
  service,
  appointments,
  now = new Date(),
}: {
  barber: Barber;
  date: ISODate;
  service: Service;
  appointments: Appointment[];
  now?: Date;
}): Slot[] {
  const window = barberDayWindow(barber, date);
  if (!window) return [];

  const busy = busyRanges(appointments, barber.id, date);
  const startMin = minutesFromClock(window.start);
  const endMin = minutesFromClock(window.end);
  const todayISO = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}`;
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const slots: Slot[] = [];
  for (let t = startMin; t + service.durationMin <= endMin; t += SLOT_STEP) {
    const overlaps = busy.some((b) => t < b.to && t + service.durationMin > b.from);
    const isPast = date < todayISO || (date === todayISO && t < nowMin + 30);
    slots.push({
      time: clockFromMinutes(t),
      available: !overlaps && !isPast,
      reason: isPast ? "past" : overlaps ? "busy" : undefined,
    });
  }
  return slots;
}

export function occupancyFor({
  barber,
  date,
  appointments,
}: {
  barber: Barber;
  date: ISODate;
  appointments: Appointment[];
}) {
  const window = barberDayWindow(barber, date);
  if (!window) return { booked: 0, capacity: 0, pct: 0 };
  const capacity = minutesFromClock(window.end) - minutesFromClock(window.start);
  const booked = appointments
    .filter(
      (a) =>
        a.barberId === barber.id &&
        a.date === date &&
        a.status !== "cancelled" &&
        a.status !== "no_show",
    )
    .reduce((acc, a) => acc + a.durationMin, 0);
  return { booked, capacity, pct: capacity ? Math.round((booked / capacity) * 100) : 0 };
}

export function endTime(a: Appointment): ClockTime {
  return addMinutes(a.start, a.durationMin);
}
