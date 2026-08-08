"use client";

import * as React from "react";
import { useActionState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { login, type LoginState } from "./actions";

const ERROR_TEXT: Record<string, string> = {
  config: "Brak konfiguracji serwera: ustaw ADMIN_PASSWORD i AUTH_SECRET w pliku .env.local.",
  google_off: "Logowanie przez Google nie jest jeszcze skonfigurowane.",
  google_cancelled: "Logowanie przerwane.",
  google_state: "Sesja logowania wygasła. Spróbuj jeszcze raz.",
  google_failed: "Google odrzucił logowanie. Spróbuj jeszcze raz.",
  google_unverified: "To konto Google nie ma potwierdzonego adresu e-mail.",
  no_access: "To konto nie ma dostępu do panelu. Poproś właściciela o dodanie.",
};

export function LoginForm({
  next,
  errorCode,
  errorEmail,
  googleEnabled,
}: {
  next: string;
  errorCode?: string;
  errorEmail?: string;
  googleEnabled: boolean;
}) {
  const initialError = errorCode
    ? errorCode === "no_access" && errorEmail
      ? `${ERROR_TEXT.no_access} (${errorEmail})`
      : (ERROR_TEXT[errorCode] ?? "Nie udało się zalogować.")
    : undefined;

  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {
    error: initialError,
  });
  const [visible, setVisible] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(!googleEnabled);

  return (
    <div className="space-y-4">
      {googleEnabled ? (
        <>
          <a
            href="/api/auth/google"
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-[#2a2a28] bg-[#f4f5f0] text-[14px] font-semibold text-[#1c1c1b] transition-opacity hover:opacity-90"
          >
            <GoogleMark /> Zaloguj przez Google
          </a>
          <p className="text-center text-[11px] leading-relaxed text-[#6a6f68]">
            Pracownicy logują się swoim kontem Google.
            <br />
            Dostęp nadaje właściciel.
          </p>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-[#2a2a28]" />
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#6a6f68]">albo</span>
            <span className="h-px flex-1 bg-[#2a2a28]" />
          </div>

          {!showPassword ? (
            <button
              onClick={() => setShowPassword(true)}
              className="w-full rounded-md py-2 text-[12px] text-[#98a1a9] transition-colors hover:text-[#f2efe9]"
            >
              Zaloguj hasłem właściciela
            </button>
          ) : null}
        </>
      ) : null}

      {state.error && !showPassword ? (
        <p
          role="alert"
          className="rounded-md border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2 text-[12px] leading-relaxed text-[var(--danger)]"
        >
          {state.error}
        </p>
      ) : null}

      {showPassword ? (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <Field label="Hasło właściciela">
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fg-subtle)]" />
          <Input
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            placeholder="••••••••••"
            className="h-11 pl-9 pr-10"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-[var(--fg-subtle)] transition-colors hover:text-[var(--fg)]"
            aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-[color-mix(in_oklab,var(--danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2 text-[12px] leading-relaxed text-[var(--danger)]"
        >
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
        {pending ? "Weryfikacja…" : "Zaloguj do BROZONE OS"}
      </Button>
    </form>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.8l7.8 6c1.9-5.6 7.2-9.8 13.6-10.3z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.1 5.3-4.5 7l7.2 5.6c4.2-3.9 6.9-9.7 6.9-17z" />
      <path fill="#FBBC05" d="M10.4 28.2c-.5-1.4-.8-2.8-.8-4.2s.3-2.9.8-4.2l-7.8-6C1 16.8 0 20.3 0 24s1 7.2 2.6 10.2l7.8-6z" />
      <path fill="#34A853" d="M24 47.5c6.2 0 11.5-2 15.3-5.5l-7.2-5.6c-2 1.4-4.7 2.2-8.1 2.2-6.4 0-11.7-4.2-13.6-9.9l-7.8 6C6.5 42.1 14.6 47.5 24 47.5z" />
    </svg>
  );
}
