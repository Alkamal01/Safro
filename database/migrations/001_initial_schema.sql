-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_id TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    kyc_level INTEGER DEFAULT 0,
    is_agent BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'))
);

-- Escrow transactions (off-chain cache)
CREATE TABLE escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id TEXT UNIQUE NOT NULL,
    creator_id UUID REFERENCES users(id),
    counterparty_id UUID REFERENCES users(id),
    amount_satoshis BIGINT NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('BTC', 'ckBTC')),
    deposit_address TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('CREATED', 'FUNDED', 'DELIVERED', 'RELEASED', 'REFUNDED', 'DISPUTED')),
    time_lock_unix BIGINT,
    ai_risk_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_name TEXT,
    cash_float_usd DECIMAL(15, 2) DEFAULT 0,
    max_transaction_usd DECIMAL(15, 2) DEFAULT 1000,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_transactions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent transactions
CREATE TABLE agent_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) NOT NULL,
    escrow_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('cash_in', 'cash_out')),
    amount_usd DECIMAL(15, 2) NOT NULL,
    amount_satoshis BIGINT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- VAS transactions
CREATE TABLE vas_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('airtime', 'data', 'bill_payment')),
    provider TEXT NOT NULL,
    recipient TEXT NOT NULL,
    amount_usd DECIMAL(15, 2) NOT NULL,
    amount_satoshis BIGINT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    provider_reference TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'whatsapp', 'push')),
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Reconciliation logs
CREATE TABLE reconciliation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type TEXT NOT NULL CHECK (job_type IN ('utxo_check', 'ckbtc_ledger', 'vas_verification', 'agent_settlement')),
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    records_checked INTEGER DEFAULT 0,
    discrepancies_found INTEGER DEFAULT 0,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- AI risk assessments (cache)
CREATE TABLE ai_risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    risk_reasons JSONB,
    recommended_action TEXT NOT NULL CHECK (recommended_action IN ('ALLOW', 'FLAG', 'MANUAL_REVIEW')),
    model_version TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reputation snapshots (periodic cache from canister)
CREATE TABLE reputation_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    completed_deals INTEGER DEFAULT 0,
    dispute_count INTEGER DEFAULT 0,
    avg_response_time_seconds INTEGER DEFAULT 0,
    trust_score INTEGER DEFAULT 50,
    badges JSONB,
    snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- USSD sessions
CREATE TABLE ussd_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    current_menu TEXT NOT NULL,
    session_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX idx_escrow_transactions_creator ON escrow_transactions(creator_id);
CREATE INDEX idx_escrow_transactions_counterparty ON escrow_transactions(counterparty_id);
CREATE INDEX idx_escrow_transactions_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_transactions_created ON escrow_transactions(created_at);

CREATE INDEX idx_users_principal ON users(principal_id);
CREATE INDEX idx_users_phone ON users(phone_number);

CREATE INDEX idx_agent_transactions_agent ON agent_transactions(agent_id);
CREATE INDEX idx_agent_transactions_escrow ON agent_transactions(escrow_id);
CREATE INDEX idx_agent_transactions_status ON agent_transactions(status);

CREATE INDEX idx_vas_transactions_user ON vas_transactions(user_id);
CREATE INDEX idx_vas_transactions_status ON vas_transactions(status);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

CREATE INDEX idx_ai_risk_escrow ON ai_risk_assessments(escrow_id);

CREATE INDEX idx_reputation_snapshots_user ON reputation_snapshots(user_id);

CREATE INDEX idx_ussd_sessions_session_id ON ussd_sessions(session_id);
CREATE INDEX idx_ussd_sessions_phone ON ussd_sessions(phone_number);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_transactions_updated_at BEFORE UPDATE ON escrow_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
