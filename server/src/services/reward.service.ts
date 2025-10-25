import supabase from '../config/supabase';

export class RewardService {
  async getRewardHistory(userId: string, limit: number = 20, offset: number = 0) {
    const { data: rewards, error, count } = await supabase
      .from('rewards')
      .select(`
        *,
        pools (name, token_symbol)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('Failed to fetch rewards');
    }

    return {
      rewards: rewards || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async getTotalEarned(userId: string) {
    const { data, error } = await supabase
      .from('rewards')
      .select('amount')
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to calculate total earned');
    }

    const total = data?.reduce((sum, reward) => sum + parseFloat(reward.amount), 0) || 0;

    return total;
  }
}