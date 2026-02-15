#!/usr/bin/env bash
set -euo pipefail

echo "[migrate] running backend migrations"
docker compose run --rm backend npm run migration:run
