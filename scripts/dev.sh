#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -f "$ROOT/rephrase-studio-backend/.env" ]]; then
  set -a; source "$ROOT/rephrase-studio-backend/.env"; set +a
fi
(cd "$ROOT/rephrase-studio-backend" && npm run dev) & API_PID=$!
(cd "$ROOT/rephrase-studio-web" && npm run dev) & WEB_PID=$!
trap 'kill "$API_PID" "$WEB_PID" 2>/dev/null || true' EXIT INT TERM
wait
