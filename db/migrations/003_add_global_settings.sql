CREATE TABLE IF NOT EXISTS global_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default values if they don't exist
INSERT INTO global_settings (key, value) VALUES 
('bcv_rate', '55.42'),
('fee_card_percent', '2.9'),
('fee_card_fixed', '0.30'),
('fee_c2p_percent', '1.5'),
('fee_transfer_percent', '1.0')
ON CONFLICT (key) DO NOTHING;
