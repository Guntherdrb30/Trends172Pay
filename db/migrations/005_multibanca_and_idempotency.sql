ALTER TABLE merchant_apps
ADD COLUMN IF NOT EXISTS default_provider_code TEXT NOT NULL DEFAULT 'mercantil';

ALTER TABLE payment_sessions
ADD COLUMN IF NOT EXISTS provider_code TEXT NOT NULL DEFAULT 'mercantil',
ADD COLUMN IF NOT EXISTS provider_reference TEXT,
ADD COLUMN IF NOT EXISTS provider_raw_status TEXT,
ADD COLUMN IF NOT EXISTS failure_code TEXT,
ADD COLUMN IF NOT EXISTS failure_reason TEXT,
ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_provider_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS provider_metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_payment_sessions_provider_code
  ON payment_sessions (provider_code);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_sessions_merchant_idempotency
  ON payment_sessions (merchant_app_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
