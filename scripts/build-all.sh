#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/rephrase-studio-core" && npm install && npm run build
cd "$ROOT/rephrase-studio-backend" && npm install && npm run build
cd "$ROOT/rephrase-studio-web" && npm install && npm run build
printf '\nBuild Rephrase Studio selesai.\n'
