#!/usr/bin/env bash
set -euo pipefail
URL="${1:-http://localhost:8080/healthz}"
WS_URL="${2:-ws://localhost:3000}"

echo "[healthcheck] HTTP => $URL"
if curl -fsS "$URL" >/dev/null; then
  echo "[healthcheck] OK: overlay server respondeu"
else
  echo "[healthcheck] ERRO: overlay server indisponível"
  exit 1
fi

node -e "
import WebSocket from 'ws';
const wsUrl = process.argv[1];
const ws = new WebSocket(wsUrl);
const timeout = setTimeout(() => { console.error('[healthcheck] ERRO: timeout WS'); process.exit(1); }, 5000);
ws.on('open', () => { console.log('[healthcheck] OK: conexão WS aberta'); clearTimeout(timeout); ws.close(); process.exit(0); });
ws.on('error', (err) => { console.error('[healthcheck] ERRO WS:', err.message); clearTimeout(timeout); process.exit(1); });
" "$WS_URL"
