import { Pool } from '@/types';
import { InvestmentStrategy, StrategyAllocation, UserInvestmentProfile } from '@/types/strategy';

export class StrategyService {
  /**
   * Generate investment strategies based on user profile and available pools
   */
  static generateStrategies(
    profile: UserInvestmentProfile,
    pools: Pool[]
  ): InvestmentStrategy[] {
    const strategies: InvestmentStrategy[] = [];

    // Sort pools by APY
    const sortedPools = [...pools].sort((a, b) => b.apy - a.apy);

    // Strategy 1: Conservative (Low Risk)
    strategies.push(this.generateConservativeStrategy(profile, sortedPools));

    // Strategy 2: Balanced (Medium Risk)
    strategies.push(this.generateBalancedStrategy(profile, sortedPools));

    // Strategy 3: Aggressive (High Risk)
    strategies.push(this.generateAggressiveStrategy(profile, sortedPools));

    // Strategy 4: Target APY Strategy
    if (profile.targetApy) {
      const targetStrategy = this.generateTargetApyStrategy(profile, sortedPools);
      if (targetStrategy) {
        strategies.push(targetStrategy);
      }
    }

    return strategies;
  }

  private static generateConservativeStrategy(
    profile: UserInvestmentProfile,
    pools: Pool[]
  ): InvestmentStrategy {
    // Select top stable pools with moderate APY (between 5-15%)
    let stablePools = pools.filter(p => p.apy >= 5 && p.apy <= 15 && p.total_staked > 100000);

    // Fallback: if no pools meet criteria, use pools with lower TVL
    if (stablePools.length === 0) {
      stablePools = pools.filter(p => p.apy >= 5 && p.apy <= 15);
    }

    // Fallback: if still no pools, use any moderate APY pools
    if (stablePools.length === 0) {
      stablePools = pools.filter(p => p.apy >= 5 && p.apy <= 30);
    }

    // Final fallback: use any pools
    if (stablePools.length === 0) {
      stablePools = pools.slice(0, 3);
    }

    const selectedPools = stablePools.slice(0, 3);

    const allocations = this.createEqualAllocations(profile.investmentAmount, selectedPools);
    const totalApy = this.calculateWeightedApy(allocations);
    const projectedReturn = (profile.investmentAmount * totalApy) / 100;

    return {
      id: 'conservative',
      name: 'Conservative Growth',
      description: 'Low-risk strategy focusing on established pools with proven track records. Diversified across multiple stable pools to minimize volatility.',
      riskLevel: 'low',
      riskScore: 3,
      rewardPotential: 5,
      totalApy,
      projectedReturn,
      allocations,
      pros: [
        'Lower volatility and risk',
        'Established pools with high liquidity',
        'Diversified across multiple pools',
        'Suitable for long-term holdings'
      ],
      cons: [
        'Lower potential returns',
        'May not meet aggressive growth targets',
        'Limited exposure to high-yield opportunities'
      ],
      timeframe: 'Long-term (6-12+ months)'
    };
  }

