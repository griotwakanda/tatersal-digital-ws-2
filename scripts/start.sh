#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "[start.sh] Instalando dependências..."
  npm install
fi

npm run start
