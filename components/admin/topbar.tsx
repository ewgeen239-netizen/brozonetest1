"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Eye,
  EyeOff,
  LogOut,
  Menu,
  Moon,
  RefreshCcw,
  Search,
  Settings,
  Sun,
  UserCog,
} from "lucide-react";
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
} from "@/components/ui/misc";
import { useStore } from "@/lib/store";
import { ROLE_LABEL } from "@/lib/booking/types";
import { useMe } from "@/lib/booking/use-api";
import { logout } from "@/app/login/actions";
import { useTheme } from "@/components/theme-provider";
import { cn, formatDatePL, relativeTimePL } from "@/lib/utils";

export function Topbar({
  onOpenCommand,
  onOpenSidebar,
  minimal = false,
}: {
  onOpenCommand: () => void;
  onOpenSidebar: () => void;
  /** widok pracownika: bez wyszukiwarki, synchronizacji i powiadomień */
  minimal?: boolean;
}) {
  const { booksy, syncing, runSync, today, appointments } = useStore();
  const { theme, toggle } = useTheme();
  const { data: me } = useMe();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const conflicts = appointments.filter(
    (a) => a.conflict && !a.conflict.resolved,
  ).length;

  const stateTone =
    booksy.connectionState === "connected"
      ? "var(--ok)"
      : booksy.connectionState === "degraded"
        ? "var(--warn)"
        : "var(--fg-subtle)";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-elevated)_88%,transparent)] px-3 backdrop-blur-xl sm:px-4">
      {!minimal ? (
        <button
          onClick={onOpenSidebar}
          className="grid size-9 shrink-0 place-items-center rounded-md border border-[var(--border-strong)] lg:hidden"
          aria-label="Menu"
        >
          <Menu className="size-4" />
        </button>
      ) : null}

      {minimal ? (
        <span className="text-[13px] font-bold tracking-[0.18em]">BROZONE</span>
      ) : (
        /* command / search */
        <button
          onClick={onOpenCommand}
          className="group flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] px-3 text-left transition-colors hover:border-[var(--accent)] md:max-w-md"
        >
          <Search className="size-3.5 shrink-0 text-[var(--fg-subtle)]" />
          <span className="truncate text-[13px] text-[var(--fg-subtle)]">
            Search clients, appointments, barbers…
          </span>
          <kbd className="ml-auto hidden shrink-0 rounded border border-[var(--border-strong)] bg-[var(--panel)] px-1.5 py-0.5 text-[10px] text-[var(--fg-subtle)] sm:block">
            ⌘K
          </kbd>
        </button>
      )}

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* date */}
        <div className={cn("hidden text-right", minimal ? "" : "lg:block")}>
          <div className="text-[12px] font-medium leading-tight">
            {formatDatePL(today, "long")}
          </div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--fg-subtle)]">
            Salon otwarty · 10:00–21:00
          </div>
        </div>

        <span className="hidden h-6 w-px bg-[var(--border)] lg:block" />

        {!minimal ? (
          <>
            {/* booksy sync status */}
            <Tooltip
              content={
                booksy.lastSyncAt
                  ? `Ostatnia synchronizacja ${relativeTimePL(booksy.lastSyncAt)}`
                  : "Brak synchronizacji"
              }
            >
              <button
                onClick={() => runSync()}
                disabled={syncing}
                className="flex h-9 items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--panel-muted)] px-2.5 text-[12px] transition-colors hover:border-[var(--accent)] disabled:opacity-70"
              >
                <span className="relative flex size-1.5">
                  <span
                    className="absolute inline-flex size-full animate-ping rounded-full opacity-70"
                    style={{ background: stateTone }}
                  />
                  <span
                    className="relative inline-flex size-1.5 rounded-full"
                    style={{ background: stateTone }}
                  />
                </span>
                <span className="hidden sm:inline">Booksy</span>
                <RefreshCcw
                  className={cn("size-3.5", syncing && "animate-spin")}
                />
              </button>
            </Tooltip>

            {/* notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative grid size-9 place-items-center rounded-md text-[var(--fg-muted)] transition-colors hover:bg-[var(--panel-muted)] hover:text-[var(--fg)]">
                  <Bell className="size-4" />
                  {conflicts ? (
                    <span className="absolute right-1.5 top-1.5 grid size-3.5 place-items-center rounded-full bg-[var(--warn)] text-[8px] font-bold text-[#0b0c0d]">
                      {conflicts}
                    </span>
                  ) : null}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Powiadomienia</DropdownMenuLabel>
                {conflicts ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/booksy">
                      <RefreshCcw />
                      <span className="flex-1">
                        {conflicts} konflikt{conflicts > 1 ? "y" : ""}{" "}
                        synchronizacji
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link href="/admin/raport-kasowy">
                    <Settings />
                    <span className="flex-1">
                      Raport kasowy za dziś nie zamknięty
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/ewidencja">
                    <UserCog />
                    <span className="flex-1">
                      Ewidencja czasu — 4 wpisy do akceptacji
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}

        {me?.viewingAs ? (
          <span className="flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--warn)_45%,transparent)] bg-[color-mix(in_oklab,var(--warn)_12%,transparent)] px-2.5 py-1 text-[11px] font-medium text-[var(--warn)]">
            <Eye className="size-3" />
            <span className="hidden sm:inline">
              Podgląd jako {ROLE_LABEL[me.viewingAs as keyof typeof ROLE_LABEL] ?? me.viewingAs}
            </span>
            <button className="underline underline-offset-2" onClick={() => exitViewAs()}>
              Wróć
            </button>
          </span>
        ) : null}

        {/* theme */}
        <Tooltip content={theme === "dark" ? "Tryb jasny" : "Tryb ciemny"}>
          <button
            onClick={toggle}
            className="grid size-9 place-items-center rounded-md text-[var(--fg-muted)] transition-colors hover:bg-[var(--panel-muted)] hover:text-[var(--fg)]"
            aria-label="Przełącz motyw"
          >
            {mounted && theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
        </Tooltip>

        {/* user */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 transition-colors hover:bg-[var(--panel-muted)]">
              <Avatar
                name={me?.email ?? "BroZone"}
                ring="var(--accent)"
                className="size-7"
              />
              <div className="hidden max-w-[11rem] text-left sm:block">
                <div className="truncate text-[12px] font-medium leading-tight">
                  {me?.email ?? "BROZONE"}
                </div>
                <div className="text-[10px] text-[var(--fg-subtle)]">
                  {me
                    ? (ROLE_LABEL[me.role as keyof typeof ROLE_LABEL] ??
                      me.role)
                    : "…"}
                </div>
              </div>
              <ChevronDown className="size-3.5 text-[var(--fg-subtle)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{me?.email ?? "Konto"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {me?.realRole === "admin" ? <ViewAsItems /> : null}
            <DropdownMenuItem asChild>
              <Link href="/admin/ustawienia">
                <Settings /> Ustawienia salonu
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/pracownicy">
                <UserCog /> Zespół
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem danger asChild>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2"
                >
                  <LogOut /> Wyloguj
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/** Wyjście z podglądu — wraca do pełnego widoku właściciela. */
async function exitViewAs() {
  await fetch("/api/view-as", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: null }),
  });
  window.location.href = "/admin";
}

/**
 * „Zobacz panel oczami…" — właściciel przełącza rolę, serwer od razu tnie
 * dane i menu tak, jak zobaczy je ta osoba. Powrót przez „Wróć do widoku
 * właściciela".
 */
function ViewAsItems() {
  const [busy, setBusy] = React.useState(false);

  const switchTo = async (role: string | null) => {
    setBusy(true);
    await fetch("/api/view-as", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    window.location.href = role ? "/admin/moje-wizyty" : "/admin";
  };

  return (
    <>
      <DropdownMenuLabel>Zobacz panel oczami</DropdownMenuLabel>
      <DropdownMenuItem disabled={busy} onSelect={() => switchTo("barber")}>
        <Eye /> Barbera
      </DropdownMenuItem>
      <DropdownMenuItem disabled={busy} onSelect={() => switchTo("recepcja")}>
        <Eye /> Recepcji
      </DropdownMenuItem>
      <DropdownMenuItem disabled={busy} onSelect={() => switchTo(null)}>
        <EyeOff /> Wróć do widoku właściciela
      </DropdownMenuItem>
      <DropdownMenuSeparator />
    </>
  );
}
