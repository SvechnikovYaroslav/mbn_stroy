# Отделка 360

## Project

Отделка 360 (ранее MBN Строй)

## Purpose

Сайт компании по ремонту квартир и домов в Туле.

Слоган: **Решаем задачи — меняем пространство**

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Payload CMS
- PostgreSQL 17
- Yandex Object Storage (media: otdelka-360-media, backups: otdelka-360-backups)
- Caddy (production reverse proxy)

## Architecture

### Development

```text
PostgreSQL (local / docker-compose.yml)
   ↓
Payload CMS (/admin) — local filesystem uploads
   ↓
Public frontend
```

### Production / staging (Yandex Cloud VM)

```text
Internet
   ↓ 80/443
Caddy
   ↓
app:3000  (Next.js + Payload)
   ↓
postgres:5432  (Docker network only)

Payload media  →  Yandex Object Storage (otdelka-360-media)
DB backups     →  Yandex Object Storage (otdelka-360-backups), prefix db-backups/YYYY-MM-DD/
```

Портфолио в server runtime читает **только published** проекты. Изменения в `/admin` после Publish видны на сайте без `npm run build` / redeploy (dynamic routes).

### GitHub Pages demo

```text
src/data/projects.ts
   ↓
static export frontend
```

GitHub Pages **не** подключается к PostgreSQL и **не** использует S3.
Demo — зафиксированный snapshot mock data, `noindex`, заявки отключены.

```bash
npm run build:pages
```

Репозиторий и Pages URL пока сохраняют путь `/mbn_stroy` (имя GitHub repo). Публичный бренд на страницах — **Отделка 360**.

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

Defaults из `docker-compose.yml` (только локальная разработка):

- database: `mbn_stroy`
- user: `mbn_stroy`
- password: `mbn_stroy_local_dev`
- port: `5432`

Production использует другие имена БД (`otdelka_360`) через `.env.production`.

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

Локально **не** задавайте `S3_*` — Payload пишет медиа в каталог `media/`.
Production/staging с заполненными `S3_*` пишет медиа в Object Storage.

## Development

```bash
npm install
npm run migrate          # если используете migrations вместо push
npm run seed:production  # work types + calculator/site defaults, без demo projects
# или для локальных черновиков проектов:
npm run seed
npm run seed:calculator
npm run seed:site-settings
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

Первого администратора создайте через `/admin` при первом запуске или `npm run create:admin`.

## Legal

Юридические тексты на `/privacy` и `/personal-data-consent` являются **техническим шаблоном сайта** и должны быть проверены с фактическими реквизитами и процессами оператора перед production.

Не заполняйте реквизиты вымышленными значениями. Пустые поля на публичных страницах не показываются.

`consentVersion` заявок: `v1` (версия текста согласия этого milestone).

## SEO / robots

- `NEXT_PUBLIC_SITE_URL` — канонический origin (canonical, OG, sitemap, robots Sitemap)
- `SITE_ENV=production` — индексация разрешена
- `SITE_ENV=staging` или GitHub Pages — `noindex, nofollow` и `robots Disallow: /`
- `/admin` и `/api` не попадают в sitemap; в production robots — Disallow

Первый cloud deploy: **`SITE_ENV=staging`**.

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

## Payload migrations

Production **не** использует `push: true`. Схема накатывается командой migrate — не при старте контейнера.

```bash
npm run generate:types
npm run migrate:create optional-name
npm run migrate
npm run migrate:status
```

Deploy:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app npm run migrate
```

Не запускайте `payload migrate:fresh` / `migrate:reset` на production данных.

Локально `PAYLOAD_DB_PUSH=true` по-прежнему можно использовать как песочницу. Не смешивайте push и migrations на одной и той же базе.

## Seeds

| Команда | Назначение |
| --- | --- |
| `npm run seed:production` | Idempotent: work types, пустой калькулятор, пустые brand defaults. **Без** Projects/Leads |
| `npm run seed` | Local/dev: work types + demo project drafts (запрещён при `SITE_ENV=production`) |
| `npm run seed:calculator` | Заполняет калькулятор, если base rates пустые (`FORCE_SEED=true` — перезаписать) |
| `npm run seed:site-settings` | Brand defaults, не трогает заполненные поля |

