import supabase from '../config/supabase';

export class StakeService {
  async stakeTokens(userId: string, poolId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Check wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (!wallet || parseFloat(wallet.balance) < amount) {
      throw new Error('Insufficient balance');
    }

    // Check pool
    const { data: pool } = await supabase
      .from('pools')
      .select('*')
      .eq('id', poolId)
      .single();

    if (!pool || !pool.is_active) {
      throw new Error('Pool not found or inactive');
    }

    if (amount < parseFloat(pool.min_stake_amount)) {
      throw new Error(`Minimum stake amount is ${pool.min_stake_amount}`);
    }

    // Check max stake limit
    if (pool.max_stake_per_user) {
      const { data: userStakes } = await supabase
        .from('stakes')
        .select('amount')
        .eq('user_id', userId)
        .eq('pool_id', poolId)
        .eq('status', 'active');

      const currentStaked = userStakes?.reduce(
        (sum, stake) => sum + parseFloat(stake.amount),
        0
      ) || 0;

      if (currentStaked + amount > parseFloat(pool.max_stake_per_user)) {
        throw new Error(`Maximum stake per user is ${pool.max_stake_per_user}`);
      }
    }

    // Deduct from wallet
    const { error: walletError } = await supabase.rpc(
      'decrement_balance',
      {
        user_id_param: userId,
        amount_param: amount,
      }
    );

    if (walletError) {
      throw new Error('Failed to deduct from wallet');
    }

    // Create stake
    const { data: stake, error: stakeError } = await supabase
      .from('stakes')
      .insert({
        user_id: userId,
        pool_id: poolId,
        amount,
        status: 'active',
      })
      .select(`
        *,
        pools (name, token_symbol, apy)
      `)
      .single();

    if (stakeError) {
      throw new Error('Failed to create stake');
    }

    // Update pool total
    await supabase.rpc(
      'increment_pool_stake',
      {
        pool_id_param: poolId,
        amount_param: amount,
      }
    );

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'stake',
      amount,
      pool_id: poolId,
      status: 'completed',
    });

    return stake;
  }

  async unstakeTokens(userId: string, stakeId: string, amount?: number) {
    const { data: stake } = await supabase
      .from('stakes')
      .select(`
        *,
        pools (apy)
      `)
      .eq('id', stakeId)
      .single();

    if (!stake || stake.user_id !== userId) {
      throw new Error('Stake not found');
    }

    if (stake.status !== 'active') {
      throw new Error('Stake is not active');
    }

    const unstakeAmount = amount || parseFloat(stake.amount);

    if (unstakeAmount > parseFloat(stake.amount)) {
      throw new Error('Insufficient staked amount');
    }

    // Calculate pending rewards
    const pendingRewards = await this.calculatePendingRewards(stakeId);

    // Update or close stake
    if (unstakeAmount === parseFloat(stake.amount)) {
      await supabase
        .from('stakes')
        .update({
          status: 'withdrawn',
          unstaked_at: new Date().toISOString(),
        })
        .eq('id', stakeId);
    } else {
      await supabase
        .from('stakes')
        .update({
          amount: parseFloat(stake.amount) - unstakeAmount,
        })
        .eq('id', stakeId);
    }

    // Return tokens + rewards to wallet
    await supabase.rpc(
      'increment_balance',
      {
        user_id_param: userId,
        amount_param: unstakeAmount + pendingRewards,
      }
    );

    // Update pool total
    await supabase.rpc(
      'decrement_pool_stake',
      {
        pool_id_param: stake.pool_id,
        amount_param: unstakeAmount,
      }
    );

    // Record reward if any
    if (pendingRewards > 0) {
      await supabase.from('rewards').insert({
        user_id: userId,
        stake_id: stakeId,
        pool_id: stake.pool_id,
        amount: pendingRewards,
        type: 'staking',
      });
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'unstake',
      amount: unstakeAmount,
      pool_id: stake.pool_id,
      status: 'completed',
    });

    return {
      unstakeAmount,
      rewardsClaimed: pendingRewards,
    };
  }

  async claimRewards(userId: string, stakeId: string) {
    const { data: stake } = await supabase
      .from('stakes')
      .select('*')
      .eq('id', stakeId)
      .single();

    if (!stake || stake.user_id !== userId) {
      throw new Error('Stake not found');
    }

    if (stake.status !== 'active') {
      throw new Error('Stake is not active');
    }

    const pendingRewards = await this.calculatePendingRewards(stakeId);

    if (pendingRewards <= 0) {
      throw new Error('No rewards to claim');
    }

    // Add rewards to wallet
    await supabase.rpc(
      'increment_balance',
      {
        user_id_param: userId,
        amount_param: pendingRewards,
      }
    );

    // Update last calculation time
    await supabase
      .from('stakes')
      .update({
        last_reward_calculation: new Date().toISOString(),
      })
      .eq('id', stakeId);

    // Record reward
    await supabase.from('rewards').insert({
      user_id: userId,
      stake_id: stakeId,
      pool_id: stake.pool_id,
      amount: pendingRewards,
      type: 'staking',
    });

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'claim',
      amount: pendingRewards,
      pool_id: stake.pool_id,
      status: 'completed',
    });

    return { amount: pendingRewards };
  }

  async getActiveStakes(userId: string) {
    const { data: stakes, error } = await supabase
      .from('stakes')
      .select(`
        *,
        pools (name, token_symbol, apy)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('staked_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch stakes');
    }

    const stakesWithRewards = await Promise.all(
      (stakes || []).map(async (stake) => {
        const pendingRewards = await this.calculatePendingRewards(stake.id);
        return {
          ...stake,
          amount: parseFloat(stake.amount),
          pendingRewards,
        };
      })
    );

    return stakesWithRewards;
  }

  private async calculatePendingRewards(stakeId: string): Promise<number> {
    const { data: stake } = await supabase
      .from('stakes')
      .select(`
        *,
        pools (apy)
      `)
      .eq('id', stakeId)
      .single();

    if (!stake || stake.status !== 'active') {
      return 0;
    }

    const currentTime = new Date();
    const lastCalculation = new Date(stake.last_reward_calculation);
    const timeElapsed = (currentTime.getTime() - lastCalculation.getTime()) / 1000;

    const apy = parseFloat(stake.pools.apy);
    const stakedAmount = parseFloat(stake.amount);

    const rewardPerSecond = (stakedAmount * apy) / (365 * 24 * 60 * 60 * 100);
    const pendingRewards = timeElapsed * rewardPerSecond;

    return pendingRewards;
  }
}