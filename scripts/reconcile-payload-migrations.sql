-- One-time reconciliation for a database created via Payload drizzle `push`.
-- The restored dev DB carries a `dev`/-1 marker instead of real migration
-- records. Payload's migrate() would otherwise show an interactive
-- "data loss" prompt and exit without running anything.
--
-- Preconditions (verified on 2026-11-01 test restore):
--   * schema == 20260913_152037_initial
--     (only cosmetic drift: site_settings.company_name column DEFAULT)
--   * payload_migrations contains exactly one row: name='dev', batch=-1
--
-- The script is transactional and aborts if the expected state is not found.
-- It does NOT touch business data — only the payload_migrations bookkeeping row.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM payload_migrations WHERE name = 'dev' AND batch = -1
  ) THEN
    RAISE EXCEPTION 'reconcile aborted: expected dev/-1 marker not found';
  END IF;
  IF EXISTS (
    SELECT 1 FROM payload_migrations WHERE name = '20260913_152037_initial'
  ) THEN
    RAISE EXCEPTION 'reconcile aborted: initial migration already recorded';
  END IF;
  IF (SELECT count(*) FROM payload_migrations) <> 1 THEN
    RAISE EXCEPTION 'reconcile aborted: unexpected payload_migrations row count';
  END IF;
END $$;

UPDATE payload_migrations
SET name = '20260913_152037_initial',
    batch = 1,
    updated_at = now()
WHERE name = 'dev' AND batch = -1;

COMMIT;
