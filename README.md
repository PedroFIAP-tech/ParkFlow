# ParkFlow

Central operacional inteligente para gestao de ocorrencias e sinistros veiculares.

## Stack definida

- Frontend: Next.js + TypeScript + Tailwind, deploy na Vercel
- Backend: Java Spring Boot, deploy na Render
- Banco: Neon PostgreSQL
- IA: OpenAI Responses API
- Storage: Cloudinary

## Estrutura

```txt
ParkFlow/
  backend/   API Spring Boot + JWT + Flyway + Neon + OpenAI + Cloudinary
  frontend/  Webapp/PWA Next.js operacional
```

## O que criar/configurar

### IA

No backend, a IA fica em `backend/src/main/java/br/com/parkflow/integration/ai`.

Ela e responsavel por:

- receber contexto estruturado da ocorrencia;
- enviar fotos do Cloudinary como `input_image`;
- pedir uma resposta JSON estruturada para a OpenAI;
- salvar o resultado em `ai_analyses`;
- marcar confianca, modelo, provider e resposta bruta.

Nao coloque a chave da OpenAI no frontend e nao salve segredo no Git. Configure somente no backend:

```txt
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
```

Endpoints principais:

```txt
POST /api/ai/occurrences/{id}/analyze
GET  /api/ai/occurrences/{id}/analyses
```

Enquanto `OPENAI_API_KEY` estiver vazia, o backend retorna uma analise local de preview. Isso permite demonstrar o fluxo sem consumir creditos nem quebrar a tela.

### Frontend

O frontend consome a API do Spring Boot:

```txt
NEXT_PUBLIC_API_URL=https://sua-api.onrender.com/api
```

### Backend

O backend precisa de:

```txt
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
JWT_SECRET=troque-por-um-segredo-grande
APP_CORS_ALLOWED_ORIGINS=https://seu-front.vercel.app,http://localhost:3000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
```

### Banco

As tabelas sao criadas por Flyway em `backend/src/main/resources/db/migration`.

No Neon, use a URL JDBC no Render:

```txt
SPRING_DATASOURCE_URL=jdbc:postgresql://host/db?sslmode=require
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

Vercel:

- importar a pasta `frontend`;
- configurar `NEXT_PUBLIC_API_URL` com a URL do Render, incluindo `/api`.

Cloudinary:

- criar credenciais;
- configurar `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

OpenAI:

- configurar `OPENAI_API_KEY` no Render;
- manter chamadas somente no backend.
