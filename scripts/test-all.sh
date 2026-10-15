#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/rephrase-studio-core" && npm test
cd "$ROOT/rephrase-studio-backend" && npm run build && npm test && npm audit --omit=dev
cd "$ROOT/rephrase-studio-web" && npm run build && npm audit --omit=dev
printf '\nSemua suite non-E2E selesai. Lihat rephrase-studio-test-report.md untuk E2E Playwright.\n'
