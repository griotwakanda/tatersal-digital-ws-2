import { describe, it, expect } from 'vitest';
import { normalizePayload, parseIncomingMessage } from '../src/shared/payload.js';

describe('normalizePayload', () => {
  it('normaliza payload válido no objeto raiz', () => {
    const result = normalizePayload({ lot: 12, title: 'Lote Teste', bid: '1500.50', status: 'open' }, 1700000000000);
    expect(result.ok).toBe(true);
    expect(result.data.lot).toBe('12');
    expect(result.data.bid).toBe(1500.5);
    expect(result.data.status).toBe('open');
  });

  it('detecta heartbeat sem dados de lote', () => {
    const result = normalizePayload({ heartbeat: true });
    expect(result.ok).toBe(true);
    expect(result.heartbeatOnly).toBe(true);
  });

  it('rejeita payload inválido', () => {
    const result = normalizePayload({ bid: 'abc' });
    expect(result.ok).toBe(false);
  });
});

describe('parseIncomingMessage', () => {
  it('faz parse de string JSON', () => {
    const result = parseIncomingMessage('{"lot":"A1","title":"Teste"}');
    expect(result.ok).toBe(true);
    expect(result.data.lot).toBe('A1');
  });

  it('falha com JSON inválido', () => {
    const result = parseIncomingMessage('{bad json');
    expect(result.ok).toBe(false);
  });
});
