# Cursor Agent Brief for SKLabChat

You are evolving a Next.js + Supabase starter called SKLabChat.

## Current app goal

A small web app where users sign in without an app password, configure preferences, and use an SMS/Telegram-style chat interface. The AI backend is not implemented yet.

## Constraints

- Keep Supabase as backend/auth/database.
- Google and Apple OAuth are the only real auth providers for now.
- Keep PG-13 as default content rating.
- Store adult preference as `content_rating = 'adult'`; do not hard-code policy logic all over the app.
- Store chat history in Supabase.
- Do not expose service role keys in browser code.

## Next likely tasks

1. Add route handlers for creating passcode sessions.
2. Implement secure QR/device-login approval flow.
3. Add multiple chat conversations.
4. Replace fake assistant responses in `src/app/actions.ts` with real AI integration.
5. Add streaming UI.
6. Improve RLS and audit policies before production.
