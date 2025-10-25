export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Pool {
  id: string;
  name: string;
  description?: string;
  token_symbol: string;
  apy: number;
  total_staked: number;
  min_stake_amount: number;
  max_stake_per_user?: number;
  is_active: boolean;
  yourStake: number;
  pendingRewards: number;
  created_at: string;
  total_stakers?: number;
  lock_period_days?: number;

  // DefiLlama fields
  chain?: string;
  project?: string;
  pool_id?: string;
  apy_base?: number;
  apy_reward?: number;
  reward_tokens?: string[];
  underlying_tokens?: string[];
  pool_meta?: string;
  url?: string;
  tvl_usd?: number;
  predicted_class?: string;
  predicted_probability?: number;
  binned_confidence?: number;
  il_risk?: string;
  exposure?: string;
}

export interface Stake {
  id: string;
  pool_id: string;
  amount: number;
  staked_at: string;
  pendingRewards: number;
  pools: {
    name: string;
    token_symbol: string;
    apy: number;
  };
}

export interface WalletBalance {
  balance: number;
  stakedBalance: number;
  pendingRewards: number;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  pools?: {
    name: string;
    token_symbol: string;
  };
}

export interface DashboardOverview {
  totalValueStaked: number;
  totalRewardsEarned: number;
  pendingRewards: number;
  availableBalance: number;
  activeStakes: number;
  activePositions: ActivePosition[];
}

export interface ActivePosition {
  stakeId: string;
  poolId: string;
  poolName: string;
  tokenSymbol: string;
  stakedAmount: number;
  currentAPY: number;
  pendingRewards: number;
  stakedAt: string;
}