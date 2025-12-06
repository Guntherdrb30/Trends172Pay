-- Migration: Add authentication fields to merchant_apps

ALTER TABLE merchant_apps
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS balance_currency TEXT DEFAULT 'USD';

-- Backfill existing rows with dummy data if needed to avoid null constraint issues if we added NOT NULL directly (which we didn't for safety, but plan implied it).
-- For this MVP, we will allow them to be nullable initially or just update them manually if needed.
-- However, for new signups they will be required.
