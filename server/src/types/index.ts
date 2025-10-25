import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    isAdmin: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface Pool {
  id: string;
  name: string;
  description?: string;
  token_symbol: string;
  apy: string;
  total_staked: string;
  min_stake_amount: string;
  max_stake_per_user?: string;
  is_active: boolean;
  created_at: string;
  // DefiLlama fields
  chain?: string;
  project?: string;
  pool_id?: string;
  apy_base?: string;
  apy_reward?: string;
  reward_tokens?: string[];
  url?: string;
}

export interface Stake {
  id: string;
  user_id: string;
  pool_id: string;
  amount: string;
  status: string;
  staked_at: string;
  unstaked_at?: string;
  last_reward_calculation: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: string;
  pool_id?: string;
  status: string;
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  stake_id: string;
  pool_id: string;
  amount: string;
  type: string;
  claimed_at: string;
}