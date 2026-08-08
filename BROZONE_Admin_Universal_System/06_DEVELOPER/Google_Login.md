# Logowanie pracowników przez Google

Właściciel wchodzi hasłem (`ADMIN_PASSWORD`). Pracownicy **nie dostają
hasła** — logują się swoim kontem Google.

## 1. Jak to działa

```
/login  →  „Zaloguj się przez Google"
        →  /api/auth/google          (losowy `state` w ciasteczku, redirect do Google)
        →  Google
        →  /api/auth/google/callback (sprawdza `state`, wymienia `code` na token)
        →  arkusz `permissions`      (czy ten e-mail ma dostęp?)
        →  podpisane ciasteczko sesji + przekierowanie
```

Konto Google **samo w sobie nie daje dostępu**. Rola bierze się wyłącznie
z arkusza `permissions`:

| kolumna | znaczenie |
|---|---|
| `email` | adres Google pracownika, małymi literami |
| `role` | `admin` / `recepcja` / `barber` / `tattoo` / `massage` / `viewer` |
| `staffId` | do kogo należą wizyty (role pracownicze) |
| `active` | `FALSE` odcina dostęp bez kasowania wiersza |

Adresu nie ma na liście → `/login?error=no_access`. Żadnego konta nie
tworzymy automatycznie.

Rola pracownicza (`barber` / `tattoo` / `massage`) ląduje od razu na
`/admin/moje-wizyty` i nigdzie indziej nie wejdzie — pilnuje tego
middleware, a API i tak filtruje dane po `staffId`.

## 2. Konfiguracja

Google Cloud Console → *APIs & Services* → *Credentials* →
*Create credentials* → *OAuth client ID* → **Web application**.

Authorized redirect URI:

```
{APP_URL}/api/auth/google/callback
```

Zmienne w `.env.local`:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APP_URL=http://localhost:3000
OWNER_EMAIL=
```

Bez `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` przycisk Google po prostu
się nie pokazuje — logowanie hasłem działa dalej.

## 3. Uwagi bezpieczeństwa

- `state` chroni przed CSRF; niezgodny → `google_state`.
- Payload `id_token` czytamy bez weryfikacji podpisu, bo przychodzi
  **bezpośrednio z Google po TLS**, w zamian za nasz `client_secret`
  (patrz komentarz w `lib/auth-google.ts`). Gdyby token miał kiedyś
  przychodzić z przeglądarki, podpis trzeba sprawdzać.
- Wymagamy `email_verified`.
- Sesja to podpisane HMAC-SHA256 ciasteczko `httpOnly` — rola siedzi
  w środku, więc przeglądarka nie może jej podmienić.

## 4. Podgląd „jako"

Właściciel może zobaczyć panel oczami barbera lub recepcji
(menu konta → *Zobacz panel oczami*). Serwer tnie wtedy dane dokładnie
tak, jak zobaczy je ta osoba. Pasek u góry przypomina o podglądzie
i pozwala wrócić — decyzję o wyjściu podejmuje **prawdziwa** rola
z ciasteczka (`getRealSession`), więc z podglądu zawsze da się wyjść.
