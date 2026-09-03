# Deploying RivalScan

**Live at `rivals.manarattar.com`.**

## How it is put together

Vite SPA served by Caddy; FastAPI proxied at `/api/*` on the same origin.

## Where this runs

Everything is on a single Contabo VPS. There is no Vercel, Render, or other
PaaS involved any more.

| | |
|---|---|
| Server | `194.163.176.183` — `ssh ubuntu@194.163.176.183` (key only, no password) |
| Stack | `/srv/stack/docker-compose.yml` + `/srv/stack/Caddyfile` |
| App sources | `/srv/apps/<name>` |
| Built static sites | `/srv/www/<name>` |
| Secrets | `/srv/stack/env/<name>.env` (0600, root-owned) |
| Database | one `postgres:18-alpine` container, internal network only |
| TLS | Caddy, automatic Let's Encrypt |
| Backups | nightly 03:17 to `/srv/backup/nightly`, 14-day rotation |

Caddy terminates TLS for every hostname and routes by host. Postgres has no
published port — it is reachable only on the internal Docker network.

## Secrets

Never commit them. Each app reads `/srv/stack/env/<name>.env` on the server,
which compose injects via `env_file`. `DATABASE_URL` is set by compose, not by
that file, so an app cannot accidentally point at an old database.

## Deploying a change

```bash
cd frontend && VITE_API_URL="" npm run build
tar czf - -C dist . | ssh ubuntu@194.163.176.183 \
  'rm -rf /srv/www/rivals && mkdir -p /srv/www/rivals && tar xzf - -C /srv/www/rivals'

cd ../backend && tar czf - --exclude=venv --exclude=.env --exclude=data . \
  | ssh ubuntu@194.163.176.183 'tar xzf - -C /srv/apps/rivals'
ssh ubuntu@194.163.176.183 'cd /srv/stack && sudo docker compose up -d --build rivals'
```

## Things that will catch you out

- Data now persists. On the old host `DATABASE_URL` was never set, so it fell
  back to SQLite on an ephemeral disk and the startup seeder re-ran on every
  restart — competitors silently reset. It now uses the `rivals` Postgres
  database and survives restarts.

## Rolling back

Rebuild from the previous commit and redeploy. There is no rollback to a
previous provider — the old Vercel and Render deployments were deleted in
September 2026. Database backups are on the server at
`/srv/backup/nightly` (nightly, 14-day rotation).
