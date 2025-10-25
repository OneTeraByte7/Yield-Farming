import api from './axios';
import { Stake } from '@/types';

export const stakeApi = {
  stake: async (poolId: string, amount: number) => {
    const response = await api.post('/stake/stake', { poolId, amount });
    return response.data;
  },

  unstake: async (stakeId: string, amount?: number) => {
    const response = await api.post('/stake/unstake', { stakeId, amount });
    return response.data;
  },

  claimRewards: async (stakeId: string) => {
    const response = await api.post('/stake/claim', { stakeId });
    return response.data;
  },

  getActiveStakes: async () => {
    const response = await api.get<{ success: boolean; data: Stake[] }>(
      '/stake/active'
    );
    return response.data.data;
  },
};