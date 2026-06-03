# akra_store

Minimalist streetwear storefront built with Next.js (App Router) and Supabase.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase (PostgreSQL) — accessed server-only via the service role key
- Zustand (cart), react-hook-form + Zod (forms), Tailwind + shadcn/ui, sonner

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Environment variables

See `.env.example`. All are server-only — none are prefixed `NEXT_PUBLIC`, and the
Supabase service role key must never be exposed to the client.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access (keep secret) |
| `ADMIN_PASSWORD` | Password for the `/admin` dashboard |
| `ADMIN_SESSION_SECRET` | Secret used to sign the admin session cookie |

On Vercel, set the same variables in Project Settings → Environment Variables.

## Database

Provision the schema by running `scripts/schema.sql` in the Supabase SQL editor,
then seed demo products:

```bash
node scripts/seed.mjs
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — lint
