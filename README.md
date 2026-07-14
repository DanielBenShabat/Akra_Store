# akra

1-of-1 wearable-art storefront for the akra brand, built with Next.js (App Router) and Supabase.

**Live at [https://akrastudioz.com](https://akrastudioz.com)** — deployed on a DigitalOcean VM; every push to `main` deploys automatically (see [Deployment](#deployment)).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Supabase (PostgreSQL) — accessed server-only via the service role key; RLS deny-all on every table
- Zustand (persisted cart), react-hook-form + Zod (forms), Tailwind v4 + shadcn/ui, sonner
- Grow (Meshulam) hosted payments with HMAC-verified webhook confirmation
- Resend transactional email (order confirmations)
- sharp + heic-convert for image processing (iPhone HEIC uploads are converted to JPEG)
- Self-hosted Umami v2 for analytics (powers the admin Statistics tab)

## The 1-of-1 model

Every product is a unique, one-off piece. The whole codebase assumes quantity = 1 per item:

- Cart lines have no quantity field; adding the same product twice is rejected.
- Stock is decremented atomically in Postgres (`decrement_product_stock`, `confirm_order` in `scripts/schema.sql`), so two buyers can never purchase the same piece — the second payment's order is cancelled at confirmation time.
- Checkout supports both a multi-item cart and an isolated "Buy Now" fast lane.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

With `PAYMENT_PROVIDER=simulated` (the default) checkout captures inline without a real charge, so the full order flow works locally with only the Supabase variables set.

## Environment variables

See `.env.example` for the authoritative, commented list. Summary:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access (never exposed to the client) |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | `/admin` login + HS256 signing key for the admin session JWT (8h expiry) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Order confirmation emails; skipped gracefully if unset |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (`https://akrastudioz.com` in production) |
| `PAYMENT_PROVIDER` | `simulated` (inline, no charge) or `grow` (hosted gateway + webhook) |
| `GROW_API_BASE`, `GROW_PAGE_CODE`, `GROW_USER_ID`, `GROW_WEBHOOK_SECRET` | Grow/Meshulam gateway; the secret HMAC-verifies incoming webhooks |
| `NEXT_PUBLIC_UMAMI_SRC`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Visitor tracking script (public, baked in at build time) |
| `UMAMI_APP_URL`, `UMAMI_WEBSITE_ID`, `UMAMI_USERNAME`, `UMAMI_PASSWORD` | Server-only Umami API access for the admin Statistics tab |

Umami variables are optional — when unset, tracking is disabled and the Statistics tab shows setup instructions instead of data.

## Database

Fresh install: run `scripts/schema.sql` in the Supabase SQL editor, then optionally seed demo products:

```bash
node scripts/seed.mjs
```

Incremental changes to an existing database live in `scripts/migrations/*.sql` (dated, idempotent). They are **not** run by the deploy pipeline — run new ones manually in the Supabase SQL editor when they land. `scripts/schema.sql` is kept as the full snapshot.

Tables: `categories`, `products` (multi-image, `status` available/unavailable/archive, `display_order`), `archive_items`, `orders` (structured Israeli address, shipping method, payment reference), `order_items`, `site_settings` (jsonb key/value).

## Storefront

Routes under `src/app/(storefront)`: home, `/available`, `/goosebumps`, `/archive`, `/category/[slug]`, `/product/[id]`, `/checkout` (+ success/cancel), `/about`, `/contact`, `/faq`, `/legal/*`.

- Catalog pages are static/ISR (1h revalidate) via `unstable_cache` tags, busted by admin mutations with `revalidateTag`.
- Shipping methods: **express** (40₪), **standard** (25₪, free over 400₪), **pickup** (free, Modi'in area). Fees and the free-shipping threshold are admin-editable; `src/lib/pricing.ts` is the server-side pricing authority.
- Checkout validates a structured Israeli address (city select from `src/lib/israeli-cities.ts`).

## Admin

`/admin` (password login, signed JWT session cookie, middleware-guarded; every mutating server action re-verifies the session):

- **Inventory** — products with multi-image upload, status, drag-and-drop ordering (dnd-kit)
- **Categories**, **Goosebumps**, **Archive** — collection management
- **Orders** — multi-item orders with status transitions
- **Settings** — admin-managed storefront: logo/top logo, hero background, custom icons, navigation items, About/Contact content, per-page typography (mobile/desktop px), page background images. Stored in the `site_settings` table, read through `src/lib/site-settings.ts` (cached, tag-busted on save).
- **Statistics** — visitors, pageviews, top pages/referrers/devices from the self-hosted Umami instance

## Payments

`src/lib/payments/` defines a `PaymentProvider` interface with two implementations:

- `simulated` — captures inline; for local dev and testing.
- `grow` — creates a hosted payment page on Grow/Meshulam and redirects. Confirmation is **webhook-only** (`/api/payments/webhook`): raw-body HMAC-SHA256 verification (timing-safe), strict paid/failed status allow-lists, and order confirmation through the atomic `confirm_order` RPC. Confirmation emails are sent exactly once, from the webhook path.

## Deployment

Production runs on a DigitalOcean VM behind the `akrastudioz.com` domain, managed by pm2 (process name `akra-store`).

- **Auto-deploy:** `.github/workflows/deploy-vm.yml` runs on every push to `main` that touches app code — it SSHes into the VM, `git reset --hard origin/main`, then runs `deploy/vm/hook.sh` (`npm ci` → `next build` → `pm2 restart akra-store`). Pushing to `main` **is** a production deploy.
  - GitHub secrets: `AKRA_VM_HOST`, `AKRA_VM_USER`, `AKRA_VM_SSH_KEY`; repo variables: `AKRA_VM_REPO_PATH`, `AKRA_SITE_URL`.
- **Supabase keep-alive:** `.github/workflows/supabase-keepalive.yml` pings `/api/keepalive` every 3 days so the free-tier project is never paused for inactivity.
- **Umami** is provisioned manually on the VM (listens on `127.0.0.1:3001`; the Next.js server queries it over localhost).

`main` is the only working branch — feature work merges into it via PRs. (`master` is a stale legacy branch.)

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — lint
