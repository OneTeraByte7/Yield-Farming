import { Response } from 'express';
import { AuthRequest } from '../types';
import { PoolService } from '../services/pool.service';
import { PoolSyncService } from '../services/poolSync.service';
import { sendSuccess, sendError } from '../utils/response.util';

const poolService = new PoolService();

export const getAllPools = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const pools = await poolService.getAllPools(userId);
    
    return sendSuccess(res, pools);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getPoolById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const pool = await poolService.getPoolById(id, userId);
    
    return sendSuccess(res, pool);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const createPool = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const pool = await poolService.createPool(data);
    
    return sendSuccess(res, pool, 'Pool created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updatePool = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const pool = await poolService.updatePool(id, data);
    
    return sendSuccess(res, pool, 'Pool updated successfully');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const syncPoolsFromExternal = async (req: AuthRequest, res: Response) => {
  try {
    const poolSyncService = new PoolSyncService();
    const pools = await poolSyncService.syncPools();

    return sendSuccess(res, pools, 'Pools synced successfully');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const cleanupDuplicatePools = async (req: AuthRequest, res: Response) => {
  try {
    const poolService = new PoolService();
    const result = await poolService.removeDuplicates();

    return sendSuccess(res, result, 'Duplicate pools cleaned up successfully');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};