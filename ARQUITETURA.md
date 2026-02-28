# Arquitetura - Tatersal Overlay WS v2.0

## Visão geral

A solução é dividida em:

1. **Servidor local (`src/server.js`)**
   - Serve frontend estático para OBS
   - Expõe `config.json` para parâmetros operacionais
   - Expõe `healthz` para monitoramento
   - Emite logs estruturados

2. **Cliente overlay (`src/public/app.js`)**
   - Conecta em `WS_URL`
   - Reconnect automático (backoff + jitter)
   - Parse de mensagens e renderização
   - Indicador de stale data
   - Fallback manual para continuidade operacional

3. **Camada de validação (`src/shared/payload.js`)**
   - Schema Zod para payload de entrada
   - Normalização de tipos/campos
   - Detecção de heartbeat-only
   - Base para testes automatizados

## Fluxo de dados

`WS origem (ws://localhost:3000)` -> `Overlay Browser (OBS)`

O payload é consumido no **objeto raiz** (sem envelope `type/data`).

## Resiliência

- Reconnect progressivo com jitter para evitar thundering herd
- Heartbeat/ping não quebra interface
- Status de dados desatualizados para ação operacional rápida
- Painel manual para contingência

## Testabilidade

Testes unitários cobrem:

- parsing JSON
- validação/normalização
- detecção de heartbeat
- falha em payload inválido
