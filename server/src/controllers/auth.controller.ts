import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return sendError(res, 'All fields are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    const result = await authService.register(email, username, password);
    
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const result = await authService.login(email, password);
    
    return sendSuccess(res, result, 'Login successful');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await authService.getProfile(userId);
    
    return sendSuccess(res, profile);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};