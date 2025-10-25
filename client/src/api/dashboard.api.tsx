import api from './axios';
import { DashboardOverview } from '@/types';

export const dashboardApi = {
  getOverview: async () => {
    const response = await api.get<{ success: boolean; data: DashboardOverview }>(
      '/dashboard/overview'
    );
    return response.data.data;
  },

  getRewardHistory: async (page: number = 1, limit: number = 20) => {
    const response = await api.get(
      `/dashboard/rewards-history?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },
};