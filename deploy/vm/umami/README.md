# Umami analytics — one-time VM setup

Self-hosted [Umami](https://umami.is) powers the admin **Statistics** tab and the
storefront tracking script. Everything runs on the same VM as the store; nothing
is sent to a third party and no cookie banner is needed.

## 1. Start Umami

```bash
cd deploy/vm/umami
cat > .env <<EOF
POSTGRES_PASSWORD=$(openssl rand -hex 16)
APP_SECRET=$(openssl rand -hex 32)
EOF
docker compose up -d
```

Umami listens on `127.0.0.1:3001` (not public).

## 2. Create the admin user + website

Open a tunnel from your laptop and use the Umami UI once:

```bash
ssh -L 3001:localhost:3001 <user>@<vm-host>
# then open http://localhost:3001
```

- Log in with the default `admin` / `umami` and **change the password**.
- Settings → Websites → Add website (name: akra, domain: your real domain).
- Copy the generated **Website ID**.

## 3. Expose the tracker through nginx

The browser only needs two paths (`/umami/script.js` and `/umami/api/send`).
Add to the site's nginx server block and reload:

```nginx
location /umami/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

(`X-Forwarded-For`/`X-Real-IP` matter — without them every visitor looks like
127.0.0.1 and Umami counts them as one person. Umami trusts these headers by
default when behind a proxy.)

## 4. Point the app at it

Add to the store's `.env` on the VM (then rebuild/restart, e.g. rerun
`deploy/vm/hook.sh` — `NEXT_PUBLIC_*` values are baked in at build time):

```bash
# Storefront tracking script (public URL, via the nginx proxy)
NEXT_PUBLIC_UMAMI_SRC=https://<your-domain>/umami/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<website-id>

# Admin statistics tab (server-side, over localhost)
UMAMI_APP_URL=http://127.0.0.1:3001
UMAMI_WEBSITE_ID=<website-id>
UMAMI_USERNAME=admin
UMAMI_PASSWORD=<the-password-you-set>
```

That's it — visits start appearing in `/admin/statistics` immediately.

## Notes

- Data lives in the `umami-db` Docker volume; `docker compose down` keeps it,
  `docker compose down -v` deletes it.
- Upgrade later with `docker compose pull && docker compose up -d`.
- The tracking script is only rendered on the storefront layout, so admin
  browsing is never counted.
