INSERT INTO global_settings (key, value) VALUES 
('bank_fee_percent', '0.5')
ON CONFLICT (key) DO NOTHING;