  private static generateBalancedStrategy(
    profile: UserInvestmentProfile,
    pools: Pool[]
  ): InvestmentStrategy {
    // Mix of stable and moderate-high APY pools
    let stablePools = pools.filter(p => p.apy >= 5 && p.apy <= 15 && p.total_staked > 100000).slice(0, 2);
    let moderatePools = pools.filter(p => p.apy > 15 && p.apy <= 50 && p.total_staked > 50000).slice(0, 2);

    // Fallback for stable pools
    if (stablePools.length === 0) {
      stablePools = pools.filter(p => p.apy >= 5 && p.apy <= 15).slice(0, 2);
    }
    if (stablePools.length === 0) {
      stablePools = pools.slice(0, 2);
    }

    // Fallback for moderate pools
    if (moderatePools.length === 0) {
      moderatePools = pools.filter(p => p.apy > 15 && p.apy <= 50).slice(0, 2);
    }
    if (moderatePools.length === 0) {
      moderatePools = pools.slice(2, 4);
    }

    // 60% in stable, 40% in moderate
    const allocations: StrategyAllocation[] = [];
    const stableAmount = profile.investmentAmount * 0.6;
    const moderateAmount = profile.investmentAmount * 0.4;

    if (stablePools.length > 0) {
      stablePools.forEach((pool) => {
        const amount = stableAmount / stablePools.length;
        allocations.push({
          poolId: pool.id,
          poolName: pool.name,
          tokenSymbol: pool.token_symbol,
          apy: pool.apy,
          allocatedAmount: amount,
          allocatedPercentage: (amount / profile.investmentAmount) * 100,
          expectedReturn: (amount * pool.apy) / 100
        });
      });
    }

    if (moderatePools.length > 0) {
      moderatePools.forEach((pool) => {
        const amount = moderateAmount / moderatePools.length;
        allocations.push({
          poolId: pool.id,
          poolName: pool.name,
          tokenSymbol: pool.token_symbol,
          apy: pool.apy,
          allocatedAmount: amount,
          allocatedPercentage: (amount / profile.investmentAmount) * 100,
          expectedReturn: (amount * pool.apy) / 100
        });
      });
    }

    const totalApy = this.calculateWeightedApy(allocations);
    const projectedReturn = (profile.investmentAmount * totalApy) / 100;

    return {
      id: 'balanced',
      name: 'Balanced Growth',
      description: 'Balanced risk-reward strategy combining stable pools with higher-yield opportunities. 60% in established pools, 40% in moderate-risk pools.',
      riskLevel: 'medium',
      riskScore: 5,
      rewardPotential: 7,
      totalApy,
      projectedReturn,
      allocations,
      pros: [
        'Balanced risk-reward ratio',
        'Exposure to both stable and high-yield pools',
        'Good diversification',
        'Moderate growth potential'
      ],
      cons: [
        'Moderate risk exposure',
        'May not maximize returns',
        'Requires active monitoring'
      ],
      timeframe: 'Medium-term (3-6 months)'
    };
  }

  private static generateAggressiveStrategy(
    profile: UserInvestmentProfile,
    pools: Pool[]
  ): InvestmentStrategy {
    // Focus on high APY pools
    let highYieldPools = pools.filter(p => p.apy > 20 && p.apy < 500).slice(0, 4);

    // Fallback: if no high-yield pools, use top APY pools
    if (highYieldPools.length === 0) {
      const sortedByApy = [...pools].sort((a, b) => b.apy - a.apy);
      highYieldPools = sortedByApy.slice(0, 4);
    }

    // Ensure we have at least some pools
    if (highYieldPools.length === 0) {
      highYieldPools = pools.slice(0, 4);
    }

    // 70% in top 2 highest APY, 30% in next 2
    const allocations: StrategyAllocation[] = [];
    const primaryAmount = profile.investmentAmount * 0.7;
    const secondaryAmount = profile.investmentAmount * 0.3;

    const primaryPools = highYieldPools.slice(0, Math.min(2, highYieldPools.length));
    const secondaryPools = highYieldPools.slice(2, Math.min(4, highYieldPools.length));

    if (primaryPools.length > 0) {
      primaryPools.forEach((pool) => {
        const amount = primaryAmount / primaryPools.length;
        allocations.push({
          poolId: pool.id,
          poolName: pool.name,
          tokenSymbol: pool.token_symbol,
          apy: pool.apy,
          allocatedAmount: amount,
          allocatedPercentage: (amount / profile.investmentAmount) * 100,
          expectedReturn: (amount * pool.apy) / 100
        });
      });
    }

    if (secondaryPools.length > 0) {
      secondaryPools.forEach((pool) => {
        const amount = secondaryAmount / secondaryPools.length;
        allocations.push({
          poolId: pool.id,
          poolName: pool.name,
          tokenSymbol: pool.token_symbol,
          apy: pool.apy,
          allocatedAmount: amount,
          allocatedPercentage: (amount / profile.investmentAmount) * 100,
          expectedReturn: (amount * pool.apy) / 100
        });
      });
    }

    const totalApy = this.calculateWeightedApy(allocations);
    const projectedReturn = (profile.investmentAmount * totalApy) / 100;

    return {
      id: 'aggressive',
      name: 'Aggressive Growth',
      description: 'High-risk, high-reward strategy targeting maximum returns. Concentrated in top-performing pools with highest APY.',
      riskLevel: 'high',
      riskScore: 8,
      rewardPotential: 9,
      totalApy,
      projectedReturn,
      allocations,
      pros: [
        'Maximum potential returns',
        'Exposure to highest-yield opportunities',
        'Quick profit potential',
        'Higher APY than conservative strategies'
      ],
      cons: [
        'Higher volatility and risk',
        'Pool stability may vary',
        'Requires active management',
        'Potential for larger losses'
      ],
      timeframe: 'Short to Medium-term (1-3 months)'
    };
  }

