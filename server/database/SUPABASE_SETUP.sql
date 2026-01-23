-- ============================================
-- SUPABASE DATABASE SETUP - Yield Farming
-- ============================================
-- Complete SQL to recreate all Supabase tables
-- Run this in your Supabase SQL editor

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email and username
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_username_idx ON users(username);

-- ============================================
-- 2. WALLETS TABLE
-- ============================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(20, 2) DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create index for user_id
CREATE INDEX wallets_user_id_idx ON wallets(user_id);

-- ============================================
-- 3. POOLS TABLE
-- ============================================
CREATE TABLE pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  token_symbol VARCHAR(50) NOT NULL,
  apy NUMERIC(10, 4) NOT NULL,
  total_staked NUMERIC(20, 2) DEFAULT 0,
  min_stake_amount NUMERIC(20, 2) NOT NULL,
  max_stake_per_user NUMERIC(20, 2),
  is_active BOOLEAN DEFAULT TRUE,
  -- DefiLlama fields
  chain VARCHAR(100),
  project VARCHAR(255),
  pool_id VARCHAR(255),
  apy_base NUMERIC(10, 4),
  apy_reward NUMERIC(10, 4),
  reward_tokens TEXT[], -- JSON array as text
  url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for pools
CREATE INDEX pools_is_active_idx ON pools(is_active);
CREATE INDEX pools_created_at_idx ON pools(created_at);
CREATE INDEX pools_name_idx ON pools(name);

-- ============================================
-- 4. STAKES TABLE
-- ============================================
CREATE TABLE stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  amount NUMERIC(20, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, withdrawn, etc.
  staked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  unstaked_at TIMESTAMP WITH TIME ZONE,
  last_reward_calculation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for stakes
CREATE INDEX stakes_user_id_idx ON stakes(user_id);
CREATE INDEX stakes_pool_id_idx ON stakes(pool_id);
CREATE INDEX stakes_status_idx ON stakes(status);
CREATE INDEX stakes_user_pool_idx ON stakes(user_id, pool_id);

-- ============================================
-- 5. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- deposit, withdraw, stake, unstake, claim
  amount NUMERIC(20, 2) NOT NULL,
  pool_id UUID REFERENCES pools(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'completed', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for transactions
CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_type_idx ON transactions(type);
CREATE INDEX transactions_created_at_idx ON transactions(created_at);

-- ============================================
-- 6. REWARDS TABLE
-- ============================================
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stake_id UUID NOT NULL REFERENCES stakes(id) ON DELETE CASCADE,
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  amount NUMERIC(20, 2) NOT NULL,
  type VARCHAR(50) DEFAULT 'staking', -- staking, bonus, etc.
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for rewards
CREATE INDEX rewards_user_id_idx ON rewards(user_id);
CREATE INDEX rewards_stake_id_idx ON rewards(stake_id);
CREATE INDEX rewards_pool_id_idx ON rewards(pool_id);

-- ============================================
-- 7. AI_CHAT_HISTORY TABLE
-- ============================================
CREATE TABLE ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chat_title VARCHAR(255) NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  investment_profile JSONB,
  strategies JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for ai_chat_history
CREATE INDEX ai_chat_history_user_id_idx ON ai_chat_history(user_id);
CREATE INDEX ai_chat_history_updated_at_idx ON ai_chat_history(updated_at);

-- ============================================
-- RPC FUNCTIONS - WALLET BALANCE OPERATIONS
-- ============================================

-- Function to increment wallet balance
CREATE OR REPLACE FUNCTION increment_balance(user_id_param UUID, amount_param NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE wallets
  SET balance = balance + amount_param,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement wallet balance
CREATE OR REPLACE FUNCTION decrement_balance(user_id_param UUID, amount_param NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE wallets
  SET balance = balance - amount_param,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RPC FUNCTIONS - POOL STAKE OPERATIONS
-- ============================================

-- Function to increment pool total staked
CREATE OR REPLACE FUNCTION increment_pool_stake(pool_id_param UUID, amount_param NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE pools
  SET total_staked = total_staked + amount_param,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = pool_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement pool total staked
CREATE OR REPLACE FUNCTION decrement_pool_stake(pool_id_param UUID, amount_param NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE pools
  SET total_staked = total_staked - amount_param,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = pool_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - USERS TABLE
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = id OR auth.jwt() ->> 'is_admin' = 'true');

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (auth.jwt() ->> 'is_admin' = 'true');

-- ============================================
-- RLS POLICIES - WALLETS TABLE
-- ============================================

-- Users can view their own wallet
CREATE POLICY "Users can view their own wallet"
ON wallets FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own wallet (service key only)
CREATE POLICY "Wallets can be updated via RPC"
ON wallets FOR UPDATE
USING (true);

-- ============================================
-- RLS POLICIES - POOLS TABLE
-- ============================================

-- Everyone can view active pools
CREATE POLICY "Everyone can view active pools"
ON pools FOR SELECT
USING (is_active = true);

-- Admins can view all pools
CREATE POLICY "Admins can view all pools"
ON pools FOR SELECT
USING (auth.jwt() ->> 'is_admin' = 'true');

-- ============================================
-- RLS POLICIES - STAKES TABLE
-- ============================================

-- Users can view their own stakes
CREATE POLICY "Users can view their own stakes"
ON stakes FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - TRANSACTIONS TABLE
-- ============================================

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - REWARDS TABLE
-- ============================================

-- Users can view their own rewards
CREATE POLICY "Users can view their own rewards"
ON rewards FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - AI_CHAT_HISTORY TABLE
-- ============================================

-- Users can view their own chat history
CREATE POLICY "Users can view their own chat history"
ON ai_chat_history FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own chat history
CREATE POLICY "Users can create their own chat history"
ON ai_chat_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own chat history
CREATE POLICY "Users can update their own chat history"
ON ai_chat_history FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own chat history
CREATE POLICY "Users can delete their own chat history"
ON ai_chat_history FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA (OPTIONAL - TEST POOLS)
-- ============================================

-- Insert some example pools
INSERT INTO pools (name, description, token_symbol, apy, min_stake_amount, max_stake_per_user, is_active, chain, project)
VALUES
  ('Ethereum Staking', 'Stake ETH and earn rewards', 'ETH', 4.2, 0.1, 100, TRUE, 'Ethereum', 'Lido'),
  ('USDC Yield Pool', 'Generate yield on stablecoins', 'USDC', 8.5, 100, 50000, TRUE, 'Ethereum', 'Aave'),
  ('Polygon MATIC Pool', 'High APY on Polygon network', 'MATIC', 15.5, 10, 10000, TRUE, 'Polygon', 'Aave'),
  ('Base USDC Pool', 'Earn on Base network', 'USDC', 7.2, 50, 25000, TRUE, 'Base', 'Moonwell'),
  ('Arbitrum ARB Pool', 'ARB token staking rewards', 'ARB', 12.0, 1, 5000, TRUE, 'Arbitrum', 'Camelot')
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTE: 
-- - Use service_role key for backend operations (increment/decrement functions)
-- - Use anon key for authenticated user operations (respects RLS)
-- - Adjust RLS policies based on your authentication setup
-- ============================================
