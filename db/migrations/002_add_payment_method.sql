ALTER TABLE payment_sessions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE payment_sessions ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10, 2);
