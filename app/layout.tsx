import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/theme-provider";
import { StoreProvider } from "@/lib/store";
import { LanguageProvider } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/misc";
import { Toaster } from "@/components/toaster";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "BROZONE Barber Shop — Szczecin",
    template: "%s · BROZONE OS",
  },
  description:
    "BROZONE Barber Shop w Szczecinie. Rezerwacja przez Booksy w 30 sekund. Fade, broda, brzytwa.",
  metadataBase: new URL("https://brozone.pl"),
  openGraph: {
    title: "BROZONE Barber Shop — Szczecin",
    description: "Zarezerwuj wizytę w 30 sekund przez Booksy.",
    locale: "pl_PL",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08090a" },
    { media: "(prefers-color-scheme: light)", color: "#f4f2ee" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`dark ${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <StoreProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster />
              </TooltipProvider>
            </StoreProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
