"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import type { Appointment, Barber } from "@/lib/types";
import { barberDayWindow } from "@/lib/availability";
import {
  addMinutes,
  clockFromMinutes,
  cn,
  minutesFromClock,
  plnFormat,
} from "@/lib/utils";
import { useClientMap, useServiceMap } from "@/lib/store";
import { SourceBadge } from "./shared";

const DEFAULT_START = 9 * 60;
const DEFAULT_END = 21 * 60 + 30;
const SNAP = 15;

export interface DropProposal {
  appointment: Appointment;
  barberId: string;
  start: string;
  date: string;
}

export function DayGrid({
  date,
  barbers,
  appointments,
  onSelect,
  onPropose,
  compact = false,
  showNow = true,
}: {
  date: string;
  barbers: Barber[];
  appointments: Appointment[];
  onSelect?: (a: Appointment) => void;
  onPropose?: (p: DropProposal) => void;
  compact?: boolean;
  showNow?: boolean;
}) {
  const clientMap = useClientMap();
  const serviceMap = useServiceMap();
  const pxPerMin = compact ? 0.62 : 1.05;
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<{ barberId: string; min: number } | null>(null);
  const [nowMin, setNowMin] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!showNow) return;
    const update = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [showNow]);

  const startMin = DEFAULT_START;
  const endMin = DEFAULT_END;
  const height = (endMin - startMin) * pxPerMin;

  const hourMarks = React.useMemo(() => {
    const marks: number[] = [];
    for (let m = startMin; m <= endMin; m += 60) marks.push(m);
    return marks;
  }, [startMin, endMin]);

  const handleDrop = (barberId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    const appointment = appointments.find((a) => a.id === id);
    setDragId(null);
    setHover(null);
    if (!appointment || !onPropose) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const raw = startMin + offset / pxPerMin;
    const snapped = Math.round(raw / SNAP) * SNAP;
    const start = clockFromMinutes(Math.max(startMin, Math.min(endMin - appointment.durationMin, snapped)));
    if (appointment.barberId === barberId && appointment.start === start) return;
    onPropose({ appointment, barberId, start, date });
  };

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-max"
        style={{ gridTemplateColumns: `56px repeat(${barbers.length}, minmax(${compact ? 132 : 176}px, 1fr))` }}
      >
        {/* header */}
        <div className="sticky left-0 z-20 border-b border-r border-[var(--border)] bg-[var(--panel)]" />
        {barbers.map((b) => {
          const window = barberDayWindow(b, date);
          const dayApts = appointments.filter(
            (a) => a.barberId === b.id && a.status !== "cancelled",
          );
          return (
            <div
              key={b.id}
              className="border-b border-r border-[var(--border)] bg-[var(--panel)] px-2.5 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: b.color }} />
                <span className="truncate text-[12px] font-medium">{b.name}</span>
              </div>
              <div className="mt-0.5 truncate text-[10px] text-[var(--fg-subtle)]">
                {window ? `${window.start}–${window.end} · ${dayApts.length} wizyt` : "Dzień wolny"}
              </div>
            </div>
          );
        })}

        {/* time gutter */}
        <div
          className="sticky left-0 z-10 border-r border-[var(--border)] bg-[var(--panel)]"
          style={{ height }}
        >
          {hourMarks.map((m, i) => (
            <div
              key={m}
              className="absolute pr-2 text-right text-[10px] tabular text-[var(--fg-subtle)]"
              style={{
                top: (m - startMin) * pxPerMin,
                width: 56,
                // don't clip the first label against the header
                transform: i === 0 ? "none" : "translateY(-50%)",
              }}
            >
              {clockFromMinutes(m)}
            </div>
          ))}
        </div>

        {/* columns */}
        {barbers.map((b) => {
          const window = barberDayWindow(b, date);
          const items = appointments.filter((a) => a.barberId === b.id);
          return (
            <div
              key={b.id}
              className="relative border-r border-[var(--border)]"
              style={{ height }}
              onDragOver={(e) => {
                if (!onPropose) return;
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                const raw = startMin + (e.clientY - rect.top) / pxPerMin;
                setHover({ barberId: b.id, min: Math.round(raw / SNAP) * SNAP });
              }}
              onDragLeave={() => setHover((h) => (h?.barberId === b.id ? null : h))}
              onDrop={(e) => handleDrop(b.id, e)}
            >
              {/* closed overlay */}
              {!window ? (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--bg-sunken),var(--bg-sunken)_6px,transparent_6px,transparent_12px)] opacity-60" />
              ) : (
                <>
                  <div
                    className="absolute inset-x-0 bg-[var(--bg-sunken)] opacity-50"
                    style={{ top: 0, height: (minutesFromClock(window.start) - startMin) * pxPerMin }}
                  />
                  <div
                    className="absolute inset-x-0 bg-[var(--bg-sunken)] opacity-50"
                    style={{
                      top: (minutesFromClock(window.end) - startMin) * pxPerMin,
                      bottom: 0,
                    }}
                  />
                </>
              )}

              {/* hour lines */}
              {hourMarks.map((m) => (
                <div
                  key={m}
                  className="pointer-events-none absolute inset-x-0 border-t border-[var(--border)]"
                  style={{ top: (m - startMin) * pxPerMin }}
                />
              ))}
              {hourMarks.map((m) => (
                <div
                  key={`h${m}`}
                  className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[var(--border)] opacity-40"
                  style={{ top: (m + 30 - startMin) * pxPerMin }}
                />
              ))}

              {/* drop indicator */}
              {hover?.barberId === b.id ? (
                <div
                  className="pointer-events-none absolute inset-x-1 z-20 rounded border border-dashed border-[var(--brass)] bg-[color-mix(in_oklab,var(--brass)_12%,transparent)]"
                  style={{
                    top: (hover.min - startMin) * pxPerMin,
                    height: 28,
                  }}
                >
                  <span className="px-1.5 text-[10px] tabular text-[var(--brass)]">
                    {clockFromMinutes(hover.min)}
                  </span>
                </div>
              ) : null}

              {/* appointments */}
              {items.map((a) => {
                const top = (minutesFromClock(a.start) - startMin) * pxPerMin;
                const h = Math.max(22, a.durationMin * pxPerMin - 2);
                const client = clientMap.get(a.clientId);
                const service = serviceMap.get(a.serviceIds[0]);
                const cancelled = a.status === "cancelled" || a.status === "no_show";
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    draggable={Boolean(onPropose) && !cancelled}
                    onDragStart={(e) => {
                      const ev = e as unknown as React.DragEvent;
                      ev.dataTransfer?.setData("text/plain", a.id);
                      setDragId(a.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setHover(null);
                    }}
                    onClick={() => onSelect?.(a)}
                    className={cn(
                      "group absolute inset-x-1 z-10 cursor-pointer overflow-hidden rounded-md border px-1.5 py-1 text-left transition-shadow",
                      "hover:z-30 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.8)]",
                      dragId === a.id && "opacity-40",
                      cancelled && "opacity-45 saturate-0",
                    )}
                    style={{
                      top,
                      height: h,
                      borderColor: `color-mix(in oklab, ${b.color} 55%, transparent)`,
                      background: `linear-gradient(180deg, color-mix(in oklab, ${b.color} 22%, var(--panel)), color-mix(in oklab, ${b.color} 11%, var(--panel)))`,
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 w-0.5"
                      style={{ background: b.color }}
                    />
                    <div className="flex items-center gap-1 pl-1">
                      <span className="text-[10px] font-semibold tabular">{a.start}</span>
                      {a.conflict && !a.conflict.resolved ? (
                        <span className="size-1.5 rounded-full bg-[var(--warn)]" />
                      ) : null}
                      {a.status === "no_show" ? (
                        <span className="text-[9px] uppercase text-[var(--danger)]">no-show</span>
                      ) : null}
                    </div>
                    {h > 30 ? (
                      <div className="truncate pl-1 text-[11px] font-medium leading-tight">
                        {client?.name ?? "Klient"}
                      </div>
                    ) : null}
                    {h > 48 ? (
                      <div className="truncate pl-1 text-[10px] leading-tight text-[var(--fg-muted)]">
                        {service?.name}
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}

              {/* now marker */}
              {showNow && nowMin !== null && nowMin > startMin && nowMin < endMin ? (
                <div
                  className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                  style={{ top: (nowMin - startMin) * pxPerMin }}
                >
                  <span className="size-1.5 rounded-full bg-[var(--danger)]" />
                  <span className="h-px flex-1 bg-[var(--danger)] opacity-70" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- detail summary ---------------------------- */

export function AppointmentSummary({ appointment }: { appointment: Appointment }) {
  const clientMap = useClientMap();
  const serviceMap = useServiceMap();
  const client = clientMap.get(appointment.clientId);

  return (
    <div className="space-y-2 text-[12px]">
      <div className="flex items-center gap-2 text-[var(--fg-muted)]">
        <User className="size-3.5" /> {client?.name}
      </div>
      <div className="flex items-center gap-2 text-[var(--fg-muted)]">
        <Clock className="size-3.5" /> {appointment.start}–
        {addMinutes(appointment.start, appointment.durationMin)}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <SourceBadge source={appointment.source} />
        <span className="text-[var(--fg-muted)]">
          {appointment.serviceIds.map((id) => serviceMap.get(id)?.name).filter(Boolean).join(" + ")}
        </span>
        <span className="ml-auto font-semibold tabular">{plnFormat(appointment.price)}</span>
      </div>
    </div>
  );
}
