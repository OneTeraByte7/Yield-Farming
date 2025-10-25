import { Response } from 'express';
import { AuthRequest } from '../types';
import { StakeService } from '../services/stake.service';
import { sendSuccess, sendError } from '../utils/response.util';

const stakeService = new StakeService();

export const stake = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { poolId, amount } = req.body;

    if (!poolId || !amount) {
      return sendError(res, 'Pool ID and amount are required', 400);
    }

    const result = await stakeService.stakeTokens(userId, poolId, parseFloat(amount));
    
    return sendSuccess(res, result, 'Tokens staked successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const unstake = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { stakeId, amount } = req.body;

    if (!stakeId) {
      return sendError(res, 'Stake ID is required', 400);
    }

    const result = await stakeService.unstakeTokens(
      userId,
      stakeId,
      amount ? parseFloat(amount) : undefined
    );
    
    return sendSuccess(res, result, 'Tokens unstaked successfully');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const claimRewards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { stakeId } = req.body;

    if (!stakeId) {
      return sendError(res, 'Stake ID is required', 400);
    }

    const result = await stakeService.claimRewards(userId, stakeId);
    
    return sendSuccess(res, result, 'Rewards claimed successfully');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getActiveStakes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const stakes = await stakeService.getActiveStakes(userId);
    
    return sendSuccess(res, stakes);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};