import supabase from '../config/supabase';

export class PoolService {
  async getAllPools(userId?: string) {
    const { data: pools, error } = await supabase
      .from('pools')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch pools');
    }

    if (!userId) {
      return pools.map((pool) => ({
        ...pool,
        totalStaked: parseFloat(pool.total_staked),
        apy: parseFloat(pool.apy),
        minStakeAmount: parseFloat(pool.min_stake_amount),
        maxStakePerUser: pool.max_stake_per_user ? parseFloat(pool.max_stake_per_user) : null,
        yourStake: 0,
        pendingRewards: 0,
      }));
    }

    const poolsWithUserData = await Promise.all(
      pools.map(async (pool) => {
        const { data: userStakes } = await supabase
          .from('stakes')
          .select('amount, id')
          .eq('pool_id', pool.id)
          .eq('user_id', userId)
          .eq('status', 'active');

        const yourStake = userStakes?.reduce(
          (sum, stake) => sum + parseFloat(stake.amount),
          0
        ) || 0;

        let pendingRewards = 0;
        if (userStakes) {
          for (const stake of userStakes) {
            pendingRewards += await this.calculatePendingRewards(stake.id);
          }
        }

        return {
          ...pool,
          totalStaked: parseFloat(pool.total_staked),
          apy: parseFloat(pool.apy),
          minStakeAmount: parseFloat(pool.min_stake_amount),
          maxStakePerUser: pool.max_stake_per_user ? parseFloat(pool.max_stake_per_user) : null,
          yourStake,
          pendingRewards,
        };
      })
    );

    return poolsWithUserData;
  }

  async getPoolById(poolId: string, userId?: string) {
    const { data: pool, error } = await supabase
      .from('pools')
      .select('*')
      .eq('id', poolId)
      .single();

    if (error || !pool) {
      throw new Error('Pool not found');
    }

    let yourStake = 0;
    let pendingRewards = 0;

    if (userId) {
      const { data: userStakes } = await supabase
        .from('stakes')
        .select('amount, id')
        .eq('pool_id', poolId)
        .eq('user_id', userId)
        .eq('status', 'active');

      yourStake = userStakes?.reduce(
        (sum, stake) => sum + parseFloat(stake.amount),
        0
      ) || 0;

      if (userStakes) {
        for (const stake of userStakes) {
          pendingRewards += await this.calculatePendingRewards(stake.id);
        }
      }
    }

    return {
      ...pool,
      totalStaked: parseFloat(pool.total_staked),
      apy: parseFloat(pool.apy),
      minStakeAmount: parseFloat(pool.min_stake_amount),
      maxStakePerUser: pool.max_stake_per_user ? parseFloat(pool.max_stake_per_user) : null,
      yourStake,
      pendingRewards,
    };
  }

  async createPool(data: any) {
    const { data: pool, error } = await supabase
      .from('pools')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create pool');
    }

    return pool;
  }

  async updatePool(poolId: string, data: any) {
    const { data: pool, error } = await supabase
      .from('pools')
      .update(data)
      .eq('id', poolId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update pool');
    }

    return pool;
  }

  async removeDuplicates() {
    try {
      // Get all pools
      const { data: allPools, error } = await supabase
        .from('pools')
        .select('id, name, description, created_at')
        .order('created_at', { ascending: true });

      if (error || !allPools) {
        throw new Error('Could not fetch pools for duplicate check');
      }

      // Track unique pools by name
      const seenNames = new Map<string, string>();
      const duplicateIds: string[] = [];

      for (const pool of allPools) {
        const existingId = seenNames.get(pool.name);

        if (existingId) {
          // This is a duplicate, mark for deletion (keep the older one)
          duplicateIds.push(pool.id);
        } else {
          seenNames.set(pool.name, pool.id);
        }
      }

      // Delete duplicates
      if (duplicateIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('pools')
          .delete()
          .in('id', duplicateIds);

        if (deleteError) {
          throw new Error(`Error deleting duplicates: ${deleteError.message}`);
        }

        return {
          removed: duplicateIds.length,
          duplicateIds,
        };
      } else {
        return {
          removed: 0,
          duplicateIds: [],
        };
      }
    } catch (error) {
      console.error('❌ Error removing duplicates:', error);
      throw error;
    }
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