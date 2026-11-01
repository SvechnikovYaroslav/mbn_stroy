# План перехода Payload Media на S3 (otdelka-360-media-storage)

## Текущее состояние

- 14 Media-записей в БД → `/api/media/file/<name>` → volume `otdelka-360_media_data` (56 файлов).
- Реально используются 5: `cover-2.jpg` + `01-7/8/9.jpg` (проект 4, published), `01-6.jpg` (проект 5, draft). Остальные 9 — несвязанные/тестовые.
- Статика `/public/images/*` и `/public/media/*` — в образе, S3 не нужна.
- `S3_BUCKET=` пуст → s3Storage выключен. Ключи уже в `.env.production`.

## Порядок переключения

1. `scripts/backup-postgres.sh` — дамп перед изменениями.
2. `node scripts/sync-media-to-s3.mjs` — dry-run: что будет загружено.
3. `node scripts/sync-media-to-s3.mjs --apply` — заливка всех 56 файлов под `media/<filename>`, HeadObject перед каждым PUT, существующие не перезаписываются; конфликты → exit 2.
4. Verify: `ListObjectsV2` по `media/` — 56 новых объектов рядом со 164 старыми.
5. `.env.production`: `S3_BUCKET=otdelka-360-media-storage`.
6. `compose up -d --force-recreate app` (тот же образ — S3 включается через env).
7. Проверки: `/api/media/file/cover-2.jpg` → 200 (теперь из S3); страница проекта 4; `/admin` → Media показывает thumbnails; тестовая загрузка файла → появляется в бакете под `media/`.

## Откат

`S3_BUCKET=` → `compose up -d --force-recreate app` — возврат к volume (файлы сохранены). Бакетные объекты не трогаем.

## Импорт выбранных prod-фото

1. Владелец отмечает группы в `D:\mbn_stroy\media-audit\index.html` (номера #1–32).
2. Из `manifest.json` берутся ключи **оригиналов** → файл списка (1 ключ/строка).
3. `tsx src/scripts/import-s3-media.ts list.txt` (dry-run) → `--apply`.
   Скачивает оригинал → `payload.create({collection:'media'})` → Payload генерирует варианты. Дедуп по `filename`. Печатает созданные id — откат = удалить docs в /admin.
4. Привязка к проектам вручную в админке.

## Риски

- Имя при импорте: Payload перегенерирует filename (добавит свой суффикс) — связи старых prod-проектов к этим файлам не восстанавливаются автоматически, привязка ручная.
- При включённом S3 новые загрузки минуют volume — старые локальные файлы остаются на случай отката.
