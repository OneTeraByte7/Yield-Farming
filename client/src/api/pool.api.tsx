import api from './axios';
import { Pool } from '@/types';

export const poolApi = {
  getAllPools: async () => {
    const response = await api.get<{ success: boolean; data: Pool[] }>('/pools');
    return response.data.data;
  },

  getPoolById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Pool }>(`/pools/${id}`);
    return response.data.data;
  },
};