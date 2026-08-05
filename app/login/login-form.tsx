"use client";

import * as React from "react";
import { useActionState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { login, type LoginState } from "./actions";

export function LoginForm({ next, configError }: { next: string; configError: boolean }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {
    error: configError
      ? "Brak konfiguracji serwera: ustaw ADMIN_PASSWORD i AUTH_SECRET w pliku .env.local."
      : undefined,
  });
  const [visible, setVisible] = React.useState(false);

  return (
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

      <Button type="submit" variant="brass" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
        {pending ? "Weryfikacja…" : "Zaloguj do BROZONE OS"}
      </Button>
    </form>
  );
}
