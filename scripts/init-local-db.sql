-- Optional helper for local PostgreSQL (without Docker).
-- Run as a superuser, e.g.:
--   psql -U postgres -f scripts/init-local-db.sql

CREATE USER mbn_stroy WITH PASSWORD 'mbn_stroy_local_dev';
CREATE DATABASE mbn_stroy OWNER mbn_stroy;
GRANT ALL PRIVILEGES ON DATABASE mbn_stroy TO mbn_stroy;
