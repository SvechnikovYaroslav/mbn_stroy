# Развёртывание на новом сервере (Ubuntu 24.04)

Целевая машина: Yandex Cloud, `deploy@51.250.74.173`, 2 vCPU / 4 ГиБ RAM / 30 ГиБ.

Топология: снаружи открыты только `22` (SSH) и `80/443` (Caddy). Порты `3000` (app)
и `5432` (postgres) наружу не публикуются.

## 1. Подготовка сервера

```bash
ssh deploy@51.250.74.173

# Docker Engine + compose plugin (официальный репозиторий Docker)
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin git
sudo usermod -aG docker deploy   # перелогиниться после этого
```

Swap на 2 ГиБ — `next build` на VM с 4 ГиБ без swap может упасть по OOM:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Firewall (опционально, если ufw используется):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

## 2. Код и переменные окружения

```bash
sudo mkdir -p /opt/otdelka-360
sudo chown deploy:deploy /opt/otdelka-360
cd /opt/otdelka-360
git clone https://github.com/SvechnikovYaroslav/mbn_stroy.git .
git checkout main

cp .env.production.example .env.production
nano .env.production
```

Обязательно заполнить в `.env.production`:

| Переменная | Что указать |
| --- | --- |
| `PAYLOAD_SECRET` | случайная строка ≥ 32 символов (`openssl rand -hex 48`) |
| `POSTGRES_PASSWORD` | случайный пароль (`openssl rand -hex 24`) |
| `DATABASE_URL` | `postgresql://otdelka_360_app:<POSTGRES_PASSWORD>@postgres:5432/otdelka_360` — пароль должен совпадать с `POSTGRES_PASSWORD` |
| `NEXT_PUBLIC_SITE_URL` | пока нет домена — `http://51.250.74.173`; позже `https://<домен>` |
| `SITE_ENV` | `staging` на первое время (noindex), потом `production` |
| `STAGE_DOMAIN` | пусто = HTTP на :80; домен = Caddy выпустит TLS |
| `S3_BUCKET` | существующий медиа-бакет (`otdelka-360-media-storage` — проверить в консоли YC) |
| `BACKUP_S3_BUCKET` | приватный бакет для бэкапов (`otdelka-360-backups`) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | статический ключ сервисного аккаунта с доступом к обоим бакетам |

## 3. Первый запуск

```bash
cd /opt/otdelka-360
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app npm run migrate
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app npm run seed:production
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

`seed:production` идемпотентен: work types, настройки калькулятора и brand defaults.
Проекты и заявки не создаются — 5 проектов сотрудники внесут вручную через `/admin`.

Проверка:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
curl http://127.0.0.1/api/health   # через Caddy → {"ok":true}
# или напрямую: docker compose ... exec app node -e "fetch('http://127.0.0.1:3000/api/health')..."
```

## 4. Два административных аккаунта

Пароли задаются только через env при вызове, в файлы и git не попадают:

```bash
cd /opt/otdelka-360
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm \
  -e OWNER1_EMAIL='owner1@example.com' \
  -e OWNER1_PASSWORD='<пароль ≥ 24 символов>' \
  -e OWNER1_NAME='Имя 1' \
  -e OWNER2_EMAIL='owner2@example.com' \
  -e OWNER2_PASSWORD='<другой пароль ≥ 24 символов>' \
  -e OWNER2_NAME='Имя 2' \
  app npm run create:owners
```

Скрипт проверяет вход обоих аккаунтов. Альтернатива — первый пользователь через
`/admin` (форма регистрации при пустой коллекции users), второй — из админки.

## 5. Обновления (после первого деплоя)

На сервере в `/opt/otdelka-360`:

```bash
./scripts/deploy.sh full      # git pull --ff-only main → build → migrate → recreate → smoke
./scripts/deploy.sh restart   # пересоздать app/caddy без сборки
./scripts/deploy.sh status    # SHA, compose ps, health, диск, память
./scripts/deploy.sh logs app  # логи app | caddy | postgres
```

С локальной Windows-машины: `rebuild.ssh` / `rebuild.ssh.ps1` (ключ —
`deploy.local.env`, не коммитится). Дефолтный хост уже указывает на новый сервер.

## 6. Резервное копирование PostgreSQL

```bash
chmod +x scripts/backup-postgres.sh
./scripts/backup-postgres.sh
```

Дамп `pg_dump | gzip` → `s3://<BACKUP_S3_BUCKET>/db-backups/YYYY-MM-DD/…sql.gz`,
после загрузки размер объекта сверяется (`HeadObject`). Cron (пример):

```cron
15 3 * * * cd /opt/otdelka-360 && ./scripts/backup-postgres.sh >> /var/log/otdelka-360-backup.log 2>&1
```

Восстановление — см. раздел «PostgreSQL restore» в README.

## 7. Когда появится домен

1. A-запись домена → `51.250.74.173`.
2. В `.env.production`: `STAGE_DOMAIN=<домен>`, `NEXT_PUBLIC_SITE_URL=https://<домен>`.
3. `./scripts/deploy.sh full` (NEXT_PUBLIC_* инлайнится при сборке — нужен rebuild).
4. Caddy сам выпустит TLS. `SITE_ENV=production` — только после финальной проверки.
