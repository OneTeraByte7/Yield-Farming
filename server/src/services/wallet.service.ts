import supabase from '../config/supabase';

export class WalletService {
  async getBalance(userId: string) {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error('Wallet not found');
    }

    // Get total staked
    const { data: stakes } = await supabase
      .from('stakes')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'active');

    const totalStaked = stakes?.reduce(
      (sum, stake) => sum + parseFloat(stake.amount),
      0
    ) || 0;

    // Get pending rewards
    const pendingRewards = await this.calculateTotalPendingRewards(userId);

    return {
      balance: parseFloat(wallet.balance),
      stakedBalance: totalStaked,
      pendingRewards,
    };
  }

  async deposit(userId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Update wallet balance
    const { data: wallet, error: walletError } = await supabase.rpc(
      'increment_balance',
      {
        user_id_param: userId,
        amount_param: amount,
      }
    );

    if (walletError) {
      throw new Error('Failed to deposit');
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'deposit',
      amount,
      status: 'completed',
    });

    return { amount };
  }

  async withdraw(userId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Check balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (!wallet || parseFloat(wallet.balance) < amount) {
      throw new Error('Insufficient balance');
    }

    // Update wallet balance
    const { error: walletError } = await supabase.rpc(
      'decrement_balance',
      {
        user_id_param: userId,
        amount_param: amount,
      }
    );

    if (walletError) {
      throw new Error('Failed to withdraw');
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'withdraw',
      amount,
      status: 'completed',
    });

    return { amount };
  }

  async getTransactions(userId: string, limit: number = 20, offset: number = 0) {
    const { data: transactions, error, count } = await supabase
      .from('transactions')
      .select(`
        *,
        pools (name, token_symbol)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('Failed to fetch transactions');
    }

    return {
      transactions: transactions || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  private async calculateTotalPendingRewards(userId: string): Promise<number> {
    const { data: stakes } = await supabase
      .from('stakes')
      .select(`
        *,
        pools (apy)
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!stakes) return 0;

    let totalPending = 0;

    for (const stake of stakes) {
      const currentTime = new Date();
      const lastCalculation = new Date(stake.last_reward_calculation);
      const timeElapsed =
        (currentTime.getTime() - lastCalculation.getTime()) / 1000;

      const apy = parseFloat(stake.pools.apy);
      const stakedAmount = parseFloat(stake.amount);

      const rewardPerSecond = (stakedAmount * apy) / (365 * 24 * 60 * 60 * 100);
      const pendingRewards = timeElapsed * rewardPerSecond;

      totalPending += pendingRewards;
    }

    return totalPending;
  }
}