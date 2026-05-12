# ParkFlow

Central operacional inteligente para gestao de ocorrencias e sinistros veiculares.

## Stack definida

- Frontend: Next.js + TypeScript + Tailwind, deploy na Vercel
- Backend: Java Spring Boot, deploy na Render
- Banco: PostgreSQL em Docker
- IA: workflows n8n chamando OpenAI por HTTP Request
- Storage: ainda nao implementado em producao

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

Os workflows atuais recebem `multipart/form-data` com o arquivo real no campo `image`. Ainda nao existe pipeline real de storage/Cloudinary no produto.

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

### Banco

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
- se o backend estiver publicado na Render, o banco PostgreSQL em Docker tambem precisa estar acessivel em uma maquina/servidor publico. Um container rodando localmente no seu PC nao sera acessivel pela Render.

Vercel:

- importar a pasta `frontend`;
- configurar `NEXT_PUBLIC_API_URL` com a URL do Render, incluindo `/api`.

IA:

- configurar os dois webhooks n8n na Vercel;
- manter a OpenAI API Key somente dentro do n8n.
