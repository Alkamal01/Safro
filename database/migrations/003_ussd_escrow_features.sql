-- Migration: Add USSD and Escrow features
-- Created: 2025-01-XX

-- Update users table with additional fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approval_pin_hash TEXT;

-- Create index on phone_number
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- Deal codes table
CREATE TABLE IF NOT EXISTS deal_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_code VARCHAR(6) UNIQUE NOT NULL,
    escrow_id TEXT NOT NULL,
    seller_id UUID REFERENCES users(id),
    buyer_phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    used BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_deal_codes_code ON deal_codes(deal_code);
CREATE INDEX IF NOT EXISTS idx_deal_codes_escrow ON deal_codes(escrow_id);
CREATE INDEX IF NOT EXISTS idx_deal_codes_seller ON deal_codes(seller_id);

-- KYC documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    document_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_documents_user ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    method_type TEXT NOT NULL CHECK (method_type IN ('mobile_money', 'bank', 'crypto', 'agent')),
    provider TEXT,
    account_number TEXT,
    metadata JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);

-- Update escrow_transactions table if needed
ALTER TABLE escrow_transactions 
ADD COLUMN IF NOT EXISTS funded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS released_at TIMESTAMP WITH TIME ZONE;

-- Add counterparty_id if it doesn't exist
ALTER TABLE escrow_transactions 
ADD COLUMN IF NOT EXISTS counterparty_id UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_escrow_transactions_counterparty ON escrow_transactions(counterparty_id);

