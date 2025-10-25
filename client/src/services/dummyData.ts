// Dummy data service for demo purposes
// This will be replaced with real blockchain data later

export interface DummyInvestment {
  poolId: string;
  poolName: string;
  tokenSymbol: string;
  amount: number;
  apy: number;
  startDate: Date;
  currentValue: number;
  totalEarned: number;
  chain: string;
}

export interface DummyReward {
  id: string;
  poolId: string;
  poolName: string;
  tokenSymbol: string;
  amount: number;
  usdValue: number;
  earnedDate: Date;
  status: 'pending' | 'claimed';
  chain: string;
}

// Generate dummy investments based on user ID
export const generateDummyInvestments = (userId: string): DummyInvestment[] => {
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return min + ((x - Math.floor(x)) * (max - min));
  };

  const pools = [
    { name: 'Ethereum Staking', symbol: 'ETH', apy: 4.2, chain: 'Ethereum' },
    { name: 'USDC Yield Pool', symbol: 'USDC', apy: 8.5, chain: 'Ethereum' },
    { name: 'BNB Flex Stake', symbol: 'BNB', apy: 6.8, chain: 'BSC' },
    { name: 'Polygon MATIC', symbol: 'MATIC', apy: 12.3, chain: 'Polygon' },
    { name: 'Avalanche Rush', symbol: 'AVAX', apy: 15.7, chain: 'Avalanche' },
    { name: 'Solana Liquid', symbol: 'SOL', apy: 9.2, chain: 'Solana' },
  ];

  const numInvestments = Math.floor(random(2, 5, 0));
  const investments: DummyInvestment[] = [];

  for (let i = 0; i < numInvestments; i++) {
    const pool = pools[Math.floor(random(0, pools.length, i))];
    const amount = random(500, 5000, i + 10);
    const daysInvested = Math.floor(random(1, 180, i + 20));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysInvested);

    const dailyRate = pool.apy / 100 / 365;
    const totalEarned = amount * dailyRate * daysInvested;
    const currentValue = amount + totalEarned;

    investments.push({
      poolId: `pool-${i}`,
      poolName: pool.name,
      tokenSymbol: pool.symbol,
      amount,
      apy: pool.apy,
      startDate,
      currentValue,
      totalEarned,
      chain: pool.chain,
    });
  }

  return investments;
};

// Generate dummy rewards
export const generateDummyRewards = (userId: string): DummyReward[] => {
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, index: number) => {
    const x = Math.sin(seed + index + 1000) * 10000;
    return min + ((x - Math.floor(x)) * (max - min));
  };

  const pools = [
    { name: 'Ethereum Staking', symbol: 'ETH', chain: 'Ethereum', price: 2400 },
    { name: 'USDC Yield Pool', symbol: 'USDC', chain: 'Ethereum', price: 1 },
    { name: 'BNB Flex Stake', symbol: 'BNB', chain: 'BSC', price: 310 },
    { name: 'Polygon MATIC', symbol: 'MATIC', chain: 'Polygon', price: 0.85 },
    { name: 'Avalanche Rush', symbol: 'AVAX', chain: 'Avalanche', price: 38 },
    { name: 'Solana Liquid', symbol: 'SOL', chain: 'Solana', price: 105 },
  ];

  const rewards: DummyReward[] = [];

  // Pending rewards (unclaimed)
  for (let i = 0; i < 4; i++) {
    const pool = pools[Math.floor(random(0, pools.length, i))];
    const amount = random(0.01, 2, i + 30);
    const usdValue = amount * pool.price;
    const daysAgo = Math.floor(random(0, 7, i + 40));
    const earnedDate = new Date();
    earnedDate.setDate(earnedDate.getDate() - daysAgo);

    rewards.push({
      id: `reward-pending-${i}`,
      poolId: `pool-${i}`,
      poolName: pool.name,
      tokenSymbol: pool.symbol,
      amount,
      usdValue,
      earnedDate,
      status: 'pending',
      chain: pool.chain,
    });
  }

  // Claimed rewards (history)
  for (let i = 0; i < 8; i++) {
    const pool = pools[Math.floor(random(0, pools.length, i + 100))];
    const amount = random(0.05, 3, i + 130);
    const usdValue = amount * pool.price;
    const daysAgo = Math.floor(random(7, 60, i + 140));
    const earnedDate = new Date();
    earnedDate.setDate(earnedDate.getDate() - daysAgo);

    rewards.push({
      id: `reward-claimed-${i}`,
      poolId: `pool-${i}`,
      poolName: pool.name,
      tokenSymbol: pool.symbol,
      amount,
      usdValue,
      earnedDate,
      status: 'claimed',
      chain: pool.chain,
    });
  }

  return rewards;
};

// Calculate total portfolio value
export const calculatePortfolioValue = (investments: DummyInvestment[]) => {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const currentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalEarned = investments.reduce((sum, inv) => sum + inv.totalEarned, 0);
  const percentChange = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalEarned,
    percentChange,
  };
};

// Calculate total pending rewards
export const calculatePendingRewards = (rewards: DummyReward[]) => {
  const pending = rewards.filter(r => r.status === 'pending');
  const totalUsdValue = pending.reduce((sum, r) => sum + r.usdValue, 0);

  return {
    count: pending.length,
    totalUsdValue,
    rewards: pending,
  };
};
