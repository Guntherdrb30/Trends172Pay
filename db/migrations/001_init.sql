-- Schema inicial para trends172 Pay en PostgreSQL (Neon).

CREATE TABLE IF NOT EXISTS merchant_apps (
  id TEXT PRIMARY KEY,
  business_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,

  logo_url TEXT,
  allowed_domains TEXT[],

  webhook_url TEXT,
  webhook_secret TEXT,
  tech_stack_hint TEXT,

  commission_percent NUMERIC(5, 2) NOT NULL,
  payout_currency TEXT NOT NULL,
  payout_bank_name TEXT,
  payout_account_number TEXT,
  payout_account_holder TEXT,

  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_sessions (
  id TEXT PRIMARY KEY,

  merchant_app_id TEXT NOT NULL REFERENCES merchant_apps(id) ON DELETE CASCADE,
  business_code TEXT NOT NULL,

  origin_system TEXT NOT NULL,

  amount NUMERIC(18, 2) NOT NULL,
  currency TEXT NOT NULL,

  platform_fee_amount NUMERIC(18, 2) NOT NULL,
  merchant_net_amount NUMERIC(18, 2) NOT NULL,

  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'paid', 'failed')),

  customer_name TEXT,
  customer_email TEXT,

  success_url TEXT NOT NULL,
  cancel_url TEXT NOT NULL,

  external_order_id TEXT,
  bank_payment_id TEXT,

  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_sessions_business_code
  ON payment_sessions (business_code);

CREATE INDEX IF NOT EXISTS idx_payment_sessions_status
  ON payment_sessions (status);

CREATE INDEX IF NOT EXISTS idx_payment_sessions_created_at
  ON payment_sessions (created_at);

CREATE INDEX IF NOT EXISTS idx_payment_sessions_external_order_id
  ON payment_sessions (external_order_id);

