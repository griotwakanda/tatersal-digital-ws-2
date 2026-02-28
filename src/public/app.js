const els = {
  wsStatus: document.querySelector('#wsStatus'),
  staleStatus: document.querySelector('#staleStatus'),
  lotNumber: document.querySelector('#lotNumber'),
  lotTitle: document.querySelector('#lotTitle'),
  lotStatus: document.querySelector('#lotStatus'),
  currentBid: document.querySelector('#currentBid'),
  bidder: document.querySelector('#bidder'),
  updatedAt: document.querySelector('#updatedAt'),
  fallbackForm: document.querySelector('#fallbackForm'),
  manualOff: document.querySelector('#manualOff')
};

let socket;
let reconnectAttempt = 0;
let lastDataAt = 0;
let staleMs = 15000;
let manualMode = false;
let config = { wsUrl: 'ws://localhost:3000', reconnect: { minMs: 1000, maxMs: 30000 } };

const fmtMoney = (value, currency = 'BRL') => {
  if (typeof value !== 'number') return '--';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
};

function setWsBadge(status) {
  els.wsStatus.className = 'badge';
  if (status === 'ok') {
    els.wsStatus.classList.add('badge-ok');
    els.wsStatus.textContent = 'WS conectado';
  } else if (status === 'down') {
    els.wsStatus.classList.add('badge-danger');
    els.wsStatus.textContent = 'WS desconectado';
  } else {
    els.wsStatus.classList.add('badge-warn');
    els.wsStatus.textContent = 'Conectando…';
  }
}

function setStaleBadge() {
  const stale = Date.now() - lastDataAt > staleMs;
  els.staleStatus.className = `badge ${stale ? 'badge-danger' : 'badge-ok'}`;
  els.staleStatus.textContent = stale ? 'Dados desatualizados' : 'Dados em tempo real';
}

function render(payload) {
  if (manualMode) return;
  els.lotNumber.textContent = payload.lot ?? '-';
  els.lotTitle.textContent = payload.title ?? 'Lote em andamento';
  els.currentBid.textContent = fmtMoney(payload.bid, payload.currency || 'BRL');
  els.bidder.textContent = payload.bidder ? `Arrematante: ${payload.bidder}` : '';

  const status = (payload.status || 'open').toLowerCase();
  els.lotStatus.textContent = status.toUpperCase();
  els.lotStatus.className = `state state-${status}`;

  const updated = payload.updatedAt ? new Date(payload.updatedAt) : new Date();
  els.updatedAt.textContent = `Atualizado: ${updated.toLocaleString('pt-BR')}`;
}

function parseMessage(raw) {
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return { ok: false, heartbeatOnly: false };
  }

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, heartbeatOnly: false };
  }

  const heartbeatOnly = (obj.heartbeat === true || obj.ping === true) && !obj.lot && !obj.title && obj.bid === undefined;

  return { ok: true, heartbeatOnly, data: obj };
}

function reconnectDelay() {
  const min = config.reconnect?.minMs || 1000;
  const max = config.reconnect?.maxMs || 30000;
  const exp = Math.min(max, min * (2 ** reconnectAttempt));
  const jitter = Math.floor(Math.random() * Math.min(1500, exp * 0.25));
  return exp + jitter;
}

function connectWs() {
  setWsBadge('connecting');
  socket = new WebSocket(config.wsUrl);

  socket.addEventListener('open', () => {
    reconnectAttempt = 0;
    setWsBadge('ok');
  });

  socket.addEventListener('message', (event) => {
    const parsed = parseMessage(event.data);
    if (!parsed.ok) return;
    lastDataAt = Date.now();
    if (!parsed.heartbeatOnly) render(parsed.data);
  });

  socket.addEventListener('close', () => {
    setWsBadge('down');
    reconnectAttempt += 1;
    setTimeout(connectWs, reconnectDelay());
  });

  socket.addEventListener('error', () => {
    socket.close();
  });
}

els.fallbackForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(els.fallbackForm);
  manualMode = true;
  render({
    lot: form.get('lot') || '-',
    title: form.get('title') || 'Entrada manual',
    bid: form.get('bid') ? Number(form.get('bid')) : null,
    status: form.get('status') || 'open',
    currency: form.get('currency') || 'BRL',
    bidder: form.get('bidder') || null,
    updatedAt: new Date().toISOString()
  });
});

els.manualOff.addEventListener('click', () => {
  manualMode = false;
});

setInterval(setStaleBadge, 1000);

(async function bootstrap() {
  try {
    const response = await fetch('/config.json', { cache: 'no-store' });
    config = await response.json();
    staleMs = Number(config.staleMs || 15000);
  } catch {
    // fallback default config
  }
  connectWs();
})();
