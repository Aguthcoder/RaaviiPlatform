#!/usr/bin/env bash
set -euo pipefail

echo "[seed] seeding sample data"
docker compose run --rm backend node dist/scripts/seed.js || echo "Seed script not found; add dist/scripts/seed.js when ready."
