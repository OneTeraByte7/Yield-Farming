import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt.util';
import { sendError } from '../utils/response.util';
import supabase from '../config/supabase';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, is_admin, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !user || !user.is_active) {
      return sendError(res, 'User not found or inactive', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.is_admin,
    };
    
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return sendError(res, 'Admin access required', 403);
  }
  next();
};