# Whisper Worker (Cloudflare Workers + Workers AI)

Este Worker busca um arquivo MP3 público e realiza transcrição usando o modelo `@cf/openai/whisper-large-v3-turbo` via binding `env.AI`.

## Requisitos

- Node.js instalado (para usar o `wrangler`)
- `wrangler` instalado globalmente:

```bash
npm i -g wrangler
```

## Configuração

O arquivo `wrangler.toml` já está configurado com:

- `account_id = "15d816f9860d7764ccb5644d673f09ee"`
- Binding:
  ```toml
  [ai]
  binding = "AI"
  ```
- `nodejs_compat = true` (para uso de `Buffer`)

Autenticação recomendada:

- Interativa (recomendada):  
  ```bash
  wrangler login
  ```
- Não interativa (ex.: CI/CD) com API Token (NÃO commitar tokens):  
  ```bash
  wrangler config --api-token YOUR_API_TOKEN
  ```

> Observação: usando o binding `env.AI`, você não precisa incluir `Authorization` manualmente no código; o runtime do Workers gerencia isso após o `wrangler login/config`.

## Desenvolvimento

```bash
wrangler dev
```

Abra a URL local exibida pelo Wrangler para testar.

## Deploy

```bash
wrangler deploy
```

## Código principal

Veja `src/worker.js`. Ele:
- Faz `fetch` do MP3 a partir de uma URL pública.
- Converte o binário para base64 (usando `Buffer` graças ao `nodejs_compat`).
- Invoca `env.AI.run("@cf/openai/whisper-large-v3-turbo", { audio })`.

Se desejar trocar o áudio, altere a constante `URL` em `src/worker.js`.

## Rodar localmente (sem Wrangler)

Se você prefere executar no seu PC sem `wrangler`, use o script `local-whisper.js`, que chama a API HTTP do Workers AI diretamente:

1) Defina as variáveis de ambiente (PowerShell no Windows):
```powershell
$env:CLOUDFLARE_ACCOUNT_ID="15d816f9860d7764ccb5644d673f09ee"
$env:CLOUDFLARE_API_TOKEN="SEU_API_TOKEN_AQUI"
```
Opcional: para usar outro áudio público
```powershell
$env:AUDIO_URL="https://seu-servidor/arquivo.mp3"
```

2) Execute com Node 18+:
```powershell
node local-whisper.js
```

O script:
- Baixa o MP3 da URL informada (ou a padrão do exemplo)
- Converte para base64
- Faz POST para `https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/openai/whisper-large-v3-turbo`
- Imprime o resultado de transcrição no console


