import dotenv from 'dotenv';
import express from 'express';
import pino from 'pino';

dotenv.config();

const PORT = Number(process.env.OVERLAY_PORT || 8080);
const WS_URL = process.env.WS_URL || 'ws://localhost:3000';
const STALE_MS = Number(process.env.STALE_MS || 15000);
const RECONNECT_MIN_MS = Number(process.env.RECONNECT_MIN_MS || 1000);
const RECONNECT_MAX_MS = Number(process.env.RECONNECT_MAX_MS || 30000);

const log = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'tatersal-overlay-v2' },
  timestamp: pino.stdTimeFunctions.isoTime
});

const app = express();

app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    log.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Number((performance.now() - start).toFixed(1))
    }, 'http_request');
  });
  next();
});

app.use(express.static('src/public', { extensions: ['html'] }));

app.get('/config.json', (_req, res) => {
  res.json({
    wsUrl: WS_URL,
    staleMs: STALE_MS,
    reconnect: {
      minMs: RECONNECT_MIN_MS,
      maxMs: RECONNECT_MAX_MS
    }
  });
});

app.get('/healthz', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'tatersal-overlay-v2',
    now: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  log.info({ port: PORT, wsUrl: WS_URL }, 'overlay_server_started');
});
