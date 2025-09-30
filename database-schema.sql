-- BANGZ SALOON Database Schema for Supabase
-- This replaces the Google Sheets structure with a proper PostgreSQL database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (replaces Users sheet)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Worker' CHECK (role IN ('Admin', 'Worker')),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workers table (replaces Workers sheet)
CREATE TABLE workers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(100) DEFAULT 'Worker',
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table (replaces Services sheet)
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Normal', 'Promotional')),
    service_name VARCHAR(255) NOT NULL,
    cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, service_name)
);

-- Transactions table (replaces Transactions sheet)
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    customer_name VARCHAR(255),
    service TEXT NOT NULL,
    worker VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    tip DECIMAL(10,2) DEFAULT 0 CHECK (tip >= 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('Cash', 'Card')),
    notes TEXT,
    phone VARCHAR(20),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_worker ON transactions(worker);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_workers_email ON workers(email);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view all workers" ON workers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage workers" ON workers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id::text = auth.uid()::text 
        AND users.role = 'Admin'
    )
);

CREATE POLICY "Users can view all services" ON services FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage services" ON services FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id::text = auth.uid()::text 
        AND users.role = 'Admin'
    )
);

CREATE POLICY "Users can view all transactions" ON transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create transactions" ON transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update transactions" ON transactions FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id::text = auth.uid()::text 
        AND users.role = 'Admin'
    )
);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO users (name, email, password_hash, role, status) VALUES 
('System Administrator', 'admin@bangzsaloon.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'Active');

INSERT INTO services (category, service_name, cost) VALUES 
('Promotional', 'Basic Hair Cut', 15.00),
('Promotional', 'Premium Hair Cut', 10.00),
('Promotional', 'Hair Styling', 15.00),
('Promotional', 'head massage', 15.00),
('Promotional', 'Normal Scrub', 20.00),
('Promotional', 'Normal Facial', 30.00),
('Promotional', 'Gold Facial', 50.00),
('Promotional', 'Whiting Facial', 70.00),
('Promotional', 'Dimond Facial', 100.00),
('Promotional', 'Hair color Black', 25.00),
('Promotional', 'Stylish Color', 30.00),
('Promotional', 'Highlights Color', 40.00),
('Promotional', 'Hair SPA', 30.00),
('Promotional', 'Pedicure', 50.00),
('Promotional', 'Menicure', 30.00);

-- Views for common queries
CREATE VIEW daily_sales_summary AS
SELECT 
    date,
    COUNT(*) as transaction_count,
    SUM(amount) as total_sales,
    SUM(CASE WHEN payment_method = 'Cash' THEN amount ELSE 0 END) as cash_total,
    SUM(CASE WHEN payment_method = 'Card' THEN amount ELSE 0 END) as card_total,
    SUM(tip) as total_tips
FROM transactions
GROUP BY date
ORDER BY date DESC;

CREATE VIEW worker_performance AS
SELECT 
    worker,
    COUNT(*) as transaction_count,
    SUM(amount) as total_sales,
    SUM(tip) as total_tips,
    AVG(amount) as average_transaction,
    MAX(date) as last_transaction_date
FROM transactions
GROUP BY worker
ORDER BY total_sales DESC;
