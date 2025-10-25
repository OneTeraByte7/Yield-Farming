import jwt, { type SignOptions } from 'jsonwebtoken';
import type { StringValue as MsStringValue } from 'ms';
import { config } from '../config/env';

const msStringPattern = /^-?\d+(?:\.\d+)?(?:\s?(?:years?|yrs?|y|weeks?|w|days?|d|hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s|milliseconds?|msecs?|ms))?$/i;

const normalizeExpiresIn = (value: unknown): SignOptions['expiresIn'] => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('JWT expiresIn must be a finite number');
    }
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if ((msStringPattern.test(trimmed) || Number.isFinite(Number(trimmed))) && trimmed !== '') {
      return trimmed as MsStringValue;
    }
    throw new Error('JWT expiresIn must be a valid ms string (e.g., "15m") or numeric value');
  }

  throw new Error('JWT expiresIn is not defined');
};

export const generateToken = (payload: { id: string; email: string }): string => {
  if (!config.jwt.secret) {
    throw new Error('JWT secret is not defined');
  }
  const expiresIn = normalizeExpiresIn(config.jwt.expiresIn);
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn,
  });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};