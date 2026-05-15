# ParkFlow

Central privada Smart Parking Security AI para seguranca operacional de estacionamentos, leitura de placa, evidencias, historico de suspeitas e alertas entre unidades.

## Stack definida

- Frontend: Next.js + TypeScript + Tailwind, deploy na Vercel
- Backend: Java Spring Boot, deploy na Render
- Banco: Neon PostgreSQL ou PostgreSQL em Docker para desenvolvimento local
- IA: workflows n8n chamando OpenAI por HTTP Request
- Storage: Cloudinary preparado no backend

## Estrutura

```txt
ParkFlow/
  backend/   API Spring Boot + JWT + Flyway + PostgreSQL
  frontend/  Webapp/PWA Next.js operacional
```

## O que criar/configurar

### IA via n8n

A chave da OpenAI fica somente no n8n. O frontend chama apenas os webhooks publicos:

```txt
NEXT_PUBLIC_N8N_ANALYZE_WEBHOOK_URL=https://pedrosilvapriv.app.n8n.cloud/webhook/parkflow-analyze
NEXT_PUBLIC_N8N_OCR_WEBHOOK_URL=https://pedrosilvapriv.app.n8n.cloud/webhook/parkflow-ocr
```

Os workflows atuais recebem `multipart/form-data` com o arquivo real no campo `image` e devem retornar placa, tipo de veiculo, evidencia relevante, risco operacional e resumo.

### Frontend

O frontend consome a API do Spring Boot:

```txt
NEXT_PUBLIC_API_URL=https://sua-api.onrender.com/api
NEXT_PUBLIC_N8N_ANALYZE_WEBHOOK_URL=https://...
NEXT_PUBLIC_N8N_OCR_WEBHOOK_URL=https://...
```

### Backend

O backend precisa de:

```txt
DATABASE_URL=jdbc:postgresql://...
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
JWT_SECRET=parkflow_2026_ultra_secure_jwt_secret
CORS_ALLOWED_ORIGINS=https://seu-front.vercel.app
```

### Banco e entidades

Modelo principal: `users`, `units`, `vehicles`, `occurrences`, `occurrence_images`, `alerts`, `ai_analysis` e `audit_logs`.

Ao abrir uma ocorrencia com placa ja existente na base interna, o backend gera alerta automatico de reincidencia com unidade anterior, data, tipo e nivel de risco.

### Banco local

As tabelas sao criadas por Flyway em `backend/src/main/resources/db/migration`.

Para desenvolvimento local, suba o PostgreSQL com Docker:

```bash
docker compose up -d parkflow_db
```

Credenciais locais:

```txt
Database: parkflow
User: parkflow
Password: parkflow
Port: 5433 no host, 5432 dentro do container
```

Variaveis do backend:

```txt
DATABASE_URL=jdbc:postgresql://localhost:5433/parkflow
DATABASE_USERNAME=parkflow
DATABASE_PASSWORD=parkflow
```

### Primeiro login local

O backend cria um admin automaticamente quando sobe:

```txt
Email: admin@parkflow.com
Senha: ParkFlow@2026
```

Troque isso nas variaveis:

```txt
APP_SEED_ADMIN_EMAIL=...
APP_SEED_ADMIN_PASSWORD=...
```

## Rodar local

Backend:

```bash
docker compose up -d parkflow_db
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Deploy

Render:

- criar Web Service via `render.yaml`;
- apontar para `backend/Dockerfile`;
- configurar variaveis do backend.
- usar Neon PostgreSQL em producao;
- configurar variaveis do backend no Render.

Vercel:

- importar a pasta `frontend`;
- configurar `NEXT_PUBLIC_API_URL` com a URL do Render, incluindo `/api`.

IA:

- configurar os dois webhooks n8n na Vercel;
- manter a OpenAI API Key somente dentro do n8n.



Passando essa parte, vamos focar no cadastro e login e usuarios, iremos cadastrar todos os supervisores fora de uma tela de cadastro, tipo no banco sabe, entao só ira ter login e tera que ser uma tela intuitiva de login