import { Response } from 'express';
import { AuthRequest } from '../types';
import { WalletService } from '../services/wallet.service';
import { StakeService } from '../services/stake.service';
import { RewardService } from '../services/reward.service';
import { sendSuccess, sendError } from '../utils/response.util';

const walletService = new WalletService();
const stakeService = new StakeService();
const rewardService = new RewardService();

export const getDashboardOverview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [balance, stakes, totalEarned] = await Promise.all([
      walletService.getBalance(userId),
      stakeService.getActiveStakes(userId),
      rewardService.getTotalEarned(userId),
    ]);

    const overview = {
      totalValueStaked: balance.stakedBalance,
      totalRewardsEarned: totalEarned,
      pendingRewards: balance.pendingRewards,
      availableBalance: balance.balance,
      activeStakes: stakes.length,
      activePositions: stakes.map(stake => ({
        stakeId: stake.id,
        poolId: stake.pool_id,
        poolName: stake.pools.name,
        tokenSymbol: stake.pools.token_symbol,
        stakedAmount: stake.amount,
        currentAPY: parseFloat(stake.pools.apy),
        pendingRewards: stake.pendingRewards,
        stakedAt: stake.staked_at,
      })),
    };

    return sendSuccess(res, overview);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getRewardHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const result = await rewardService.getRewardHistory(userId, limit, offset);
    
    return sendSuccess(res, result);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};