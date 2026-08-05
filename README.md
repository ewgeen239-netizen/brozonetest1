# BROZONE OS

Premium barbershop website + owner admin panel. Client books through Booksy in a few taps;
the owner runs barbers, schedule, cash, product usage, work-time evidence and Booksy imports
from one dashboard.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Radix UI
primitives · Framer Motion. No backend — everything runs on a typed mock layer.

```bash
npm install
cp .env.example .env.local   # fill ADMIN_PASSWORD + AUTH_SECRET
npm run dev     # http://localhost:3000
npm run build
npm run typecheck
```

## Admin access

`/admin/**` is closed. `middleware.ts` checks an HMAC-SHA256 signed session cookie on every
request and redirects to `/login` when it is missing, tampered with or expired.

| Env var | Meaning |
| --- | --- |
| `ADMIN_PASSWORD` | owner password for `/login` |
| `AUTH_SECRET` | random 32+ byte signing key — `openssl rand -base64 48` |

Details:

- Cookie is `httpOnly`, `sameSite=lax`, `secure` in production, 8 h lifetime.
- Password comparison runs over HMAC digests, so it does not leak a prefix match by timing;
  failed logins get a uniform delay.
- Brute-force throttle: 8 attempts per IP per 10 minutes.
- Fails closed — no `AUTH_SECRET`/`ADMIN_PASSWORD` means nobody gets in.
- `?next=` is validated, so the login page cannot be used as an open redirect.
- Admin responses carry `Cache-Control: no-store` and `X-Robots-Tag: noindex`.
- Logout lives in the top-bar user menu.

Rotating the password only needs an env change and a restart — sessions signed with the old
`AUTH_SECRET` stop verifying the moment the secret changes.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Client site — cinematic hero, booking block, services, barbers, reviews, map |
| `/login` | Owner sign-in for BROZONE OS |
| `/admin` | Dashboard: KPIs, today timeline, upcoming visits, Booksy + cash status |
| `/admin/rezerwacje` | Calendar — Day / Week / Month / List, drag-and-drop reschedule |
| `/admin/klienci` | Client base, segments, visit history drawer |
| `/admin/uslugi` | Price list, durations, Booksy service-id mapping |
| `/admin/barberzy` · `/admin/barberzy/[id]` | Barber CRUD + individual performance profile |
| `/admin/grafik` | Weekly shift matrix (barbers × days), breaks, holidays, sick days |
| `/admin/ewidencja` | Work-time evidence for payroll / ZUS / PIT / PIP |
| `/admin/raport-kasowy` | Daily cash report (RK) with close-day and approval flow |
| `/admin/raport-zuzycia` | Cosmetics usage and cost report |
| `/admin/booksy` | Integration modes, sync log, conflict resolver |
| `/admin/ustawienia` | Salon data, notifications, fiscal parameters, theme |

## Design

Deep graphite / black base, warm white type, steel-gray structure, brass accent with electric
blue as the secondary signal colour. Tokens live as CSS variables in `app/globals.css`; both
dark (default) and light themes are defined, and the admin theme toggle switches between them.

The client site is mobile-first and deliberately short — hero, booking, services, barbers,
reviews, contact. The admin is desktop/tablet-first, dense, and built for daily work rather
than decoration.

## Booksy — live widget

The real profile is business **287574** (BroZone, Targ Rybny 4, 70-535 Szczecin). The official
loader is mounted on the public site only:

```html
<script type="text/javascript" src="https://booksy.com/widget/code.js?id=287574&country=pl&lang=uk"></script>
```

It is configured in `BOOKSY` (`lib/mock-data.ts`) — change `lang` to `"pl"` there for a Polish
booking dialog; it currently follows the snippet you supplied (`uk`).

The widget build exposes no JS API: it injects `.booksy-widget-container` with its own launcher
and dialog iframe. `components/site/booksy-widget.tsx` therefore detects that launcher in the
DOM, and the "Rezerwuj przez Booksy" CTA forwards clicks to it — falling back to the profile
deep link (service, date, time and UTM tags in the query) whenever the widget is blocked or
still loading.

### What is real vs. still demo

Pulled from the Booksy profile and hard-coded in `lib/mock-data.ts`:

- **28 services** with real prices, durations and per-barber / per-length variants
  (`Service.variants`), e.g. Mens Haircut 80/90/100 zł, COMBO 120–150 zł, colour work up to
  600 zł.
- **4 barbers**: Max Siwy (senior), Olga Wizard (senior), Walera (barber), Ilia (junior),
  matching the JUNIOR 80 / BARBER 90 / SENIOR 100 zł tiers.
- Address Targ Rybny 4, 70-535 Szczecin, geo, opening hours (Mon–Sat 10–20, Sun 10–19),
  company name, Instagram / Facebook, rating 4.9 from 150 reviews, logo, business photo and the
  8-photo portfolio gallery (`SALON.gallery`).

Deliberately **not** used:

- **Reviews** — no invented testimonials for a real business. The section shows the real
  aggregate rating and links to Booksy.
- **Gallery photos on the public page** — they are close-up portraits of identifiable clients.
  They stay in `SALON.gallery` for the owner to publish knowingly; the hero uses a neutral
  stock interior instead.
- **Staff photos** — Booksy publishes none, so barber cards fall back to monogram tiles.

Still demo: clients, appointments, cash reports, product usage, time entries — the operational
history a real backend would own. Phone, e-mail and NIP in `SALON` are blank on purpose; the UI
hides those rows until they are filled.

## Booksy integration in the admin — what is real

Booksy has no public write API for third-party salon systems, so the app never pretends to do
a two-way live sync. `lib/booksy-adapter.ts` defines one `BooksyAdapter` interface with three
honest modes:

- **Widget Mode** — the site deep-links into Booksy with service, barber, date and time
  prefilled plus UTM tags. Works with zero configuration; nothing flows back.
- **Import Mode** — one-way pull into BROZONE OS via partner API, CSV export or webhook.
  Includes conflict detection when a record changed on both sides.
- **Manual Mode** — the owner keeps the calendar locally; Booksy stays a marketing channel.

Swapping `MockBooksyAdapter` for a real HTTP client is mechanical — no component branches on
transport details.

## Data model

`lib/types.ts` holds the domain: `Barber`, `Service`, `Client`, `Appointment`, `WorkShift`,
`CashReport`, `ProductUsageEntry` / `ProductUsageReport`, `TimeEntry` / `TimeReport`,
`BooksySyncLog`, `BooksyConfig`.

`lib/mock-data.ts` generates a deterministic dataset anchored to today (seeded PRNG, so server
and client renders match): ~6 weeks of appointments across 4 active barbers, 64 clients, shifts,
21 cash reports, 30 days of product usage, time entries and sync history — including two seeded
Booksy conflicts so the resolver has real work to do.

`lib/store.tsx` is a React context acting as the mock backend. Every writer (`moveAppointment`,
`closeCashDay`, `runSync`, …) is shaped like the API call that will replace it.

## Notes

- Loading, empty and error states are implemented across tables and panels, not just happy paths.
- Drag-and-drop reschedule always confirms through a before/after modal and states plainly that
  the change stays local to BROZONE OS.
- CSV export is real (`downloadCSV`); "PDF" uses the browser print dialog.
- Photos come from Unsplash at runtime; the Next image optimizer is disabled so the app also
  runs on static hosting.
