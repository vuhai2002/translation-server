# Deploy - translation-server

Target VPS `103.77.240.24`. Pattern: Cloudflare (proxied) -> host Caddy -> Docker
container bound to `127.0.0.1` -> no database (stateless proxy).

## Allocation

| Item | Value |
|---|---|
| Domain | `translate-api.vuhai.io.vn` (Cloudflare proxied, SSL mode Full (strict)) |
| Host port | `127.0.0.1:3002` (Caddy proxies here) |
| Container port | `3000` (internal) |
| Database | none |
| Repo path on VPS | `/opt/apps/translation-server` |

## One-time setup

### 1. Cloudflare
The `vuhai.io.vn` zone is already at SSL/TLS mode **Full (strict)**. Just add a
DNS record `translate-api` (A) -> `103.77.240.24`, **proxied (orange cloud)**.
A grey-cloud / direct-to-origin record is blocked by the origin firewall on `:443`.

### 2. Caddy (on the VPS)
Append to `/etc/caddy/Caddyfile`, then
`caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy`:

```caddy
# translation-server - Cloudflare Full (strict). CF Origin cert (wildcard *.vuhai.io.vn).
translate-api.vuhai.io.vn {
    tls /etc/caddy/certs/toeic.vuhai.io.vn.pem /etc/caddy/certs/toeic.vuhai.io.vn.key
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        -Server
    }
    reverse_proxy 127.0.0.1:3002 {
        # Real client IP from Cloudflare so per-IP rate limiting is correct.
        header_up X-Forwarded-For {http.request.header.Cf-Connecting-Ip}
    }
}
```

### 3. Clone + secrets
```bash
git clone https://github.com/vuhai2002/translation-server /opt/apps/translation-server
cd /opt/apps/translation-server
cp .env.production.example .env.production
chmod 600 .env.production
# edit .env.production: TRANSLATOR_BASE_URL / TRANSLATOR_API_KEY / TRANSLATOR_MODEL
```

## Deploy / update
```bash
cd /opt/apps/translation-server
bash deploy.sh
```
`deploy.sh` does: `git pull --ff-only` -> `docker compose -f docker-compose.prod.yml build`
-> `up -d --wait` -> prune dangling images + cap build cache at 2GB -> health check.
Downtime = container restart only.

Overrides: `DEPLOY_SKIP_PULL=1` (rebuild current checkout), `DEPLOY_SKIP_PRUNE=1`.

## Verify
```bash
docker ps                                     # translation-server -> healthy
curl -fsS http://127.0.0.1:3002/api/health    # {"status":"UP",...}
```
No new UFW port is opened - the app rides on Caddy `:443`.

## Notes
- `read_only: true` root filesystem; the app only writes winston logs to the
  `./logs` bind mount (+ `/tmp` tmpfs). If a future change writes elsewhere and
  crashes with `EROFS`, comment out `read_only`/`tmpfs` in `docker-compose.prod.yml`.
- Container runs as non-root `node` (uid 1000). `deploy.sh` pre-creates `logs/`
  so the bind mount is owned by the deploy user (also uid 1000) and stays writable.