  private static generateTargetApyStrategy(
    profile: UserInvestmentProfile,
    pools: Pool[]
  ): InvestmentStrategy | null {
    const targetApy = profile.targetApy;

    // Find pools that can achieve target APY
    const suitablePools = pools.filter(p => p.apy >= targetApy * 0.7 && p.apy < 500);

    if (suitablePools.length === 0) {
      return null;
    }

    // Use optimization to reach target APY
    const selectedPools = suitablePools.slice(0, 3);
    const allocations = this.optimizeForTargetApy(profile.investmentAmount, selectedPools, targetApy);

    const totalApy = this.calculateWeightedApy(allocations);
    const projectedReturn = (profile.investmentAmount * totalApy) / 100;

    // Determine risk level based on target APY
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    let riskScore = 5;
    if (targetApy < 15) {
      riskLevel = 'low';
      riskScore = 3;
    } else if (targetApy > 30) {
      riskLevel = 'high';
      riskScore = 7;
    }

    return {
      id: 'target-apy',
      name: `Target ${targetApy}% APY Strategy`,
      description: `Custom strategy optimized to achieve your target ${targetApy}% APY. Allocations are weighted to maximize returns while managing risk.`,
      riskLevel,
      riskScore,
      rewardPotential: Math.min(10, Math.round(targetApy / 10) + 3),
      totalApy,
      projectedReturn,
      allocations,
      pros: [
        `Optimized for ${targetApy}% target APY`,
        'Custom allocation based on your goals',
        'Balanced pool selection',
        'Meets your expected returns'
      ],
      cons: [
        'Target may not always be achievable',
        'Market conditions may vary',
        'Requires monitoring'
      ],
      timeframe: 'Custom based on target'
    };
  }

  private static createEqualAllocations(
    totalAmount: number,
    pools: Pool[]
  ): StrategyAllocation[] {
    const amountPerPool = totalAmount / pools.length;

    return pools.map(pool => ({
      poolId: pool.id,
      poolName: pool.name,
      tokenSymbol: pool.token_symbol,
      apy: pool.apy,
      allocatedAmount: amountPerPool,
      allocatedPercentage: (amountPerPool / totalAmount) * 100,
      expectedReturn: (amountPerPool * pool.apy) / 100
    }));
  }

  private static optimizeForTargetApy(
    totalAmount: number,
    pools: Pool[],
    targetApy: number
  ): StrategyAllocation[] {
    // Simple optimization: weight pools by APY to reach target
    const sortedPools = [...pools].sort((a, b) => b.apy - a.apy);

    // If top pool exceeds target, use conservative allocation
    if (sortedPools[0].apy >= targetApy) {
      return this.createEqualAllocations(totalAmount, sortedPools);
    }

    // Weight towards higher APY pools
    const allocations: StrategyAllocation[] = [];

    sortedPools.forEach((pool, idx) => {
      const weight = (sortedPools.length - idx) / sortedPools.reduce((sum, _, i) => sum + (sortedPools.length - i), 0);
      const amount = totalAmount * weight;

      allocations.push({
        poolId: pool.id,
        poolName: pool.name,
        tokenSymbol: pool.token_symbol,
        apy: pool.apy,
        allocatedAmount: amount,
        allocatedPercentage: (amount / totalAmount) * 100,
        expectedReturn: (amount * pool.apy) / 100
      });
    });

    return allocations;
  }

  private static calculateWeightedApy(allocations: StrategyAllocation[]): number {
    const totalAmount = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
    const weightedApy = allocations.reduce((sum, a) => {
      return sum + (a.apy * a.allocatedAmount / totalAmount);
    }, 0);
    return weightedApy;
  }

  /**
   * Format currency with proper decimals
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Calculate risk-adjusted return (Sharpe-like ratio)
   */
  static calculateRiskAdjustedReturn(strategy: InvestmentStrategy): number {
    // Simple risk-adjusted return: APY / Risk Score
    return strategy.totalApy / strategy.riskScore;
  }
}
