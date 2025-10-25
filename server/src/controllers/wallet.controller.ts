import { Response } from 'express';
import { AuthRequest } from '../types';
import { WalletService } from '../services/wallet.service';
import { sendSuccess, sendError } from '../utils/response.util';

const walletService = new WalletService();

export const getBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const balance = await walletService.getBalance(userId);
    
    return sendSuccess(res, balance);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deposit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 'Invalid amount', 400);
    }

    const result = await walletService.deposit(userId, parseFloat(amount));
    
    return sendSuccess(res, result, 'Deposit successful');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const withdraw = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 'Invalid amount', 400);
    }

    const result = await walletService.withdraw(userId, parseFloat(amount));
    
    return sendSuccess(res, result, 'Withdrawal successful');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const result = await walletService.getTransactions(userId, limit, offset);
    
    return sendSuccess(res, result);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};