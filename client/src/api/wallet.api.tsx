import api from './axios';
import { WalletBalance, Transaction } from '@/types';

export const walletApi = {
  getBalance: async () => {
    const response = await api.get<{ success: boolean; data: WalletBalance }>(
      '/wallet/balance'
    );
    return response.data.data;
  },

  deposit: async (amount: number) => {
    const response = await api.post('/wallet/deposit', { amount });
    return response.data;
  },

  withdraw: async (amount: number) => {
    const response = await api.post('/wallet/withdraw', { amount });
    return response.data;
  },

  getTransactions: async (page: number = 1, limit: number = 20) => {
    const response = await api.get<{
      success: boolean;
      data: {
        transactions: Transaction[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`/wallet/transactions?page=${page}&limit=${limit}`);
    return response.data.data;
  },
};