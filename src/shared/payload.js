import { z } from 'zod';

const numeric = z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)]).transform(Number);

export const overlayPayloadSchema = z.object({
  lot: z.union([z.string(), z.number()]).transform(String).optional(),
  title: z.string().trim().min(1).optional(),
  status: z.enum(['open', 'closed', 'paused']).optional(),
  bid: numeric.optional(),
  currency: z.string().trim().min(1).max(6).optional(),
  bidder: z.string().trim().optional(),
  updatedAt: z.string().datetime().optional(),
  heartbeat: z.boolean().optional(),
  ping: z.boolean().optional()
}).passthrough();

export function normalizePayload(input, now = Date.now()) {
  const parsed = overlayPayloadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.flatten(),
      raw: input
    };
  }

  const value = parsed.data;
  const isHeartbeatOnly = Boolean(value.heartbeat || value.ping) &&
    !value.lot && !value.title && value.bid === undefined && !value.status;

  const updatedAt = value.updatedAt ? new Date(value.updatedAt).toISOString() : new Date(now).toISOString();

  return {
    ok: true,
    heartbeatOnly: isHeartbeatOnly,
    data: {
      lot: value.lot ?? '-',
      title: value.title ?? 'Lote em andamento',
      status: value.status ?? 'open',
      bid: value.bid ?? null,
      currency: value.currency ?? 'BRL',
      bidder: value.bidder ?? null,
      updatedAt,
      meta: Object.fromEntries(Object.entries(value).filter(([k]) => !['lot', 'title', 'status', 'bid', 'currency', 'bidder', 'updatedAt', 'heartbeat', 'ping'].includes(k)))
    }
  };
}

export function parseIncomingMessage(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : JSON.parse(raw.toString('utf8'));
    return normalizePayload(parsed);
  } catch (error) {
    return {
      ok: false,
      error: { formErrors: ['JSON inválido'], fieldErrors: {} },
      raw: String(raw)
    };
  }
}
