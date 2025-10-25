// DefiLlama Pool Types
export interface DefiLlamaPool {
  pool: string; // Unique pool identifier
  chain: string; // Blockchain network
  project: string; // Protocol name
  symbol: string; // Token symbol
  tvlUsd: number; // Total Value Locked in USD
  apy?: number; // Total APY
  apyBase?: number; // Base APY (without rewards)
  apyReward?: number; // Reward APY
  rewardTokens?: string[]; // Array of reward token symbols
  underlyingTokens?: string[]; // Array of underlying asset symbols
  poolMeta?: string; // Pool metadata/description
  url?: string; // Pool URL on protocol website
  predictions?: {
    predictedClass?: string; // AI prediction (e.g., "Stable", "Volatile")
    predictedProbability?: number; // Prediction confidence (0-1)
    binnedConfidence?: number; // Binned confidence level (1-5)
  };
  ilRisk?: string; // Impermanent Loss risk
  exposure?: string; // Asset exposure type
}

export interface DefiLlamaResponse {
  status: string;
  data: DefiLlamaPool[];
}

// Internal Database Pool Type
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
  created_at: string;
  updated_at?: string;

  // DefiLlama fields
  chain?: string;
  project?: string;
  pool_id?: string; // External pool ID from DefiLlama
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

  // User-specific fields (populated at runtime)
  yourStake?: number;
  pendingRewards?: number;
  total_stakers?: number;
  lock_period_days?: number;
}

// Pool creation/update data
export interface CreatePoolData {
  name: string;
  description?: string;
  token_symbol: string;
  apy: number;
  min_stake_amount: number;
  max_stake_per_user?: number;
  is_active?: boolean;

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

export interface UpdatePoolData extends Partial<CreatePoolData> {
  id: string;
}

// Normalized pool for internal processing
export interface NormalizedPool {
  poolId: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  rewardTokens: string[];
  underlyingTokens: string[];
  poolMeta: string;
  name: string;
  description: string;
  url: string;
  predictedClass?: string;
  predictedProbability?: number;
  binnedConfidence?: number;
  ilRisk?: string;
  exposure?: string;
}

// Pool filter options
export interface PoolFilters {
  chain?: string;
  project?: string;
  minApy?: number;
  maxApy?: number;
  minTvl?: number;
  maxTvl?: number;
  riskClass?: string;
  isActive?: boolean;
  search?: string;
}

// Pool response with user data
export interface PoolWithUserData extends Pool {
  yourStake: number;
  pendingRewards: number;
}