## Production (Yandex VM) — first deploy

Репозиторий готовит стек. Этот README **не** запускает VM/DNS/сертификаты за вас.

Пример:

```bash
git clone <repo-url>
cd <repo>
git checkout feat/cloud-deploy

cp .env.production.example .env.production
# заполнить secrets: PAYLOAD_SECRET, POSTGRES_PASSWORD, DATABASE_URL,
# S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, NEXT_PUBLIC_SITE_URL
# S3_BUCKET=otdelka-360-media
# BACKUP_S3_BUCKET=otdelka-360-backups
# SITE_ENV=staging
# STAGE_DOMAIN=   # пусто для HTTP на :80 по IP

docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app npm run migrate
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app npm run seed:production
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Проверка:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f postgres
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f caddy
```

Smoke-test без DNS (временно публикует `:3000` — не для финального production):

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml -f docker-compose.smoke.yml up -d
# http://<VM-IP>:3000
```

Финальная topology: наружу только Caddy `80/443`. Порты `3000` и `5432` не публикуются.

Когда появится staging-домен, задайте `STAGE_DOMAIN` (без хардкода в репозитории) и перезапустите Caddy — HTTPS выпускает Caddy.

### Smoke-test checklist

- [ ] app starts (`/api/health` → `{"ok":true}`)
- [ ] Payload connects to postgres
- [ ] `/admin` loads
- [ ] login works
- [ ] project create works
- [ ] image upload reaches Yandex Object Storage
- [ ] video upload reaches Yandex Object Storage
- [ ] calculator reads settings
- [ ] lead creates DB row (`/api/public-leads`)
- [ ] restart containers preserves DB (`postgres_data` volume)

## PostgreSQL backup

Скрипт (на VM, не внутри image cron):

```bash
chmod +x scripts/backup-postgres.sh
./scripts/backup-postgres.sh
```

Логика: `pg_dump` → `gzip` → bucket `BACKUP_S3_BUCKET` (`otdelka-360-backups`), ключ `db-backups/YYYY-MM-DD/otdelka-360-<timestamp>.sql.gz`.

`S3_BUCKET` (`otdelka-360-media`) используется только Payload Media и в бэкапы не пишется.

Пример cron на VM (не создаётся автоматически):

```cron
15 3 * * * cd /opt/otdelka-360 && ./scripts/backup-postgres.sh >> /var/log/otdelka-360-backup.log 2>&1
```

Retention automation пока не нужна.

## PostgreSQL restore

Не выполняется автоматически.

1. Скачать объект `db-backups/YYYY-MM-DD/....sql.gz` из bucket `otdelka-360-backups` (`BACKUP_S3_BUCKET`).
2. Распаковать: `gunzip otdelka-360-....sql.gz`
3. Восстановить в **остановленный/чистый** postgres (или отдельную базу):

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < otdelka-360-....sql
```

Если dump сделан custom-format (`pg_dump -Fc`), используйте `pg_restore` вместо `psql`. Текущий скрипт пишет plain SQL + gzip.

## Before Production

```text
[ ] заполнены реквизиты оператора
[ ] проверены privacy/consent тексты
[ ] NEXT_PUBLIC_SITE_URL заполнен
[ ] SITE_ENV=production  (первый cloud deploy — staging)
[ ] staging закрыт/noindex
[ ] Payload admin production password
[ ] database backup cron на VM
[ ] Object Storage configured
[ ] домен / TLS (Caddy + STAGE_DOMAIN)
[ ] уведомление Роскомнадзора проверено владельцем бизнеса
```

Владельцу бизнеса необходимо самостоятельно проверить применимость требований о уведомлении Роскомнадзора и иных обязанностей оператора ПДн до запуска сбора персональных данных. Этот README не является юридической консультацией.

## Planned

- email / Telegram notifications for leads
- production rate limiting (Redis / edge)
- SEO / Yandex Metrica (после staging)
- DNS / TLS на реальном домене
