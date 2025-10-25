import bcrypt from 'bcryptjs';
import supabase from '../config/supabase';
import { generateToken } from '../utils/jwt.util';

export class AuthService {
  async register(email: string, username: string, password: string) {
    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password_hash: passwordHash,
      })
      .select('id, email, username, created_at')
      .single();

    if (userError) {
      throw new Error('Failed to create user');
    }

    // Create wallet with initial balance
    const { error: walletError } = await supabase
      .from('wallets')
      .insert({
        user_id: user.id,
        balance: 10000, // Initial demo balance
      });

    if (walletError) {
      throw new Error('Failed to create wallet');
    }

    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  }

  async login(email: string, password: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    const token = generateToken({ id: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.is_admin,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        username,
        is_admin,
        created_at,
        wallets (balance)
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    return user;
  }
}