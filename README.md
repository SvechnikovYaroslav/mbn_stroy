# MBN Строй

## Project

MBN Строй

## Purpose

Сайт компании по ремонту квартир и домов в Туле.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Payload CMS
- PostgreSQL

## Architecture

### Development / future production

```text
PostgreSQL
   ↓
Payload CMS (/admin)
   ↓
Payload Local API (getPayload)
   ↓
Public frontend (/, /projects, /projects/[slug])
```

Портфолио в server runtime читает **только published** проекты. Изменения в `/admin` после Publish видны на сайте без `npm run build` / redeploy (dynamic routes).

### GitHub Pages demo

```text
src/data/projects.ts
   ↓
static export frontend
```

GitHub Pages **не** подключается к PostgreSQL и **не** отражает изменения из `/admin`.
Demo — зафиксированный snapshot mock data.

```bash
npm run build:pages
```

## Local database

PostgreSQL нужен для `/admin` и Payload API.

### Docker Compose (рекомендуется)

Если установлен Docker:

```bash
docker compose up -d
```

Остановка (данные сохраняются в volume):

```bash
docker compose down
```

Не используйте `docker compose down -v` как обычную команду — флаг `-v` удаляет volume с базой.

Defaults из `docker-compose.yml`:

- database: `mbn_stroy`
- user: `mbn_stroy`
- password: `mbn_stroy_local_dev`
- port: `5432`

### Локальный PostgreSQL без Docker

Можно использовать установленный PostgreSQL. Создайте базу `mbn_stroy` и укажите `DATABASE_URL` в `.env`.

## Environment

```bash
cp .env.example .env
# или
node scripts/create-local-env.mjs
```

Заполните:

```text
DATABASE_URL=
PAYLOAD_SECRET=
```

## Development

```bash
npm install
npm run dev
```

- Сайт: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

Первого администратора создайте через `/admin` при первом запуске.

Seed work types + demo projects (без admin user):

```bash
npm run seed
```

## Payload scripts

```bash
npm run payload -- migrate:create
npm run payload -- migrate
npm run migrate:duration
npm run generate:types
npm run generate:importmap
```

Schema push в dev по умолчанию **выключен** (`PAYLOAD_DB_PUSH=true` только при необходимости).
Интерактивный drizzle push на Windows зависает и даёт в `/admin` ошибку `Failed to fetch`.

## Planned

- renovation calculator
- S3-compatible media storage (Yandex Object Storage)
- SEO / Yandex Metrica
- production hosting в РФ
