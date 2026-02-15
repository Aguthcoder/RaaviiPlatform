#!/usr/bin/env bash
set -euo pipefail

WORKFLOW_FILE="${1:-n8n/workflows/ravi-smart-matching-workflow.json}"
echo "[n8n] importing workflow ${WORKFLOW_FILE}"
docker compose exec -T n8n n8n import:workflow --input "${WORKFLOW_FILE}"
