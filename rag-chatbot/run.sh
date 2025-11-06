#!/usr/bin/env bash

set -euo pipefail

# cd to script directory
cd "$(dirname "$0")"

# Optional: install deps
if [[ "${1:-}" == "--install" ]]; then
  python3 -m pip install --upgrade pip
  python3 -m pip install -r requirements.txt
fi

# Load env if present
if [[ -f .env ]]; then
  export $(grep -v '^#' .env | xargs -d '\n')
fi

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8080}"

exec uvicorn app.main:app \
  --host "$HOST" \
  --port "$PORT" \
  --reload


