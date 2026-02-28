# Instruções de Operação (PT-BR)

## 1) Preparação

1. Copie variáveis:
   ```bash
   cp .env.example .env
   ```
2. Ajuste `WS_URL` se necessário.
3. Instale dependências:
   ```bash
   npm install
   ```

## 2) Subir overlay local

### Linux/macOS
```bash
./scripts/start.sh
```

### Windows
```bat
scripts\start.bat
```

### Alternativa
```bash
npm run start
```

## 3) Configurar no OBS

1. Fonte: **Browser Source**
2. URL: `http://localhost:8080`
3. Dimensão sugerida: 1280x720 (ou conforme layout)
4. Ative "Refresh browser when scene becomes active" se quiser reset visual por cena.

## 4) Monitoramento operacional

### Healthcheck rápido
```bash
./scripts/healthcheck.sh
```

### Endpoint de saúde
- `GET /healthz`

### Logs
- Saída em JSON no stdout (compatível com agregadores)
- Campos principais: `level`, `time`, `service`, `msg`, `method`, `path`, `statusCode`

## 5) Contingência

Se a origem WS cair ou atrasar:

1. Abra o painel **"Painel manual (fallback)"**
2. Preencha lote/lance/status
3. Clique **"Aplicar manual"**
4. Quando WS normalizar, clique **"Voltar ao automático"**

## 6) Critérios de validação antes de transmissão

- [ ] `npm test` aprovado
- [ ] `healthcheck.sh` sem erro
- [ ] overlay renderizando no OBS
- [ ] indicador de stale alterando corretamente
- [ ] reconnect WS testado (desligar/ligar origem)
