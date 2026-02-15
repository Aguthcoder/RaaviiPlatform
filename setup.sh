#!/usr/bin/env bash
set -euo pipefail

echo "[setup] Ravi local stack bootstrap"

command -v docker >/dev/null

docker compose pull

docker compose build backend frontend ai-engine telegram-bot

docker compose up -d postgres redis
sleep 8

docker compose run --rm backend npm run migration:run || true

docker compose up -d ai-engine telegram-bot n8n backend frontend nginx

echo "[setup] stack is up"
docker compose ps
