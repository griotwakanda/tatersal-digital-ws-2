# Tatersal Digital WS Overlay v2.0

Overlay WebSocket pronto para produção, focado em uso no **OBS Browser Source**.

## Destaques

- Interface minimalista e limpa, responsiva (desktop + mobile)
- Fonte WS padrão: `ws://localhost:3000`
- Servidor local da overlay: `http://localhost:8080`
- Reconexão robusta (backoff exponencial + jitter)
- Validação de payload com **Zod** (sem `type/data`, objeto na raiz)
- Suporte a heartbeat/ping
- Indicador visual de dados desatualizados (stale)
- Painel de fallback manual para operação de contingência
- Logs estruturados em JSON com Pino
- Testes para parsing/normalização
- Docker opcional

## Estrutura

- `src/server.js` — servidor HTTP local da overlay
- `src/public/` — frontend da overlay
- `src/shared/payload.js` — parser/normalização com Zod
- `tests/` — cobertura de parser
- `scripts/` — inicialização e healthcheck

## Requisitos

- Node.js 22+
- npm 10+

## Instalação rápida

```bash
cp .env.example .env
npm install
npm test
npm run start
```

Abra no navegador/OBS:

- `http://localhost:8080`

## Scripts

- `npm run start` — inicia servidor
- `npm run dev` — modo watch
- `npm run test` — testes
- `scripts/start.sh` / `scripts/start.bat` — start assistido
- `scripts/healthcheck.sh` — checagem HTTP + WS

## Formato esperado do payload WS (objeto raiz)

```json
{
  "lot": "125",
  "title": "Novilha Nelore",
  "status": "open",
  "bid": 12500,
  "currency": "BRL",
  "bidder": "Cliente 41",
  "updatedAt": "2026-02-27T18:00:00.000Z",
  "heartbeat": false,
  "ping": false
}
```

> Importante: **não** usar envelope `type/data`. O lote deve estar no objeto raiz.

## Docker (opcional)

```bash
docker compose up --build -d
```

## Documentação adicional

- `INSTRUCOES-OPERACAO.md`
- `ARQUITETURA.md`
- `CHANGELOG.md`
