export interface UserInvestmentProfile {
  investmentAmount: number;
  expectedReturns: number; // percentage
  targetApy: number; // percentage
  investmentDays: number; // number of days to achieve returns
  riskTolerance?: 'low' | 'medium' | 'high';
  timeHorizon?: 'short' | 'medium' | 'long'; // short: <3mo, medium: 3-12mo, long: >12mo
}

export interface StrategyAllocation {
  poolId: string;
  poolName: string;
  tokenSymbol: string;
  apy: number;
  allocatedAmount: number;
  allocatedPercentage: number;
  expectedReturn: number;
}

export interface InvestmentStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number; // 1-10
  rewardPotential: number; // 1-10
  totalApy: number;
  projectedReturn: number;
  allocations: StrategyAllocation[];
  pros: string[];
  cons: string[];
  timeframe: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  strategies?: InvestmentStrategy[];
}
