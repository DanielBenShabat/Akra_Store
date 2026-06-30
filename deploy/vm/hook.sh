#!/usr/bin/env bash
# Run on the Akra VM after the repo is synced by GitHub Actions.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

npm ci
npm run build
pm2 restart akra-store
pm2 save
