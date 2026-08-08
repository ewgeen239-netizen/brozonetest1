# Deploy — Vercel + GitHub

Repo: `ewgeen239-netizen/brozonetest1`, branch `main`.
Nic nie trzeba budować lokalnie — Vercel wykrywa Next.js sam.

## 1. Import projektu

1. [vercel.com/new](https://vercel.com/new) → *Import Git Repository*.
2. Jeśli repo nie ma na liście: *Adjust GitHub App Permissions* → dodaj
   `brozonetest1`.
3. Framework Preset: **Next.js** (wykryje się sam).
   Build Command, Output Directory, Install Command — zostaw domyślne.
4. **Nie klikaj jeszcze Deploy** — najpierw zmienne (punkt 2).

## 2. Zmienne środowiskowe

*Environment Variables* → dodaj dla **Production** i **Preview**:

| Zmienna | Wymagana | Skąd wziąć |
|---|---|---|
| `ADMIN_PASSWORD` | tak | długie, unikalne hasło właściciela do `/admin` |
| `AUTH_SECRET` | tak | `openssl rand -base64 48` |
| `APP_URL` | tak | pełny adres bez ukośnika, np. `https://brozonetest1.vercel.app` |
| `OWNER_EMAIL` | zalecana | Twój adres Google — dostaje rolę `admin` |
| `GOOGLE_CLIENT_ID` | opcjonalna | logowanie pracowników przez Google |
| `GOOGLE_CLIENT_SECRET` | opcjonalna | j.w. |
| `SHEETS_API_URL` | opcjonalna | adres Apps Script Web App (baza) |
| `SHEETS_API_SECRET` | opcjonalna | wspólny sekret Apps Script |

Bez `ADMIN_PASSWORD` i `AUTH_SECRET` panel **celowo nikogo nie wpuszcza**
(fail closed) — `/admin` przekierowuje na `/login?error=config`.

Bez `SHEETS_API_URL` aplikacja działa na danych demonstracyjnych: wszystko
klika się normalnie, ale zapisy giną po restarcie instancji.

Bez `GOOGLE_CLIENT_*` przycisk „Zaloguj się przez Google" się nie pokazuje —
zostaje logowanie hasłem.

## 3. Deploy

Kliknij *Deploy*. Każdy push na `main` = nowy deploy produkcyjny,
każdy PR = preview.

## 4. Po pierwszym deployu

1. Ustaw `APP_URL` na prawdziwy adres (jeśli wcześniej zgadywałeś) →
   *Redeploy*.
2. Google Cloud Console → OAuth client → **Authorized redirect URIs**:

   ```
   https://TWOJ-ADRES.vercel.app/api/auth/google/callback
   ```

   Adres musi zgadzać się z `APP_URL` co do znaku.
3. Wejdź na `/login`, zaloguj się hasłem, sprawdź `/admin/raport-kasowy`.

## 5. Własna domena

*Settings → Domains* → dodaj `brozone.pl`, ustaw rekordy u rejestratora.
Potem zmień `APP_URL` i redirect URI w Google na nową domenę.

## Uwagi

- `.env.local` nigdy nie trafia do repo — zmienne żyją tylko w Vercel.
- Panel wysyła `X-Robots-Tag: noindex` i `Cache-Control: no-store`,
  więc `/admin` nie wejdzie do wyszukiwarki.
- Booksy nie ma publicznego API do zapisu — synchronizacja jest
  jednokierunkowa (import), i tak to opisujemy w panelu.
