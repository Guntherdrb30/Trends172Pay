CREATE TABLE IF NOT EXISTS public_leads (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  business_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  monthly_volume TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_leads_created_at
  ON public_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_public_leads_email
  ON public_leads (email);

CREATE TABLE IF NOT EXISTS public_tracking_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  path TEXT,
  referrer TEXT,
  session_id TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_tracking_events_created_at
  ON public_tracking_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_public_tracking_events_event_name
  ON public_tracking_events (event_name);

CREATE INDEX IF NOT EXISTS idx_public_tracking_events_session_id
  ON public_tracking_events (session_id);
