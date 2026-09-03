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
NEXT_PUBLIC_SITE_URL=
SITE_ENV=development
```

## Development

```bash
npm install
npm run seed
npm run seed:calculator
npm run seed:site-settings
npm run migrate:leads
npm run migrate:site-legal
npm run dev
```

- Сайт: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Калькулятор: [http://localhost:3000/calculator](http://localhost:3000/calculator)
- Контакты / заявки: [http://localhost:3000/contacts](http://localhost:3000/contacts)
- Legal: [/privacy](http://localhost:3000/privacy), [/personal-data-consent](http://localhost:3000/personal-data-consent)
- Настройки цен в admin: **Калькулятор** (Global)
- Заявки в admin: **Заявки**
- Реквизиты оператора: **Настройки сайта** → «Реквизиты оператора»

Первого администратора создайте через `/admin` при первом запуске.

Seed work types + demo projects (без admin user):

```bash
npm run seed
```

## Legal

Юридические тексты на `/privacy` и `/personal-data-consent` являются **техническим шаблоном сайта** и должны быть проверены с фактическими реквизитами и процессами оператора перед production.

Не заполняйте реквизиты вымышленными значениями. Пустые поля на публичных страницах не показываются.

`consentVersion` заявок: `v1` (версия текста согласия этого milestone).

## SEO / robots

- `NEXT_PUBLIC_SITE_URL` — канонический origin (canonical, OG, sitemap, robots Sitemap)
- `SITE_ENV=production` — индексация разрешена
- `SITE_ENV=staging` или GitHub Pages — `noindex, nofollow` и `robots Disallow: /`
- `/admin` и `/api` не попадают в sitemap; в production robots — Disallow

## Leads

Заявки с сайта сохраняются в Payload collection **Заявки** (`leads`).

- Формы: `/contacts`, результат `/calculator`, контекст с `/projects/[slug]` и `/services/[slug]`
- Создание только через `/api/public-leads` + Local API (публичный Payload create для `leads` запрещён)
- Калькулятор прикладывает immutable snapshot расчёта
- GitHub Pages **не** отправляет заявки (кнопка disabled / сообщение о демо)
- Удаление заявок в production отключено (`delete` только в development); lifecycle через статусы

Проверка:

```bash
npm run verify:leads
```

Первичное создание таблицы:

```bash
$env:PAYLOAD_DB_PUSH='true'; npm run migrate:leads
```

## Before Production

```text
[ ] заполнены реквизиты оператора
[ ] проверены privacy/consent тексты
[ ] NEXT_PUBLIC_SITE_URL заполнен
[ ] SITE_ENV=production
[ ] staging закрыт/noindex
[ ] Payload admin production password
[ ] database backup strategy
[ ] Object Storage configured
[ ] уведомление Роскомнадзора проверено владельцем бизнеса
```

Владельцу бизнеса необходимо самостоятельно проверить применимость требований о уведомлении Роскомнадзора и иных обязанностей оператора ПДн до запуска сбора персональных данных. Этот README не является юридической консультацией.

## Payload scripts

```bash
npm run payload -- migrate:create
npm run payload -- migrate
npm run migrate:duration
npm run migrate:leads
npm run migrate:site-legal
npm run generate:types
npm run generate:importmap
```

Schema push в dev по умолчанию **выключен** (`PAYLOAD_DB_PUSH=true` только при необходимости).
Интерактивный drizzle push на Windows зависает и даёт в `/admin` ошибку `Failed to fetch`.

## Planned

- email / Telegram notifications for leads
- production rate limiting (Redis / edge)
- S3-compatible media storage (Yandex Object Storage)
- SEO / Yandex Metrica (после staging)
- production hosting в РФ
