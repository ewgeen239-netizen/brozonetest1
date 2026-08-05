import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "./login-form";
import { SESSION_COOKIE, safeRedirect, verifySessionToken } from "@/lib/auth";
import { SALON } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Logowanie",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeRedirect(params.next);

  // already signed in — skip the form
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token, process.env.AUTH_SECRET)) redirect(next);

  return (
    <main className="noise relative grid min-h-dvh place-items-center overflow-hidden bg-[#05070a] px-4 py-12">
      <div className="spotlight pointer-events-none absolute inset-0" />
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="relative grid size-11 place-items-center overflow-hidden rounded-[10px] bg-gradient-to-b from-[var(--brass-soft)] to-[var(--brass)] text-lg font-black text-[#0b0c0d]">
            B
            <span className="animate-sheen absolute inset-y-0 -left-1/3 w-1/3 bg-white/40 blur-[6px]" />
          </span>
          <h1 className="mt-3 text-[15px] font-bold tracking-[0.24em] text-[#f2efe9]">BROZONE</h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#6a747c]">
            Operating system · {SALON.city}
          </p>
        </div>

        <div className="rounded-xl border border-[#1e2428] bg-[#0e1113] p-5 shadow-2xl">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[#f2efe9]">Panel właściciela</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[#98a1a9]">
              Dostęp tylko dla obsługi salonu. Sesja wygasa po 8 godzinach.
            </p>
          </div>

          <LoginForm next={next} configError={params.error === "config"} />
        </div>

        <Link
          href="/"
          className="mt-5 flex items-center justify-center gap-1.5 text-[12px] text-[#6a747c] transition-colors hover:text-[var(--brass)]"
        >
          <ArrowLeft className="size-3.5" /> Wróć na stronę klienta
        </Link>
      </div>
    </main>
  );
}
