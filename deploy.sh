#!/usr/bin/env bash
# Deploy translation-server on the VPS: git pull -> build -> up --wait.
# Downtime = container restart only. Run from the app dir over SSH.
#
#   cd /opt/apps/translation-server && bash deploy.sh
#
# Overrides: DEPLOY_SKIP_PULL=1 (rebuild current checkout), DEPLOY_SKIP_PRUNE=1.
set -euo pipefail
cd "$(dirname "$0")"

COMPOSE_FILE="docker-compose.prod.yml"

[[ "${DEPLOY_SKIP_PULL:-0}" == "1" ]] || { echo "--- git pull ---"; git pull --ff-only; }

test -f .env.production || { echo "ERROR: .env.production missing (cp .env.production.example .env.production && chmod 600)"; exit 1; }

# logs/ must exist before the container starts so the bind mount is owned by the
# deploy user (uid 1000 == container "node"), keeping it writable under read_only.
mkdir -p logs

echo "--- build + up ---"
docker compose -f "$COMPOSE_FILE" build
docker compose -f "$COMPOSE_FILE" up -d --wait --wait-timeout 90

if [[ "${DEPLOY_SKIP_PRUNE:-0}" != "1" ]]; then
  echo "--- prune (dangling images + cap build cache 2GB) ---"
  docker image prune -f --filter "dangling=true"
  docker builder prune -af --keep-storage "${DEPLOY_BUILD_CACHE_KEEP:-2GB}"
fi

echo "--- health ---"
curl -fsS "http://127.0.0.1:3002/api/health" && echo "  OK" || echo "WARN: health probe failed (warming up?)"
