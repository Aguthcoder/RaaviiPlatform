#!/usr/bin/env bash
set -euo pipefail

echo "[bot] starting telegram bot"
docker compose up -d telegram-bot
