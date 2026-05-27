# SKLabChat

A Cursor-ready starter app for a Supabase-backed text chat interface with Google/Apple OAuth, per-user content-rating settings, persistent chat logs, and a passcode/QR login scaffold.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Row Level Security
- `@supabase/ssr` for cookie-based auth sessions
- `qrcode.react` for the future device/passcode login UI

## What works now

- Google and Apple OAuth buttons through Supabase Auth
- Protected `/app/*` routes
- User profile/settings screen
- PG-13 default mode with adult preference toggle
- Persistent chat + messages tables
- Fake assistant reply:
  - PG-13: `Ok, let me think about: <message>. Note: the AI integration is coming soon.`
  - Adult: `I am feeling spunky, talk dirty to me.`
- Passcode/QR login UI scaffold

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project.

3. In Supabase SQL Editor, run:

```bash
supabase/schema.sql
```

4. Copy env file:

```bash
cp .env.example .env.local
```

5. Fill in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

6. In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - your future production callback URL, for example `https://your-domain.com/auth/callback`

7. In Supabase Dashboard → Authentication → Providers:

- Enable Google.
- Enable Apple.
- Add OAuth credentials from Google Cloud Console / Apple Developer.

8. Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Important note on passcode / QR login

Supabase supports OAuth and passwordless email OTP/magic-link auth, but the QR-code device-login pattern is normally a custom authorization flow. This project includes the UI and `login_passcodes` table only.

Recommended future implementation:

1. Desktop creates a short-lived `login_passcodes` row from a server route using the service role key.
2. User scans QR on phone.
3. Phone signs in via Google/Apple and approves that code.
4. Desktop polls for approval.
5. A trusted server route exchanges approval for a Supabase session or another secure session mechanism.

Do not expose the Supabase service role key to the browser.

## Suggested Cursor tasks after opening

- Wire passcode creation/polling with Next.js route handlers.
- Add multiple chat conversations and chat titles.
- Replace the fake assistant reply in `src/app/actions.ts` with your AI backend call.
- Add streaming responses.
- Add content-mode routing to different model policies.
- Generate Supabase types from your actual project and replace `src/types/database.ts`.

## Project structure

```text
src/
  app/
    (auth)/login/        OAuth login page
    app/chat/            Protected chat UI
    app/settings/        Protected settings UI
    auth/callback/       Supabase OAuth callback route
    passcode/            QR/passcode scaffold
  components/            Shared UI pieces
  lib/supabase/          Browser/server/middleware clients
  types/database.ts      Starter Supabase types
supabase/schema.sql      Database schema + RLS policies
```
